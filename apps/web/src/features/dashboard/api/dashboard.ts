import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface DashboardStats {
  resumesCount: number;
  averageAtsScore: number;
  interviewsCount: number;
  jobTrackerStages: Array<{ stage: string; count: number }>;
  credits: number;
}

export function useDashboardStats() {
  return useQuery({ queryKey: ["dashboard", "stats"], queryFn: () => api.get<DashboardStats>("/dashboard/stats") });
}
