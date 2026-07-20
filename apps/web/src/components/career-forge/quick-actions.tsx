import { motion } from "framer-motion"
import { Link } from "@tanstack/react-router"
import { FileText, ScanLine, Briefcase, MessageSquare } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Action = {
  label: string
  icon: LucideIcon
  glow: string
  iconColor: string
  to: string
}

const actions: Action[] = [
  { label: "Create Resume", icon: FileText, glow: "hover:ring-1 hover:ring-cyan/50", iconColor: "text-cyan", to: "/resumes" },
  { label: "ATS Scan", icon: ScanLine, glow: "hover:ring-1 hover:ring-emerald/50", iconColor: "text-emerald", to: "/ats" },
  { label: "Track Job", icon: Briefcase, glow: "hover:ring-1 hover:ring-purple/50", iconColor: "text-purple", to: "/job-tracker" },
  { label: "Mock Interview", icon: MessageSquare, glow: "hover:ring-1 hover:ring-amber-400/50", iconColor: "text-amber-400", to: "/interviews" },
]

export function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((action, i) => {
        const className = `glass group flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs sm:text-sm font-medium text-foreground/90 transition-all duration-300 ${action.glow}`
        return (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link to={action.to} className={className}>
              <action.icon className={`size-4 ${action.iconColor}`} strokeWidth={2} />
              {action.label}
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
