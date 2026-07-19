import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Interview {
  id: string;
  jobTitle: string;
  score?: number;
  createdAt?: string;
  questions?: Array<{ index: number; prompt: string; answerText?: string; feedback?: string; score?: number }>;
}

export function useInterviews() {
  return useQuery({ queryKey: ["interviews"], queryFn: () => api.get<Interview[]>("/interviews") });
}
export function useInterview(id: string | undefined) {
  return useQuery({
    queryKey: ["interviews", id],
    queryFn: () => api.get<Interview>(`/interviews/${id}`),
    enabled: !!id,
  });
}
export function useCreateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { resumeId: string; jobTitle: string; jobDescription: string }) =>
      api.post<Interview>("/interviews", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["interviews"] }),
  });
}
export function useSubmitAnswer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { questionIndex: number; answerText: string }) =>
      api.post<any>(`/interviews/${id}/answer`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["interviews", id] }),
  });
}
