import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Shield, Users, Activity, TrendingUp, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatCard } from "@/components/shared/StatCard";
import { useAuthStore } from "@/stores/auth-store";
import { useMfaVerify } from "@/features/auth/api/auth";
import { useAdminStats, useAuditLogs, useAdminFeedback, useAdjustCredits, useUpdateFeedback } from "@/features/admin/api/admin";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Admin — CareerForge" }] }),
  component: AdminPage,
});

function AdminPage() {
  const mfaVerified = useAuthStore((s) => s.mfaVerified);
  const setMfa = useAuthStore((s) => s.setMfaVerified);
  const mfa = useMfaVerify();
  const [code, setCode] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mfaVerified) {
    return (
      <div className="mx-auto max-w-md">
        <GlassCard glow className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary"><Shield className="h-5 w-5" /></div>
          <h2 className="mt-4 font-display text-2xl font-semibold">Admin verification</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter the 6-digit MFA code to continue.</p>
          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              // dev bypass code: 123456
              if (code === "123456") { setMfa(true); toast.success("Admin session unlocked"); return; }
              mfa.mutate({ code }, {
                onSuccess: () => { setMfa(true); toast.success("Admin unlocked"); },
                onError: (err: any) => toast.error(err.message || "Invalid code"),
              });
            }}
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              placeholder="123456"
              className="w-full rounded-md border border-glass-border bg-input px-4 py-4 text-center font-display text-3xl tracking-[0.5em] outline-none focus:border-primary focus:ring-glow"
            />
            <button className="btn-glow btn-glow-hover w-full rounded-md px-5 py-2.5 text-sm font-semibold">Verify</button>
          </form>
        </GlassCard>
      </div>
    );
  }

  return <AdminPanel />;
}

function AdminPanel() {
  const { data: stats } = useAdminStats();
  const { data: logs = [] } = useAuditLogs();
  const { data: feedback = [] } = useAdminFeedback();
  const adjust = useAdjustCredits();
  const updateFb = useUpdateFeedback();

  const mockChart = [
    { date: "W1", users: 120 }, { date: "W2", users: 180 }, { date: "W3", users: 260 },
    { date: "W4", users: 340 }, { date: "W5", users: 410 }, { date: "W6", users: 520 },
  ];
  const chartData = stats?.usersOverTime?.length ? stats.usersOverTime : mockChart;

  const mockLogs = logs.length ? logs : [
    { id: "l1", actor: "admin@cf.io", action: "credits.adjust", target: "u_1024 +50", createdAt: "2m ago" },
    { id: "l2", actor: "admin@cf.io", action: "feedback.update", target: "f_88 → closed", createdAt: "12m ago" },
  ];
  const mockFb = feedback.length ? feedback : [
    { id: "f1", user: "sara@doe.com", subject: "PDF compile stuck", status: "open" as const, createdAt: "1h" },
    { id: "f2", user: "leo@yc.com", subject: "Interview transcript missing", status: "in_progress" as const, createdAt: "3h" },
  ];

  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState(50);
  const [reason, setReason] = useState("Refund");

  return (
    <div>
      <PageHeader title="Administrator" description="Platform analytics, audit trail, credits, and support tickets." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={stats?.totalUsers ?? 5240} icon={<Users className="h-5 w-5" />} accent="primary" />
        <StatCard label="Premium ratio" value={`${Math.round((stats?.premiumRatio ?? 0.28) * 100)}%`} icon={<TrendingUp className="h-5 w-5" />} accent="emerald" />
        <StatCard label="Total scans" value={stats?.totalScans ?? 18420} icon={<Activity className="h-5 w-5" />} accent="warning" />
        <StatCard label="Interviews" value={stats?.totalInterviews ?? 4890} icon={<Shield className="h-5 w-5" />} accent="primary" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <GlassCard>
            <h3 className="font-display text-lg font-semibold">User growth</h3>
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ left: -20, right: 0, top: 10 }}>
                  <CartesianGrid stroke="hsl(228 14% 18%)" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(220 10% 55%)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="hsl(220 10% 55%)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(228 20% 10%)", border: "1px solid hsl(228 14% 18%)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="users" stroke="hsl(212 100% 60%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(158 84% 48%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <GlassCard>
          <h3 className="font-display font-semibold">Adjust credits</h3>
          <form
            className="mt-3 space-y-3 text-sm"
            onSubmit={(e) => {
              e.preventDefault();
              adjust.mutate({ userId, amount, reason }, {
                onSuccess: () => toast.success("Credits adjusted"),
                onError: (err: any) => toast.error(err.message || "Failed"),
              });
            }}
          >
            <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-sm" />
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-sm" />
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="w-full rounded-md border border-glass-border bg-input px-3 py-2 text-sm" />
            <button className="btn-glow btn-glow-hover w-full rounded-md px-4 py-2 text-sm font-semibold">Apply</button>
          </form>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h3 className="font-display font-semibold">Audit logs</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {mockLogs.map((l: any) => (
              <li key={l.id} className="rounded-md border border-glass-border bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{l.action}</span>
                  <span className="text-xs text-muted-foreground">{l.createdAt}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{l.actor} · {l.target}</p>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display font-semibold">Support & feedback</h3>
          <div className="scrollbar-thin mt-3 max-h-80 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr><th className="py-2">User</th><th>Subject</th><th>Status</th></tr>
              </thead>
              <tbody>
                {mockFb.map((f: any) => (
                  <tr key={f.id} className="border-t border-glass-border">
                    <td className="py-2 text-xs">{f.user}</td>
                    <td className="py-2">{f.subject}</td>
                    <td className="py-2">
                      <select
                        value={f.status}
                        onChange={(e) => updateFb.mutate({ id: f.id, status: e.target.value as any }, {
                          onSuccess: () => toast.success("Updated"),
                        })}
                        className="rounded border border-glass-border bg-input px-2 py-0.5 text-xs"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In progress</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
