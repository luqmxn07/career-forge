import { createFileRoute, Link, useNavigate, Outlet, useMatch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MessageSquare, Loader2, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useInterviews, useCreateInterview } from "@/features/interviews/api/interviews";
import { useResumes } from "@/features/resume/api/resume";

export const Route = createFileRoute("/_app/interviews")({
  head: () => ({ meta: [{ title: "Interview Simulator — CareerForge" }] }),
  component: InterviewsLayout,
});

function InterviewsLayout() {
  const isIndex = useMatch({ from: "/_app/interviews/", shouldThrow: false });
  if (!isIndex) {
    return <Outlet />;
  }
  return <InterviewsPage />;
}

function InterviewsPage() {
  const { data: sessions = [], isLoading: loadingSessions } = useInterviews();
  const { data: resumes = [], isLoading: loadingResumes } = useResumes();
  const create = useCreateInterview();
  const navigate = useNavigate();
  const [resumeId, setResumeId] = useState("");
  const [title, setTitle] = useState("");
  const [jd, setJd] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center gap-2 text-primary"><MessageSquare className="h-4 w-4" /><h3 className="font-display font-semibold">Start a session</h3></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <select value={resumeId} onChange={(e) => setResumeId(e.target.value)} className="rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm sm:col-span-1">
                <option value="">Resume…</option>
                {resumes.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" className="rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm" />
              <textarea rows={7} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Job description…" className="rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm sm:col-span-2" />
              <div className="sm:col-span-2">
                <button
                  disabled={!resumeId || !title || create.isPending}
                  onClick={() => create.mutate({ resumeId, jobTitle: title, jobDescription: jd }, {
                    onSuccess: (data: any) => {
                      toast.success("Session created");
                      if (data?.id) {
                        navigate({ to: "/interviews/$id", params: { id: data.id } });
                      }
                    },
                    onError: (e: any) => toast.error(e.message || "Failed"),
                  })}
                  className="btn-glow btn-glow-hover inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />} Begin interview
                </button>
              </div>
            </div>
          </GlassCard>
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
