'use client';
import Sidebar from "@/components/base/sidebar";
import ChatWindow from "@/components/base/chatWindow";
import { useEffect } from "react";
import socket from "@/utils/socketClient";

const HomePage = () => {
  
  useEffect(() => {
    socket.connect();

    socket.emit("register", {
      userId: "123"
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />
      {/* Chat Window */}
      <ChatWindow />
    </div>
  );
};

export default HomePage;
