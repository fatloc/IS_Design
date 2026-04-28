import { create } from "zustand";
import type { User } from "../types";
import { clearAuthToken, setAuthToken } from "@/services/api";

export type AppRole = "Sale" | "Manager" | "Accountant";

export type AuthUser = User & {
  role?: AppRole | string;
  loaiNhanVien?: string | null;
};

type AuthState = {
  currentUser: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setLoading: (value: boolean) => void;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  token: null,
  isLoading: false,
  setLoading: (value) => set({ isLoading: value }),
  setAuth: (user, token) => {
    setAuthToken(token);
    set({ currentUser: user, token, isLoading: false });
  },
  clearAuth: () => {
    clearAuthToken();
    set({ currentUser: null, token: null, isLoading: false });
  },
}));