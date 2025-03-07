import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SafeUser } from "@server/db/schema";

export interface AuthState {
  user: SafeUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: SafeUser, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    }
  )
);
