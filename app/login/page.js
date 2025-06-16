"use client";

import LoginForm from "@/components/page/loginForm";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    console.log("LoginPage -> isAuthenticated", isAuthenticated);
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
  
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-card shadow-xl rounded-xl border border-border">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-bold text-center text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to continue to Telme</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
