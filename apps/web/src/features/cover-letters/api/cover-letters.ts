import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface CoverLetter {
  id: string;
  userId?: string;
  title?: string;
  company?: string;
  role?: string;
  content?: string;
  body?: string;
  jobDescriptionText?: string;
  tone?: string;
  createdAt?: string;
}

export function useCoverLetters() {
  return useQuery({ queryKey: ["cover-letters"], queryFn: () => api.get<CoverLetter[]>("/cover-letters") });
}
export function useCoverLetter(id: string | undefined) {
  return useQuery({
    queryKey: ["cover-letters", id],
    queryFn: () => api.get<CoverLetter>(`/cover-letters/${id}`),
    enabled: !!id,
  });
}
export function useCreateCoverLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { resumeId?: string; jobDescription: string; company?: string; role?: string }) =>
      api.post<CoverLetter>("/cover-letters", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cover-letters"] });
      qc.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}
export function useDeleteCoverLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cover-letters/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cover-letters"] }),
  });
}
