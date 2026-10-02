"use client";
import RegisterForm from "@/components/page/registerForm";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { FloatingThemeToggle } from "@/components/base/themeToggle";

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
    <div className="min-h-dvh flex items-center justify-center bg-muted/40 p-4">
      <FloatingThemeToggle />
      <div className="w-full max-w-md p-6 sm:p-8 bg-card shadow-lg rounded-2xl border border-border">
        <div className="flex flex-col items-center mb-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-center text-foreground">Create account</h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">Sign up to get started with Telme</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
