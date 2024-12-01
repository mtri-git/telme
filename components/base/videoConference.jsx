'use client';

import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const VideoConference = () => {
    const [peers, setPeers] = useState([]);
    const userVideo = useRef();
    const socketRef = useRef();
    const peerConnections = useRef({}); // Lưu trữ các PeerConnections

    useEffect(() => {
        // Kết nối signaling server
        socketRef.current = io('http://localhost:3002');

        // Truy cập camera/microphone
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                if (userVideo.current) {
                    userVideo.current.srcObject = stream;
                }

                socketRef.current.emit('join_video_room', 'test-room');``

                // Khi có người tham gia
                socketRef.current.on('user_join_video_call', ({ userId }) => {
                    if (peerConnections.current[userId]) return; // Đã tồn tại kết nối
                    const peerConnection = createPeerConnection(userId, stream);
                    peerConnections.current[userId] = peerConnection;

                    // Tạo offer để bắt đầu kết nối
                    peerConnection.createOffer()
                        .then((offer) => {
                            return peerConnection.setLocalDescription(offer);
                        })
                        .then(() => {
                            socketRef.current.emit('signal', {
                                to: userId,
                                signal: { type: 'offer', sdp: peerConnection.localDescription.sdp },
                            });
                        })
                        .catch((err) => console.error('Error creating offer:', err));
                });

                // Xử lý tín hiệu WebRTC từ các client khác
                socketRef.current.on('signal', ({ from, signal }) => {
                    let peerConnection = peerConnections.current[from];
                    if (!peerConnection) {
                        peerConnection = createPeerConnection(from, stream);
                        peerConnections.current[from] = peerConnection;
                    }

                    if (signal.type === 'offer') {
                        peerConnection.setRemoteDescription(new RTCSessionDescription(signal))
                            .then(() => peerConnection.createAnswer())
                            .then((answer) => {
                                return peerConnection.setLocalDescription(answer);
                            })
                            .then(() => {
                                socketRef.current.emit('signal', {
                                    to: from,
                                    signal: { type: 'answer', sdp: peerConnection.localDescription.sdp },
                                });
                            })
                            .catch((err) => console.error('Error handling offer:', err));
                    } else if (signal.type === 'answer') {
                        peerConnection.setRemoteDescription(new RTCSessionDescription(signal))
                            .catch((err) => console.error('Error setting remote description:', err));
                    } else if (signal.candidate) {
                        peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate))
                            .catch((err) => console.error('Error adding ICE candidate:', err));
                    }
                });
            })
            .catch((err) => console.error('Error accessing media devices:', err));

        return () => {
            // Cleanup connections and socket
            Object.values(peerConnections.current).forEach((pc) => pc.close());
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const createPeerConnection = (userId, stream) => {
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ],
        });

        // Gửi ICE candidate cho server
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('signal', {
                    to: userId,
                    signal: { candidate: event.candidate },
                });
            }
        };

        // Nhận stream video từ peer
        peerConnection.ontrack = (event) => {
            setPeers((prevPeers) => {
                if (prevPeers.some((peer) => peer.userId === userId)) return prevPeers;
                return [...prevPeers, { userId, stream: event.streams[0] }];
            });
        };

        // Thêm local stream vào peer
        stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

        return peerConnection;
    };

    return (
        <div>
            <video ref={userVideo} autoPlay muted style={{ width: '200px' }} />
            {peers.map((peer, index) => (
                <video
                    key={peer.userId}
                    ref={(ref) => {
                        if (ref && !ref.srcObject) {
                            ref.srcObject = peer.stream;
                        }
                    }}
                    autoPlay
                    style={{ width: '200px' }}
                />
            ))}
        </div>
    );
};

export default VideoConference;
