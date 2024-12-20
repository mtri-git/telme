'use client';
import RegisterForm from "@/components/page/registerForm";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-700">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded dark:bg-gray-500">
        <h1 className="text-xl font-bold text-center mb-6">Login</h1>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
