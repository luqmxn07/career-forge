import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface DashboardStats {
  resumes: number;
  atsAverageScore: number;
  atsHistory?: Array<{ date: string; score: number }>;
  interviews: number;
  interviewsHistory?: Array<{ date: string; score: number }>;
  kanban: { wishlist: number; applied: number; interview: number; offer: number; rejected: number };
  credits: number;
  creditsMax?: number;
}

export function useDashboardStats() {
  return useQuery({ queryKey: ["dashboard", "stats"], queryFn: () => api.get<DashboardStats>("/dashboard/stats") });
}
