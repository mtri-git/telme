import authService from "@/services/authService";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useAuthStore = create(
  process.env.NODE_ENV === "development"
    ? devtools(
        (set) => ({
          user: null,
          isAuthenticated: false,
          isLoading: true,

          setIsLoading: (isLoading) => set({ isLoading }),
          
          setUser: (user) =>
            {
              return set({ user, isAuthenticated: !!user }, false, "auth/setUser");
            },

          init: async () => {
            set({ isLoading: true });

            try {
              const response = await authService.getMe();
              const user = response.data;
              console.log("🚀 ~ init: ~ user:", user)
              set({ user, isAuthenticated: !!user });
            } catch (error) {
              set({ user: null, isAuthenticated: false });
              console.log("auth/init", error);
            } finally {
              set({ isLoading: false });
            }
          },

          logout: () =>
            set({ user: null, isAuthenticated: false }, false, "auth/logout"),
        }),
        { name: "AuthStore" }
      )
    : (set) => ({
        user: null,
        isAuthenticated: false,

        setUser: (user) => set({ user, isAuthenticated: !!user }),

        logout: () => set({ user: null, isAuthenticated: false }),

        init: async () => {
          set({ isLoading: true });

          try {
            const response = await authService.getMe();
            const user = response.data;
            set({ user, isAuthenticated: !!user });
          } catch (error) {
            set({ user: null, isAuthenticated: false });
            console.log("auth/init", error);
          } finally {
            set({ isLoading: false });
          }
        },
      })
);

export default useAuthStore;
