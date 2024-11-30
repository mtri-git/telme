"use client";
import Sidebar from "@/components/base/sidebar";
import ChatWindow from "@/components/base/chatWindow";
import { useEffect } from "react";
import socket from "@/utils/socketClient";
import useAuthStore from "@/store/authStore";
import authService from "@/services/authService";

const HomePage = () => {
  const { setUser } = useAuthStore();

  useEffect(() => {
    authService.getMe().then((data) => {
      console.log("🚀 ~ authService.getMe ~ data:", data);
      if (!data) {
        router.push("/login");
      }
      const userData = data.data
      setUser({ user: userData, isAuthenticated: true });
      socket.connect();
      socket.emit("register", {
        userId: userData?._id,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [setUser]);

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
