'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CursorGlow() {
  const mouseX = useMotionValue(-500)
  const mouseY = useMotionValue(-500)

  // Trailing spring for the fluid, blurred follow effect
  const x = useSpring(mouseX, { stiffness: 120, damping: 20, mass: 0.6 })
  const y = useSpring(mouseY, { stiffness: 120, damping: 20, mass: 0.6 })

  const raf = useRef<number | null>(null)

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        mouseX.set(e.clientX - 200)
        mouseY.set(e.clientY - 200)
      })
    }
    window.addEventListener('mousemove', handleMove)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [mouseX, mouseY])

  return (
    <motion.div
      aria-hidden="true"
      style={{ x, y }}
      className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[400px] w-[400px] rounded-full md:block"
    >
      <div
        className="h-full w-full rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(56,189,248,0.35) 0%, rgba(168,85,247,0.28) 45%, transparent 70%)',
        }}
      />
    </motion.div>
  )
}
