"use client";

import React, { createContext, useContext } from "react";
import authService from "../services/authService";
import useAuthStore from "@/store/authStore";

const AuthContext = createContext();

// Thin wrapper over the auth store so there's a single source of truth
// (the store is initialised once by AuthLayout; no extra /users/me calls here).
export const AuthProvider = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const clearUser = useAuthStore((state) => state.logout);

  // Hàm đăng xuất
  const logout = () => {
    clearUser();
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
