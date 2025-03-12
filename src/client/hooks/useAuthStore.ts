import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SafeUser } from "@server/db/schema";
import { getCsrfToken } from "../utils/getCsrfToken";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface AuthState {
  user: SafeUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: SafeUser, token: string) => void;
  logout: () => void;
  refresh: (userId: number) => Promise<void>;
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
      refresh: async (userId: number) => {
        try {
          const { csrfToken } = await getCsrfToken();
          const response = await axios.get(`${API_URL}/users/${userId}`, {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          });
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          console.error(error);
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
