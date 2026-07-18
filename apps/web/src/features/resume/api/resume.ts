import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Resume { id: string; title: string; templateId?: string; updatedAt?: string; content?: any; }

export function useResumes() {
  return useQuery({ queryKey: ["resumes"], queryFn: () => api.get<Resume[]>("/resume") });
}
export function useResume(id: string | undefined) {
  return useQuery({
    queryKey: ["resume", id],
    queryFn: () => api.get<Resume>(`/resume/${id}`),
    enabled: !!id,
  });
}
export function useCreateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; templateId: string }) => api.post<Resume>("/resume", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resumes"] }),
  });
}
export function useUpdateResume(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { content?: any; title?: string }) => api.patch<Resume>(`/resume/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resume", id] });
      qc.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}
export function useCompileResume(id: string) {
  return useMutation({
    mutationFn: () => api.post<{ downloadUrl: string; jobId?: string }>(`/resume/${id}/compile`),
  });
}
