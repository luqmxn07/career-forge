'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { CheckCircle2, Zap, Mic, FileText } from 'lucide-react'
import { useTypewriter } from './use-typewriter'

const BULLETS = [
  'Optimized distributed database query latency by 42% using Redis indexing.',
  'Led migration of monolith to microservices, cutting deploy time by 65%.',
  'Built real-time analytics pipeline processing 2M events per minute.',
  'Mentored 6 engineers; raised team code-review throughput by 30%.',
]

export function ResumeCard() {
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, { stiffness: 150, damping: 18 })
  const springY = useSpring(rotateY, { stiffness: 150, damping: 18 })

  const glareX = useTransform(springY, [-12, 12], ['0%', '100%'])
  const glareY = useTransform(springX, [12, -12], ['0%', '100%'])

  const { displayed, current } = useTypewriter(BULLETS)

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * 24)
    rotateX.set(-py * 24)
  }

  function handleLeave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <div className="relative mx-auto w-full max-w-md" style={{ perspective: 1200 }}>
      {/* Floating badges */}
      <FloatingBadge
        className="-left-3 -top-4 md:-left-16"
        color="green"
        icon={<CheckCircle2 className="h-4 w-4" />}
        label="ATS Match: 98%"
        delay={0.2}
      />
      <FloatingBadge
        className="-right-2 top-1/3 md:-right-14"
        color="cyan"
        icon={<Zap className="h-4 w-4" />}
        label="Tailored: Frontend @ Google"
        delay={0.5}
      />
      <FloatingBadge
        className="-left-3 bottom-10 md:-left-16"
        color="purple"
        icon={<Mic className="h-4 w-4" />}
        label="Interview Ready"
        delay={0.8}
      />

      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          rotateX: springX,
          rotateY: springY,
          transformStyle: 'preserve-3d',
        }}
        className="glass relative aspect-[1/1.414] w-full overflow-hidden rounded-2xl p-6 shadow-[0_30px_80px_-20px_rgba(56,189,248,0.35)]"
      >
        {/* Glare */}
        <motion.div
          aria-hidden="true"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.18), transparent 45%)`,
            ),
          }}
          className="pointer-events-none absolute inset-0"
        />

        {/* Resume header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple text-background">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Alex Rivera</div>
            <div className="text-xs text-muted-foreground">Senior Software Engineer</div>
          </div>
        </div>

        {/* Experience label */}
        <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-brand-cyan">
          Experience — AI Generated
        </div>

        {/* Typewriter bullets */}
        <ul className="mt-3 space-y-3 font-mono text-[12px] leading-relaxed text-muted-foreground">
          {displayed.map((line, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-brand-green">•</span>
              <span className="text-foreground/90">{line}</span>
            </li>
          ))}
          {current && (
            <li className="flex gap-2">
              <span className="text-brand-green">•</span>
              <span className="text-foreground/90">
                {current}
                <span
                  className="ml-0.5 inline-block h-3 w-[2px] translate-y-0.5 bg-brand-cyan"
                  style={{ animation: 'blink-caret 1s step-end infinite' }}
                />
              </span>
            </li>
          )}
        </ul>

        {/* Skeleton footer lines */}
        <div className="mt-6 space-y-2">
          <div className="h-2 w-3/4 rounded-full bg-white/8" />
          <div className="h-2 w-2/3 rounded-full bg-white/8" />
          <div className="h-2 w-1/2 rounded-full bg-white/8" />
        </div>
      </motion.div>
    </div>
  )
}

function FloatingBadge({
  className,
  color,
  icon,
  label,
  delay,
}: {
  className?: string
  color: 'green' | 'cyan' | 'purple'
  icon: React.ReactNode
  label: string
  delay: number
}) {
  const styles = {
    green: 'text-brand-green shadow-[0_0_24px_rgba(52,211,153,0.4)]',
    cyan: 'text-brand-cyan shadow-[0_0_24px_rgba(56,189,248,0.4)]',
    purple: 'text-brand-purple shadow-[0_0_24px_rgba(168,85,247,0.4)]',
  }[color]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { delay, duration: 0.5 },
        scale: { delay, duration: 0.5 },
        y: { delay: delay + 0.5, duration: 4, repeat: Infinity, ease: 'easeInOut' },
      }}
      className={`glass absolute z-20 flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${styles} ${className}`}
    >
      {icon}
      <span className="whitespace-nowrap text-foreground">{label}</span>
    </motion.div>
  )
}
