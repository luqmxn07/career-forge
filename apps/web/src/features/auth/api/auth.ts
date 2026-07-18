import { useMutation } from "@tanstack/react-query";
import { api, setAccessToken } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

export interface LoginResponse { accessToken: string; refreshToken?: string; expiresIn: number; user?: any; }

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api.post<LoginResponse>("/auth/login", body),
    onSuccess: (data) => setSession(data.accessToken, data.user ?? null, data.refreshToken),
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (body: {
      email: string;
      password: string;
      fullName: string;
      phoneNumber?: string;
      location?: string;
      age?: string;
    }) => api.post<LoginResponse>("/auth/signup", body),
  });
}

export function useMfaVerify() {
  const setMfa = useAuthStore((s) => s.setMfaVerified);
  return useMutation({
    mutationFn: (body: { code: string }) => api.post("/auth/mfa/verify", body),
    onSuccess: () => setMfa(true),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: { email: string }) => api.post("/auth/reset-password", body),
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSettled: () => { setAccessToken(null); clear(); },
  });
}
