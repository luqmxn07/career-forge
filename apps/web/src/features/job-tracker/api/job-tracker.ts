import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export type Stage = "wishlist" | "applied" | "interview" | "offer" | "rejected";
export interface JobCard {
  id: string;
  company: string;
  position: string;
  stage: Stage;
  salary?: string;
  deadline?: string;
  tags?: string[];
}

export interface DiscoveredJob {
  id: string;
  title: string;
  company: string;
  location: string;
  city: string;
  country: string;
  source: string;
  url: string;
  salary?: string;
  isRemote: boolean;
  descriptionSnippet: string;
}

export function useJobTracker() {
  return useQuery({ queryKey: ["job-tracker"], queryFn: () => api.get<JobCard[]>("/job-tracker") });
}
export function useCreateJobCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<JobCard, "id">) => api.post<JobCard>("/job-tracker", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job-tracker"] }),
  });
}
export function useUpdateJobCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<JobCard> & { id: string }) =>
      api.patch<JobCard>(`/job-tracker/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job-tracker"] }),
  });
}
export function useSearchLiveJobs() {
  return useMutation({
    mutationFn: (body: {
      role: string;
      city?: string;
      country?: string;
      locationPriority?: "city" | "country" | "remote";
    }) => api.post<DiscoveredJob[]>("/job-tracker/search", body),
  });
}
