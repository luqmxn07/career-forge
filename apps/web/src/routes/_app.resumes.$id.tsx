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
  const { data: resume, isLoading } = useResume(id);
  const update = useUpdateResume(id);
  const compile = useCompileResume(id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (resume) {
      setTitle(resume.title ?? "");
      setContent(typeof resume.content === "string" ? resume.content : JSON.stringify(resume.content ?? {}, null, 2));
    }
  }, [resume]);

  if (!mounted || isLoading || !resume) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  let parsedContent: any = {};
  let parseError = "";
  try {
    parsedContent = JSON.parse(content || "{}");
  } catch (e: any) {
    parseError = "Invalid JSON syntax. Fix syntax to update preview.";
  }
  const personalInfo = parsedContent.personalInfo || {};
  const summary = parsedContent.summary || "";
  const experience = parsedContent.experience || [];
  const education = parsedContent.education || [];
  const skills = parsedContent.skills || [];

  const handleClientPrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popup windows to print resume");
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title || "Resume"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Inter', sans-serif; color: #09090b; margin: 0; padding: 0; background: #ffffff; -webkit-print-color-adjust: exact; }
    h2 { font-size: 22px; font-weight: 800; margin: 0; color: #09090b; letter-spacing: -0.02em; }
    .contact { margin-top: 4px; font-size: 11px; color: #71717a; display: flex; gap: 8px; flex-wrap: wrap; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #71717a; margin-top: 18px; border-bottom: 1px solid #e4e4e7; padding-bottom: 4px; }
    .content-text { margin-top: 6px; font-size: 12px; line-height: 1.5; color: #27272a; }
    .item-header { display: flex; justify-content: space-between; font-weight: 600; font-size: 12px; color: #09090b; margin-top: 10px; }
    .item-date { font-size: 11px; font-weight: 400; color: #71717a; }
    ul { margin: 4px 0 0 0; padding-left: 18px; font-size: 12px; color: #27272a; }
    li { margin-bottom: 3px; }
    .skills-flex { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
    .skill-pill { background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 4px; padding: 2px 6px; font-size: 11px; color: #3f3f46; }
  </style>
</head>
<body>
  <h2>${personalInfo.fullName || title || "Your Name"}</h2>
  <div class="contact">
    ${personalInfo.location ? `<span>${personalInfo.location}</span>` : ""}
    ${personalInfo.location && (personalInfo.email || personalInfo.phone) ? `<span>·</span>` : ""}
    ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ""}
    ${personalInfo.email && personalInfo.phone ? `<span>·</span>` : ""}
    ${personalInfo.phone ? `<span>${personalInfo.phone}</span>` : ""}
    ${personalInfo.website ? `<span>· ${personalInfo.website}</span>` : ""}
  </div>

  ${summary ? `<div class="section-title">Professional Summary</div><div class="content-text">${summary}</div>` : ""}

  ${experience.length > 0 ? `
    <div class="section-title">Work Experience</div>
    ${experience.map((exp: any) => `
      <div class="item-header">
        <span>${exp.position || exp.title || "Role"} · ${exp.company || ""}</span>
        <span class="item-date">${exp.startDate || ""} ${exp.startDate || exp.endDate ? "—" : ""} ${exp.endDate || "Present"}</span>
      </div>
      ${exp.description ? `
        <ul>
          ${(Array.isArray(exp.description) ? exp.description : String(exp.description).split("\n"))
            .filter((l: string) => l.trim().length > 0)
            .map((bullet: string) => `<li>${bullet.replace(/^[-\*\s]+/, "")}</li>`).join("")}
        </ul>
      ` : ""}
    `).join("")}
  ` : ""}

  ${education.length > 0 ? `
    <div class="section-title">Education</div>
    ${education.map((edu: any) => `
      <div class="item-header">
        <span>${edu.degree || ""} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""} ${edu.school ? `· ${edu.school}` : ""}</span>
        <span class="item-date">${edu.startDate || ""} ${edu.startDate || edu.endDate ? "—" : ""} ${edu.endDate || ""}</span>
      </div>
      ${edu.description ? `<div class="content-text">${edu.description}</div>` : ""}
    `).join("")}
  ` : ""}

  ${skills.length > 0 ? `
    <div class="section-title">Skills</div>
    <div class="skills-flex">
      ${skills.map((s: any) => `<span class="skill-pill">${typeof s === "string" ? s : s.name || s}</span>`).join("")}
    </div>
  ` : ""}
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  };

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
              onClick={() => {
                const compilePromise = new Promise((resolve, reject) => {
                  compile.mutate(undefined, {
                    onSuccess: (d) => {
                      if (d?.downloadUrl) {
                        window.open(d.downloadUrl, "_blank");
                        resolve(d);
                      } else {
                        reject(new Error("PDF download URL unavailable"));
                      }
                    },
                    onError: (err: any) => {
                      handleClientPrint();
                      reject(err);
                    }
                  });
                });
                toast.promise(compilePromise, {
                  loading: "Rendering PDF via Headless Chrome...",
                  success: "PDF compiled and ready!",
                  error: (e: any) => e?.message || "Render fallback triggered: Print window opened",
                });
              }}
              className="btn-glow btn-glow-hover inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
            >
              {compile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Compile PDF
            </button>
            <button
              onClick={handleClientPrint}
              className="inline-flex items-center gap-2 rounded-md border border-glass-border bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              title="Print or save as PDF directly from browser"
            >
              Print / Save PDF
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

        <GlassCard className="flex flex-col">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Live preview</p>
            {parseError && <span className="text-[11px] text-amber-500 font-medium">{parseError}</span>}
          </div>
          <div id="printable-resume-preview" className="scrollbar-thin mt-4 max-h-[620px] overflow-y-auto rounded-lg bg-white p-8 text-zinc-900 shadow-inner">
            {/* Header */}
            <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
              {personalInfo.fullName || title || "Your Name"}
            </h2>
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-zinc-500">
              {personalInfo.location && <span>{personalInfo.location}</span>}
              {personalInfo.location && (personalInfo.email || personalInfo.phone) && <span>·</span>}
              {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="hover:underline">{personalInfo.email}</a>}
              {personalInfo.email && personalInfo.phone && <span>·</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.website && <span>·</span>}
              {personalInfo.website && <a href={personalInfo.website} target="_blank" className="hover:underline">{personalInfo.website}</a>}
            </div>

            {/* Summary */}
            {summary && (
              <div className="mt-5 border-t border-zinc-200 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Professional Summary</h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-700">{summary}</p>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div className="mt-5 border-t border-zinc-200 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Work Experience</h3>
                <div className="mt-2 space-y-4">
                  {experience.map((exp: any, idx: number) => (
                    <div key={idx} className="text-xs">
                      <div className="flex items-center justify-between font-semibold text-zinc-950">
                        <span>{exp.position} · {exp.company}</span>
                        <span className="text-[11px] text-zinc-500 font-normal">{exp.startDate} — {exp.endDate || "Present"}</span>
                      </div>
                      {exp.description && (
                        <ul className="mt-1.5 list-disc pl-4 space-y-0.5 text-zinc-700">
                          {(Array.isArray(exp.description)
                            ? exp.description
                            : typeof exp.description === "string"
                            ? exp.description.split("\n").filter((l: string) => l.trim().length > 0)
                            : []
                          ).map((bullet: string, bIdx: number) => (
                            <li key={bIdx}>{bullet.replace(/^[-\*\s]+/, "")}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="mt-5 border-t border-zinc-200 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Education</h3>
                <div className="mt-2 space-y-3">
                  {education.map((edu: any, idx: number) => (
                    <div key={idx} className="text-xs">
                      <div className="flex items-center justify-between font-semibold text-zinc-950">
                        <span>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""} · {edu.school}</span>
                        <span className="text-[11px] text-zinc-500 font-normal">{edu.startDate} — {edu.endDate}</span>
                      </div>
                      {edu.description && <p className="mt-1 text-zinc-600">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="mt-5 border-t border-zinc-200 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Skills</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(Array.isArray(skills) ? skills : [skills]).map((skill: any, idx: number) => (
                    <span key={idx} className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-800">
                      {typeof skill === "string" ? skill : skill.name || JSON.stringify(skill)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
