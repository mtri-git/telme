"use client";

import React, { createContext, useContext } from "react";
import socket from "@/utils/socketClient";

const SocketContext = createContext(null);

// Exposes the app's single shared socket. Connecting is handled where the user is known
// (see components/page/home.jsx) so we don't open an extra, unauthenticated connection.
export const SocketProvider = ({ children }) => {
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
