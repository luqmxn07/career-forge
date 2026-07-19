import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { FileText, Plus, Download, Clock, Loader2, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useResumes, useCreateResume, useCompileResume } from "@/features/resume/api/resume";
import { useJobTracker } from "@/features/job-tracker/api/job-tracker";

export const Route = createFileRoute("/_app/resumes")({
  head: () => ({ meta: [{ title: "Resumes — CareerForge" }] }),
  component: ResumesLayout,
});

function ResumesLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isExactIndex = pathname === "/resumes" || pathname === "/resumes/";
  if (!isExactIndex) {
    return <Outlet />;
  }
  return <ResumesPage />;
}

const templates = [
  { id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb7d", name: "Minimal", desc: "Clean single-column, ATS-safe" },
  { id: "a3a2901a-8c5f-40e9-aa81-9b1b4d0891d2", name: "Compact", desc: "Two-column, dense" },
  { id: "f3b39cb2-9d3f-4e0e-9273-04b39ad34b22", name: "Editorial", desc: "Elegant serif accents" },
];

function ResumesPage() {
  const { data: resumes = [], isLoading } = useResumes();
  const { data: jobCards = [] } = useJobTracker();
  const create = useCreateResume();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb7d");
  const [mounted, setMounted] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [targetJd, setTargetJd] = useState("");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryRole = params.get("tailorRole") || params.get("role");
      const queryCompany = params.get("company");
      const queryJd = params.get("jd");

      if (queryRole || queryCompany) {
        const fullTitle = queryCompany ? `${queryRole || "Role"} — ${queryCompany}` : queryRole || "";
        setTitle(fullTitle);
        if (queryRole) setTargetRole(queryRole);
        if (queryJd) setTargetJd(queryJd);
        setOpen(true);
      }
    }
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleCreate = () => {
    const roleForTailoring = targetRole || title;
    create.mutate(
      { title: title || "Untitled resume", templateId },
      {
        onSuccess: (newResume: any) => {
          toast.success("Resume created!");
          setOpen(false);
          setTitle("");
          if (newResume?.id) {
            const query = new URLSearchParams();
            if (roleForTailoring) query.set("autoTailorRole", roleForTailoring);
            if (targetJd) query.set("autoTailorJd", targetJd);
            const searchStr = query.toString() ? `?${query.toString()}` : "";
            window.location.href = `/resumes/${newResume.id}${searchStr}`;
          }
        },
        onError: (err: any) => toast.error(err.message || "Failed"),
      }
    );
  };

  return (
    <div>
      <PageHeader
        title="Resumes"
        description="Create, tailor, and export ATS-ready resumes with 1-click AI generation."
        actions={
          <button onClick={() => setOpen(true)} className="btn-glow btn-glow-hover inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold">
            <Plus className="h-4 w-4" /> Create resume
          </button>
        }
      />

      {resumes.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-4 font-display text-lg font-semibold">No resumes created yet</h3>
          <p className="mt-1 text-xs text-muted-foreground">Craft your first ATS-optimized resume to get started.</p>
          <button onClick={() => setOpen(true)} className="btn-glow btn-glow-hover mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold">
            <Plus className="h-4 w-4" /> Build a resume
          </button>
        </GlassCard>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r: any, i: number) => (
            <ResumeCard key={r.id} r={r} i={i} />
          ))}
        </ul>
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content className="glass-panel fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-glass-border p-6 shadow-2xl data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0">
            <Dialog.Title className="font-display text-xl font-semibold">Create a new resume</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">Give it a title and pick a template. You can rewrite everything later.</Dialog.Description>
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
                          setTitle(`${selectedJob.position} — ${selectedJob.company}`);
                          setTargetRole(selectedJob.position);
                          const cleanJd = (selectedJob.notes || "")
                            .replace(/Job Link:\s*https?:\/\/[^\s]+/gi, "")
                            .replace(/https?:\/\/[^\s]+/gi, "")
                            .replace(/^Key Requirements:\s*/gi, "")
                            .replace(/^\s*[\r\n]/gm, "")
                            .trim();
                          setTargetJd(cleanJd || `Job Position: ${selectedJob.position}\nCompany: ${selectedJob.company}`);
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
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Engineer — Vercel" className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-glow" />
              </label>
              <div>
                <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Template</span>
                <div className="grid gap-2 sm:grid-cols-3">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplateId(t.id)}
                      className={`rounded-md border p-3 text-left transition ${templateId === t.id ? "border-primary bg-primary/10 ring-glow" : "border-glass-border bg-white/[0.02] hover:bg-white/[0.05]"}`}
                    >
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close className="rounded-md border border-glass-border px-4 py-2 text-sm hover:bg-white/[0.04]">Cancel</Dialog.Close>
              <button
                disabled={create.isPending}
                onClick={handleCreate}
                className="btn-glow btn-glow-hover rounded-md px-4 py-2 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>Create</span>
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function ResumeCard({ r, i }: { r: any; i: number }) {
  const compile = useCompileResume(r.id);

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (r.id.startsWith("demo-")) {
      toast.error("Please create a real resume to compile a PDF");
      return;
    }
    
    toast.promise(
      compile.mutateAsync(),
      {
        loading: "Compiling PDF... This may take a few seconds",
        success: (d: any) => {
          if (d?.downloadUrl) {
            const link = document.createElement("a");
            link.href = d.downloadUrl;
            link.target = "_blank";
            link.download = `${r.title || "Resume"}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          return "PDF compiled successfully!";
        },
        error: (err: any) => err.message || "Failed to compile PDF"
      }
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
      <Link to="/resumes/$id" params={{ id: r.id }}>
        <GlassCard className="h-full transition-transform hover:-translate-y-0.5 hover:ring-glow">
          <div className="flex items-start justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-linear-to-br from-primary/30 to-primary/0 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">v3</span>
          </div>
          <p className="mt-4 font-display text-lg font-semibold">{r.title}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> Updated {r.updatedAt || "recently"}
          </p>
          <div className="mt-6 flex items-center justify-between">
            <span className="rounded-full bg-emerald/15 px-2 py-0.5 text-[11px] font-semibold text-emerald">ATS 88</span>
            <button
              onClick={handleDownload}
              disabled={compile.isPending}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {compile.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : <Download className="h-3.5 w-3.5" />} PDF
            </button>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}
