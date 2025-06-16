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
import { LOCAL_STORAGE_KEY } from "@/constants/localStorage";
import { useRouter } from "next/navigation";

const VideoConference = ({ roomId }) => {
  const [peers, setPeers] = useState([]);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const userVideo = useRef();
  const socketRef = useRef();
  const peerConnections = useRef({});
  const localStream = useRef();
  const router = useRouter();

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL);

    const userData = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY.userInfo)
    );
    const handleRegister = () => {
      socket.emit("register", {
        userId: userData?._id,
      });
    };
    console.log("🚀 ~ useEffect ~ userData:", userData);

    socket.connect();
    socket.on("connect", handleRegister);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream.current = stream;
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }

        socketRef.current.emit("join_video_room", {
          roomId,
          userId: userData?._id,
          userInfo: userData,
        });

        socketRef.current.on("user_join_video_call", ({ userId, userInfo }) => {
          if (peerConnections.current[userId]) return;
          console.log(`User joined: ${userId}`);
          const peerConnection = createPeerConnection(userId, stream, userInfo);
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
        socket.off("connect", handleRegister);
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  const createPeerConnection = (userId, stream, userInfo) => {
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
        return [
          ...prevPeers,
          { userId, stream: event.streams[0], userInfo: userInfo },
        ];
      });
    };

    // Replace old tracks with new tracks from the local stream
    stream.getTracks().forEach((track) => {
      const sender = peerConnection
        .getSenders()
        .find((s) => s.track && s.track.kind === track.kind);

      if (sender) {
        sender.replaceTrack(track);
      } else {
        peerConnection.addTrack(track, stream);
      }
    });

    return peerConnection;
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);

        // Update video track for all peer connections
        Object.values(peerConnections.current).forEach((peerConnection) => {
          const sender = peerConnection
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
      }
    }
  };

  const toggleAudio = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
        setAudioEnabled(!audioEnabled);

        // Update audio track for all peer connections
        Object.values(peerConnections.current).forEach((peerConnection) => {
          const sender = peerConnection
            .getSenders()
            .find((s) => s.track && s.track.kind === "audio");
          if (sender) {
            sender.replaceTrack(audioTrack);
          }
        });
      }
    }
  };

  const endCall = () => {
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    // close all tracks
    localStream.current.getTracks().forEach((track) => track.stop());

    if (socketRef.current) {
      socketRef.current.emit("leave_video_call", roomId);
      socketRef.current.disconnect();

      setTimeout(() => {
        router.push("/we-meet/left-meeting");
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-background min-h-screen">
      <div className="flex flex-wrap justify-center gap-4">
        <video
          ref={userVideo}
          autoPlay
          muted
          className="w-48 h-48 border-4 border-red-500 rounded-lg shadow-lg"
        />
        {peers.map((peer) => (
          <div key={peer.userId}>
            <video
              ref={(ref) => {
                if (ref && !ref.srcObject) {
                  ref.srcObject = peer.stream;
                }
              }}
              autoPlay
              className="w-48 h-48 rounded-lg shadow-lg"
            />
            <div>{peer?.userInfo?.fullname}</div>
          </div>
        ))}
      </div>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-sm w-full bg-card p-4 rounded-lg shadow-lg text-card-foreground">
        <div className="text-center mb-4 flex justify-center gap-4">
          <h1 className="text-xl font-bold">Code:</h1>
          <span className="text-xl font-bold">{roomId}</span>
          <Button
            variant="primary"
            className="text-white bg-blue-500 hover:bg-blue-600"
            onClick={() => navigator.clipboard.writeText(roomId)}
          >
            Copy
          </Button>
        </div>
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
