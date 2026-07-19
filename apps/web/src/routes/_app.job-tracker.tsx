import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Calendar, Tag, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useJobTracker, useUpdateJobCard, useCreateJobCard, type JobCard, type Stage } from "@/features/job-tracker/api/job-tracker";

export const Route = createFileRoute("/_app/job-tracker")({
  head: () => ({ meta: [{ title: "Job Tracker — CareerForge" }] }),
  component: JobTrackerPage,
});

const STAGES: { key: Stage; label: string; accent: string }[] = [
  { key: "wishlist", label: "Wishlist", accent: "from-white/10" },
  { key: "applied", label: "Applied", accent: "from-primary/20" },
  { key: "interview", label: "Interview", accent: "from-emerald/20" },
  { key: "offer", label: "Offer", accent: "from-emerald/30" },
  { key: "rejected", label: "Rejected", accent: "from-destructive/20" },
];

const DEMO: JobCard[] = [
  { id: "1", company: "Vercel", position: "Sr Frontend", stage: "wishlist", salary: "$220k", deadline: "Fri", tags: ["Remote"] },
  { id: "2", company: "Linear", position: "Product Engineer", stage: "applied", salary: "$195k", deadline: "Mon", tags: ["Remote"] },
  { id: "3", company: "Stripe", position: "Sr Engineer", stage: "interview", salary: "$240k", deadline: "Wed", tags: ["SF"] },
  { id: "4", company: "Notion", position: "PM", stage: "interview", salary: "$210k", deadline: "Thu", tags: ["NYC"] },
  { id: "5", company: "Figma", position: "Design Eng", stage: "offer", salary: "$260k", tags: ["SF"] },
  { id: "6", company: "Airbnb", position: "Sr Frontend", stage: "rejected", tags: ["Remote"] },
];

function JobTrackerPage() {
  const { data, isLoading } = useJobTracker();
  const [cards, setCards] = useState<JobCard[]>(data ?? []);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);
  const update = useUpdateJobCard();
  const create = useCreateJobCard();
  const [adding, setAdding] = useState<Stage | null>(null);
  const [newTitle, setNewTitle] = useState({ company: "", position: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data) {
      setCards(data);
    }
  }, [data]);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  function move(id: string, stage: Stage) {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, stage } : c)));
    update.mutate({ id, stage }, {
      onError: (e: any) => toast.error(e.message || "Update failed"),
      onSuccess: () => toast.success(`Moved to ${stage}`),
    });
  }

  return (
    <div>
      <PageHeader title="Job Tracker" description="Drag opportunities across your pipeline. Deadlines and salary at a glance." />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {STAGES.map((col) => {
          const items = cards.filter((c) => c.stage === col.key);
          const over = overStage === col.key;
          return (
            <div
              key={col.key}
              onDragOver={(e) => { e.preventDefault(); setOverStage(col.key); }}
              onDragLeave={() => setOverStage((s) => (s === col.key ? null : s))}
              onDrop={() => { if (dragId) move(dragId, col.key); setDragId(null); setOverStage(null); }}
              className={`glass-card min-h-[400px] p-3 transition ${over ? "ring-glow" : ""}`}
            >
              <div className={`mb-3 flex items-center justify-between rounded-md bg-linear-to-b ${col.accent} to-transparent px-2 py-1.5`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{col.label}</span>
                  <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-muted-foreground">{items.length}</span>
                </div>
                <button onClick={() => setAdding(col.key)} className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-white/[0.06] hover:text-foreground">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {items.map((c) => (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      draggable
                      onDragStart={() => setDragId(c.id)}
                      onDragEnd={() => setDragId(null)}
                      whileDrag={{ scale: 1.03, rotate: -1 }}
                      className={`cursor-grab rounded-md border border-glass-border bg-white/[0.03] p-3 text-sm active:cursor-grabbing ${dragId === c.id ? "opacity-40" : ""}`}
                    >
                      <p className="font-semibold">{c.position}</p>
                      <p className="text-xs text-muted-foreground">{c.company}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        {c.salary && <span className="rounded bg-emerald/15 px-1.5 py-0.5 text-emerald">{c.salary}</span>}
                        {c.deadline && (
                          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {c.deadline}</span>
                        )}
                        {c.tags?.map((t) => (
                          <span key={t} className="inline-flex items-center gap-1 rounded bg-white/[0.05] px-1.5 py-0.5"><Tag className="h-3 w-3" /> {t}</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {adding === col.key && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-md border border-primary/50 bg-primary/5 p-2">
                    <input autoFocus value={newTitle.position} onChange={(e) => setNewTitle({ ...newTitle, position: e.target.value })} placeholder="Position" className="w-full rounded bg-transparent px-1 py-1 text-sm outline-none" />
                    <input value={newTitle.company} onChange={(e) => setNewTitle({ ...newTitle, company: e.target.value })} placeholder="Company" className="w-full rounded bg-transparent px-1 py-1 text-xs text-muted-foreground outline-none" />
                    <div className="mt-1 flex justify-end gap-1">
                      <button onClick={() => setAdding(null)} className="rounded px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground">Cancel</button>
                      <button
                        onClick={() => {
                          if (!newTitle.position) return;
                          const card: JobCard = { id: `local-${Date.now()}`, position: newTitle.position, company: newTitle.company, stage: col.key };
                          setCards((cs) => [...cs, card]);
                          create.mutate(card, { onError: () => toast.error("Save failed") });
                          setAdding(null); setNewTitle({ company: "", position: "" });
                        }}
                        className="rounded bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground"
                      >Add</button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
