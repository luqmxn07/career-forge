import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface AdminStats {
  totalUsers: number;
  premiumRatio: number;
  totalScans: number;
  totalInterviews: number;
  usersOverTime?: Array<{ date: string; users: number }>;
}
export interface AuditLog { id: string; actor: string; action: string; target?: string; createdAt: string; }
export interface Feedback { id: string; user: string; subject: string; status: "open" | "in_progress" | "closed"; createdAt: string; }

export function useAdminStats() {
  return useQuery({ queryKey: ["admin", "stats"], queryFn: () => api.get<AdminStats>("/admin/stats") });
}
export function useAuditLogs() {
  return useQuery({ queryKey: ["admin", "audit-logs"], queryFn: () => api.get<AuditLog[]>("/admin/audit-logs") });
}
export function useAdminFeedback() {
  return useQuery({ queryKey: ["admin", "feedback"], queryFn: () => api.get<Feedback[]>("/admin/feedback") });
}
export function useAdjustCredits() {
  return useMutation({
    mutationFn: (body: { userId: string; amount: number; reason: string }) =>
      api.post("/admin/credits/adjust", body),
  });
}
export function useUpdateFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Feedback["status"] }) =>
      api.patch(`/admin/feedback/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "feedback"] }),
  });
}
