'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const SKILLS = [
  { label: 'React / TypeScript', matched: true },
  { label: 'System Design', matched: true },
  { label: 'GraphQL', matched: true },
  { label: 'Kubernetes', matched: false },
]

export function FeatureAtsScanner() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [score, setScore] = useState(0)
  const target = 94

  useEffect(() => {
    if (!inView) return
    let frame: number
    const start = performance.now()
    const duration = 1400
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setScore(Math.round(eased * target))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView])

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div ref={ref} className="flex h-full flex-col items-center justify-center gap-5">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} className="fill-none stroke-secondary" strokeWidth="10" />
          <defs>
            <linearGradient id="ats-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="fill-none"
            stroke="url(#ats-grad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s linear', filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.6))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{score}%</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">ATS Match</span>
        </div>
      </div>

      <ul className="w-full space-y-2">
        {SKILLS.map((s, i) => (
          <motion.li
            key={s.label}
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 + i * 0.15 }}
            className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-xs"
          >
            <span className="text-foreground">{s.label}</span>
            <span className={s.matched ? 'text-brand-green' : 'text-muted-foreground'}>
              {s.matched ? 'Matched' : 'Add skill'}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
