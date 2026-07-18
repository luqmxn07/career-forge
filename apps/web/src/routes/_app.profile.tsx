import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GraduationCap, Briefcase, User, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useProfile, useUpdateProfile } from "@/features/profile/api/profile";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — CareerForge" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const [form, setForm] = useState({ fullName: "", summary: "", phoneNumber: "", location: "", age: "" });
  useEffect(() => {
    if (profile) setForm({
      fullName: profile.fullName ?? "",
      summary: profile.summary ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      location: profile.location ?? "",
      age: profile.age ?? "",
    });
  }, [profile]);

  const completion = profile?.completionScore ?? 62;

  return (
    <div>
      <PageHeader title="Profile" description="Your master profile powers every resume, cover letter, and interview session." />

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center gap-2 text-primary"><User className="h-4 w-4" /> <h3 className="font-display text-lg font-semibold">Personal info</h3></div>
            <form
              className="mt-6 grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                update.mutate(form, {
                  onSuccess: () => toast.success("Profile saved"),
                  onError: (err: any) => toast.error(err.message || "Failed"),
                });
              }}
            >
              <Field label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
              <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="City, Country" />
              <Field label="Phone" value={form.phoneNumber} onChange={(v) => setForm({ ...form, phoneNumber: v })} />
              <Field label="Age" value={form.age} onChange={(v) => setForm({ ...form, age: v })} placeholder="25" />
              <Field label="Email" value={profile?.email ?? ""} onChange={() => {}} placeholder="you@work.com" />
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Summary</span>
                <textarea
                  rows={4}
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-glow"
                />
              </label>
              <div className="sm:col-span-2">
                <button className="btn-glow btn-glow-hover inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold">
                  <Save className="h-4 w-4" /> Save changes
                </button>
              </div>
            </form>
          </GlassCard>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <GlassCard>
              <div className="flex items-center gap-2 text-emerald"><GraduationCap className="h-4 w-4" /><h3 className="font-display font-semibold">Education</h3></div>
              <ul className="mt-3 space-y-3 text-sm">
                {(profile?.education ?? [{ school: "MIT", degree: "B.Sc. Computer Science", startDate: "2018", endDate: "2022" }]).map((ed, i) => (
                  <li key={i} className="rounded-md border border-glass-border bg-white/[0.02] p-3">
                    <p className="font-medium">{ed.school}</p>
                    <p className="text-xs text-muted-foreground">{ed.degree} · {ed.startDate}–{ed.endDate ?? "Present"}</p>
                  </li>
                ))}
              </ul>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-2 text-primary"><Briefcase className="h-4 w-4" /><h3 className="font-display font-semibold">Experience</h3></div>
              <ul className="mt-3 space-y-3 text-sm">
                {(profile?.experiences ?? [
                  { company: "Stripe", role: "Frontend Engineer", startDate: "2022", endDate: "Present" },
                ]).map((ex, i) => (
                  <li key={i} className="rounded-md border border-glass-border bg-white/[0.02] p-3">
                    <p className="font-medium">{ex.role} · {ex.company}</p>
                    <p className="text-xs text-muted-foreground">{ex.startDate}–{ex.endDate ?? "Present"}</p>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard glow>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Profile completion</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-4xl font-semibold text-gradient-primary">{completion}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-linear-to-r from-primary to-emerald" style={{ width: `${completion}%` }} />
            </div>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>✓ Add 3+ experiences</li>
              <li>✓ Set a professional summary</li>
              <li>○ Add 5+ skills</li>
              <li>○ Verify phone number</li>
            </ul>
          </GlassCard>

          <GlassCard className="mt-4">
            <h3 className="font-display font-semibold">Skills</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(profile?.skills ?? ["React", "TypeScript", "Node.js", "GraphQL", "Postgres"]).map((s) => (
                <span key={s} className="rounded-full border border-glass-border bg-white/[0.03] px-2.5 py-1 text-xs">{s}</span>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-glow"
      />
    </label>
  );
}
