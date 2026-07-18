import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Profile {
  id?: string;
  fullName?: string;
  email?: string;
  summary?: string;
  phoneNumber?: string;
  location?: string;
  age?: string;
  completionScore?: number;
  education?: Array<{ id?: string; school: string; degree: string; startDate?: string; endDate?: string }>;
  experiences?: Array<{ id?: string; company: string; role: string; startDate?: string; endDate?: string; summary?: string }>;
  skills?: string[];
}

export const profileKey = ["profile"] as const;

export function useProfile() {
  return useQuery({ queryKey: profileKey, queryFn: () => api.get<Profile>("/profile") });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Profile>) => api.patch<Profile>("/profile", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKey }),
  });
}

export function useAddEducation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NonNullable<Profile["education"]>[number]) => api.post("/profile/education", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKey }),
  });
}

export function useAddExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NonNullable<Profile["experiences"]>[number]) => api.post("/profile/experience", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKey }),
  });
}
