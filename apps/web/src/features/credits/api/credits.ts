import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useCredits() {
  return useQuery({
    queryKey: ["credits"],
    queryFn: async () => {
      const res = await api.get<{ balance: number } | number>("/credits/balance");
      if (typeof res === "number") return res;
      return res?.balance ?? 100;
    },
    staleTime: 5000,
  });
}
