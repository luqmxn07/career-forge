import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { FileText, ScanLine, MessageSquare, Zap, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { GlassCard } from "@/components/shared/GlassCard";
import { useDashboardStats } from "@/features/dashboard/api/dashboard";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CareerForge" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading } = useDashboardStats();
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

  const resumesCount = data?.resumesCount ?? 0;
  const averageAtsScore = data?.averageAtsScore ?? 0;
  const interviewsCount = data?.interviewsCount ?? 0;
  const credits = data?.credits ?? 50;

  const hasResumes = resumesCount > 0;
  const hasAtsScans = averageAtsScore > 0;
  const hasInterviews = interviewsCount > 0;
  const hasJobEntries = data?.jobTrackerStages && data.jobTrackerStages.some(s => s.count > 0);

  const ats = hasAtsScans ? [{ date: "Average", score: averageAtsScore }] : [];
  const kanban = hasJobEntries
    ? (data?.jobTrackerStages ?? []).map(item => ({
        stage: item.stage.charAt(0).toUpperCase() + item.stage.slice(1).toLowerCase(),
        count: item.count
      }))
    : [];

  return (
    <div>
      <PageHeader title="Welcome back" description="Your resume workshop, ATS results, interview prep, and pipeline — at a glance." />

      {/* Guided Career Accelerator Workflow Banner */}
      <GlassCard className="mb-6 border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 via-primary/5 to-purple-500/10 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
              ⚡
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Job Application Guided Pathway</h3>
              <p className="text-[11px] text-muted-foreground">Follow this 4-step workflow to maximize your interview callbacks</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/25">
            4-Step System
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Link
            to="/profile"
            className="flex flex-col justify-between p-2.5 rounded-xl border border-white/10 bg-black/40 hover:bg-white/10 transition group"
          >
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Step 1</span>
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Fill Master Profile</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Skills, education & bio</p>
          </Link>

          <Link
            to="/job-tracker"
            className="flex flex-col justify-between p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition group"
          >
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Step 2</span>
              <p className="text-xs font-semibold text-emerald-300 group-hover:text-emerald-200 transition-colors">Discover & Track Jobs</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">LinkedIn & Indeed jobs</p>
          </Link>

          <Link
            to="/resumes"
            className="flex flex-col justify-between p-2.5 rounded-xl border border-white/10 bg-black/40 hover:bg-white/10 transition group"
          >
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Step 3</span>
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Tailor Resume & Letter</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">1-Click AI role adaptation</p>
          </Link>

          <Link
            to="/interviews"
            className="flex flex-col justify-between p-2.5 rounded-xl border border-white/10 bg-black/40 hover:bg-white/10 transition group"
          >
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Step 4</span>
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Mock AI Interview</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Practice role questions</p>
          </Link>
        </div>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Resumes Stat Card */}
        {hasResumes ? (
          <StatCard label="Resumes" value={resumesCount} icon={<FileText className="h-5 w-5" />} accent="primary" hint="Active resumes created" delay={0.0} />
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.0 }}>
            <GlassCard className="flex flex-col justify-between h-full min-h-[140px] group border border-glass-border/40">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Resumes</p>
                  <div className="mt-2 font-display text-lg font-medium text-white/50">No Resumes</div>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-linear-to-br from-primary/30 to-primary/0 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex flex-col justify-between flex-grow">
                <p className="text-xs text-muted-foreground leading-normal">Ready to land your dream job? Let's build your first standout resume.</p>
                <Link to="/resumes" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors">
                  Build Resume <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ATS Score Stat Card */}
        {hasAtsScans ? (
          <StatCard label="Avg ATS Score" value={`${averageAtsScore}%`} icon={<ScanLine className="h-5 w-5" />} accent="emerald" hint="Your current average match score" delay={0.05} />
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <GlassCard className="flex flex-col justify-between h-full min-h-[140px] group border border-glass-border/40">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Avg ATS Score</p>
                  <div className="mt-2 font-display text-lg font-medium text-white/50">No Scans</div>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-linear-to-br from-emerald/30 to-emerald/0 text-emerald">
                  <ScanLine className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex flex-col justify-between flex-grow">
                <p className="text-xs text-muted-foreground leading-normal">Find out how well your resume matches target job descriptions.</p>
                <Link to="/ats" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald hover:text-emerald-hover hover:underline transition-colors">
                  Scan Resume <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Interviews Stat Card */}
        {hasInterviews ? (
          <StatCard label="Interview Prep" value={interviewsCount} icon={<MessageSquare className="h-5 w-5" />} accent="primary" hint="Active practice sessions" delay={0.1} />
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <GlassCard className="flex flex-col justify-between h-full min-h-[140px] group border border-glass-border/40">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Interview Prep</p>
                  <div className="mt-2 font-display text-lg font-medium text-white/50">No Practice</div>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-linear-to-br from-primary/30 to-primary/0 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex flex-col justify-between flex-grow">
                <p className="text-xs text-muted-foreground leading-normal">Practice interview questions in real-time with tailored AI feedback.</p>
                <Link to="/interviews" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors">
                  Practice Now <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Credits Stat Card */}
        <StatCard label="Credits" value={credits} icon={<Zap className="h-5 w-5" />} accent="warning" hint="Renews automatically" delay={0.15} />
      </div>

      {/* Main Charts / Empty State Section */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* ATS score trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          {hasAtsScans ? (
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold">ATS score trend</h3>
                  <p className="text-xs text-muted-foreground">Historical averages</p>
                </div>
              </div>
              <div className="mt-6 h-64">
                <ResponsiveContainer>
                  <AreaChart data={ats} margin={{ left: -20, right: 0, top: 10 }}>
                    <defs>
                      <linearGradient id="score" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(212 100% 60%)" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="hsl(212 100% 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="hsl(228 14% 18%)" vertical={false} />
                    <XAxis dataKey="date" stroke="hsl(220 10% 55%)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="hsl(220 10% 55%)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(228 20% 10%)", border: "1px solid hsl(228 14% 18%)", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "hsl(210 20% 96%)" }}
                    />
                    <Area type="monotone" dataKey="score" stroke="hsl(212 100% 60%)" strokeWidth={2} fill="url(#score)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="min-h-[340px] flex flex-col items-center justify-center text-center p-6 border border-glass-border/40">
              <div className="rounded-full bg-primary/10 p-4 text-primary mb-4">
                <ScanLine className="h-8 w-8" />
              </div>
              <h3 className="font-display text-base font-semibold text-white">No ATS Scan History</h3>
              <p className="mt-2 text-xs text-muted-foreground max-w-sm leading-relaxed">
                Compare your resume against job postings to see your match score and receive targeted improvement recommendations.
              </p>
              <Link to="/ats" className="btn-glow btn-glow-hover mt-5 rounded-md px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2">
                Scan Your First Resume
              </Link>
            </GlassCard>
          )}
        </motion.div>

        {/* Pipeline / Application tracker */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          {hasJobEntries ? (
            <GlassCard>
              <h3 className="font-display text-lg font-semibold">Pipeline</h3>
              <p className="text-xs text-muted-foreground">Applications by stage</p>
              <div className="mt-6 h-64">
                <ResponsiveContainer>
                  <BarChart data={kanban} margin={{ left: -20, right: 0, top: 10 }}>
                    <CartesianGrid stroke="hsl(228 14% 18%)" vertical={false} />
                    <XAxis dataKey="stage" stroke="hsl(220 10% 55%)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="hsl(220 10% 55%)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(228 20% 10%)", border: "1px solid hsl(228 14% 18%)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="hsl(158 84% 48%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="min-h-[340px] flex flex-col items-center justify-center text-center p-6 border border-glass-border/40">
              <div className="rounded-full bg-emerald/10 p-4 text-emerald mb-4">
                <Briefcase className="h-8 w-8" />
              </div>
              <h3 className="font-display text-base font-semibold text-white">Empty Job Pipeline</h3>
              <p className="mt-2 text-xs text-muted-foreground max-w-xs leading-relaxed">
                Keep track of your applications. Save target jobs to your wishlist and move them through active stages.
              </p>
              <Link to="/job-tracker" className="btn-glow btn-glow-hover mt-5 rounded-md px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2">
                Track Your First Job
              </Link>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}
