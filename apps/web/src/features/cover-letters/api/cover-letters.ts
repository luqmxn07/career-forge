import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface CoverLetter { id: string; resumeId: string; body: string; createdAt?: string; }

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
    mutationFn: (body: { resumeId: string; jobDescription: string }) =>
      api.post<CoverLetter>("/cover-letters", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cover-letters"] }),
  });
}
