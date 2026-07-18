import { create } from "zustand";
import { setAccessToken as setApiToken } from "@/lib/api-client";

export interface AuthUser {
  id?: string;
  email?: string;
  fullName?: string;
  role?: "user" | "admin";
  credits?: number;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  mfaVerified: boolean;
  setSession: (token: string | null, user?: AuthUser | null) => void;
  setUser: (u: AuthUser | null) => void;
  setMfaVerified: (v: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  mfaVerified: false,
  setSession: (token, user) => {
    setApiToken(token);
    set({ token, ...(user !== undefined ? { user } : {}) });
  },
  setUser: (user) => set({ user }),
  setMfaVerified: (v) => set({ mfaVerified: v }),
  clear: () => {
    setApiToken(null);
    set({ token: null, user: null, mfaVerified: false });
  },
}));
