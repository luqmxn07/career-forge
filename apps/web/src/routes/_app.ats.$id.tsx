import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, Loader2, Trash2, Sparkles, ExternalLink, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAtsScan, useDeleteAtsScan } from "@/features/ats/api/ats";
import { useTailorResume } from "@/features/resume/api/resume";
import { ScoreBadge, getScanTitle } from "./_app.ats";

export const Route = createFileRoute("/_app/ats/$id")({
  head: () => ({ meta: [{ title: "ATS Result — CareerForge" }] }),
  component: AtsDetailPage,
});

const MOCK = {
  score: 82,
  matchedKeywords: ["React", "TypeScript", "GraphQL", "Node.js", "Testing", "CI/CD"],
  missingKeywords: ["Kubernetes", "gRPC", "Terraform"],
  suggestions: [
    "Add a bullet quantifying performance improvements (%).",
    "Mention experience owning infrastructure or on-call rotations.",
    "Add a skills line with Kubernetes and Terraform if applicable.",
  ],
};

function AtsDetailPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useAtsScan(id);
  const deleteScan = useDeleteAtsScan();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const s = data ?? (MOCK as any);
  const tailor = useTailorResume(s.resumeId || "");

  if (!mounted || isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const gauge = s.overallScore ?? s.score ?? MOCK.score;
  const scanRoleTitle = getScanTitle(s);
  const missingKws: string[] = s.missingKeywords ?? MOCK.missingKeywords;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this ATS scan?")) {
      try {
        await deleteScan.mutateAsync(id);
        toast.success("Scan deleted");
        navigate({ to: "/ats" });
      } catch (err: any) {
        toast.error(err.message || "Failed to delete scan");
      }
    }
  };

  const handleAiEnhance = async () => {
    if (!s.resumeId) {
      toast.error("No linked resume found for this scan");
      return;
    }
    try {
      const res = await tailor.mutateAsync({
        targetRole: scanRoleTitle,
        jobDescription: s.jobDescriptionText || undefined,
      });
      setEnhancedResult(res);
      toast.success("Resume automatically enhanced & saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to auto-enhance resume");
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/ats" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to scans
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleteScan.isPending}
          className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete scan
        </button>
      </div>
      <PageHeader title={scanRoleTitle} description="Detailed ATS match report with recommendations." />

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard glow className="text-center space-y-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Overall match</p>
            <div className="relative mx-auto h-40 w-40">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" strokeWidth="8" className="stroke-white/10" fill="none" />
                <motion.circle
                  cx="50" cy="50" r="42" strokeWidth="8" fill="none"
                  stroke="url(#gradGauge)" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - gauge / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradGauge" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(212 100% 60%)" />
                    <stop offset="100%" stopColor="hsl(158 84% 48%)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-display text-4xl font-semibold text-gradient-primary">{gauge}%</span>
              </div>
            </div>
            <ScoreBadge score={gauge} />

            {/* AI Enhance Call-to-Action Card */}
            <div className="pt-3 border-t border-glass-border">
              <button
                disabled={tailor.isPending || !s.resumeId}
                onClick={handleAiEnhance}
                className="btn-glow btn-glow-hover w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {tailor.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300" />}
                {tailor.isPending ? "Enhancing Resume..." : "✨ AI Enhance Resume"}
              </button>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Automatically injects missing keywords & optimizes STAR bullet points for this job description.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-4">
          
          {/* Enhanced Result Banner (if user clicked AI Enhance) */}
          {enhancedResult && (
            <GlassCard glow className="border-emerald/40 bg-emerald/10 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald/20 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald flex items-center gap-1.5">
                  <Check className="h-4 w-4" /> AI Resume Enhancements Applied
                </span>
                {s.resumeId && (
                  <Link
                    to="/resumes/$id"
                    params={{ id: s.resumeId }}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    Open in Resume Editor <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
              <div className="space-y-2 text-xs">
                <p className="font-medium text-foreground">
                  Added Keywords to Skills:
                </p>
                <div className="flex flex-wrap gap-1">
                  {missingKws.map((k) => (
                    <span key={k} className="rounded bg-emerald/20 px-2 py-0.5 font-mono text-emerald">
                      + {k}
                    </span>
                  ))}
                </div>
                {enhancedResult.summary && (
                  <div className="mt-2 pt-2 border-t border-emerald/20">
                    <p className="font-medium text-foreground mb-1">Enhanced Professional Summary:</p>
                    <p className="text-muted-foreground italic leading-relaxed">"{enhancedResult.summary}"</p>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          <GlassCard>
            <h3 className="flex items-center gap-2 font-display font-semibold text-emerald"><CheckCircle2 className="h-4 w-4" /> Matched keywords</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(s.matchedKeywords ?? MOCK.matchedKeywords).map((k: string) => (
                <span key={k} className="rounded-full bg-emerald/10 px-2.5 py-1 text-xs text-emerald">{k}</span>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display font-semibold text-destructive"><XCircle className="h-4 w-4" /> Missing keywords</h3>
              <button
                disabled={tailor.isPending || !s.resumeId}
                onClick={handleAiEnhance}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Auto-inject missing keywords
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {missingKws.map((k: string) => (
                <span key={k} className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs text-destructive">{k}</span>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="flex items-center gap-2 font-display font-semibold text-primary"><Lightbulb className="h-4 w-4" /> Suggestions</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {(s.suggestions ?? MOCK.suggestions).map((sg: string, i: number) => (
                <li key={i} className="flex gap-2 rounded-md border border-glass-border bg-white/[0.02] p-3">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">{i + 1}</span>
                  <span className="text-muted-foreground">{sg}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
