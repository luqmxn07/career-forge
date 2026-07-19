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
      })));

      // Skills normalization
      if (parsed.skills && typeof parsed.skills === "object" && !Array.isArray(parsed.skills)) {
        setSkills({
          technical: parsed.skills.technical || [],
          tools: parsed.skills.tools || [],
          soft: parsed.skills.soft || [],
        });
      } else if (Array.isArray(parsed.skills)) {
        setSkills({
          technical: parsed.skills.map((s: any) => typeof s === "string" ? s : s.name),
          tools: ["Git", "GitHub", "VS Code", "Postman"],
          soft: ["Problem Solving", "Team Collaboration"],
        });
      }

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
        success: boolean;
        data: {
          summary: string;
          experience: any[];
          skills: { technical: string[]; tools: string[]; soft: string[] };
        };
      }>(`/resume/${id}/tailor`, { targetRole });

      if (res?.data) {
        if (res.data.summary) setSummary(res.data.summary);
        if (res.data.skills) setSkills(res.data.skills);
        if (res.data.experience && res.data.experience.length > 0) {
          setExperience(res.data.experience.map((e: any) => ({
            company: e.company || "",
            position: e.position || targetRole,
            startDate: e.startDate || "",
            endDate: e.endDate || "Present",
            location: e.location || "",
            description: e.bullets || e.description || [],
          })));
        }
        toast.success(`✨ AI Tailored resume for ${targetRole}!`);
      }
    } catch (e: any) {
      toast.error(e?.message || "AI Tailoring completed with rule-based enhancement!");
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 12mm; }
    body { font-family: 'Inter', sans-serif; color: #09090b; margin: 0; padding: 0; background: #ffffff; -webkit-print-color-adjust: exact; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px; }
    .name { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #0284c7; margin: 0; }
    .role-badge { font-size: 13px; font-weight: 600; color: #475569; margin-top: 2px; }
    .contact { margin-top: 6px; font-size: 11px; color: #64748b; display: flex; gap: 10px; flex-wrap: wrap; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0284c7; margin-top: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .content-text { margin-top: 6px; font-size: 11.5px; line-height: 1.5; color: #334155; }
    .item-header { display: flex; justify-content: space-between; font-weight: 600; font-size: 12px; color: #0f172a; margin-top: 8px; }
    .item-sub { font-size: 11px; color: #64748b; }
    .item-date { font-size: 11px; font-weight: 400; color: #64748b; }
    ul { margin: 4px 0 0 0; padding-left: 18px; font-size: 11.5px; color: #334155; }
    li { margin-bottom: 3px; }
    .skills-category { margin-top: 6px; font-size: 11px; }
    .skills-label { font-weight: 600; color: #0f172a; }
    .skill-pill { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; font-size: 10.5px; color: #334155; display: inline-block; margin: 2px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${personalInfo.fullName || title || "Your Name"}</div>
    <div class="role-badge">${targetRole}</div>
    <div class="contact">
      ${personalInfo.location ? `<span>📍 ${personalInfo.location}</span>` : ""}
      ${personalInfo.email ? `<span>✉️ ${personalInfo.email}</span>` : ""}
      ${personalInfo.phone ? `<span>📞 ${personalInfo.phone}</span>` : ""}
      ${personalInfo.website ? `<span>🌐 ${personalInfo.website}</span>` : ""}
    </div>
  </div>

  ${summary ? `<div class="section-title">Professional Summary</div><div class="content-text">${summary}</div>` : ""}

  ${skills.technical.length > 0 || skills.tools.length > 0 || skills.soft.length > 0 ? `
    <div class="section-title">Skills & Tech Stack</div>
    ${skills.technical.length > 0 ? `<div class="skills-category"><span class="skills-label">Technical: </span>${skills.technical.map(s => `<span class="skill-pill">${s}</span>`).join("")}</div>` : ""}
    ${skills.tools.length > 0 ? `<div class="skills-category"><span class="skills-label">Tools & Platforms: </span>${skills.tools.map(t => `<span class="skill-pill">${t}</span>`).join("")}</div>` : ""}
    ${skills.soft.length > 0 ? `<div class="skills-category"><span class="skills-label">Core Competencies: </span>${skills.soft.map(sf => `<span class="skill-pill">${sf}</span>`).join("")}</div>` : ""}
  ` : ""}

  ${experience.length > 0 ? `
    <div class="section-title">Work Experience</div>
    ${experience.map((exp) => `
      <div class="item-header">
        <span>${exp.position || targetRole} · ${exp.company}</span>
        <span class="item-date">${exp.startDate || ""} ${exp.startDate || exp.endDate ? "—" : ""} ${exp.endDate || "Present"}</span>
      </div>
      ${exp.description && exp.description.length > 0 ? `
        <ul>
          ${exp.description.map((bullet: string) => `<li>${bullet.replace(/^[-\*\s]+/, "")}</li>`).join("")}
        </ul>
      ` : ""}
    `).join("")}
  ` : ""}

  ${education.length > 0 ? `
    <div class="section-title">Education & Qualifications</div>
    ${education.map((edu) => `
      <div class="item-header">
        <span>${edu.level ? `[${edu.level}] ` : ""}${edu.degree} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</span>
        <span class="item-date">${edu.yearOfPassing ? `Passout: ${edu.yearOfPassing}` : ""}</span>
      </div>
      <div class="item-sub">
        ${edu.institution} ${edu.board ? `(${edu.board})` : ""} ${edu.marks ? `· Marks/CGPA: ${edu.marks}` : ""}
      </div>
    `).join("")}
  ` : ""}

  ${projects.length > 0 ? `
    <div class="section-title">Key Projects</div>
    ${projects.map((p) => `
      <div class="item-header">
        <span>${p.title} ${p.tech ? `<span style="font-weight:400;color:#64748b">(${p.tech})</span>` : ""}</span>
        ${p.link ? `<span class="item-date">${p.link}</span>` : ""}
      </div>
      ${p.description ? `<div class="content-text">${p.description}</div>` : ""}
    `).join("")}
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
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Year of Passing</label>
                      <input
                        value={edu.yearOfPassing}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].yearOfPassing = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="e.g. 2024"
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
                onClick={() => setEducation([...education, { institution: "", degree: "B.Tech", level: "Undergraduate", board: "", fieldOfStudy: "", yearOfPassing: "", marks: "" }])}
                className="w-full rounded-md border border-dashed border-glass-border p-3 text-xs text-muted-foreground hover:bg-white/[0.02] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Education Entry (Class X / XII / Degree)
              </button>
            </div>
          )}

          {/* TAB 6: Skills & Tech Stacks */}
          {activeTab === "skills" && (
            <GlassCard className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Skills & Categorized Tech Stack</h3>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Technical Skills (Comma separated)</label>
                <input
                  value={skills.technical.join(", ")}
                  onChange={(e) => setSkills({ ...skills, technical: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="TypeScript, React, Node.js, Python, PostgreSQL"
                  className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Tools & Cloud Platforms (Comma separated)</label>
                <input
                  value={skills.tools.join(", ")}
                  onChange={(e) => setSkills({ ...skills, tools: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="Docker, Git, AWS, Vercel, Postman"
                  className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Core Competencies (Comma separated)</label>
                <input
                  value={skills.soft.join(", ")}
                  onChange={(e) => setSkills({ ...skills, soft: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
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

            <div id="printable-resume-preview" className="scrollbar-thin mt-4 max-h-[660px] overflow-y-auto rounded-lg bg-white p-6 text-slate-900 shadow-xl border border-slate-200">
              {/* Executive Header */}
              <div className="border-b-2 border-sky-600 pb-3">
                <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950">
                  {personalInfo.fullName || title || "Your Full Name"}
                </h2>
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mt-0.5">
                  {targetRole}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-slate-500">
                  {personalInfo.location && <span>📍 {personalInfo.location}</span>}
                  {personalInfo.email && <span>✉️ {personalInfo.email}</span>}
                  {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
                  {personalInfo.website && <span>🌐 {personalInfo.website}</span>}
                </div>
              </div>

              {/* Summary */}
              {summary && (
                <div className="mt-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-sky-700 border-b border-slate-200 pb-1">Professional Summary</h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700">{summary}</p>
                </div>
              )}

              {/* Skills */}
              {(skills.technical.length > 0 || skills.tools.length > 0 || skills.soft.length > 0) && (
                <div className="mt-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-sky-700 border-b border-slate-200 pb-1">Skills & Tech Stack</h3>
                  <div className="mt-1.5 space-y-1 text-[11px]">
                    {skills.technical.length > 0 && (
                      <div><strong className="text-slate-900">Technical:</strong> {skills.technical.join(" · ")}</div>
                    )}
                    {skills.tools.length > 0 && (
                      <div><strong className="text-slate-900">Tools & Platforms:</strong> {skills.tools.join(" · ")}</div>
                    )}
                    {skills.soft.length > 0 && (
                      <div><strong className="text-slate-900">Core Competencies:</strong> {skills.soft.join(" · ")}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Experience */}
              {experience.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-sky-700 border-b border-slate-200 pb-1">Work Experience</h3>
                  <div className="mt-2 space-y-3">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="text-[11px]">
                        <div className="flex items-center justify-between font-bold text-slate-950">
                          <span>{exp.position || targetRole} · {exp.company}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{exp.startDate} {exp.startDate || exp.endDate ? "—" : ""} {exp.endDate || "Present"}</span>
                        </div>
                        {exp.description && exp.description.length > 0 && (
                          <ul className="mt-1 list-disc pl-4 space-y-0.5 text-slate-700">
                            {exp.description.map((bullet, bIdx) => (
                              <li key={bIdx}>{bullet.replace(/^[-\*\s]+/, "")}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education (Class X / XII / Degree) */}
              {education.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-sky-700 border-b border-slate-200 pb-1">Education & Qualifications</h3>
                  <div className="mt-2 space-y-2.5">
                    {education.map((edu, idx) => (
                      <div key={idx} className="text-[11px]">
                        <div className="flex items-center justify-between font-bold text-slate-950">
                          <span>{edu.level ? `[${edu.level}] ` : ""}{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{edu.yearOfPassing ? `Passout: ${edu.yearOfPassing}` : ""}</span>
                        </div>
                        <div className="text-[10.5px] text-slate-600">
                          {edu.institution} {edu.board ? `(${edu.board})` : ""} {edu.marks ? `· Marks/CGPA: ${edu.marks}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-sky-700 border-b border-slate-200 pb-1">Key Projects</h3>
                  <div className="mt-2 space-y-2">
                    {projects.map((proj, idx) => (
                      <div key={idx} className="text-[11px]">
                        <div className="flex items-center justify-between font-bold text-slate-950">
                          <span>{proj.title} {proj.tech ? `<span className="font-normal text-slate-500">(${proj.tech})</span>` : ""}</span>
                          {proj.link && <span className="text-[10px] text-sky-600 font-normal">{proj.link}</span>}
                        </div>
                        {proj.description && <p className="mt-0.5 text-slate-700">{proj.description}</p>}
                      </div>
                    ))}
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
