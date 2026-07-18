import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Download, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useResume, useUpdateResume, useCompileResume } from "@/features/resume/api/resume";

export const Route = createFileRoute("/_app/resumes/$id")({
  head: () => ({ meta: [{ title: "Edit resume — CareerForge" }] }),
  component: ResumeEditor,
});

function ResumeEditor() {
  const { id } = Route.useParams();
  const { data: resume } = useResume(id);
  const update = useUpdateResume(id);
  const compile = useCompileResume(id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (resume) {
      setTitle(resume.title ?? "");
      setContent(typeof resume.content === "string" ? resume.content : JSON.stringify(resume.content ?? {}, null, 2));
    }
  }, [resume]);

  return (
    <div>
      <Link to="/resumes" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to resumes
      </Link>
      <PageHeader
        title={title || "Untitled resume"}
        description="Live editor — changes save on demand. PDF compiles enqueue a background job."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => update.mutate({ title, content }, { onSuccess: () => toast.success("Saved") })}
              className="inline-flex items-center gap-2 rounded-md border border-glass-border bg-white/[0.03] px-4 py-2 text-sm hover:bg-white/[0.06]"
            >
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </button>
            <button
              onClick={() => compile.mutate(undefined, {
                onSuccess: (d) => { toast.success("PDF ready"); if (d?.downloadUrl) window.open(d.downloadUrl, "_blank"); },
                onError: (e: any) => toast.error(e.message || "Compile failed"),
              })}
              className="btn-glow btn-glow-hover inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
            >
              {compile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Compile PDF
            </button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <label>
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-glow" />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Content (JSON / Markdown)</span>
            <textarea
              rows={22}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 font-mono text-xs outline-none focus:border-primary focus:ring-glow"
            />
          </label>
        </GlassCard>

        <GlassCard>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Live preview</p>
          <div className="mt-4 rounded-lg bg-white p-8 text-zinc-900 shadow-inner">
            <h2 className="font-display text-2xl font-bold">{title || "Your Name"}</h2>
            <p className="mt-1 text-xs text-zinc-500">San Francisco · you@work.com · linkedin.com/in/you</p>
            <div className="mt-5 border-t border-zinc-200 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Summary</h3>
              <p className="mt-1.5 text-sm">Product-minded engineer with 6 years shipping consumer products at scale.</p>
            </div>
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Experience</h3>
              <div className="mt-2 text-sm">
                <p className="font-semibold">Senior Frontend Engineer · Stripe</p>
                <p className="text-xs text-zinc-500">2022 — Present</p>
                <ul className="mt-1 list-disc pl-4 text-sm">
                  <li>Led migration of 12M+ session/day dashboard to React 19.</li>
                  <li>Reduced first paint by 42% via streaming SSR.</li>
                </ul>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
