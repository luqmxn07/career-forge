import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAtsScan } from "@/features/ats/api/ats";
import { ScoreBadge } from "./_app.ats";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const s = data ?? (MOCK as any);
  const gauge = s.score ?? MOCK.score;

  return (
    <div>
      <Link to="/ats" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to scans
      </Link>
      <PageHeader title={`Scan #${id.slice(0, 8)}`} description="Detailed ATS match report with recommendations." />

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard glow className="text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Overall match</p>
            <div className="relative mx-auto mt-4 h-40 w-40">
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
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-4">
          <GlassCard>
            <h3 className="flex items-center gap-2 font-display font-semibold text-emerald"><CheckCircle2 className="h-4 w-4" /> Matched keywords</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(s.matchedKeywords ?? MOCK.matchedKeywords).map((k: string) => (
                <span key={k} className="rounded-full bg-emerald/10 px-2.5 py-1 text-xs text-emerald">{k}</span>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="flex items-center gap-2 font-display font-semibold text-destructive"><XCircle className="h-4 w-4" /> Missing keywords</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(s.missingKeywords ?? MOCK.missingKeywords).map((k: string) => (
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
