'use client';
import React, { useEffect } from 'react'
import useAuthStore from "@/store/authStore";
import { Loading } from "../base/loading";
import { redirect } from 'next/navigation'

export default function AuthLayout({ children }) {
  const { isLoading, isAuthenticated, init } = useAuthStore();

  useEffect(() => {
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated && typeof window !== 'undefined') {
    // check curent route is not login page or register page
    if (window.location.pathname !== '/login' || window.location.pathname !== '/register') {
      redirect('/login')
    }
  }
  
  return (
    <>
      {children}
    </>
  )
}
