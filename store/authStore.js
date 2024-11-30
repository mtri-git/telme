import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useAuthStore = create(
  process.env.NODE_ENV === "development"
    ? devtools(
        (set) => ({
          user: null,
          isAuthenticated: false,

          setUser: (user) =>
            {
              console.log("auth/setUser", user);
              return set({ user, isAuthenticated: !!user }, false, "auth/setUser");
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
      })
);

export default useAuthStore;
