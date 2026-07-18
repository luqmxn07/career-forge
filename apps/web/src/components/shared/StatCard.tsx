import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: string;
  accent?: "primary" | "emerald" | "warning" | "destructive";
  delay?: number;
}
const accents: Record<NonNullable<Props["accent"]>, string> = {
  primary: "from-primary/30 to-primary/0 text-primary",
  emerald: "from-emerald/30 to-emerald/0 text-emerald",
  warning: "from-warning/30 to-warning/0 text-warning",
  destructive: "from-destructive/30 to-destructive/0 text-destructive",
};

export function StatCard({ label, value, icon, hint, accent = "primary", delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <GlassCard className="group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div
            className={cn(
              "grid h-10 w-10 place-items-center rounded-lg bg-linear-to-br",
              accents[accent]
            )}
          >
            {icon}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
