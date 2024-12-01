"use client";

import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Button } from "../ui/button";
import {
  MicIcon,
  MicOffIcon,
  PhoneOff,
  VideoIcon,
  VideoOffIcon,
} from "lucide-react";
import socket from "@/utils/socketClient";

const VideoConference = ({ roomId }) => {
  const [peers, setPeers] = useState([]);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const userVideo = useRef();
  const socketRef = useRef();
  const peerConnections = useRef({});
  const localStream = useRef();

  useEffect(() => {
    socketRef.current = io("http://localhost:3002");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream.current = stream;
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }

        socketRef.current.emit("join_video_room", roomId);

        socketRef.current.on("user_join_video_call", ({ userId }) => {
          if (peerConnections.current[userId]) return;
          const peerConnection = createPeerConnection(userId, stream);
          peerConnections.current[userId] = peerConnection;

          peerConnection
            .createOffer()
            .then((offer) => peerConnection.setLocalDescription(offer))
            .then(() => {
              socketRef.current.emit("signal", {
                to: userId,
                signal: {
                  type: "offer",
                  sdp: peerConnection.localDescription.sdp,
                },
              });
            })
            .catch((err) => console.error("Error creating offer:", err));
        });

        socketRef.current.on("signal", ({ from, signal }) => {
          let peerConnection = peerConnections.current[from];
          if (!peerConnection) {
            peerConnection = createPeerConnection(from, stream);
            peerConnections.current[from] = peerConnection;
          }

          if (signal.type === "offer") {
            peerConnection
              .setRemoteDescription(new RTCSessionDescription(signal))
              .then(() => peerConnection.createAnswer())
              .then((answer) => peerConnection.setLocalDescription(answer))
              .then(() => {
                socketRef.current.emit("signal", {
                  to: from,
                  signal: {
                    type: "answer",
                    sdp: peerConnection.localDescription.sdp,
                  },
                });
              })
              .catch((err) => console.error("Error handling offer:", err));
          } else if (signal.type === "answer") {
            peerConnection
              .setRemoteDescription(new RTCSessionDescription(signal))
              .catch((err) =>
                console.error("Error setting remote description:", err)
              );
          } else if (signal.candidate) {
            peerConnection
              .addIceCandidate(new RTCIceCandidate(signal.candidate))
              .catch((err) =>
                console.error("Error adding ICE candidate:", err)
              );
          }
        });
      })
      .catch((err) => console.error("Error accessing media devices:", err));

    socketRef.current.on("user_leave_video_call", ({ userId }) => {
      console.log(`User left: ${userId}`);

      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
      }

      setPeers((prevPeers) =>
        prevPeers.filter((peer) => peer.userId !== userId)
      );
    });

    return () => {
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  const createPeerConnection = (userId, stream) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("signal", {
          to: userId,
          signal: { candidate: event.candidate },
        });
      }
    };

    peerConnection.ontrack = (event) => {
      setPeers((prevPeers) => {
        if (prevPeers.some((peer) => peer.userId === userId)) return prevPeers;
        return [...prevPeers, { userId, stream: event.streams[0] }];
      });
    };

    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));

    return peerConnection;
  };

  const toggleVideo = () => {
    const videoTrack = localStream.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoEnabled;
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    const audioTrack = localStream.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioEnabled;
      setAudioEnabled(!audioEnabled);
    }
  };

  const endCall = () => {
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    if (socketRef.current) {
      socketRef.current.emit("leave_video_call", roomId);
      socketRef.current.disconnect();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-wrap justify-center gap-4">
        <video
          ref={userVideo}
          autoPlay
          muted
          className="w-48 h-48 border-4 border-red-500 rounded-lg shadow-lg"
        />
        {peers.map((peer) => (
          <video
            key={peer.userId}
            ref={(ref) => {
              if (ref && !ref.srcObject) {
                ref.srcObject = peer.stream;
              }
            }}
            autoPlay
            className="w-48 h-48 rounded-lg shadow-lg"
          />
        ))}
      </div>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-sm w-full bg-white p-4 rounded-lg shadow-lg">
        <div className="flex justify-center space-x-4">
          <Button
            onClick={toggleVideo}
            className="bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
          >
            {videoEnabled ? <VideoOffIcon /> : <VideoIcon />}
          </Button>
          <Button
            onClick={toggleAudio}
            className="bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
          >
            {audioEnabled ? <MicOffIcon /> : <MicIcon />}
          </Button>
          <Button onClick={endCall} variant="destructive">
            <PhoneOff />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoConference;