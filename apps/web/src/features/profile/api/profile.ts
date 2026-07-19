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
  education?: Array<{ id?: string; institution?: string; school?: string; degree: string; level?: string; board?: string; marks?: string; yearOfPassing?: string; startDate?: string; endDate?: string }>;
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
    mutationFn: (body: { institution: string; degree: string; level?: string; board?: string; marks?: string; yearOfPassing?: string; startDate?: string | null; endDate?: string | null; isCurrent?: boolean }) => 
      api.post("/profile/education", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKey }),
  });
}

export function useUpdateEducation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; institution?: string; degree?: string; level?: string; board?: string; marks?: string; yearOfPassing?: string; startDate?: string | null; endDate?: string | null; isCurrent?: boolean }) => 
      api.put(`/profile/education/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKey }),
  });
}

export function useDeleteEducation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/profile/education/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKey }),
  });
}

export function useAddExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { company: string; title: string; startDate: string; endDate?: string | null; isCurrent?: boolean }) => 
      api.post("/profile/experience", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKey }),
  });
}

export function useUpdateExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; company?: string; title?: string; startDate?: string; endDate?: string | null; isCurrent?: boolean }) => 
      api.put(`/profile/experience/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKey }),
  });
}

export function useDeleteExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/profile/experience/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKey }),
  });
}

export function useAddSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; category?: string }) => api.post("/profile/skills", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKey }),
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.delete(`/profile/skills/${encodeURIComponent(name)}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKey }),
  });
}
