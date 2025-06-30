"use client";
import RegisterForm from "@/components/page/registerForm";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
  
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-card shadow-xl rounded-xl border border-border">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-center text-foreground">Create account</h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">Sign up to get started with Telme</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
