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
    // Lấy thông tin người dùng
    authService.getMe().then((data) => {
      console.log("🚀 ~ authService.getMe ~ data:", data);
      if (!data) {
        router.push("/login");
        return;
      }
      const userData = data.data;
      setUser({ user: userData, isAuthenticated: true });

      // Kết nối socket
      socket.connect();

      // Đăng ký khi kết nối thành công
      const handleRegister = () => {
        socket.emit("register", {
          userId: userData?._id,
        });
      };

      // Đăng ký ngay khi kết nối thành công
      socket.on("connect", handleRegister);

      // Đảm bảo xoá listener khi component unmount
      return () => {
        socket.off("connect", handleRegister);
        socket.disconnect();
      };
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
