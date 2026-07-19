import { Link, useNavigate } from "@tanstack/react-router";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, LogOut, Menu, Sparkles, User as UserIcon, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { useNotifications, useMarkAllRead } from "@/features/notifications/api/notifications";
import { useLogout } from "@/features/auth/api/auth";
import { cn } from "@/lib/utils";

import { useCredits } from "@/features/credits/api/credits";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const toggle = useUIStore((s) => s.toggleSidebar);
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications();
  const { data: liveBalance } = useCredits();
  const markAll = useMarkAllRead();
  const logout = useLogout();
  const unread = notifications.filter((n) => !n.isRead && !n.read).length;
  const isAdmin = user?.role?.toLowerCase() === "admin" || user?.email === "aricpaul2007@gmail.com";
  const credits = isAdmin ? 999999 : (typeof liveBalance === "number" ? liveBalance : (user?.credits ?? 100));
  const creditsMax = 100;
  const pct = isAdmin ? 100 : Math.max(0, Math.min(100, (credits / creditsMax) * 100));

  return (
    <header className="glass-panel sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-glass-border px-4 lg:px-6">
      <button
        onClick={toggle}
        className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-white/[0.04] hover:text-foreground lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link to="/" className="flex items-center gap-2 lg:hidden cursor-pointer hover:opacity-90 transition-opacity" title="Go to Home Page">
        <img src="/logo.png" className="h-8 w-8 object-contain" alt="CareerForge Logo" />
        <span className="font-display font-semibold">CareerForge</span>
      </Link>

      <nav className="ml-4 hidden items-center gap-1 md:flex">
        {[
          { to: "/dashboard", label: "Dashboard" },
          { to: "/resumes", label: "Resumes" },
          { to: "/ats", label: "ATS" },
          { to: "/interviews", label: "Interviews" },
          { to: "/job-tracker", label: "Tracker" },
        ].map((i) => (
          <Link
            key={i.to}
            to={i.to}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
            activeProps={{ className: "bg-white/[0.06] text-foreground" }}
          >
            {i.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        {/* Credits meter */}
        <div className="hidden items-center gap-2 rounded-lg border border-glass-border bg-white/[0.03] px-3 py-1.5 sm:flex">
          <Zap className="h-3.5 w-3.5 text-emerald" />
          <div className="text-xs">
            {isAdmin ? (
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <span>👑 Admin</span>
                <span className="text-[10px] text-muted-foreground">(∞ Unlimited)</span>
              </span>
            ) : (
              <>
                <span className="font-semibold tabular-nums text-foreground">{credits}</span>
                <span className="text-muted-foreground"> / {creditsMax}</span>
              </>
            )}
          </div>
          {!isAdmin && (
            <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-emerald to-primary-glow"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="grid h-9 w-9 place-items-center rounded-md border border-glass-border bg-white/[0.03] text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Switch Theme"
              title="Switch Theme"
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="glass-panel z-50 w-48 rounded-lg border border-glass-border p-1.5 shadow-2xl space-y-1"
            >
              <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Select Theme</p>
              {[
                { id: "dark", label: "🌙 Dark Glass", icon: "✨" },
                { id: "cyber-violet", label: "👾 Cyber Violet", icon: "💜" },
                { id: "emerald-glow", label: "🌿 Emerald Neon", icon: "💚" },
                { id: "pure-light", label: "☀️ Pure Light", icon: "🤍" },
              ].map((t) => (
                <DropdownMenu.Item
                  key={t.id}
                  onSelect={() => useUIStore.getState().setTheme(t.id as any)}
                  className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs cursor-pointer hover:bg-white/[0.06] text-foreground font-medium"
                >
                  <span>{t.label}</span>
                  {useUIStore.getState().theme === t.id && <span className="text-primary font-bold">✓</span>}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Notifications */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="relative grid h-9 w-9 place-items-center rounded-md border border-glass-border bg-white/[0.03] text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-[0_0_10px_hsl(212_100%_60%/0.8)]">
                  {unread}
                </span>
              )}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className={cn(
                "glass-panel z-50 w-80 rounded-lg border border-glass-border p-2 shadow-2xl",
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
              )}
            >
              <div className="flex items-center justify-between px-2 py-1.5">
                <p className="text-sm font-semibold">Notifications</p>
                {unread > 0 && (
                  <button
                    onClick={() => markAll.mutate()}
                    className="text-xs text-primary hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="scrollbar-thin max-h-[360px] overflow-y-auto">
                <AnimatePresence>
                  {notifications.length === 0 && (
                    <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                      You're all caught up.
                    </p>
                  )}
                  {notifications.slice(0, 8).map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-2 rounded-md px-3 py-2 hover:bg-white/[0.04]"
                    >
                      <div className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", (n.isRead || n.read) ? "bg-white/20" : "bg-primary shadow-[0_0_8px_hsl(212_100%_60%/0.8)]")} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        {(n.body || n.message) && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body || n.message}</p>}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <DropdownMenu.Separator className="my-1 h-px bg-glass-border" />
              <DropdownMenu.Item asChild>
                <Link to="/notifications" className="block rounded-md px-3 py-2 text-center text-xs text-muted-foreground hover:bg-white/[0.04] hover:text-foreground">
                  View all notifications
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Avatar / user */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-primary to-primary-glow text-xs font-semibold text-primary-foreground shadow-[0_0_20px_hsl(212_100%_60%/0.35)]">
              {(user?.fullName || user?.email || "U").slice(0, 1).toUpperCase()}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="glass-panel z-50 w-56 rounded-lg border border-glass-border p-1 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0"
            >
              <div className="px-3 py-2">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{user?.fullName || "Signed in"}</p>
                  {isAdmin && <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">ADMIN</span>}
                </div>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenu.Separator className="my-1 h-px bg-glass-border" />
              <DropdownMenu.Item asChild>
                <Link to="/profile" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/[0.04]">
                  <UserIcon className="h-4 w-4" /> Profile
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1 h-px bg-glass-border" />
              <DropdownMenu.Item
                onSelect={() => logout.mutate(undefined, { onSettled: () => navigate({ to: "/auth/login" }) })}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
