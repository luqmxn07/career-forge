import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useCoverLetters, useCreateCoverLetter } from "@/features/cover-letters/api/cover-letters";
import { useResumes } from "@/features/resume/api/resume";

export const Route = createFileRoute("/_app/cover-letters")({
  head: () => ({ meta: [{ title: "Cover Letters — CareerForge" }] }),
  component: CoverLettersPage,
});

function CoverLettersPage() {
  const { data: letters = [] } = useCoverLetters();
  const { data: resumes = [] } = useResumes();
  const create = useCreateCoverLetter();
  const [resumeId, setResumeId] = useState("");
  const [jd, setJd] = useState("");

  const list = letters.length ? letters : [
    { id: "cl1", resumeId: "demo-1", body: "Dear Hiring Team...", createdAt: "2d" } as any,
  ];

  return (
    <div>
      <PageHeader
        title="Cover Letters"
        description="Generate tailored cover letters from a resume + JD in seconds."
        actions={<span className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-white/[0.03] px-3 py-1 text-xs"><Zap className="h-3 w-3 text-emerald" /> 10 credits per letter</span>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard>
            <div className="flex items-center gap-2 text-primary"><Sparkles className="h-4 w-4" /><h3 className="font-display font-semibold">Generate</h3></div>
            <div className="mt-5 space-y-4">
              <select value={resumeId} onChange={(e) => setResumeId(e.target.value)} className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm">
                <option value="">Select resume…</option>
                {(resumes.length ? resumes : [{ id: "demo-1", title: "Senior FE — Stripe" }]).map((r: any) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
              <textarea rows={9} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste JD…" className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm" />
              <button
                disabled={!resumeId || !jd || create.isPending}
                onClick={() => create.mutate({ resumeId, jobDescription: jd }, {
                  onSuccess: () => toast.success("Cover letter drafted"),
                  onError: (e: any) => toast.error(e.message || "Failed"),
                })}
                className="btn-glow btn-glow-hover inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate letter
              </button>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GlassCard>
            <h3 className="font-display font-semibold">Recent</h3>
            <ul className="mt-3 space-y-2">
              {list.map((l: any) => (
                <li key={l.id} className="rounded-md border border-glass-border bg-white/[0.02] p-3 text-sm">
                  <p className="font-medium">Letter #{l.id.slice(0, 6)}</p>
                  <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{l.body}</p>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
