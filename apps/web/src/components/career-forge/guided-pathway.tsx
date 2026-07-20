import { motion } from "framer-motion"
import { UserRound, Search, FileEdit, Mic, Check, ArrowRight } from "lucide-react"
import { Link } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"

export type StepStatus = "done" | "current" | "upnext"

export type DynamicStep = {
  n: number
  title: string
  desc: string
  icon: LucideIcon
  status: StepStatus
  to: string
  actionText: string
}

function StatusBadge({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald/15 px-2.5 py-1 text-xs font-medium text-emerald">
        <Check className="size-3" strokeWidth={3} />
        Done
      </span>
    )
  }
  if (status === "current") {
    return (
      <span className="relative inline-flex items-center gap-1.5 rounded-full bg-cyan/15 px-2.5 py-1 text-xs font-medium text-cyan">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-cyan" />
        </span>
        Current Step
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      Up Next
    </span>
  )
}

interface GuidedPathwayProps {
  steps: DynamicStep[]
  progressPercent: number
  activeStep: DynamicStep
}

export function GuidedPathway({ steps, progressPercent, activeStep }: GuidedPathwayProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass relative overflow-hidden rounded-3xl border border-border p-6 md:p-7 glow-purple"
    >
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-balance">Job Application Guided Pathway</h2>
          <p className="text-sm text-muted-foreground">Follow the steps to land your next role faster.</p>
        </div>
        <div className="mt-2 flex items-center gap-3 md:mt-0">
          <span className="text-2xl font-semibold tabular-nums text-cyan">{progressPercent}%</span>
          <span className="text-xs text-muted-foreground">completed</span>
        </div>
      </div>

      {/* progress bar */}
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="h-full rounded-full bg-gradient-to-r from-cyan to-emerald"
        />
      </div>

      {/* steps */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => {
          const isCurrent = step.status === "current"
          return (
            <Link key={step.n} to={step.to}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                className={`relative rounded-2xl border p-4 transition-colors cursor-pointer ${
                  isCurrent
                    ? "border-cyan/40 bg-cyan/5 glow-cyan"
                    : step.status === "done"
                      ? "border-emerald/25 bg-emerald/5 hover:border-emerald/40"
                      : "border-border bg-card/40 hover:bg-card/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex size-9 items-center justify-center rounded-xl ${
                      isCurrent
                        ? "bg-cyan/15 text-cyan"
                        : step.status === "done"
                          ? "bg-emerald/15 text-emerald"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <step.icon className="size-4" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Step {step.n}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground text-pretty">{step.desc}</p>
                <div className="mt-3">
                  <StatusBadge status={step.status} />
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <Link to={activeStep.to}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full bg-cyan px-5 py-2.5 text-sm font-semibold text-background transition-shadow glow-cyan cursor-pointer"
          >
            {activeStep.actionText}
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </motion.div>
        </Link>
      </div>
    </motion.section>
  )
}
