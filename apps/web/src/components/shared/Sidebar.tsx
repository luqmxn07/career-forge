import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, ScanLine, MessageSquare, Briefcase, User,
  Sparkles, Shield, ChevronLeft, ChevronRight, Bell, CreditCard,
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/resumes", label: "Resumes", icon: FileText },
  { to: "/ats", label: "ATS Scanner", icon: ScanLine },
  { to: "/cover-letters", label: "Cover Letters", icon: Sparkles },
  { to: "/interviews", label: "Interviews", icon: MessageSquare },
  { to: "/job-tracker", label: "Job Tracker", icon: Briefcase },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/admin", label: "Admin", icon: Shield },
] as const;


export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "glass-panel sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-glass-border py-4 transition-all duration-300 lg:flex",
        collapsed ? "w-[76px]" : "w-[248px]"
      )}
    >
      <div className={cn("flex items-center gap-2 px-4", collapsed && "justify-center px-2")}>
        <img src="/logo.png" className="h-9 w-9 object-contain" alt="CareerForge Logo" />
        {!collapsed && (
          <div>
            <p className="font-display text-sm font-semibold leading-tight">CareerForge</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Suite</p>
          </div>
        )}
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors",
                "hover:bg-white/[0.04] hover:text-foreground",
                active && "bg-white/[0.06] text-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_hsl(212_100%_60%/0.8)] w-[3px]" />
              )}
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={toggle}
        className="mx-2 mt-2 grid h-8 place-items-center rounded-md border border-glass-border text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
