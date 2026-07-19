import { createFileRoute, Link, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MessageSquare, Loader2, Zap, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useInterviews, useCreateInterview } from "@/features/interviews/api/interviews";
import { useResumes } from "@/features/resume/api/resume";
import { useJobTracker } from "@/features/job-tracker/api/job-tracker";

export const Route = createFileRoute("/_app/interviews")({
  head: () => ({ meta: [{ title: "Interview Simulator — CareerForge" }] }),
  component: InterviewsLayout,
});

function InterviewsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isExactIndex = pathname === "/interviews" || pathname === "/interviews/";
  if (!isExactIndex) {
    return <Outlet />;
  }
  return <InterviewsPage />;
}

function InterviewsPage() {
  const { data: sessions = [], isLoading: loadingSessions } = useInterviews();
  const { data: resumes = [], isLoading: loadingResumes } = useResumes();
  const { data: jobCards = [] } = useJobTracker();
  const create = useCreateInterview();
  const navigate = useNavigate();
  const [resumeId, setResumeId] = useState("");
  const [title, setTitle] = useState("");
  const [jd, setJd] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryRole = params.get("role");
      const queryCompany = params.get("company");
      const queryJd = params.get("jd");
      if (queryRole || queryCompany) {
        setTitle(queryCompany ? `${queryRole || "Role"} at ${queryCompany}` : queryRole || "");
      }
      if (queryJd) setJd(queryJd);
    }
  }, []);

  useEffect(() => {
    if (resumes && resumes.length > 0 && !resumeId) {
      setResumeId(resumes[0].id);
    }
  }, [resumes, resumeId]);

  if (!mounted || loadingSessions || loadingResumes) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="AI Interview Simulator"
        description="Practice against realistic questions, get instant transcript feedback and a per-answer score."
        actions={<span className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-white/[0.03] px-3 py-1 text-xs"><Zap className="h-3 w-3 text-emerald" /> 15 credits per session</span>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-4">
          <GlassCard>
            <div className="flex items-center gap-2 text-primary"><MessageSquare className="h-4 w-4" /><h3 className="font-display font-semibold">Start a session</h3></div>
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
                          setTitle(`${selectedJob.position} at ${selectedJob.company}`);
                          const cleanJd = (selectedJob.notes || "")
                            .replace(/Job Link:\s*https?:\/\/[^\s]+/gi, "")
                            .replace(/https?:\/\/[^\s]+/gi, "")
                            .replace(/^Key Requirements:\s*/gi, "")
                            .replace(/^\s*[\r\n]/gm, "")
                            .trim();
                          setJd(cleanJd || `Position: ${selectedJob.position}\nCompany: ${selectedJob.company}`);
                          toast.success(`Auto-filled session details for ${selectedJob.company}`);
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

              <div className="grid gap-4 sm:grid-cols-2">
                <select value={resumeId} onChange={(e) => setResumeId(e.target.value)} className="rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm sm:col-span-1">
                  <option value="">Select a resume…</option>
                  {resumes.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Target Role / Company (e.g. Frontend Dev at Google)" className="rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm" />
                <textarea rows={7} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste Job Description..." className="rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm sm:col-span-2" />
                <div className="sm:col-span-2">
                  <button
                    disabled={!resumeId || !title || create.isPending}
                    onClick={() => create.mutate({
                      type: "JD",
                      difficulty: "Mid",
                      sourceResumeId: resumeId,
                      resumeId,
                      jobTitle: title,
                      jobDescription: jd,
                      jobDescriptionText: jd,
                    } as any, {
                      onSuccess: (data: any) => {
                        toast.success("Session created");
                        if (data?.id) {
                          navigate({ to: "/interviews/$id", params: { id: data.id } });
                        }
                      },
                      onError: (e: any) => toast.error(e.message || "Failed to create interview session"),
                    })}
                    className="btn-glow btn-glow-hover inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                  >
                    {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />} Begin interview session
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* AI Recommended Interview Questions for Target Job */}
          {title && (
            <GlassCard className="border-purple-500/30 bg-purple-500/5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
                  <span>AI Predicted Interview Questions for {title}</span>
                </h4>
                <span className="text-[10px] text-purple-300/80 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 font-mono">Custom Job Prep</span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-purple-400">1.</span>
                  <span>"Walk me through your background and why you're interested in the {title} position."</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-purple-400">2.</span>
                  <span>"How do your skills align with the core technical requirements of this role?"</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-purple-400">3.</span>
                  <span>"Describe a challenging project relevant to this job description and how you solved it."</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-purple-400">4.</span>
                  <span>"How do you handle deadline pressures or changing priorities in a fast-paced team?"</span>
                </p>
              </div>
            </GlassCard>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard>
            <h3 className="font-display font-semibold">Sessions</h3>
            {sessions.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">No interview sessions yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {sessions.map((s: any) => (
                  <li key={s.id}>
                    <Link to="/interviews/$id" params={{ id: s.id }} className="flex items-center justify-between rounded-md border border-glass-border bg-white/[0.02] p-3 hover:bg-white/[0.06]">
                      <p className="text-sm font-medium truncate">{s.jobTitle}</p>
                      <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">{s.score ?? 0}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
