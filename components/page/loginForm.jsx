"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authService from "@/services/authService";
import toast from "react-hot-toast";

const LoginForm = () => {
  const [email, setEmail] = useState("vmtri20@gmail.com");
  const [password, setPassword] = useState("12345678");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await toast.promise(authService.login(email, password), {
        loading: "Logging in...",
        success: "Logged in successfully",
        error: (err) => {
          console.log("🚀 ~ toast.promise ~ err:", err);
          setError(err?.response?.data?.message);
          return "An error occurred";
        },
      });

      // sleep for 1 second
      await new Promise((resolve) => setTimeout(resolve, 500));
      // go to home
      window.location.href = "/";
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };
  return (
    <>
      <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="h-10 sm:h-11 rounded-lg text-sm sm:text-base"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <a href="#" className="text-sm text-primary hover:underline">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="h-10 sm:h-11 rounded-lg text-sm sm:text-base"
            required
          />
        </div>
        {error && <p className="text-destructive text-sm font-medium">{error}</p>}
        <Button type="submit" className="w-full h-10 sm:h-11 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm sm:text-base">
          Sign in
        </Button>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Don&apos;t have an account?{" "}
            <Button
              type="button"
              variant="link"
              className="px-1 text-primary hover:underline text-sm"
              onClick={() => (window.location.href = "/register")}
            >
              Sign up
            </Button>
          </p>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
