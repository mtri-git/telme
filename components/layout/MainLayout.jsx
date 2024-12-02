'use client';
import React, { useEffect } from 'react'
import useAuthStore from "@/store/authStore";
import authService from "@/services/authService";
import { Loading } from "../base/loading";

export default function MainLayout({ children }) {
  const { setUser, user, isLoading, setIsLoading } = useAuthStore();

  useEffect(() => {
    setIsLoading(true);
    authService.getMe().then((data) => {
      console.log("🚀 ~ authService.getMe ~ data:", data);
      if (!data) {
        // router.push("/login");
      }
      const userData = data.data
      setUser({ user: userData, isAuthenticated: true });
    }).finally(() => {
      setIsLoading(false);
    });
  }, [setIsLoading, setUser]);

  if (!user || isLoading) {
    return (
      <Loading className="h-screen"/>
    )
  }
  return (
    <div>
      {children}
    </div>
  )
}
