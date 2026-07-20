'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'ATS Scanner', href: '#features' },
  { label: 'Interview Prep', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
]

export function SiteNav() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4"
    >
      <nav className="glass flex w-full max-w-6xl items-center justify-between rounded-2xl px-4 py-3 md:px-6">
        <a href="#" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-purple shadow-[0_0_20px_rgba(56,189,248,0.5)]">
            <Flame className="h-5 w-5 text-background" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Career<span className="text-gradient">Forge</span>
          </span>
        </a>

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

        <a
          href="#"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(56,189,248,0.35)] transition-shadow hover:shadow-[0_0_28px_rgba(56,189,248,0.6)]"
        >
          Get Started
        </a>
      </nav>
    </motion.header>
  )
}
