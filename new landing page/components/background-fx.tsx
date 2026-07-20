'use client'

import { useEffect, useState } from 'react'

const COLORS = ['#38bdf8', '#a855f7', '#34d399']

type Particle = {
  id: number
  top: number
  left: number
  size: number
  color: string
  delay: number
  duration: number
}

export function BackgroundFx() {
  // Generate particles only on the client to avoid SSR/CSR hydration mismatch
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 26 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 6,
        duration: Math.random() * 6 + 6,
      })),
    )
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Obsidian grid */}
      <div className="absolute inset-0 grid-bg" />

      {/* Radial vignette + ambient color blooms */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_55%)]" />
      <div className="absolute bottom-0 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.14),transparent_60%)] blur-2xl" />

      {/* Floating neon micro-particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
