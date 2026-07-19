import { createFileRoute, Link, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ScanLine, Loader2, Zap, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAtsScans, useCreateAtsScan } from "@/features/ats/api/ats";
import { useResumes } from "@/features/resume/api/resume";
import { useJobTracker } from "@/features/job-tracker/api/job-tracker";

export const Route = createFileRoute("/_app/ats")({
  head: () => ({ meta: [{ title: "ATS Scanner — CareerForge" }] }),
  component: AtsLayout,
});

function AtsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isExactIndex = pathname === "/ats" || pathname === "/ats/";
  if (!isExactIndex) {
    return <Outlet />;
  }
  return <AtsPage />;
}

export function getScanTitle(s: any): string {
  if (s?.role) return `ATS Scan — ${s.role}`;
  if (s?.jobRole) return `ATS Scan — ${s.jobRole}`;
  if (s?.title) return s.title;
  if (s?.jobDescriptionText || s?.jobDescription) {
    const text = s.jobDescriptionText || s.jobDescription || "";
    const clean = text
      .replace(/Job Link:\s*https?:\/\/[^\s]+/gi, "")
      .replace(/^Key Requirements:\s*/gi, "")
      .trim();
    const firstLine = clean.split("\n")[0]?.trim();
    if (firstLine && firstLine.length > 3 && firstLine.length < 50) {
      return `ATS Scan — ${firstLine}`;
    }
  }
  return `ATS Scan Report`;
}

function AtsPage() {
  const { data: scans = [], isLoading: loadingScans } = useAtsScans();
  const { data: resumes = [], isLoading: loadingResumes } = useResumes();
  const { data: jobCards = [] } = useJobTracker();
  const create = useCreateAtsScan();
  const navigate = useNavigate();
  const [resumeId, setResumeId] = useState("");
  const [role, setRole] = useState("");
  const [jd, setJd] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryRole = params.get("role") || params.get("tailorRole");
      const queryJd = params.get("jd");
      if (queryRole) setRole(queryRole);
      if (queryJd) setJd(queryJd);
    }
  }, []);

  useEffect(() => {
    if (resumes && resumes.length > 0 && !resumeId) {
      setResumeId(resumes[0].id);
    }
  }, [resumes, resumeId]);

  if (!mounted || loadingScans || loadingResumes) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="ATS Scanner"
        description="Paste any job description, pick a resume, and get a keyword match report."
        actions={<span className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-white/[0.03] px-3 py-1 text-xs"><Zap className="h-3 w-3 text-emerald" /> 5 credits per scan</span>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center gap-2 text-primary"><ScanLine className="h-4 w-4" /><h3 className="font-display font-semibold">New scan</h3></div>
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
                          setRole(`${selectedJob.position} — ${selectedJob.company}`);
                          const cleanJd = (selectedJob.notes || "")
                            .replace(/Job Link:\s*https?:\/\/[^\s]+/gi, "")
                            .replace(/https?:\/\/[^\s]+/gi, "")
                            .replace(/^Key Requirements:\s*/gi, "")
                            .replace(/^\s*[\r\n]/gm, "")
                            .trim();
                          setJd(cleanJd || `Job Position: ${selectedJob.position}\nCompany: ${selectedJob.company}`);
                          toast.success(`Auto-filled details for ${selectedJob.company}`);
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
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Target Role / Job Position</span>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Lead Frontend Developer"
                  className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Resume</span>
                <select value={resumeId} onChange={(e) => setResumeId(e.target.value)} className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm focus:border-primary focus:ring-glow">
                  <option value="">Select a resume…</option>
                  {resumes.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Job description</span>
                <textarea rows={8} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the full JD here…" className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm focus:border-primary focus:ring-glow" />
              </label>
              <button
                disabled={!resumeId || !jd || create.isPending}
                onClick={() =>
                  create.mutate({ resumeId, jobDescription: jd, jobRole: role } as any, {
                    onSuccess: (data: any) => {
                      toast.success("Scan complete");
                      setJd("");
                      if (data?.id) {
                        navigate({ to: "/ats/$id", params: { id: data.id } });
                      }
                    },
                    onError: (e: any) => toast.error(e.message || "Scan failed"),
                  })
                }
                className="btn-glow btn-glow-hover inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />} Run ATS scan
              </button>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard>
            <h3 className="font-display font-semibold">Recent scans</h3>
            {scans.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">No recent scans yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {scans.map((s: any) => (
                  <li key={s.id}>
                    <Link to="/ats/$id" params={{ id: s.id }} className="flex items-center justify-between rounded-md border border-glass-border bg-white/[0.02] p-3 hover:bg-white/[0.06]">
                      <div className="min-w-0 pr-2">
                        <p className="text-sm font-medium truncate">{getScanTitle(s)}</p>
                        <p className="text-xs text-muted-foreground">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Recent"}</p>
                      </div>
                      <ScoreBadge score={s.score ?? 0} />
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

export function ScoreBadge({ score }: { score: number }) {
  const color = score >= 85 ? "emerald" : score >= 70 ? "primary" : "warning";
  const map: any = {
    emerald: "bg-emerald/15 text-emerald",
    primary: "bg-primary/15 text-primary",
    warning: "bg-warning/15 text-warning",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[color]}`}>{score}%</span>;
}
