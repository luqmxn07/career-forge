import { Link, useNavigate } from '@tanstack/react-router'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { motion } from 'framer-motion'
import { Flame, LogOut, LogIn, Palette, UserPlus } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useLogout } from '@/features/auth/api/auth'
import { useUIStore, type AppTheme } from '@/stores/ui-store'
import { toast } from 'sonner'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'ATS Scanner', href: '#features' },
  { label: 'Interview Prep', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
]

const themes: { id: AppTheme; label: string; swatch: string }[] = [
  { id: 'dark', label: 'Dark Glass', swatch: 'from-sky-400 to-violet-500' },
  { id: 'midnight-ink', label: 'Midnight Ink', swatch: 'from-slate-500 to-slate-950' },
  { id: 'cyber-violet', label: 'Cyber Violet', swatch: 'from-violet-500 to-fuchsia-500' },
  { id: 'emerald-glow', label: 'Emerald Glow', swatch: 'from-emerald-400 to-teal-500' },
  { id: 'sunset-ember', label: 'Sunset Ember', swatch: 'from-amber-400 to-rose-500' },
  { id: 'pure-light', label: 'Pure Light', swatch: 'from-slate-100 to-sky-300' },
]

export function SiteNav() {
  const token = useAuthStore((s) => s.token)
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const navigate = useNavigate()
  const logout = useLogout()

  const handleSignOut = () => {
    toast.promise(
      logout.mutateAsync(),
      {
        loading: 'Signing out...',
        success: () => {
          navigate({ to: '/' })
          return 'Signed out successfully'
        },
        error: 'Signed out successfully', // Fallback success message
      }
    )
  }

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4"
    >
      <nav className="glass flex w-full max-w-6xl items-center justify-between rounded-2xl px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-purple shadow-[0_0_20px_rgba(56,189,248,0.5)]">
            <Flame className="h-5 w-5 text-background" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Career<span className="text-gradient">Forge</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="glass grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                aria-label="Choose theme"
                title="Choose theme"
              >
                <Palette className="h-4 w-4 text-primary" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={10}
                className="glass-strong z-50 w-52 rounded-2xl p-2 shadow-2xl"
              >
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Appearance</p>
                {themes.map((item) => (
                  <DropdownMenu.Item
                    key={item.id}
                    onSelect={() => setTheme(item.id)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-foreground outline-none transition-colors hover:bg-white/10 focus:bg-white/10"
                  >
                    <span className={`h-4 w-4 rounded-full bg-gradient-to-br ${item.swatch} ring-1 ring-white/20`} />
                    <span className="flex-1">{item.label}</span>
                    {theme === item.id && <span className="text-primary">✓</span>}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          {token ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(56,189,248,0.35)] transition-shadow hover:shadow-[0_0_28px_rgba(56,189,248,0.6)]"
              >
                Launch Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                disabled={logout.isPending}
                className="glass flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground hover:bg-white/10 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="glass flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:text-brand-cyan hover:bg-white/10 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </Link>
              <Link
                to="/auth/signup"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(56,189,248,0.35)] transition-shadow hover:shadow-[0_0_28px_rgba(56,189,248,0.6)] flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" /> Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  )
}
