import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard, FileText, ScanLine, MessageSquare, Briefcase, User,
  Sparkles, Shield, ChevronLeft, ChevronRight, Bell, X,
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

import { useAuthStore } from "@/stores/auth-store";

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
  const user = useAuthStore((s) => s.user);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const setCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const navItems = items.filter((item) => item.to !== "/admin" || user?.role === "ADMIN");

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setCollapsed(true);
    }
  }, [setCollapsed]);

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setCollapsed(true);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {!collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar / Mobile Drawer */}
      <aside
        className={cn(
          "glass-panel fixed top-0 z-50 flex h-screen shrink-0 flex-col border-r border-glass-border py-4 transition-all duration-300",
          "lg:sticky lg:z-30",
          collapsed
            ? "-translate-x-full lg:translate-x-0 lg:flex lg:w-[76px]"
            : "translate-x-0 w-[260px] lg:flex lg:w-[248px]"
        )}
      >
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="h-9 w-9 object-contain" alt="CareerForge Logo" />
            {(!collapsed || (typeof window !== "undefined" && window.innerWidth < 1024)) && (
              <div>
                <p className="font-display text-sm font-semibold leading-tight">CareerForge</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Suite</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-white/[0.06] hover:text-foreground lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-2 overflow-y-auto scrollbar-thin">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                onClick={handleNavClick}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors",
                  "hover:bg-white/[0.04] hover:text-foreground",
                  active && "bg-white/[0.06] text-foreground font-medium"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_hsl(212_100%_60%/0.8)] w-[3px]" />
                )}
                <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                <span className={cn("truncate", collapsed && "lg:hidden")}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={toggle}
          className="mx-2 mt-2 hidden h-8 place-items-center rounded-md border border-glass-border text-muted-foreground hover:text-foreground hover:bg-white/[0.04] lg:grid"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>
    </>
  );
}
