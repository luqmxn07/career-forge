import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useNotifications, useMarkRead, useMarkAllRead } from "@/features/notifications/api/notifications";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — CareerForge" }] }),
  component: NotificationsPage,
});

const MOCK = [
  { id: "n1", title: "PDF ready", body: "Your resume 'Senior FE — Stripe' has compiled.", read: false, type: "pdf" as const },
  { id: "n2", title: "Deadline approaching", body: "Vercel application closes in 2 days.", read: false, type: "deadline" as const },
  { id: "n3", title: "Payment received", body: "Pro plan renewed successfully.", read: true, type: "billing" as const },
];

function NotificationsPage() {
  const { data: notifs = [], isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
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
  const list = notifs.length ? notifs : MOCK;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Deadlines, PDF compiles, billing events, and system updates."
        actions={
          <button onClick={() => markAll.mutate()} className="rounded-md border border-glass-border px-4 py-2 text-sm hover:bg-white/[0.04]">
            Mark all read
          </button>
        }
      />

      <div className="space-y-2">
        <AnimatePresence>
          {list.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard className="flex items-start gap-4">
                <div className={`mt-1 grid h-9 w-9 place-items-center rounded-lg ${(n as any).isRead || (n as any).read ? "bg-white/[0.04] text-muted-foreground" : "bg-primary/15 text-primary ring-glow"}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{n.title}</p>
                  {((n as any).body || (n as any).message) && <p className="mt-0.5 text-sm text-muted-foreground">{(n as any).body || (n as any).message}</p>}
                </div>
                {!((n as any).isRead || (n as any).read) && (
                  <button onClick={() => markRead.mutate(n.id)} className="rounded-md border border-glass-border p-2 text-muted-foreground hover:text-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
