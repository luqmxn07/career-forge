import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({ component: AuthLayout });

function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-emerald/10" />
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-emerald/20 blur-3xl" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-linear-to-br from-primary to-primary-glow shadow-[0_0_20px_hsl(212_100%_60%/0.5)]">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold">CareerForge</span>
          </Link>
          <div>
            <blockquote className="font-display text-2xl leading-snug text-foreground/90">
              "CareerForge cut my job hunt in half — three offers in six weeks, zero resume rewrites."
            </blockquote>
            <p className="mt-3 text-sm text-muted-foreground">— Amelia R., Senior Product Designer</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm"><Outlet /></div>
      </div>
    </div>
  );
}
