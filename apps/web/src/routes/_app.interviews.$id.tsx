import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
  const { data, isLoading, refetch } = useInterview(id);
  const submit = useSubmitAnswer(id);
  const [answer, setAnswer] = useState("");
  const [active, setActive] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const questions = data?.questions?.length ? data.questions : (MOCK_QS as any);
  const currentQ = questions[active] || questions[0];

  // Sync textarea state when switching active question
  useEffect(() => {
    if (currentQ) {
      setAnswer(currentQ.answerText || "");
      setIsEditing(!currentQ.answerText);
    }
  }, [active, data]);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const scores = questions.filter((q: any) => q.score != null).map((q: any) => q.score);
  const avg = scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    try {
      const res = await submit.mutateAsync({ questionIndex: active, answerText: answer });
      toast.success(`Answer evaluated! Score: ${res.gradedAnswer?.score || res.score || 80}/100`);
      setIsEditing(false);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit answer");
    }
  };

  return (
    <div>
      <Link to="/interviews" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to sessions
      </Link>
      <PageHeader title={data?.jobTitle || "Interview session"} description="Answer each question, receive instant feedback and score." />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Answered" value={`${scores.length}/${questions.length}`} accent="primary" />
        <StatCard label="Avg score" value={`${avg || 0}/100`} accent="emerald" />
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
                    {q.score != null ? (
                      <span className="rounded-full bg-emerald/15 px-2 py-0.5 text-[11px] font-bold text-emerald">{q.score}%</span>
                    ) : q.answerText ? (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] text-primary">Answered</span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm">{q.prompt || q.question}</p>
                </button>
              </li>
            ))}
          </ol>
        </GlassCard>

        <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-4">
          <GlassCard>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Question {active + 1} of {questions.length}</p>
              {currentQ?.score != null && (
                <span className="rounded-full bg-emerald/20 border border-emerald/40 px-3 py-1 text-xs font-bold text-emerald">
                  Score: {currentQ.score}/100
                </span>
              )}
            </div>
            <p className="mt-2 font-display text-xl">{currentQ?.prompt || currentQ?.question || "Select a question"}</p>
          </GlassCard>

          {/* If Question is already answered and user is not editing, show the Saved Submitted Answer Card */}
          {currentQ?.answerText && !isEditing ? (
            <GlassCard className="border-emerald/30 bg-emerald/5 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald/20 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald flex items-center gap-1.5">
                  ✓ Saved Submitted Answer
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Edit / Resubmit Answer
                </button>
              </div>
              <p className="text-sm whitespace-pre-wrap text-foreground/90 font-sans leading-relaxed">
                {currentQ.answerText}
              </p>
            </GlassCard>
          ) : (
            /* Otherwise show the Answer Input Card */
            <GlassCard>
              <label className="block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your Answer</span>
                  {currentQ?.answerText && (
                    <button onClick={() => setIsEditing(false)} className="text-xs text-muted-foreground hover:underline">
                      Cancel edit
                    </button>
                  )}
                </div>
                <textarea
                  rows={7}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm focus:border-primary focus:ring-glow"
                />
              </label>
              <div className="mt-3 flex justify-end">
                <button
                  disabled={!answer.trim() || submit.isPending}
                  onClick={handleSubmit}
                  className="btn-glow btn-glow-hover inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit Answer
                </button>
              </div>
            </GlassCard>
          )}

          {/* Saved AI Feedback Card */}
          {currentQ?.feedback && (
            <GlassCard glow className="border-primary/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">AI Evaluation & Feedback</span>
                {currentQ.score != null && (
                  <span className="text-xs font-semibold text-emerald bg-emerald/10 px-2.5 py-0.5 rounded-full border border-emerald/30">
                    Grade: {currentQ.score}%
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-foreground/90 leading-relaxed">{currentQ.feedback}</p>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}
