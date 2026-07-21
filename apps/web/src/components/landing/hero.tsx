import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowRight, LogIn, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { ResumeCard } from './resume-card'

const steps = ['Master Profile', '1-Click Resume', 'ATS Optimize', 'Mock Interview']

export function Hero() {
  const token = useAuthStore((s) => s.token)

  return (
    <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 pb-24 pt-36 md:pt-44 lg:flex-row lg:gap-8 lg:pb-32">
      {/* Left */}
      <div className="flex-1 text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground lg:mx-0"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-cyan" />
          AI-Powered Career Accelerator
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          Craft Tailored Resumes &amp; <span className="text-gradient">Crack Interviews</span> with AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground lg:mx-0 lg:text-lg"
        >
          Land your dream job 10x faster. Follow one guided pathway — master your profile,
          generate role-tailored resumes in a click, optimize your ATS match, and rehearse with a
          real-time AI interviewer.
        </motion.p>

        {/* 4-step pathway */}
        <motion.ol
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2 lg:mx-0 lg:justify-start"
        >
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-foreground">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                {s}
              </span>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
              )}
            </li>
          ))}
        </motion.ol>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
        >
          {token ? (
            <>
              <Link
                to="/dashboard"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_0_28px_rgba(56,189,248,0.4)] transition-all hover:shadow-[0_0_44px_rgba(56,189,248,0.7)]"
              >
                <span className="absolute inset-0 rounded-xl ring-2 ring-brand-cyan/0 transition-all duration-300 group-hover:ring-brand-cyan/60" />
                Launch Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth/signup"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_0_28px_rgba(56,189,248,0.4)] transition-all hover:shadow-[0_0_44px_rgba(56,189,248,0.7)]"
              >
                <span className="absolute inset-0 rounded-xl ring-2 ring-brand-cyan/0 transition-all duration-300 group-hover:ring-brand-cyan/60" />
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/auth/login"
                className="glass inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:text-brand-cyan"
              >
                <LogIn className="h-4 w-4" />
                Sign In to Account
              </Link>
            </>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-5 text-xs text-muted-foreground"
        >
          100% Free for Job Seekers · No credit card required
        </motion.p>
      </div>

      {/* Right — 3D resume */}
      <div className="flex-1 lg:pl-6">
        <ResumeCard />
      </div>
    </section>
  )
}
