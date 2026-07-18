import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatCard } from "@/components/shared/StatCard";
import { useInterview, useSubmitAnswer } from "@/features/interviews/api/interviews";

export const Route = createFileRoute("/_app/interviews/$id")({
  head: () => ({ meta: [{ title: "Interview session — CareerForge" }] }),
  component: InterviewDetail,
});

const MOCK_QS = [
  { index: 0, prompt: "Walk me through a recent project you led end-to-end.", feedback: "Strong scoping, add measurable outcome.", score: 82 },
  { index: 1, prompt: "How do you approach performance optimization in React?", feedback: "Good mention of profiling, could go deeper on memoization tradeoffs.", score: 74 },
  { index: 2, prompt: "Describe a conflict with a stakeholder and how you resolved it." },
];

function InterviewDetail() {
  const { id } = Route.useParams();
  const { data } = useInterview(id);
  const submit = useSubmitAnswer(id);
  const [answer, setAnswer] = useState("");
  const [active, setActive] = useState(2);

  const questions = data?.questions?.length ? data.questions : (MOCK_QS as any);
  const scores = questions.filter((q: any) => q.score != null).map((q: any) => q.score);
  const avg = scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

  return (
    <div>
      <Link to="/interviews" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to sessions
      </Link>
      <PageHeader title={data?.jobTitle || "Interview session"} description="Answer each question, receive instant feedback and score." />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Answered" value={`${scores.length}/${questions.length}`} accent="primary" />
        <StatCard label="Avg score" value={`${avg || 0}`} accent="emerald" />
        <StatCard label="Duration" value="12m" accent="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1">
          <h3 className="font-display font-semibold">Questions</h3>
          <ol className="mt-3 space-y-2">
            {questions.map((q: any, i: number) => (
              <li key={i}>
                <button
                  onClick={() => setActive(i)}
                  className={`w-full rounded-md border p-3 text-left text-sm transition ${
                    active === i ? "border-primary bg-primary/10 ring-glow" : "border-glass-border bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">Q{i + 1}</span>
                    {q.score != null && <span className="rounded-full bg-emerald/15 px-2 py-0.5 text-[11px] text-emerald">{q.score}</span>}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm">{q.prompt}</p>
                </button>
              </li>
            ))}
          </ol>
        </GlassCard>

        <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-4">
          <GlassCard>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Question {active + 1}</p>
            <p className="mt-2 font-display text-xl">{questions[active].prompt}</p>
          </GlassCard>

          <GlassCard>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Your answer</span>
              <textarea rows={8} value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm focus:border-primary focus:ring-glow" />
            </label>
            <div className="mt-3 flex justify-end">
              <button
                disabled={!answer || submit.isPending}
                onClick={() =>
                  submit.mutate({ questionIndex: active, answerText: answer }, {
                    onSuccess: (d) => { toast.success(`Score: ${d.score}`); setAnswer(""); },
                    onError: (e: any) => toast.error(e.message || "Failed"),
                  })
                }
                className="btn-glow btn-glow-hover inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit
              </button>
            </div>
          </GlassCard>

          {questions[active].feedback && (
            <GlassCard>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Feedback</p>
              <p className="mt-2 text-sm">{questions[active].feedback}</p>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}
