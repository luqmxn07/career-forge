import { motion } from "framer-motion"
import { TrendingUp, BarChart3 } from "lucide-react"

interface DashboardChartsProps {
  atsScoreTrend?: number[]
  pipelineData?: { stage: string; value: number; color: string }[]
}

export function DashboardCharts({ atsScoreTrend = [62, 68, 72, 78, 83, 87], pipelineData }: DashboardChartsProps) {
  const trend = atsScoreTrend.length > 0 ? atsScoreTrend : [60, 65, 70, 75, 80, 85]
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"]
  const width = 520
  const height = 200
  const pad = 24
  const min = 40
  const max = 100

  const points = trend.map((v, i) => {
    const x = pad + (i * (width - pad * 2)) / (trend.length - 1)
    const y = height - pad - ((v - min) / (max - min)) * (height - pad * 2)
    return { x, y }
  })

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - pad} L ${points[0].x} ${height - pad} Z`

  const pipeline = pipelineData || [
    { stage: "Saved", value: 12, color: "bg-muted-foreground/60" },
    { stage: "Applied", value: 18, color: "bg-cyan" },
    { stage: "Interview", value: 6, color: "bg-purple" },
    { stage: "Offer", value: 2, color: "bg-emerald" },
  ]

  const totalApplications = pipeline.reduce((acc, curr) => acc + curr.value, 0)
  const maxValue = Math.max(...pipeline.map((p) => p.value), 1)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* ATS Trend */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass rounded-3xl border border-border p-6 glow-cyan"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">ATS Score Trend</h3>
            <p className="text-xs text-muted-foreground">Match score trajectory</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald/15 px-2.5 py-1 text-xs font-medium text-emerald">
            <TrendingUp className="size-3" strokeWidth={2.5} />
            +25%
          </span>
        </div>

        <div className="mt-4 w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full" role="img" aria-label="ATS score trend chart">
            <defs>
              <linearGradient id="atsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 1, 2, 3].map((g) => {
              const y = pad + (g * (height - pad * 2)) / 3
              return <line key={g} x1={pad} y1={y} x2={width - pad} y2={y} className="stroke-border" strokeWidth={1} />
            })}

            <motion.path
              d={areaPath}
              fill="url(#atsFill)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
            <motion.path
              d={linePath}
              fill="none"
              className="stroke-cyan"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />

            {points.map((p, i) => (
              <motion.circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={3.5}
                className="fill-background stroke-cyan"
                strokeWidth={2}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08 }}
              />
            ))}
          </svg>

          <div className="mt-1 flex justify-between px-5 text-[11px] text-muted-foreground">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Job Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="glass rounded-3xl border border-border p-6 glow-purple"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Job Pipeline</h3>
            <p className="text-xs text-muted-foreground font-normal">Applications by stage</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-purple/15 px-2.5 py-1 text-xs font-medium text-purple">
            <BarChart3 className="size-3" strokeWidth={2.5} />
            {totalApplications} total
          </span>
        </div>

        <div className="mt-6 flex h-52 items-end justify-between gap-4">
          {pipeline.map((p, i) => (
            <div key={p.stage} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-sm font-semibold tabular-nums">{p.value}</span>
              <motion.div
                className={`w-full max-w-14 rounded-t-lg ${p.color}`}
                initial={{ height: 0 }}
                animate={{ height: `${(p.value / maxValue) * 160}px` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 + i * 0.1 }}
              />
              <span className="text-[11px] text-muted-foreground">{p.stage}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
