import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
}
export function GlassCard({ children, className, glow, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={cn(
        "glass-card p-6 relative overflow-hidden",
        glow && "ring-glow",
        className
      )}
    >
      {children}
    </div>
  );
}
