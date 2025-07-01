"use client";
import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import socket from "@/utils/socketClient";
import useAuthStore from "@/store/authStore";
import authService from "@/services/authService";
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
  const { setUser } = useAuthStore();
  const { currentRoomId } = useChatStore();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { scheduleWork } = usePerformance();

  // Memoize mobile detection logic
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Debounced resize handler to reduce excessive calls
  const debouncedResize = useMemo(() => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
  }, [checkMobile]);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, [checkMobile, debouncedResize]);

  // Optimize authentication logic
  useEffect(() => {
    if (isInitialized) return;
    
    const initializeAuth = async () => {
      try {
        const data = await authService.getMe();
        if (!data) return;
        
        const userData = data.data;
        setUser({ user: userData, isAuthenticated: true });

        // Use requestIdleCallback if available for socket connection
        scheduleWork(() => {
          socket.connect();
          socket.emit("register", { userId: userData?._id });
        });
        
        setIsInitialized(true);
      } catch (error) {
        console.log("Auth initialization error:", error);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [setUser, isInitialized]);

  // Memoize layout classes to prevent recalculation
  const sidebarClasses = useMemo(() => 
    `${isMobile ? (currentRoomId ? 'hidden' : 'flex w-full') : 'flex'} transition-all duration-300 ease-in-out`,
    [isMobile, currentRoomId]
  );

  const chatWindowClasses = useMemo(() => 
    `${isMobile ? (currentRoomId ? 'flex w-full' : 'hidden') : 'flex'} flex-1 transition-all duration-300 ease-in-out`,
    [isMobile, currentRoomId]
  );

  return (
    <div className="flex h-screen relative">
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
