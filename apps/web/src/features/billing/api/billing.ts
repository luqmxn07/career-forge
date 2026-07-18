import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useCheckout() {
  return useMutation({
    mutationFn: (body: { planTier: "pro" | "team" | "enterprise" }) =>
      api.post<{ url: string }>("/billing/checkout", body),
    onSuccess: (data) => { if (data?.url) window.location.href = data.url; },
  });
}
