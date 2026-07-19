import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GraduationCap, Briefcase, User, Save, Plus, X, Loader2, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import {
  useProfile,
  useUpdateProfile,
  useAddEducation,
  useUpdateEducation,
  useDeleteEducation,
  useAddExperience,
  useUpdateExperience,
  useDeleteExperience,
  useAddSkill,
  useDeleteSkill,
} from "@/features/profile/api/profile";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — CareerForge" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const addEdu = useAddEducation();
  const updateEdu = useUpdateEducation();
  const deleteEdu = useDeleteEducation();
  const addExp = useAddExperience();
  const updateExp = useUpdateExperience();
  const deleteExp = useDeleteExperience();
  const addSkill = useAddSkill();
  const deleteSkill = useDeleteSkill();
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({ fullName: "", summary: "", phoneNumber: "", location: "", age: "" });

  // Skills state
  const [newSkillInput, setNewSkillInput] = useState("");
  const rawSkills = profile?.skills || [];
  const userSkills: string[] = Array.isArray(rawSkills)
    ? rawSkills.map((s: any) => (typeof s === "string" ? s : s.name)).filter(Boolean)
    : [];

  // Education form state
  const [showEduForm, setShowEduForm] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduSchool, setEduSchool] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduLevel, setEduLevel] = useState("Undergraduate");
  const [eduBoard, setEduBoard] = useState("");
  const [eduMarks, setEduMarks] = useState("");
  const [eduYearOfPassing, setEduYearOfPassing] = useState("");
  const [eduStartDate, setEduStartDate] = useState("");
  const [eduEndDate, setEduEndDate] = useState("");
  const [eduIsCurrent, setEduIsCurrent] = useState(false);

  // Experience form state
  const [showExpForm, setShowExpForm] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expCompany, setExpCompany] = useState("");
  const [expRole, setExpRole] = useState("");
  const [expStartDate, setExpStartDate] = useState("");
  const [expEndDate, setExpEndDate] = useState("");
  const [expIsCurrent, setExpIsCurrent] = useState(false);

  const resetEduForm = () => {
    setEditingEduId(null);
    setEduSchool("");
    setEduDegree("");
    setEduLevel("Undergraduate");
    setEduBoard("");
    setEduMarks("");
    setEduYearOfPassing("");
    setEduStartDate("");
    setEduEndDate("");
    setEduIsCurrent(false);
    setShowEduForm(false);
  };

  const resetExpForm = () => {
    setEditingExpId(null);
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
    if (profile) {
      const pData = (profile as any)?.data || profile;
      setForm({
        fullName: pData.fullName ?? "",
        summary: pData.summary ?? "",
        phoneNumber: pData.phoneNumber ?? "",
        location: pData.location ?? "",
        age: pData.age ?? "",
      });
    }
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
                    onClick={() => {
                      resetEduForm();
                      setShowEduForm(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald hover:text-emerald-hover transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                )}
              </div>

              {showEduForm ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!eduSchool || !eduDegree) {
                      toast.error("School/Institution and Degree are required");
                      return;
                    }
                    const formatYearToDate = (yr: string) => {
                      if (!yr) return null;
                      if (/^\d{4}$/.test(yr)) return `${yr}-01-01`;
                      return yr;
                    };

                    const payload = {
                      institution: eduSchool,
                      degree: eduDegree,
                      level: eduLevel,
                      board: eduBoard,
                      marks: eduMarks,
                      yearOfPassing: eduYearOfPassing,
                      startDate: formatYearToDate(eduStartDate),
                      endDate: eduIsCurrent ? null : formatYearToDate(eduEndDate),
                      isCurrent: eduIsCurrent
                    };

                    if (editingEduId) {
                      updateEdu.mutate({ id: editingEduId, ...payload }, {
                        onSuccess: () => {
                          toast.success("Education updated");
                          resetEduForm();
                        },
                        onError: (err: any) => toast.error(err.message || "Failed to update education"),
                      });
                    } else {
                      addEdu.mutate(payload, {
                        onSuccess: () => {
                          toast.success("Education added");
                          resetEduForm();
                        },
                        onError: (err: any) => toast.error(err.message || "Failed to add education"),
                      });
                    }
                  }}
                  className="mt-4 p-3 border border-glass-border bg-white/[0.01] rounded-md space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-glass-border pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald">
                      {editingEduId ? "Edit Education Entry" : "Add Education Entry"}
                    </span>
                    <button type="button" onClick={resetEduForm} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Level</label>
                    <select
                      value={eduLevel}
                      onChange={(e) => setEduLevel(e.target.value)}
                      className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-xs outline-none focus:border-primary"
                    >
                      <option value="Undergraduate">Undergraduate / Degree (B.Tech, B.Sc)</option>
                      <option value="Postgraduate">Postgraduate (M.Tech, MBA)</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Class XII">Class XII (Higher Secondary)</option>
                      <option value="Class X">Class X (Secondary School)</option>
                    </select>
                  </div>
                  <Field label="School / Institution / College Name" value={eduSchool} onChange={setEduSchool} placeholder="e.g. Heritage Institute of Technology / St. Xavier's" />
                  <Field label="Degree / Certificate Title" value={eduDegree} onChange={setEduDegree} placeholder="e.g. B.Tech in Computer Science / Higher Secondary" />
                  <Field label="Board / University" value={eduBoard} onChange={setEduBoard} placeholder="e.g. CBSE / ICSE / MAKAUT / Calcutta University" />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Passout Year" value={eduYearOfPassing} onChange={setEduYearOfPassing} placeholder="e.g. 2024" />
                    <Field label="Marks / Percentage / CGPA" value={eduMarks} onChange={setEduMarks} placeholder="e.g. 91.5% or 8.8 CGPA" />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={resetEduForm} className="btn-glow border border-glass-border rounded-md px-3 py-1.5 text-xs font-semibold">
                      Cancel
                    </button>
                    <button type="submit" disabled={addEdu.isPending || updateEdu.isPending} className="btn-glow bg-emerald text-black rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
                      {editingEduId ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              ) : (
                <ul className="mt-3 space-y-3 text-sm">
                  {profile?.education && profile.education.length > 0 ? (
                    profile.education.map((ed, i) => (
                      <li key={ed.id || i} className="group relative rounded-md border border-glass-border bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs text-foreground">{ed.level ? `[${ed.level}] ` : ""}{ed.degree}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{ed.institution || ed.school} {ed.board ? `(${ed.board})` : ""} {ed.marks ? `· Marks: ${ed.marks}` : ""}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {ed.yearOfPassing && <span className="text-[11px] text-emerald-400 font-semibold mr-1">Passout: {ed.yearOfPassing}</span>}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEduId(ed.id || null);
                                setEduSchool(ed.institution || ed.school || "");
                                setEduDegree(ed.degree || "");
                                setEduLevel(ed.level || "Undergraduate");
                                setEduBoard(ed.board || "");
                                setEduMarks(ed.marks || "");
                                setEduYearOfPassing(ed.yearOfPassing || "");
                                setShowEduForm(true);
                              }}
                              className="p-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                              title="Edit Education"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {ed.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  deleteEdu.mutate(ed.id!, {
                                    onSuccess: () => toast.success("Education removed"),
                                    onError: (err: any) => toast.error(err.message || "Failed to remove"),
                                  });
                                }}
                                className="p-1 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                                title="Delete Education"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
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
                    onClick={() => {
                      resetExpForm();
                      setShowExpForm(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
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

                    const payload = {
                      company: expCompany,
                      title: expRole,
                      startDate: formatYearToDate(expStartDate) || "",
                      endDate: expIsCurrent ? null : formatYearToDate(expEndDate),
                      isCurrent: expIsCurrent
                    };

                    if (editingExpId) {
                      updateExp.mutate({ id: editingExpId, ...payload }, {
                        onSuccess: () => {
                          toast.success("Experience updated");
                          resetExpForm();
                        },
                        onError: (err: any) => toast.error(err.message || "Failed to update experience"),
                      });
                    } else {
                      addExp.mutate(payload, {
                        onSuccess: () => {
                          toast.success("Experience added");
                          resetExpForm();
                        },
                        onError: (err: any) => toast.error(err.message || "Failed to add experience"),
                      });
                    }
                  }}
                  className="mt-4 p-3 border border-glass-border bg-white/[0.01] rounded-md space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-glass-border pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {editingExpId ? "Edit Experience Entry" : "Add Experience Entry"}
                    </span>
                    <button type="button" onClick={resetExpForm} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
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
                    <button type="submit" disabled={addExp.isPending || updateExp.isPending} className="btn-glow bg-primary text-black rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
                      {editingExpId ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              ) : (
                <ul className="mt-3 space-y-3 text-sm">
                  {profile?.experiences && profile.experiences.length > 0 ? (
                    profile.experiences.map((ex, i) => (
                      <li key={ex.id || i} className="group relative rounded-md border border-glass-border bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs text-foreground">{ex.role} · {ex.company}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{ex.startDate}–{ex.endDate || "Present"}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingExpId(ex.id || null);
                                setExpCompany(ex.company || "");
                                setExpRole(ex.role || "");
                                setExpStartDate(ex.startDate || "");
                                setExpEndDate(ex.endDate || "");
                                setShowExpForm(true);
                              }}
                              className="p-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                              title="Edit Experience"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {ex.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  deleteExp.mutate(ex.id!, {
                                    onSuccess: () => toast.success("Experience removed"),
                                    onError: (err: any) => toast.error(err.message || "Failed to remove"),
                                  });
                                }}
                                className="p-1 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                                title="Delete Experience"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
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
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-primary flex items-center gap-1.5">
                ⚡ Skills & Competencies
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">
                {userSkills.length} {userSkills.length === 1 ? "skill" : "skills"}
              </span>
            </div>

            {/* Add Skill Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newSkillInput.trim()) return;
                const skillsToAdd = newSkillInput
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => s.length > 0);

                skillsToAdd.forEach((skillName) => {
                  addSkill.mutate({ name: skillName }, {
                    onSuccess: () => {
                      toast.success(`Added ${skillName}`);
                      setNewSkillInput("");
                    },
                    onError: (err: any) => toast.error(err.message || `Failed to add ${skillName}`),
                  });
                });
              }}
              className="mt-3 flex gap-2"
            >
              <input
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Type skill & press Enter (e.g. React, Python, Docker)"
                className="flex-1 rounded-md border border-glass-border bg-input px-3 py-1.5 text-xs outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!newSkillInput.trim() || addSkill.isPending}
                className="btn-glow bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                {addSkill.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                <span>Add</span>
              </button>
            </form>

            {/* Render Active Skills */}
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {userSkills.length > 0 ? (
                userSkills.map((s: string) => (
                  <span
                    key={s}
                    className="group flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary-foreground font-medium transition hover:border-rose-500/50 hover:bg-rose-500/10"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => {
                        deleteSkill.mutate(s, {
                          onSuccess: () => toast.success(`Removed ${s}`),
                          onError: (err: any) => toast.error(err.message || "Failed to remove skill"),
                        });
                      }}
                      className="text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                      title={`Remove ${s}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              ) : (
                <div className="w-full py-2 space-y-2">
                  <p className="text-xs text-muted-foreground italic text-center">No skills added yet. Click suggestions to quick-add:</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {["React", "TypeScript", "Node.js", "Python", "Git", "SQL", "Problem Solving"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          addSkill.mutate({ name: s }, {
                            onSuccess: () => toast.success(`Added ${s}`),
                          });
                        }}
                        className="rounded-full border border-dashed border-glass-border bg-white/[0.02] hover:bg-primary/20 hover:border-primary/40 px-2 py-0.5 text-[11px] text-muted-foreground hover:text-primary transition cursor-pointer"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
