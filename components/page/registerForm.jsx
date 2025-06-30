"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authService from "@/services/authService";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    watch
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      await toast.promise(
        authService.register({
          fullname: data.fullname,
          email: data.email,
          username: data.email,
          password: data.password
        }),
        {
          loading: "Creating account...",
          success: "Account created successfully! Redirecting...",
          error: (err) => {
            console.error("Registration error:", err);
            return err?.response?.data?.message || "Registration failed";
          }
        }
      );

      // Optional: Auto-login after registration
      await authService.login(data.email, data.password);

      // Redirect to home or dashboard
      window.location.href = "/";
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fullname" className="text-sm font-medium">Full Name</Label>
          <Input
            id="fullname"
            type="text"
            placeholder="Enter your full name"
            className="h-10 sm:h-11 rounded-lg text-sm sm:text-base"
            {...register("fullname", { 
              required: "Full name is required",
              minLength: {
                value: 2,
                message: "Full name must be at least 2 characters"
              }
            })}
          />
          {errors.fullname && (
            <p className="text-destructive text-sm mt-1">
              {errors.fullname.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="h-10 sm:h-11 rounded-lg text-sm sm:text-base"
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
          />
          {errors.email && (
            <p className="text-destructive text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-10 sm:h-11 rounded-lg text-sm sm:text-base pr-10"
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                }
              })}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} className="text-muted-foreground" /> : <Eye size={18} className="text-muted-foreground" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              className="h-10 sm:h-11 rounded-lg text-sm sm:text-base pr-10"
              {...register("confirmPassword", { 
                required: "Please confirm your password",
                validate: value => 
                  value === password || "Passwords do not match"
              })}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} className="text-muted-foreground" /> : <Eye size={18} className="text-muted-foreground" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-destructive text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full h-10 sm:h-11 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm sm:text-base" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Register"}
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Already have an account?{" "}
            <Button
              type="button"
              variant="link"
              className="px-1 text-primary hover:underline text-sm"
              onClick={() => (window.location.href = "/login")}
            >
              Sign in
            </Button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;