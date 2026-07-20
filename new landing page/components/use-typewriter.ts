'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Cycles through an array of lines, typing each one out character by character,
 * accumulating them, then resetting after all lines are typed.
 */
export function useTypewriter(lines: string[], speed = 28, holdMs = 2200) {
  const [displayed, setDisplayed] = useState<string[]>([])
  const [current, setCurrent] = useState('')
  const lineIndex = useRef(0)
  const charIndex = useRef(0)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    function tick() {
      const line = lines[lineIndex.current]
      if (charIndex.current <= line.length) {
        setCurrent(line.slice(0, charIndex.current))
        charIndex.current += 1
        timeout = setTimeout(tick, speed)
      } else {
        // Line complete
        timeout = setTimeout(() => {
          setDisplayed((prev) => [...prev, line])
          setCurrent('')
          charIndex.current = 0
          lineIndex.current += 1

          if (lineIndex.current >= lines.length) {
            // reset the whole cycle
            timeout = setTimeout(() => {
              setDisplayed([])
              lineIndex.current = 0
              tick()
            }, holdMs)
          } else {
            tick()
          }
        }, 500)
      }
    }

    tick()
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { displayed, current }
}
