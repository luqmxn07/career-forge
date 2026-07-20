import { motion } from "framer-motion"
import { FileText, Target, GraduationCap, Coins } from "lucide-react"
import { Link } from "@tanstack/react-router"

function CircularProgress({ value }: { value: number }) {
  const size = 64
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-emerald"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums text-emerald">
        {value}%
      </div>
    </div>
  )
}

interface StatCardsProps {
  resumesCount: number
  averageAtsScore: number
  interviewsCount: number
  credits: number
}

export function StatCards({ resumesCount, averageAtsScore, interviewsCount, credits }: StatCardsProps) {
  const cards = [
    { label: "Resumes", value: resumesCount, hint: resumesCount > 0 ? "active resumes" : "build your first resume", to: "/resumes", icon: FileText, iconColor: "text-cyan", glow: "hover:ring-1 hover:ring-cyan/50" },
    { label: "Avg ATS Match", value: `${averageAtsScore}%`, hint: averageAtsScore > 0 ? "across ATS scans" : "no scans yet", to: "/ats", icon: Target, iconColor: "text-emerald", glow: "hover:ring-1 hover:ring-emerald/50" },
    { label: "Interview Prep", value: interviewsCount, hint: interviewsCount > 0 ? "active sessions" : "practice interview AI", to: "/interviews", icon: GraduationCap, iconColor: "text-purple", glow: "hover:ring-1 hover:ring-purple/50" },
    { label: "Credits", value: credits, hint: "renews automatically", to: "/dashboard", icon: Coins, iconColor: "text-amber-400", glow: "hover:ring-1 hover:ring-amber-400/50" },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <Link key={card.label} to={card.to}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className={`glass flex items-center justify-between rounded-2xl border border-border p-5 transition-all duration-300 cursor-pointer ${card.glow}`}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-card">
                  <card.icon className={`size-4 ${card.iconColor}`} strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
              </div>
              <span className="mt-1 text-3xl font-semibold tabular-nums text-foreground">{card.value}</span>
              <span className="text-xs text-muted-foreground">{card.hint}</span>
            </div>

            {card.label === "Avg ATS Match" && averageAtsScore > 0 && (
              <CircularProgress value={averageAtsScore} />
            )}
          </motion.div>
        </Link>
      ))}
    </div>
  )
}
