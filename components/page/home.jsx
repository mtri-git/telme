"use client";
import { useEffect, lazy, Suspense } from "react";
import socket from "@/utils/socketClient";
import useAuthStore from "@/store/authStore";
import useChatStore from "@/store/chatStore";
import usePerformance from "@/hooks/usePerformance";

// Lazy load components to reduce initial bundle size
const Sidebar = lazy(() => import("@/components/base/sidebar"));
const ChatWindow = lazy(() => import("@/components/base/chatWindow"));
const ChatOption = lazy(() => import("../base/chatOption"));

// Loading component for Suspense
const ComponentLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const HomePage = () => {
  const user = useAuthStore((state) => state.user);
  const currentRoomId = useChatStore((state) => state.currentRoomId);
  // Stable key so re-ordering rooms (new message) doesn't re-join everything
  const roomIdsKey = useChatStore((state) => state.rooms.map((room) => room._id).sort().join(","));
  const { scheduleWork } = usePerformance();

  // The user is loaded once by AuthLayout; connect the socket when it's available
  useEffect(() => {
    if (!user?._id) return;

    const handle = scheduleWork(() => socket.connect());

    return () => {
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(handle);
      }
      socket.disconnect();
    };
  }, [user?._id, scheduleWork]);

  // Join every room's channel; socket.io drops room membership on reconnect, so re-join then too
  useEffect(() => {
    const joinRooms = () => {
      if (!roomIdsKey) return;
      for (const roomId of roomIdsKey.split(",")) {
        socket.emit("join_room", { roomId });
      }
    };

    if (socket.connected) joinRooms();
    socket.on("connect", joinRooms);
    return () => socket.off("connect", joinRooms);
  }, [roomIdsKey]);

  // Responsive switching is pure CSS (md breakpoint) so there's no layout flash on load
  const sidebarClasses = `${currentRoomId ? "hidden" : "flex"} w-full md:flex md:w-auto`;
  const chatWindowClasses = `${currentRoomId ? "flex" : "hidden"} min-w-0 flex-1 md:flex`;

  return (
    <div className="flex h-dvh overflow-hidden relative">
      {/* Mobile: Show sidebar only when no room selected, desktop: always show */}
      <div className={sidebarClasses}>
        <Suspense fallback={<ComponentLoader />}>
          <Sidebar />
        </Suspense>
      </div>
      
      {/* Mobile: Show chat window only when room selected, desktop: always show */}
      <div className={chatWindowClasses}>
        <Suspense fallback={<ComponentLoader />}>
          <ChatWindow />
        </Suspense>
      </div>
      
      {/* Chat option - responsive */}
      <Suspense fallback={<div className="w-0"></div>}>
        <ChatOption />
      </Suspense>
    </div>
  );
};

export default HomePage;
