import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { FileText, Plus, Download, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useResumes, useCreateResume, useCompileResume } from "@/features/resume/api/resume";

export const Route = createFileRoute("/_app/resumes")({
  head: () => ({ meta: [{ title: "Resumes — CareerForge" }] }),
  component: ResumesLayout,
});

function ResumesLayout() {
  const isIndex = useMatch({ from: "/_app/resumes/", shouldThrow: false });
  if (!isIndex) {
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
  const create = useCreateResume();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb7d");
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

  return (
    <div>
      <PageHeader
        title="Resumes"
        description="Craft minimalist, ATS-ready resumes. PDF compilation runs asynchronously in the background."
        actions={
          <button onClick={() => setOpen(true)} className="btn-glow btn-glow-hover inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold">
            <Plus className="h-4 w-4" /> New resume
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resumes.map((r, i) => (
            <ResumeCard key={r.id} r={r} i={i} />
          ))}
        </div>
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content className="glass-panel fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-glass-border p-6 shadow-2xl data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0">
            <Dialog.Title className="font-display text-xl font-semibold">Create a new resume</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">Give it a title and pick a template. You can rewrite everything later.</Dialog.Description>
            <div className="mt-5 space-y-4">
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
                onClick={() =>
                  create.mutate({ title: title || "Untitled resume", templateId }, {
                    onSuccess: () => { toast.success("Resume created"); setOpen(false); setTitle(""); },
                    onError: (err: any) => toast.error(err.message || "Failed"),
                  })
                }
                className="btn-glow btn-glow-hover rounded-md px-4 py-2 text-sm font-semibold"
              >
                Create
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
