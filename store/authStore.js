import authService from "@/services/authService";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// `user` is the logged-in user object returned by /users/me (or null)
const authStore = (set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setIsLoading: (isLoading) => set({ isLoading }),

  setUser: (user) => set({ user, isAuthenticated: !!user }, false, "auth/setUser"),

  init: async () => {
    set({ isLoading: true }, false, "auth/init");

    try {
      const response = await authService.getMe();
      const user = response?.data ?? null;
      set({ user, isAuthenticated: !!user }, false, "auth/init:done");
    } catch (error) {
      set({ user: null, isAuthenticated: false }, false, "auth/init:error");
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => set({ user: null, isAuthenticated: false }, false, "auth/logout"),
});

const useAuthStore = create(
  process.env.NODE_ENV === "development"
    ? devtools(authStore, { name: "AuthStore" })
    : authStore
);

export default useAuthStore;
