'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mic, ThumbsUp, Lightbulb } from 'lucide-react'

const BARS = Array.from({ length: 28 })

export function FeatureInterview() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [seeds, setSeeds] = useState<number[]>([])

  useEffect(() => {
    setSeeds(BARS.map(() => Math.random()))
  }, [])

  return (
    <div ref={ref} className="flex h-full flex-col gap-4">
      {/* Question */}
      <div className="glass rounded-xl p-3">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-brand-purple">
          <Mic className="h-3.5 w-3.5" /> AI Interviewer
        </div>
        <p className="text-sm leading-snug text-foreground">
          &ldquo;Tell me about a time you optimized system performance under pressure.&rdquo;
        </p>
      </div>

      {/* Waveform */}
      <div className="flex h-16 items-center justify-center gap-1 rounded-xl bg-secondary/40 px-3">
        {seeds.map((seed, i) => (
          <motion.span
            key={i}
            className="w-1 rounded-full bg-gradient-to-t from-brand-cyan to-brand-purple"
            animate={
              inView
                ? { height: [`${8 + seed * 20}%`, `${40 + seed * 55}%`, `${8 + seed * 20}%`] }
                : { height: '10%' }
            }
            transition={{
              duration: 0.9 + seed * 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.03,
            }}
          />
        ))}
      </div>

      {/* Feedback cards */}
      <div className="grid grid-cols-2 gap-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-brand-green/30 bg-brand-green/5 p-2.5"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-green">
            <ThumbsUp className="h-3.5 w-3.5" /> Strength
          </div>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Clear STAR structure with measurable impact.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.45 }}
          className="rounded-lg border border-brand-cyan/30 bg-brand-cyan/5 p-2.5"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-cyan">
            <Lightbulb className="h-3.5 w-3.5" /> Tip
          </div>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Quantify the team size you influenced.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
