"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useRouter } from "next/navigation";
import authService from "../services/authService";

const AuthContext = createContext();

const ACTIONS = {
  SET_USER: "SET_USER",
  LOGOUT: "LOGOUT",
};

const authReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
      };
    case ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getMe();
        if (response?.data) {
          dispatch({
            type: ACTIONS.SET_USER,
            payload: { user: response.data },
          });
        } else {
          // router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // router.push("/login");
      }
    };

    fetchUser();
  }, [router]);

  // Hàm đăng xuất
  const logout = () => {
    authService.logout(); // Gọi API logout nếu cần
    dispatch({ type: ACTIONS.LOGOUT });
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ ...state, dispatch, logout }}>
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
