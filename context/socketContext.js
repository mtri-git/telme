"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      autoConnect: false, // Không tự động kết nối
      transports: ["websocket"], // Sử dụng WebSocket
      reconnectionAttempts: 5, // Số lần thử kết nối lại
    });

    // Kết nối socket
    newSocket.connect();

    // Cập nhật socket trong state
    setSocket(newSocket);

    // Ngắt kết nối khi component bị hủy
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
