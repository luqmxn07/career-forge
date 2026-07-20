import { motion } from 'framer-motion'
import { FileEdit, ScanLine, Headphones, KanbanSquare } from 'lucide-react'
import { FeatureResumeWorkshop } from './feature-resume-workshop'
import { FeatureAtsScanner } from './feature-ats-scanner'
import { FeatureInterview } from './feature-interview'
import { FeatureTracker } from './feature-tracker'

const cards = [
  {
    icon: FileEdit,
    title: '1-Click Resume Workshop',
    desc: 'Instantly rewrite generic bullets into sharp, role-adapted achievements.',
    content: <FeatureResumeWorkshop />,
  },
  {
    icon: ScanLine,
    title: 'Instant ATS Match Scanner',
    desc: 'Scan any job description against your skills and get a live match score.',
    content: <FeatureAtsScanner />,
  },
  {
    icon: Headphones,
    title: 'AI Mock Interview Practice',
    desc: 'Rehearse out loud and get real-time feedback on structure and impact.',
    content: <FeatureInterview />,
  },
  {
    icon: KanbanSquare,
    title: 'Application Tracker',
    desc: 'Drag every opportunity from applied to offer in one clean board.',
    content: <FeatureTracker />,
  },
]

export function Features() {
  return (
    <section id="features" className="relative z-10 mx-auto max-w-6xl px-4 py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm font-semibold uppercase tracking-wider text-brand-cyan"
        >
          The Toolkit
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          Everything you need to <span className="text-gradient">get hired</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-pretty text-muted-foreground"
        >
          Four interactive tools working together across one guided pathway — try them right here.
        </motion.p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {cards.map((card, i) => (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="glass group flex flex-col rounded-2xl p-6 transition-shadow hover:shadow-[0_20px_60px_-25px_rgba(56,189,248,0.4)]"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-cyan/20 to-brand-purple/20 text-brand-cyan ring-1 ring-white/10">
                <card.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
            <div className="mt-6 min-h-[280px] flex-1 rounded-xl border border-white/5 bg-background/40 p-4">
              {card.content}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
