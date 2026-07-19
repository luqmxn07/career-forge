import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Calendar, Tag, Loader2, Sparkles, MapPin, Globe, ExternalLink, Search, CheckCircle2, SlidersHorizontal, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import {
  useJobTracker,
  useUpdateJobCard,
  useCreateJobCard,
  useSearchLiveJobs,
  type JobCard,
  type Stage,
  type DiscoveredJob,
} from "@/features/job-tracker/api/job-tracker";

export const Route = createFileRoute("/_app/job-tracker")({
  head: () => ({ meta: [{ title: "Job Tracker & Live Finder — CareerForge" }] }),
  component: JobTrackerPage,
});

const STAGES: { key: Stage; label: string; accent: string }[] = [
  { key: "wishlist", label: "Wishlist", accent: "from-white/10" },
  { key: "applied", label: "Applied", accent: "from-primary/20" },
  { key: "interview", label: "Interview", accent: "from-emerald/20" },
  { key: "offer", label: "Offer", accent: "from-emerald/30" },
  { key: "rejected", label: "Rejected", accent: "from-destructive/20" },
];

function JobTrackerPage() {
  const { data, isLoading } = useJobTracker();
  const [cards, setCards] = useState<JobCard[]>(data ?? []);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);
  const update = useUpdateJobCard();
  const create = useCreateJobCard();

  // AI Live Job Aggregator State
  const searchJobs = useSearchLiveJobs();
  const [searchRole, setSearchRole] = useState("Frontend Developer");
  const [searchCity, setSearchCity] = useState("Kolkata");
  const [searchCountry, setSearchCountry] = useState("India");
  const [locationPriority, setLocationPriority] = useState<"city" | "country" | "remote">("city");
  const [discoveredJobs, setDiscoveredJobs] = useState<DiscoveredJob[]>([]);
  const [trackedJobIds, setTrackedJobIds] = useState<Set<string>>(new Set());

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

  const handleSearchLiveJobs = async () => {
    if (!searchRole.trim()) {
      toast.error("Please enter a job title or target role!");
      return;
    }

    searchJobs.mutate(
      {
        role: searchRole,
        city: searchCity,
        country: searchCountry,
        locationPriority,
      },
      {
        onSuccess: (jobs) => {
          const list = (jobs as any)?.data || jobs;
          if (Array.isArray(list)) {
            setDiscoveredJobs(list);
            toast.success(`✨ Discovered ${list.length} live job opportunities!`);
          }
        },
        onError: (e: any) => {
          toast.error(e?.message || "Failed to fetch live job postings.");
        },
      }
    );
  };

  const handleTrackDiscoveredJob = (job: DiscoveredJob) => {
    const card: JobCard = {
      id: `live-${Date.now()}`,
      position: job.title,
      company: job.company,
      stage: "wishlist",
      salary: job.salary,
      tags: [job.source, job.isRemote ? "Remote" : job.city || job.location],
    };

    setCards((prev) => [card, ...prev]);
    setTrackedJobIds((prev) => new Set(prev).add(job.id));

    create.mutate(card, {
      onSuccess: () => toast.success(`Added ${job.title} at ${job.company} to Wishlist!`),
      onError: (e: any) => toast.error(e?.message || "Failed to save job to tracker"),
    });
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  function move(id: string, stage: Stage) {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, stage } : c)));
    update.mutate(
      { id, stage },
      {
        onError: (e: any) => toast.error(e.message || "Update failed"),
        onSuccess: () => toast.success(`Moved to ${stage}`),
      }
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Tracker & AI Live Finder"
        description="Discover live job postings from LinkedIn & Indeed, auto-prioritized by your city, country, or remote preferences. Track opportunities across your pipeline."
      />

      {/* AI Live Job Aggregator Control Bar */}
      <GlassCard className="space-y-4 border-emerald-500/20 bg-linear-to-r from-emerald-500/5 via-transparent to-primary/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-glass-border pb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Live Job Discovery Engine</h3>
              <p className="text-[11px] text-muted-foreground">Aggregates live job postings across LinkedIn, Indeed, Glassdoor & Wellfound</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Powered by Omni AI Web Search
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Target Role / Keywords</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={searchRole}
                onChange={(e) => setSearchRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full rounded-md border border-glass-border bg-input pl-8 pr-2.5 py-1.5 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Your City (Local Preference)</label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="e.g. Kolkata / Bengaluru / SF"
                className="w-full rounded-md border border-glass-border bg-input pl-8 pr-2.5 py-1.5 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Country</label>
            <div className="relative">
              <Globe className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
                placeholder="e.g. India / USA"
                className="w-full rounded-md border border-glass-border bg-input pl-8 pr-2.5 py-1.5 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Location Priority</label>
            <div className="relative">
              <SlidersHorizontal className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={locationPriority}
                onChange={(e) => setLocationPriority(e.target.value as any)}
                className="w-full rounded-md border border-glass-border bg-input pl-8 pr-2.5 py-1.5 text-xs outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="city">📍 My City First (Local)</option>
                <option value="country">🌐 Country-Wide Jobs</option>
                <option value="remote">💻 Remote Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSearchLiveJobs}
            disabled={searchJobs.isPending}
            className="btn-glow inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            {searchJobs.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-emerald-300" />}
            <span>{searchJobs.isPending ? "Searching Job Portals..." : "✨ Search Live Jobs"}</span>
          </button>
        </div>
      </GlassCard>

      {/* Discovered Live Jobs Carousel / Grid */}
      {discoveredJobs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-emerald-400" />
              Live Job Postings ({discoveredJobs.length} Found)
            </h3>
            <span className="text-xs text-muted-foreground">Sorted by priority ({locationPriority} mode)</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {discoveredJobs.map((job) => {
              const isTracked = trackedJobIds.has(job.id);
              return (
                <GlassCard key={job.id} className="flex flex-col justify-between p-3.5 space-y-2.5 border-white/10 hover:border-emerald-500/30 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-xs text-foreground line-clamp-1">{job.title}</h4>
                      <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded shrink-0">
                        {job.source}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground">{job.company}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded bg-white/[0.06] px-1.5 py-0.5">
                        <MapPin className="h-2.5 w-2.5 text-rose-400" /> {job.location}
                      </span>
                      {job.salary && (
                        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-400 font-semibold">
                          {job.salary}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-[11px] text-muted-foreground/80 line-clamp-2 leading-snug">
                      {job.descriptionSnippet}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-glass-border">
                    <button
                      onClick={() => handleTrackDiscoveredJob(job)}
                      disabled={isTracked}
                      className={`flex-1 inline-flex items-center justify-center gap-1 rounded px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer transition ${
                        isTracked
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {isTracked ? <CheckCircle2 className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      <span>{isTracked ? "Tracked" : "+ Track Job"}</span>
                    </button>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-1.5 rounded border border-glass-border bg-white/[0.03] hover:bg-white/[0.08] text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Apply on Job Portal"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Drag & Drop Kanban Pipeline */}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {STAGES.map((col) => {
          const items = cards.filter((c) => c.stage === col.key);
          const over = overStage === col.key;
          return (
            <div
              key={col.key}
              onDragOver={(e) => {
                e.preventDefault();
                setOverStage(col.key);
              }}
              onDragLeave={() => setOverStage((s) => (s === col.key ? null : s))}
              onDrop={() => {
                if (dragId) move(dragId, col.key);
                setDragId(null);
                setOverStage(null);
              }}
              className={`glass-card min-h-[420px] p-3 transition ${over ? "ring-glow" : ""}`}
            >
              <div className={`mb-3 flex items-center justify-between rounded-md bg-linear-to-b ${col.accent} to-transparent px-2.5 py-2`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wide">{col.label}</span>
                  <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <button
                  onClick={() => setAdding(col.key)}
                  className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-white/[0.08] hover:text-foreground cursor-pointer"
                >
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
                      className={`cursor-grab rounded-md border border-glass-border bg-white/[0.03] p-3 text-xs active:cursor-grabbing hover:border-white/20 transition-all ${
                        dragId === c.id ? "opacity-40" : ""
                      }`}
                    >
                      <p className="font-semibold text-foreground text-xs">{c.position}</p>
                      <p className="text-[11px] text-muted-foreground">{c.company}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                        {c.salary && (
                          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-400 font-semibold">
                            {c.salary}
                          </span>
                        )}
                        {c.deadline && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {c.deadline}
                          </span>
                        )}
                        {c.tags?.map((t) => (
                          <span key={t} className="inline-flex items-center gap-1 rounded bg-white/[0.06] px-1.5 py-0.5">
                            <Tag className="h-2.5 w-2.5 text-primary" /> {t}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {adding === col.key && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-md border border-primary/50 bg-primary/5 p-2.5 space-y-1.5">
                    <input
                      autoFocus
                      value={newTitle.position}
                      onChange={(e) => setNewTitle({ ...newTitle, position: e.target.value })}
                      placeholder="Position title (e.g. React Developer)"
                      className="w-full rounded bg-transparent px-2 py-1 text-xs outline-none border border-glass-border focus:border-primary"
                    />
                    <input
                      value={newTitle.company}
                      onChange={(e) => setNewTitle({ ...newTitle, company: e.target.value })}
                      placeholder="Company name"
                      className="w-full rounded bg-transparent px-2 py-1 text-xs text-muted-foreground outline-none border border-glass-border focus:border-primary"
                    />
                    <div className="mt-2 flex justify-end gap-1.5">
                      <button onClick={() => setAdding(null)} className="rounded px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer">
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!newTitle.position) return;
                          const card: JobCard = {
                            id: `local-${Date.now()}`,
                            position: newTitle.position,
                            company: newTitle.company || "Direct Application",
                            stage: col.key,
                          };
                          setCards((cs) => [...cs, card]);
                          create.mutate(card, { onError: () => toast.error("Save failed") });
                          setAdding(null);
                          setNewTitle({ company: "", position: "" });
                        }}
                        className="rounded bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground cursor-pointer"
                      >
                        Add Card
                      </button>
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
