import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Zap, Briefcase, Copy, Download, Trash2, Check, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useCoverLetters, useCreateCoverLetter, useDeleteCoverLetter } from "@/features/cover-letters/api/cover-letters";
import { useResumes } from "@/features/resume/api/resume";
import { useJobTracker } from "@/features/job-tracker/api/job-tracker";

export const Route = createFileRoute("/_app/cover-letters")({
  head: () => ({ meta: [{ title: "Cover Letters — CareerForge" }] }),
  component: CoverLettersPage,
});

function CoverLettersPage() {
  const { data: letters = [], isLoading: loadingLetters } = useCoverLetters();
  const { data: resumes = [], isLoading: loadingResumes } = useResumes();
  const { data: jobCards = [] } = useJobTracker();
  const create = useCreateCoverLetter();
  const deleteLetter = useDeleteCoverLetter();

  const [resumeId, setResumeId] = useState("");
  const [jd, setJd] = useState("");
  const [mounted, setMounted] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryJd = params.get("jd");
      const queryCompany = params.get("company");
      const queryRole = params.get("role");
      if (queryJd) setJd(queryJd);
      if (queryCompany) setSelectedCompany(queryCompany);
      if (queryRole) setSelectedRole(queryRole);
    }
  }, []);

  useEffect(() => {
    if (resumes && resumes.length > 0 && !resumeId) {
      setResumeId(resumes[0].id);
    }
  }, [resumes, resumeId]);

  useEffect(() => {
    if (letters.length > 0 && !activeLetterId) {
      setActiveLetterId(letters[0].id);
    }
  }, [letters, activeLetterId]);

  if (!mounted || loadingLetters || loadingResumes) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeLetter = letters.find((l: any) => l.id === activeLetterId) || letters[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Cover letter copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (letter: any) => {
    const text = letter.content || letter.body || "";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${letter.title || "Cover_Letter"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded as text file!");
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    deleteLetter.mutate(id, {
      onSuccess: () => {
        toast.success("Cover letter deleted");
        if (activeLetterId === id) {
          const next = letters.find((l: any) => l.id !== id);
          setActiveLetterId(next ? next.id : null);
        }
      },
      onError: (err: any) => toast.error(err.message || "Failed to delete cover letter"),
    });
  };

  return (
    <div>
      <PageHeader
        title="Cover Letters"
        description="Generate tailored cover letters from a resume + JD in seconds."
        actions={<span className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-white/[0.03] px-3 py-1 text-xs"><Zap className="h-3 w-3 text-emerald" /> 10 credits per letter</span>}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Form: Generator & Recent List */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard>
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <h3 className="font-display font-semibold">Generate Letter</h3>
              </div>
              <div className="mt-5 space-y-4">
                
                {/* Auto-Fill from Tracked Jobs */}
                {jobCards && jobCards.length > 0 && (
                  <div className="rounded-md border border-primary/30 bg-primary/10 p-3 space-y-1.5">
                    <label className="block">
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                          <Briefcase className="h-3.5 w-3.5" /> Auto-Fill from Tracked Jobs
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {jobCards.length} saved {jobCards.length === 1 ? "job" : "jobs"}
                        </span>
                      </div>
                      <select
                        onChange={(e) => {
                          const selectedJob = jobCards.find((j: any) => j.id === e.target.value);
                          if (selectedJob) {
                            setSelectedCompany(selectedJob.company || "");
                            setSelectedRole(selectedJob.position || "");
                            const cleanJd = (selectedJob.notes || "")
                              .replace(/Job Link:\s*https?:\/\/[^\s]+/gi, "")
                              .replace(/https?:\/\/[^\s]+/gi, "")
                              .replace(/^Key Requirements:\s*/gi, "")
                              .replace(/^\s*[\r\n]/gm, "")
                              .trim();
                            setJd(cleanJd || `Target Role: ${selectedJob.position} at ${selectedJob.company}`);
                            toast.success(`Auto-filled JD for ${selectedJob.company}`);
                          }
                        }}
                        defaultValue=""
                        className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-xs outline-none focus:border-primary text-foreground"
                      >
                        <option value="" disabled>Select a tracked job to auto-fill details...</option>
                        {jobCards.map((j: any) => (
                          <option key={j.id} value={j.id}>
                            {j.position} at {j.company} ({j.stage || "WISHLIST"})
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}

                <select value={resumeId} onChange={(e) => setResumeId(e.target.value)} className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm">
                  <option value="">Select resume (optional)…</option>
                  {resumes.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
                <textarea rows={8} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste Job Description..." className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm" />
                <button
                  disabled={!jd || create.isPending}
                  onClick={() => create.mutate({
                    resumeId: resumeId || (resumes && resumes[0]?.id) || "",
                    jobDescription: jd,
                    company: selectedCompany || "Target Company",
                    role: selectedRole || "Target Role",
                  } as any, {
                    onSuccess: (newLetter: any) => {
                      toast.success("Cover letter generated!");
                      setJd("");
                      if (newLetter?.id) {
                        setActiveLetterId(newLetter.id);
                      }
                    },
                    onError: (e: any) => toast.error(e.message || "Failed to generate cover letter"),
                  })}
                  className="btn-glow btn-glow-hover w-full inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate letter
                </button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Recent Cover Letters List */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <GlassCard>
              <h3 className="font-display font-semibold mb-3">Saved Letters</h3>
              {letters.length === 0 ? (
                <p className="text-xs text-muted-foreground">No cover letters generated yet.</p>
              ) : (
                <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {letters.map((l: any) => {
                    const displayTitle = l.title || `${l.role || "Target Role"} — ${l.company || "Company"}` || `Letter #${l.id.slice(0, 6)}`;
                    const isSelected = (activeLetterId === l.id) || (!activeLetterId && l.id === letters[0]?.id);
                    return (
                      <li key={l.id}>
                        <button
                          onClick={() => setActiveLetterId(l.id)}
                          className={`w-full rounded-md border p-3 text-left transition flex items-center justify-between gap-2 ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-glow"
                              : "border-glass-border bg-white/[0.02] hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{displayTitle}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "Saved draft"}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDelete(l.id, e)}
                            className="p-1.5 text-muted-foreground hover:text-red-400 rounded transition opacity-60 hover:opacity-100"
                            title="Delete letter"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Right Side: Interactive Cover Letter Content Viewer */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {activeLetter ? (
              <motion.div
                key={activeLetter.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <GlassCard glow className="space-y-4 border-primary/20">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-glass-border pb-4">
                    <div>
                      <h2 className="font-display text-lg font-bold text-foreground">
                        {activeLetter.title || `${activeLetter.role || "Role"} Cover Letter`}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Company: <span className="font-medium text-foreground">{activeLetter.company || "Target Company"}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(activeLetter.content || activeLetter.body || "")}
                        className="inline-flex items-center gap-1.5 rounded-md border border-glass-border bg-white/[0.03] px-3 py-1.5 text-xs font-semibold hover:bg-white/[0.08] transition text-foreground"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald" /> : <Copy className="h-3.5 w-3.5 text-primary" />}
                        {copied ? "Copied" : "Copy"}
                      </button>

                      <button
                        onClick={() => handleDownload(activeLetter)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-glass-border bg-white/[0.03] px-3 py-1.5 text-xs font-semibold hover:bg-white/[0.08] transition text-foreground"
                      >
                        <Download className="h-3.5 w-3.5 text-sky-400" />
                        Download .txt
                      </button>

                      <button
                        onClick={() => handleDelete(activeLetter.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-400 rounded transition"
                        title="Delete letter"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Letter Body Display */}
                  <div className="rounded-md border border-glass-border bg-black/40 p-5 font-sans text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap selection:bg-primary/30">
                    {activeLetter.content || activeLetter.body || "No letter content available."}
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <GlassCard className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <h4 className="font-display font-semibold text-base text-foreground">No Cover Letter Selected</h4>
                <p className="mt-1 text-xs max-w-sm">
                  Generate a new cover letter on the left or select an existing letter to view, copy, and export it.
                </p>
              </GlassCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
