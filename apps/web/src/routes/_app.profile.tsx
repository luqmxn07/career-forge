import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GraduationCap, Briefcase, User, Save, Plus, X, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useProfile, useUpdateProfile, useAddEducation, useAddExperience } from "@/features/profile/api/profile";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — CareerForge" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const addEdu = useAddEducation();
  const addExp = useAddExperience();
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({ fullName: "", summary: "", phoneNumber: "", location: "", age: "" });

  // Education form state
  const [showEduForm, setShowEduForm] = useState(false);
  const [eduSchool, setEduSchool] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduStartDate, setEduStartDate] = useState("");
  const [eduEndDate, setEduEndDate] = useState("");
  const [eduIsCurrent, setEduIsCurrent] = useState(false);

  // Experience form state
  const [showExpForm, setShowExpForm] = useState(false);
  const [expCompany, setExpCompany] = useState("");
  const [expRole, setExpRole] = useState("");
  const [expStartDate, setExpStartDate] = useState("");
  const [expEndDate, setExpEndDate] = useState("");
  const [expIsCurrent, setExpIsCurrent] = useState(false);

  const resetEduForm = () => {
    setEduSchool("");
    setEduDegree("");
    setEduStartDate("");
    setEduEndDate("");
    setEduIsCurrent(false);
    setShowEduForm(false);
  };

  const resetExpForm = () => {
    setExpCompany("");
    setExpRole("");
    setExpStartDate("");
    setExpEndDate("");
    setExpIsCurrent(false);
    setShowExpForm(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (profile) setForm({
      fullName: profile.fullName ?? "",
      summary: profile.summary ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      location: profile.location ?? "",
      age: profile.age ?? "",
    });
  }, [profile]);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald">
                  <GraduationCap className="h-4 w-4" />
                  <h3 className="font-display font-semibold">Education</h3>
                </div>
                {!showEduForm && (
                  <button
                    onClick={() => setShowEduForm(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald hover:text-emerald-hover transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                )}
              </div>

              {showEduForm ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!eduSchool || !eduDegree || !eduStartDate) {
                      toast.error("School, Degree and Start Date are required");
                      return;
                    }
                    const formatYearToDate = (yr: string) => {
                      if (!yr) return null;
                      if (/^\d{4}$/.test(yr)) return `${yr}-01-01`;
                      return yr;
                    };
                    addEdu.mutate({
                      institution: eduSchool,
                      degree: eduDegree,
                      startDate: formatYearToDate(eduStartDate) || "",
                      endDate: eduIsCurrent ? null : formatYearToDate(eduEndDate),
                      isCurrent: eduIsCurrent
                    }, {
                      onSuccess: () => {
                        toast.success("Education added");
                        resetEduForm();
                      },
                      onError: (err: any) => {
                        toast.error(err.message || "Failed to add education");
                      }
                    });
                  }}
                  className="mt-4 p-3 border border-glass-border bg-white/[0.01] rounded-md space-y-3"
                >
                  <Field label="School / University" value={eduSchool} onChange={setEduSchool} placeholder="e.g. MIT" />
                  <Field label="Degree" value={eduDegree} onChange={setEduDegree} placeholder="e.g. B.Sc. Computer Science" />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Start Year" value={eduStartDate} onChange={setEduStartDate} placeholder="e.g. 2018" />
                    {!eduIsCurrent && (
                      <Field label="End Year" value={eduEndDate} onChange={setEduEndDate} placeholder="e.g. 2022" />
                    )}
                  </div>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eduIsCurrent}
                      onChange={(e) => setEduIsCurrent(e.target.checked)}
                      className="rounded border-glass-border bg-input text-primary outline-none focus:ring-glow"
                    />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">I am currently studying here</span>
                  </label>
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={resetEduForm} className="btn-glow border border-glass-border rounded-md px-3 py-1.5 text-xs font-semibold">
                      Cancel
                    </button>
                    <button type="submit" disabled={addEdu.isPending} className="btn-glow bg-emerald text-black rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <ul className="mt-3 space-y-3 text-sm">
                  {profile?.education && profile.education.length > 0 ? (
                    profile.education.map((ed, i) => (
                      <li key={i} className="rounded-md border border-glass-border bg-white/[0.02] p-3">
                        <p className="font-medium">{ed.school}</p>
                        <p className="text-xs text-muted-foreground">{ed.degree} · {ed.startDate}–{ed.endDate || "Present"}</p>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic p-3 text-center">No education history added yet.</p>
                  )}
                </ul>
              )}
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Briefcase className="h-4 w-4" />
                  <h3 className="font-display font-semibold">Experience</h3>
                </div>
                {!showExpForm && (
                  <button
                    onClick={() => setShowExpForm(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                )}
              </div>

              {showExpForm ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!expCompany || !expRole || !expStartDate) {
                      toast.error("Company, Role and Start Date are required");
                      return;
                    }
                    const formatYearToDate = (yr: string) => {
                      if (!yr) return null;
                      if (/^\d{4}$/.test(yr)) return `${yr}-01-01`;
                      return yr;
                    };
                    addExp.mutate({
                      company: expCompany,
                      title: expRole,
                      startDate: formatYearToDate(expStartDate) || "",
                      endDate: expIsCurrent ? null : formatYearToDate(expEndDate),
                      isCurrent: expIsCurrent
                    }, {
                      onSuccess: () => {
                        toast.success("Experience added");
                        resetExpForm();
                      },
                      onError: (err: any) => {
                        toast.error(err.message || "Failed to add experience");
                      }
                    });
                  }}
                  className="mt-4 p-3 border border-glass-border bg-white/[0.01] rounded-md space-y-3"
                >
                  <Field label="Company / Employer" value={expCompany} onChange={setExpCompany} placeholder="e.g. Google" />
                  <Field label="Role / Job Title" value={expRole} onChange={setExpRole} placeholder="e.g. Frontend Engineer" />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Start Year" value={expStartDate} onChange={setExpStartDate} placeholder="e.g. 2022" />
                    {!expIsCurrent && (
                      <Field label="End Year" value={expEndDate} onChange={setExpEndDate} placeholder="e.g. Present" />
                    )}
                  </div>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={expIsCurrent}
                      onChange={(e) => setExpIsCurrent(e.target.checked)}
                      className="rounded border-glass-border bg-input text-primary outline-none focus:ring-glow"
                    />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">I am currently working here</span>
                  </label>
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={resetExpForm} className="btn-glow border border-glass-border rounded-md px-3 py-1.5 text-xs font-semibold">
                      Cancel
                    </button>
                    <button type="submit" disabled={addExp.isPending} className="btn-glow bg-primary text-black rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <ul className="mt-3 space-y-3 text-sm">
                  {profile?.experiences && profile.experiences.length > 0 ? (
                    profile.experiences.map((ex, i) => (
                      <li key={i} className="rounded-md border border-glass-border bg-white/[0.02] p-3">
                        <p className="font-medium">{ex.role} · {ex.company}</p>
                        <p className="text-xs text-muted-foreground">{ex.startDate}–{ex.endDate || "Present"}</p>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic p-3 text-center">No work experience added yet.</p>
                  )}
                </ul>
              )}
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
    <label className="block">
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
