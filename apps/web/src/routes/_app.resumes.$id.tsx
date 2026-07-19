import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Download, Loader2, Save, Sparkles, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useResume, useUpdateResume } from "@/features/resume/api/resume";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/_app/resumes/$id")({
  head: () => ({ meta: [{ title: "Edit resume — CareerForge" }] }),
  component: ResumeEditor,
});

function ResumeEditor() {
  const { id } = Route.useParams();
  const { data: resume, isLoading } = useResume(id);
  const update = useUpdateResume(id);
  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState<"role" | "personal" | "summary" | "experience" | "education" | "skills" | "projects">("role");
  const [isTailoring, setIsTailoring] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form State
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
  });
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState<Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string[];
  }>>([]);
  const [education, setEducation] = useState<Array<{
    institution: string;
    degree: string;
    level: string; // e.g., Class X, Class XII, B.Tech, Diploma, Master
    board: string;
    fieldOfStudy: string;
    yearOfPassing: string;
    marks: string;
  }>>([]);
  const [skills, setSkills] = useState<{
    technical: string[];
    tools: string[];
    soft: string[];
  }>({ technical: [], tools: [], soft: [] });
  const [techSkillsInput, setTechSkillsInput] = useState("");
  const [toolsSkillsInput, setToolsSkillsInput] = useState("");
  const [softSkillsInput, setSoftSkillsInput] = useState("");
  const [jobDescriptionInput, setJobDescriptionInput] = useState("");
  const [isEnhancingSkills, setIsEnhancingSkills] = useState(false);

  const handleEnhanceSkills = async () => {
    setIsEnhancingSkills(true);
    try {
      const res = await api.post<{
        technical: string[];
        tools: string[];
        soft: string[];
      }>(`/resume/${id}/skills/enhance`, {
        targetRole,
        jobDescription: jobDescriptionInput,
      });

      const data = (res as any)?.data || res;
      if (data) {
        setSkills(data);
        if (data.technical) setTechSkillsInput((data.technical || []).join(", "));
        if (data.tools) setToolsSkillsInput((data.tools || []).join(", "));
        if (data.soft) setSoftSkillsInput((data.soft || []).join(", "));
        toast.success(`✨ Skills enhanced for ${targetRole}!`);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to enhance skills.");
    } finally {
      setIsEnhancingSkills(false);
    }
  };

  const [projects, setProjects] = useState<Array<{
    title: string;
    tech: string;
    link: string;
    description: string;
  }>>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (resume) {
      setTitle(resume.title ?? "");
      let parsed: any = {};
      try {
        parsed = typeof resume.content === "string" ? JSON.parse(resume.content) : (resume.content || {});
      } catch (e) {
        parsed = {};
      }

      setTargetRole(parsed.targetRole || resume.title || "Software Engineer");
      setPersonalInfo({
        fullName: parsed.personalInfo?.fullName || "",
        email: parsed.personalInfo?.email || "",
        phone: parsed.personalInfo?.phoneNumber || parsed.personalInfo?.phone || "",
        location: parsed.personalInfo?.location || "",
        website: parsed.personalInfo?.website || "",
      });
      setSummary(parsed.summary || "");
      
      // Experience normalization
      const rawExp = parsed.experience || [];
      setExperience(rawExp.map((e: any) => ({
        company: e.company || "",
        position: e.position || e.role || e.title || "",
        startDate: e.startDate || "",
        endDate: e.endDate || "",
        location: e.location || "",
        description: Array.isArray(e.description)
          ? e.description
          : typeof e.description === "string"
          ? e.description.split("\n").filter((l: string) => l.trim().length > 0)
          : Array.isArray(e.bullets)
          ? e.bullets
          : [],
      })));

      // Education normalization
      const rawEdu = parsed.education || [];
      setEducation(rawEdu.map((ed: any) => ({
        institution: ed.institution || ed.school || "",
        degree: ed.degree || "",
        level: ed.level || (ed.degree?.toLowerCase().includes("class x") ? "Class X" : ed.degree?.toLowerCase().includes("class xii") ? "Class XII" : "Undergraduate"),
        board: ed.board || "",
        fieldOfStudy: ed.fieldOfStudy || "",
        yearOfPassing: ed.yearOfPassing || ed.endDate || "",
        marks: ed.marks || ed.gpa || "",
        isStudying: !!(ed.isStudying || ed.isCurrent || (typeof ed.yearOfPassing === "string" && ed.yearOfPassing.toLowerCase().includes("pursu"))),
      })));

      // Skills normalization
      let techList: string[] = [];
      let toolsList: string[] = [];
      let softList: string[] = [];

      if (parsed.skills && typeof parsed.skills === "object" && !Array.isArray(parsed.skills)) {
        techList = parsed.skills.technical || [];
        toolsList = parsed.skills.tools || [];
        softList = parsed.skills.soft || [];
      } else if (Array.isArray(parsed.skills)) {
        techList = parsed.skills.map((s: any) => typeof s === "string" ? s : s.name);
        toolsList = ["Git", "GitHub", "VS Code", "Postman"];
        softList = ["Problem Solving", "Team Collaboration"];
      }

      setSkills({ technical: techList, tools: toolsList, soft: softList });
      setTechSkillsInput(techList.join(", "));
      setToolsSkillsInput(toolsList.join(", "));
      setSoftSkillsInput(softList.join(", "));

      // Projects
      setProjects(parsed.projects || []);
    }
  }, [resume]);

  if (!mounted || isLoading || !resume) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const constructFullPayload = () => ({
    targetRole,
    personalInfo,
    summary,
    experience,
    education,
    skills,
    projects,
  });

  const handleSave = () => {
    const payload = constructFullPayload();
    update.mutate(
      { title, content: payload },
      { onSuccess: () => toast.success("Resume saved successfully!") }
    );
  };

  const handleAiTailor = async () => {
    if (!targetRole.trim()) {
      toast.error("Please enter a target job role first!");
      return;
    }
    setIsTailoring(true);
    try {
      const res = await api.post<{
        summary: string;
        experience: any[];
        skills: { technical: string[]; tools: string[]; soft: string[] };
      }>(`/resume/${id}/tailor`, { targetRole });

      const tailoredData = (res as any)?.data || res;

      if (tailoredData) {
        if (tailoredData.summary) setSummary(tailoredData.summary);
        if (tailoredData.skills) {
          setSkills(tailoredData.skills);
          setTechSkillsInput((tailoredData.skills.technical || []).join(", "));
          setToolsSkillsInput((tailoredData.skills.tools || []).join(", "));
          setSoftSkillsInput((tailoredData.skills.soft || []).join(", "));
        }
        if (tailoredData.experience && tailoredData.experience.length > 0) {
          setExperience(tailoredData.experience.map((e: any) => ({
            company: e.company || "",
            position: e.position || targetRole,
            startDate: e.startDate || "",
            endDate: e.endDate || "Present",
            location: e.location || "",
            description: Array.isArray(e.bullets) ? e.bullets : (Array.isArray(e.description) ? e.description : [e.description || ""]),
          })));
        }
        toast.success(`✨ AI Tailored resume for ${targetRole}!`);
      }
    } catch (e: any) {
      toast.error(e?.message || "AI Tailoring request failed. Please try again.");
    } finally {
      setIsTailoring(false);
    }
  };

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
  <title>${title || personalInfo.fullName || "Resume"}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    @media print {
      html, body {
        width: 100%;
        margin: 0;
        padding: 0;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact;
      }
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.45;
      background: #ffffff;
    }
    .header {
      margin-bottom: 8px;
    }
    .name {
      font-size: 26px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    .role-title {
      font-size: 13.5px;
      font-weight: 600;
      color: #475569;
      margin-top: 3px;
      margin-bottom: 8px;
    }
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 3px 24px;
      font-size: 10.5px;
      color: #334155;
    }
    .contact-item {
      display: flex;
      gap: 6px;
    }
    .contact-label {
      font-weight: 600;
      color: #0f172a;
      min-width: 50px;
    }
    .divider {
      border-bottom: 1px solid #cbd5e1;
      margin: 10px 0 12px 0;
    }
    .summary-p {
      font-size: 11px;
      color: #334155;
      line-height: 1.5;
      margin-bottom: 14px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 3px;
      margin-top: 14px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    .timeline-row {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .timeline-date {
      width: 130px;
      flex-shrink: 0;
      font-size: 10.5px;
      color: #475569;
      font-weight: 500;
      padding-top: 1px;
    }
    .timeline-body {
      flex: 1;
    }
    .item-heading {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .item-sub {
      font-size: 11px;
      font-style: italic;
      color: #475569;
      margin-top: 1px;
    }
    .item-link {
      font-size: 10.5px;
      color: #0284c7;
      text-decoration: none;
      word-break: break-all;
    }
    ul.bullet-list {
      margin: 4px 0 0 0;
      padding-left: 14px;
      color: #334155;
    }
    ul.bullet-list li {
      margin-bottom: 3px;
      line-height: 1.45;
    }
    .skills-row {
      display: flex;
      gap: 16px;
      margin-bottom: 6px;
      font-size: 11px;
      page-break-inside: avoid;
    }
    .skills-cat {
      width: 130px;
      flex-shrink: 0;
      font-weight: 600;
      color: #0f172a;
    }
    .skills-list {
      flex: 1;
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${personalInfo.fullName || title || "Your Name"}</div>
    <div class="role-title">${targetRole}</div>
    <div class="contact-grid">
      ${personalInfo.phone ? `<div class="contact-item"><span class="contact-label">Phone</span> <span>${personalInfo.phone}</span></div>` : ""}
      ${personalInfo.email ? `<div class="contact-item"><span class="contact-label">E-mail</span> <span>${personalInfo.email}</span></div>` : ""}
      ${personalInfo.location ? `<div class="contact-item"><span class="contact-label">Location</span> <span>${personalInfo.location}</span></div>` : ""}
      ${personalInfo.website ? `<div class="contact-item"><span class="contact-label">Portfolio</span> <span>${personalInfo.website}</span></div>` : ""}
    </div>
  </div>

  <div class="divider"></div>

  ${summary ? `<div class="summary-p">${summary}</div>` : ""}

  ${experience.length > 0 ? `
    <div class="section-title">Experience</div>
    ${experience.map((exp) => `
      <div class="timeline-row">
        <div class="timeline-date">${exp.startDate || ""} ${exp.startDate || exp.endDate ? "—" : ""} ${exp.endDate || "Present"}</div>
        <div class="timeline-body">
          <div class="item-heading">${exp.position || targetRole}</div>
          <div class="item-sub">${exp.company}${exp.location ? ` · ${exp.location}` : ""}</div>
          ${exp.description && exp.description.length > 0 ? `
            <ul class="bullet-list">
              ${exp.description.map((b: string) => `<li>${b.replace(/^[-\*\s]+/, "")}</li>`).join("")}
            </ul>
          ` : ""}
        </div>
      </div>
    `).join("")}
  ` : ""}

  ${education.length > 0 ? `
    <div class="section-title">Education</div>
    ${education.map((edu) => {
      const dateText = edu.isStudying
        ? (edu.yearOfPassing ? `Pursuing (Exp: ${edu.yearOfPassing})` : "Currently Pursuing")
        : (edu.yearOfPassing ? `Passout: ${edu.yearOfPassing}` : (edu.level || "Education"));
      return `
        <div class="timeline-row">
          <div class="timeline-date">${dateText}</div>
          <div class="timeline-body">
            <div class="item-heading">${edu.level ? `[${edu.level}] ` : ""}${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}</div>
            <div class="item-sub">${edu.institution}${edu.board ? ` (${edu.board})` : ""}${edu.marks ? ` · Marks/CGPA: ${edu.marks}` : ""}${edu.isStudying ? " · (Currently Pursuing)" : ""}</div>
          </div>
        </div>
      `;
    }).join("")}
  ` : ""}

  ${projects.length > 0 ? `
    <div class="section-title">Projects</div>
    ${projects.map((p) => {
      const bullets = p.description ? p.description.split(/(?:•|\n)+/).map((s: string) => s.trim()).filter(Boolean) : [];
      return `
        <div class="timeline-row">
          <div class="timeline-date">Key Project</div>
          <div class="timeline-body">
            <div class="item-heading">${p.title}${p.tech ? ` <span style="font-weight:400;color:#64748b">(${p.tech})</span>` : ""}</div>
            ${p.link ? `<div class="item-link">${p.link}</div>` : ""}
            ${bullets.length > 0 ? `
              <ul class="bullet-list">
                ${bullets.map((b: string) => `<li>${b.replace(/^[-\*\s]+/, "")}</li>`).join("")}
              </ul>
            ` : ""}
          </div>
        </div>
      `;
    }).join("")}
  ` : ""}

  ${skills.technical.length > 0 || skills.tools.length > 0 || skills.soft.length > 0 ? `
    <div class="section-title">Skills & Competencies</div>
    ${skills.technical.length > 0 ? `
      <div class="skills-row">
        <div class="skills-cat">Technical Skills</div>
        <div class="skills-list">${skills.technical.join(", ")}</div>
      </div>
    ` : ""}
    ${skills.tools.length > 0 ? `
      <div class="skills-row">
        <div class="skills-cat">Tools & Platforms</div>
        <div class="skills-list">${skills.tools.join(", ")}</div>
      </div>
    ` : ""}
    ${skills.soft.length > 0 ? `
      <div class="skills-row">
        <div class="skills-cat">Core Competencies</div>
        <div class="skills-list">${skills.soft.join(", ")}</div>
      </div>
    ` : ""}
  ` : ""}

</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.addEventListener("afterprint", () => {
      try {
        printWindow.close();
      } catch (e) {
        // Ignored
      }
    });

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
        description="Visual Resume Builder — Tailor for specific job roles with AI, edit sections cleanly, and export PDF."
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-md border border-glass-border bg-white/[0.03] px-4 py-2 text-sm font-medium hover:bg-white/[0.06] cursor-pointer"
            >
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </button>
            <button
              onClick={handleAiTailor}
              disabled={isTailoring}
              className="btn-glow inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold cursor-pointer"
            >
              {isTailoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300" />} ✨ AI Tailor for Role
            </button>
            <button
              onClick={handleClientPrint}
              className="inline-flex items-center gap-2 rounded-md border border-glass-border bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground hover:bg-white/[0.06] hover:text-foreground cursor-pointer"
            >
              <Download className="h-4 w-4" /> Print / Save PDF
            </button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Visual Editor Form (Left 7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-glass-border pb-2 gap-1 scrollbar-none">
            {[
              { id: "role", label: "🎯 Target Role" },
              { id: "personal", label: "👤 Personal" },
              { id: "summary", label: "📝 Summary" },
              { id: "experience", label: "💼 Experience" },
              { id: "education", label: "🎓 Education" },
              { id: "skills", label: "⚡ Skills" },
              { id: "projects", label: "🚀 Projects" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Target Role & AI */}
          {activeTab === "role" && (
            <GlassCard className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Target Role & AI Optimization</h3>
              <p className="text-xs text-muted-foreground">
                Enter the job role you are applying for. The AI will rewrite your bullets, summary, and technical skills specifically for this role.
              </p>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Resume Document Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="e.g. Senior Frontend Developer Resume"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Target Job Role</label>
                <input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="e.g. Full Stack Engineer / Data Analyst"
                />
              </div>
              <button
                onClick={handleAiTailor}
                disabled={isTailoring}
                className="w-full btn-glow flex items-center justify-center gap-2 rounded-md py-2.5 text-xs font-semibold cursor-pointer"
              >
                {isTailoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300" />}
                Auto-Enhance Resume for "{targetRole}"
              </button>
            </GlassCard>
          )}

          {/* TAB 2: Personal Details */}
          {activeTab === "personal" && (
            <GlassCard className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Personal Contact Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Full Name</label>
                  <input
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                    className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                  <input
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Phone Number</label>
                  <input
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Location (City, State)</label>
                  <input
                    value={personalInfo.location}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                    className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Portfolio / GitHub / LinkedIn URL</label>
                <input
                  value={personalInfo.website}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                  className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </GlassCard>
          )}

          {/* TAB 3: Summary */}
          {activeTab === "summary" && (
            <GlassCard className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Professional Summary</h3>
              </div>
              <textarea
                rows={6}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a high-impact summary highlighting your technical domain expertise..."
                className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 text-xs outline-none focus:border-primary"
              />
            </GlassCard>
          )}

          {/* TAB 4: Experience */}
          {activeTab === "experience" && (
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <GlassCard key={idx} className="space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Experience #{idx + 1}</span>
                    <button
                      onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                      className="text-xs text-rose-400 hover:underline cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Company</label>
                      <input
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].company = e.target.value;
                          setExperience(updated);
                        }}
                        className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Job Title / Role</label>
                      <input
                        value={exp.position}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].position = e.target.value;
                          setExperience(updated);
                        }}
                        className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Start Date</label>
                      <input
                        value={exp.startDate}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].startDate = e.target.value;
                          setExperience(updated);
                        }}
                        className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">End Date</label>
                      <input
                        value={exp.endDate}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].endDate = e.target.value;
                          setExperience(updated);
                        }}
                        className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Key Accomplishments (One Bullet per Line)</label>
                    <textarea
                      rows={4}
                      value={exp.description.join("\n")}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[idx].description = e.target.value.split("\n");
                        setExperience(updated);
                      }}
                      className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </GlassCard>
              ))}

              <button
                onClick={() => setExperience([...experience, { company: "", position: "", startDate: "", endDate: "", location: "", description: [] }])}
                className="w-full rounded-md border border-dashed border-glass-border p-3 text-xs text-muted-foreground hover:bg-white/[0.02] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Experience Position
              </button>
            </div>
          )}

          {/* TAB 5: Education (Class X, XII, Degree, Marks, Passing Year) */}
          {activeTab === "education" && (
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <GlassCard key={idx} className="space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald">Education Entry #{idx + 1}</span>
                    <button
                      onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                      className="text-xs text-rose-400 hover:underline cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Education Level</label>
                      <select
                        value={edu.level}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].level = e.target.value;
                          setEducation(updated);
                        }}
                        className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                      >
                        <option value="Undergraduate">Undergraduate / Degree (B.Tech, B.Sc)</option>
                        <option value="Postgraduate">Postgraduate (M.Tech, MBA)</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Class XII">Class XII (Higher Secondary)</option>
                        <option value="Class X">Class X (Secondary School)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Degree / Certificate Title</label>
                      <input
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].degree = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="e.g. B.Tech in Computer Science / Higher Secondary"
                        className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Institution / School Name</label>
                      <input
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].institution = e.target.value;
                          setEducation(updated);
                        }}
                        className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Board / University</label>
                      <input
                        value={edu.board}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].board = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="e.g. CBSE / West Bengal Board / University of Calcutta"
                        className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-between rounded-md border border-glass-border bg-input/50 px-3 py-2">
                      <label htmlFor={`isStudying-${idx}`} className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-2 select-none">
                        <input
                          id={`isStudying-${idx}`}
                          type="checkbox"
                          checked={!!edu.isStudying}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].isStudying = e.target.checked;
                            setEducation(updated);
                          }}
                          className="h-4 w-4 rounded border-glass-border text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>Currently Studying / Pursuing this degree</span>
                      </label>
                      {edu.isStudying && (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Currently Pursuing
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        {edu.isStudying ? "Expected Year of Passing" : "Year of Passing"}
                      </label>
                      <input
                        value={edu.yearOfPassing}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].yearOfPassing = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder={edu.isStudying ? "e.g. 2026 (Expected)" : "e.g. 2024"}
                        className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Marks / Percentage / CGPA</label>
                      <input
                        value={edu.marks}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].marks = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="e.g. 92% or 8.9 CGPA"
                        className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </GlassCard>
              ))}

              <button
                onClick={() => setEducation([...education, { institution: "", degree: "B.Tech", level: "Undergraduate", board: "", fieldOfStudy: "", yearOfPassing: "", marks: "", isStudying: false }])}
                className="w-full rounded-md border border-dashed border-glass-border p-3 text-xs text-muted-foreground hover:bg-white/[0.02] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Education Entry (Class X / XII / Degree)
              </button>
            </div>
          )}

          {/* TAB 6: Skills & Tech Stacks */}
          {activeTab === "skills" && (
            <GlassCard className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-glass-border">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Skills & Categorized Tech Stack</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Auto-enhance skills for target role & optional job description</p>
                </div>
                <button
                  type="button"
                  onClick={handleEnhanceSkills}
                  disabled={isEnhancingSkills}
                  className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-md shrink-0"
                >
                  {isEnhancingSkills ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
                  )}
                  <span>{isEnhancingSkills ? "Enhancing..." : "✨ Auto-Enhance Skills"}</span>
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Job Description / Role Keywords (Optional context for AI)
                </label>
                <textarea
                  rows={2}
                  value={jobDescriptionInput}
                  onChange={(e) => setJobDescriptionInput(e.target.value)}
                  placeholder="Paste target job description or required skills here to generate 100% role-tailored skill categories..."
                  className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-xs outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Technical Skills (Comma separated)</label>
                <input
                  value={techSkillsInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTechSkillsInput(val);
                    setSkills((prev) => ({
                      ...prev,
                      technical: val.split(",").map((s) => s.trim()).filter(Boolean),
                    }));
                  }}
                  placeholder="TypeScript, React, Node.js, Python, PostgreSQL"
                  className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Tools & Cloud Platforms (Comma separated)</label>
                <input
                  value={toolsSkillsInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setToolsSkillsInput(val);
                    setSkills((prev) => ({
                      ...prev,
                      tools: val.split(",").map((s) => s.trim()).filter(Boolean),
                    }));
                  }}
                  placeholder="Docker, Git, AWS, Vercel, Postman"
                  className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Core Competencies (Comma separated)</label>
                <input
                  value={softSkillsInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSoftSkillsInput(val);
                    setSkills((prev) => ({
                      ...prev,
                      soft: val.split(",").map((s) => s.trim()).filter(Boolean),
                    }));
                  }}
                  placeholder="System Design, Problem Solving, Agile Execution"
                  className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </GlassCard>
          )}

          {/* TAB 7: Projects */}
          {activeTab === "projects" && (
            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <GlassCard key={idx} className="space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Project #{idx + 1}</span>
                    <button
                      onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                      className="text-xs text-rose-400 hover:underline cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Project Title</label>
                      <input
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].title = e.target.value;
                          setProjects(updated);
                        }}
                        className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Tech Stack Used</label>
                      <input
                        value={proj.tech}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].tech = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="React, Node.js, Prisma"
                        className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Live URL / Repository</label>
                    <input
                      value={proj.link}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].link = e.target.value;
                        setProjects(updated);
                      }}
                      className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Description & Key Features</label>
                    <textarea
                      rows={3}
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].description = e.target.value;
                        setProjects(updated);
                      }}
                      className="w-full rounded-md border border-glass-border bg-input px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </GlassCard>
              ))}

              <button
                onClick={() => setProjects([...projects, { title: "", tech: "", link: "", description: "" }])}
                className="w-full rounded-md border border-dashed border-glass-border p-3 text-xs text-muted-foreground hover:bg-white/[0.02] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Key Project
              </button>
            </div>
          )}
        </div>

        {/* Live Executive Resume Preview (Right 5 Columns) */}
        <div className="lg:col-span-5">
          <GlassCard className="sticky top-20 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-glass-border">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">Live Executive Preview</p>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">{targetRole}</span>
            </div>

            <div id="printable-resume-preview" className="scrollbar-thin mt-4 max-h-[660px] overflow-y-auto rounded-lg bg-white p-6 text-slate-900 shadow-xl border border-slate-200 text-xs leading-relaxed">
              {/* Executive Header */}
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950">
                  {personalInfo.fullName || title || "Your Full Name"}
                </h2>
                <p className="text-sm font-semibold text-slate-600 mt-0.5">
                  {targetRole}
                </p>

                <div className="mt-2.5 grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-slate-700">
                  {personalInfo.phone && <div><strong className="text-slate-900">Phone:</strong> {personalInfo.phone}</div>}
                  {personalInfo.email && <div><strong className="text-slate-900">E-mail:</strong> {personalInfo.email}</div>}
                  {personalInfo.location && <div><strong className="text-slate-900">Location:</strong> {personalInfo.location}</div>}
                  {personalInfo.website && <div><strong className="text-slate-900">Portfolio:</strong> {personalInfo.website}</div>}
                </div>
              </div>

              <div className="my-3 border-b border-slate-300" />

              {/* Summary */}
              {summary && (
                <p className="text-[11px] leading-relaxed text-slate-700 mb-4">{summary}</p>
              )}

              {/* Experience */}
              {experience.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-[12.5px] font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2.5">Experience</h3>
                  <div className="space-y-3">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="flex gap-4 text-[11px]">
                        <div className="w-[120px] shrink-0 font-medium text-slate-600">
                          {exp.startDate} {exp.startDate || exp.endDate ? "—" : ""} {exp.endDate || "Present"}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-900">{exp.position || targetRole}</div>
                          <div className="italic text-slate-600">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                          {exp.description && exp.description.length > 0 && (
                            <ul className="mt-1 list-disc pl-4 space-y-0.5 text-slate-700">
                              {exp.description.map((bullet, bIdx) => (
                                <li key={bIdx}>{bullet.replace(/^[-\*\s]+/, "")}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education (Class X / XII / Degree) */}
              {education.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-[12.5px] font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2.5">Education</h3>
                  <div className="space-y-2.5">
                    {education.map((edu, idx) => {
                      const dateLabel = edu.isStudying
                        ? (edu.yearOfPassing ? `Pursuing (Exp: ${edu.yearOfPassing})` : "Currently Pursuing")
                        : (edu.yearOfPassing ? `Passout: ${edu.yearOfPassing}` : (edu.level || "Education"));
                      return (
                        <div key={idx} className="flex gap-4 text-[11px]">
                          <div className="w-[120px] shrink-0 font-medium text-slate-600">
                            {dateLabel}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-slate-900">{edu.level ? `[${edu.level}] ` : ""}{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}</div>
                            <div className="italic text-slate-600">
                              {edu.institution}{edu.board ? ` (${edu.board})` : ""}{edu.marks ? ` · Marks/CGPA: ${edu.marks}` : ""}{edu.isStudying && <span className="font-semibold text-emerald-600"> · (Currently Pursuing)</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-[12.5px] font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2.5">Projects</h3>
                  <div className="space-y-3">
                    {projects.map((proj, idx) => {
                      const bullets = proj.description ? proj.description.split(/(?:•|\n)+/).map((s: string) => s.trim()).filter(Boolean) : [];
                      return (
                        <div key={idx} className="flex gap-4 text-[11px]">
                          <div className="w-[120px] shrink-0 font-medium text-slate-600">Key Project</div>
                          <div className="flex-1">
                            <div className="font-bold text-slate-900">
                              {proj.title}
                              {proj.tech && <span className="font-normal text-slate-500"> ({proj.tech})</span>}
                            </div>
                            {proj.link && <div className="text-sky-600 break-all text-[10.5px]">{proj.link}</div>}
                            {bullets.length > 0 && (
                              <ul className="mt-1 list-disc pl-4 space-y-0.5 text-slate-700">
                                {bullets.map((b, bIdx) => (
                                  <li key={bIdx}>{b.replace(/^[-\*\s]+/, "")}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Skills & Competencies */}
              {(skills.technical.length > 0 || skills.tools.length > 0 || skills.soft.length > 0) && (
                <div className="mt-4">
                  <h3 className="text-[12.5px] font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2.5">Skills & Competencies</h3>
                  <div className="space-y-1.5 text-[11px]">
                    {skills.technical.length > 0 && (
                      <div className="flex gap-4">
                        <div className="w-[120px] shrink-0 font-bold text-slate-900">Technical Skills</div>
                        <div className="flex-1 text-slate-700">{skills.technical.join(", ")}</div>
                      </div>
                    )}
                    {skills.tools.length > 0 && (
                      <div className="flex gap-4">
                        <div className="w-[120px] shrink-0 font-bold text-slate-900">Tools & Platforms</div>
                        <div className="flex-1 text-slate-700">{skills.tools.join(", ")}</div>
                      </div>
                    )}
                    {skills.soft.length > 0 && (
                      <div className="flex gap-4">
                        <div className="w-[120px] shrink-0 font-bold text-slate-900">Core Competencies</div>
                        <div className="flex-1 text-slate-700">{skills.soft.join(", ")}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
