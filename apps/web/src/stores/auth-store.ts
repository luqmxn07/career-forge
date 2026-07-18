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
  setSession: (token: string | null, user?: AuthUser | null, refreshToken?: string | null) => void;
  setUser: (u: AuthUser | null) => void;
  setMfaVerified: (v: boolean) => void;
  clear: () => void;
}

const getStoredSession = () => {
  if (typeof window === "undefined") return { token: null, user: null, mfaVerified: false };
  try {
    const token = localStorage.getItem("cf_access_token");
    const user = localStorage.getItem("cf_user");
    const mfaVerified = localStorage.getItem("cf_mfa_verified") === "true";
    if (token) {
      setApiToken(token);
      return { token, user: user ? JSON.parse(user) : null, mfaVerified };
    }
  } catch (e) {
    console.error("Failed to load stored session:", e);
  }
  return { token: null, user: null, mfaVerified: false };
};

const initialSession = getStoredSession();

export const useAuthStore = create<AuthState>((set) => ({
  ...initialSession,
  setSession: (token, user, refreshToken) => {
    setApiToken(token);
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("cf_access_token", token);
      } else {
        localStorage.removeItem("cf_access_token");
      }
      if (user) {
        localStorage.setItem("cf_user", JSON.stringify(user));
      } else if (user === null) {
        localStorage.removeItem("cf_user");
      }
      if (refreshToken) {
        localStorage.setItem("cf_refresh_token", refreshToken);
      } else if (refreshToken === null) {
        localStorage.removeItem("cf_refresh_token");
      }
    }
    set((state) => ({ token, ...(user !== undefined ? { user } : {}) }));
  },
  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("cf_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("cf_user");
      }
    }
    set({ user });
  },
  setMfaVerified: (v) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cf_mfa_verified", String(v));
    }
    set({ mfaVerified: v });
  },
  clear: () => {
    setApiToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("cf_access_token");
      localStorage.removeItem("cf_refresh_token");
      localStorage.removeItem("cf_user");
      localStorage.removeItem("cf_mfa_verified");
    }
    set({ token: null, user: null, mfaVerified: false });
  },
}));
