import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Wand2 } from 'lucide-react'

const generic = [
  'Responsible for building web pages.',
  'Worked on the company database.',
  'Helped the team ship features.',
]

const tailored = [
  'Architected 12+ responsive React pages, lifting mobile conversion by 27%.',
  'Redesigned Postgres schema & indexing, reducing p95 query time by 42%.',
  'Shipped 30+ features across 4 sprints as squad tech lead.',
]

export function FeatureResumeWorkshop() {
  const [adapted, setAdapted] = useState(true)
  const lines = adapted ? tailored : generic

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">Generic</span>
        <button
          type="button"
          role="switch"
          aria-checked={adapted}
          aria-label="Toggle role-adapted resume bullets"
          onClick={() => setAdapted((v) => !v)}
          className={`relative h-7 w-14 rounded-full transition-colors cursor-pointer ${
            adapted ? 'bg-primary' : 'bg-secondary'
          }`}
        >
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`absolute top-1 h-5 w-5 rounded-full bg-background shadow ${
              adapted ? 'left-8' : 'left-1'
            }`}
          />
        </button>
        <span className="flex items-center gap-1 text-xs font-medium text-brand-cyan">
          <Wand2 className="h-3.5 w-3.5" /> Role-Adapted
        </span>
      </div>

      <ul className="flex-1 space-y-3">
        <AnimatePresence mode="wait">
          {lines.map((line, i) => (
            <motion.li
              key={`${adapted}-${i}`}
              initial={{ opacity: 0, x: adapted ? 16 : -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className={`flex gap-2 rounded-lg border p-3 text-sm leading-snug ${
                adapted
                  ? 'border-brand-cyan/30 bg-brand-cyan/5 text-foreground'
                  : 'border-border bg-secondary/40 text-muted-foreground'
              }`}
            >
              <span className={adapted ? 'text-brand-green' : 'text-muted-foreground'}>•</span>
              {line}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
