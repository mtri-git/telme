"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authService from "@/services/authService";
import toast from "react-hot-toast";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Logging in with", email, password);
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
      <form onSubmit={handleLogin} className="max-w-md mx-auto space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            defaultValue="vmtri20@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            defaultValue="12345678"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => (window.location.href = "/register")}
        >
          Register
        </Button>
      </form>
    </>
  );
};

export default LoginForm;
