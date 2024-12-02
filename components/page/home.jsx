"use client";
import Sidebar from "@/components/base/sidebar";
import ChatWindow from "@/components/base/chatWindow";
import { useEffect } from "react";
import socket from "@/utils/socketClient";
import useAuthStore from "@/store/authStore";
import authService from "@/services/authService";
import ChatOption from "../base/chatOption";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const { setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    authService.getMe().then((data) => {
      if (!data) {
        return;
      }
      const userData = data.data;
      setUser({ user: userData, isAuthenticated: true });

      socket.connect();

      const handleRegister = () => {
        socket.emit("register", {
          userId: userData?._id,
        });
      };

      socket.on("connect", handleRegister);

      return () => {
        socket.off("connect", handleRegister);
        socket.disconnect();
      };
    }).catch(() => {
      console.log("error");
    });
  }, [setUser, router]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />
      {/* Chat Window */}
      <ChatWindow />
      {/* Chat option */}
      <ChatOption />
    </div>
  );
};

export default HomePage;
