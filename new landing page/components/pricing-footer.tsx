'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Check, Flame } from 'lucide-react'

const perks = [
  'Unlimited role-tailored resumes',
  'Live ATS match optimization',
  'Real-time AI mock interviews',
  'Full application tracker',
]

export function PricingFooter() {
  return (
    <>
      <section id="pricing" className="relative z-10 mx-auto max-w-4xl px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass relative overflow-hidden rounded-3xl p-8 text-center md:p-14"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan to-transparent" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-purple/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-cyan/20 blur-3xl" />

          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-green">
            <Check className="h-3.5 w-3.5" /> No credit card required
          </span>

          <h2 className="mt-6 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            100% Free for Job Seekers
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
            Every tool. No paywalls, no trials, no catch. We win when you land the offer.
          </p>

          <ul className="mx-auto mt-8 grid max-w-md gap-3 text-left sm:grid-cols-2">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-sm text-foreground">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-green/15 text-brand-green">
                  <Check className="h-3 w-3" />
                </span>
                {perk}
              </li>
            ))}
          </ul>

          <a
            href="#"
            className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_0_28px_rgba(56,189,248,0.4)] transition-all hover:shadow-[0_0_44px_rgba(56,189,248,0.7)]"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-purple">
              <Flame className="h-5 w-5 text-background" strokeWidth={2.5} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Career<span className="text-gradient">Forge</span>
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            Owned &amp; Built by{' '}
            <span className="font-semibold text-gradient">Aric Paul</span>
          </p>
        </div>

        <div className="border-t border-white/5 py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CareerForge. Land your dream job 10x faster.
        </div>
      </footer>
    </>
  )
}
