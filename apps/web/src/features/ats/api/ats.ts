import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface AtsScan {
  id: string;
  resumeId: string;
  score?: number;
  createdAt?: string;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  suggestions?: string[];
}

export function useAtsScans() {
  return useQuery({ queryKey: ["ats"], queryFn: () => api.get<AtsScan[]>("/ats") });
}
export function useAtsScan(id: string | undefined) {
  return useQuery({
    queryKey: ["ats", id],
    queryFn: () => api.get<AtsScan>(`/ats/${id}`),
    enabled: !!id,
  });
}
export function useCreateAtsScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { resumeId: string; jobDescription: string; jobRole?: string }) =>
      api.post<AtsScan>("/ats", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ats"] }),
  });
}

export function useDeleteAtsScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/ats/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ats"] }),
  });
}
