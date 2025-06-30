"use client";
import Sidebar from "@/components/base/sidebar";
import ChatWindow from "@/components/base/chatWindow";
import { useEffect, useState } from "react";
import socket from "@/utils/socketClient";
import useAuthStore from "@/store/authStore";
import authService from "@/services/authService";
import ChatOption from "../base/chatOption";
import { useRouter } from "next/navigation";
import useChatStore from "@/store/chatStore";

const HomePage = () => {
  const { setUser } = useAuthStore();
  const { currentRoomId } = useChatStore();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <div className="flex h-screen relative">
      {/* Mobile: Show sidebar only when no room selected, desktop: always show */}
      <div className={`${isMobile ? (currentRoomId ? 'hidden' : 'flex w-full') : 'flex'} transition-all duration-300 ease-in-out`}>
        <Sidebar />
      </div>
      
      {/* Mobile: Show chat window only when room selected, desktop: always show */}
      <div className={`${isMobile ? (currentRoomId ? 'flex w-full' : 'hidden') : 'flex'} flex-1 transition-all duration-300 ease-in-out`}>
        <ChatWindow />
      </div>
      
      {/* Chat option - responsive */}
      <ChatOption />
    </div>
  );
};

export default HomePage;
