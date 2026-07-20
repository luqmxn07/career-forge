'use client'

import { motion } from 'framer-motion'

const columns = [
  {
    title: 'Applied',
    color: 'text-brand-cyan',
    cards: ['Stripe · SWE II', 'Notion · Frontend'],
  },
  {
    title: 'Interview',
    color: 'text-brand-purple',
    cards: ['Google · FE Eng', 'Figma · Product'],
  },
  {
    title: 'Offer',
    color: 'text-brand-green',
    cards: ['Vercel · DX Eng'],
  },
]

export function FeatureTracker() {
  return (
    <div className="grid h-full grid-cols-3 gap-2">
      {columns.map((col) => (
        <div key={col.title} className="flex flex-col gap-2">
          <div className={`text-[11px] font-semibold uppercase tracking-wider ${col.color}`}>
            {col.title}
          </div>
          {col.cards.map((card, i) => (
            <motion.div
              key={card}
              whileHover={{ y: -4, scale: 1.03 }}
              drag
              dragConstraints={{ top: -8, bottom: 8, left: -8, right: 8 }}
              dragElastic={0.2}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass cursor-grab rounded-lg p-2.5 text-[11px] leading-snug text-foreground active:cursor-grabbing"
            >
              <div className="mb-1.5 h-1.5 w-8 rounded-full bg-white/15" />
              {card}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  )
}
