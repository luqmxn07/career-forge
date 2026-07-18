import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { FileText, ScanLine, MessageSquare, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { GlassCard } from "@/components/shared/GlassCard";
import { useDashboardStats } from "@/features/dashboard/api/dashboard";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CareerForge" }] }),
  component: DashboardPage,
});

const mockAts = [
  { date: "Mon", score: 62 }, { date: "Tue", score: 68 }, { date: "Wed", score: 71 },
  { date: "Thu", score: 78 }, { date: "Fri", score: 82 }, { date: "Sat", score: 85 }, { date: "Sun", score: 88 },
];
const mockKanban = [
  { stage: "Wishlist", count: 5 }, { stage: "Applied", count: 12 },
  { stage: "Interview", count: 4 }, { stage: "Offer", count: 2 }, { stage: "Rejected", count: 3 },
];

function DashboardPage() {
  const { data } = useDashboardStats();
  const ats = data?.atsHistory?.length ? data.atsHistory : mockAts;
  const kanban = data
    ? Object.entries(data.kanban).map(([stage, count]) => ({ stage, count }))
    : mockKanban;

  return (
    <div>
      <PageHeader title="Welcome back" description="Your resume workshop, ATS results, interview prep, and pipeline — at a glance." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Resumes" value={data?.resumes ?? 4} icon={<FileText className="h-5 w-5" />} accent="primary" hint="+2 this week" delay={0.0} />
        <StatCard label="Avg ATS Score" value={`${data?.atsAverageScore ?? 82}%`} icon={<ScanLine className="h-5 w-5" />} accent="emerald" hint="↑ 6pts vs last scan" delay={0.05} />
        <StatCard label="Interview Sessions" value={data?.interviews ?? 9} icon={<MessageSquare className="h-5 w-5" />} accent="primary" hint="Avg score 84/100" delay={0.1} />
        <StatCard label="Credits" value={data?.credits ?? 65} icon={<Zap className="h-5 w-5" />} accent="warning" hint="Renews in 12 days" delay={0.15} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">ATS score trend</h3>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </div>
              <span className="rounded-full bg-emerald/15 px-2.5 py-0.5 text-xs font-semibold text-emerald">+26%</span>
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
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
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
        </motion.div>
      </div>
    </div>
  );
}
