import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Flame, LogOut, LogIn, UserPlus } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useLogout } from '@/features/auth/api/auth'
import { toast } from 'sonner'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'ATS Scanner', href: '#features' },
  { label: 'Interview Prep', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
]

export function SiteNav() {
  const token = useAuthStore((s) => s.token)
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
