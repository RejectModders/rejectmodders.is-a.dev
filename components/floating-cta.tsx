"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"

function useVisitorNumber() {
  const [num, setNum] = useState<number | null>(null)
  useEffect(() => {
    const key = "rm_visitor_num"
    const stored = localStorage.getItem(key)
    if (stored) { setNum(parseInt(stored)); return }
    const n = 1_337_000 + Math.floor(Math.random() * 83_000)
    localStorage.setItem(key, String(n))
    setNum(n)
  }, [])
  return num
}

function useRageClick(threshold = 10, windowMs = 1500) {
  const [triggered, setTriggered] = useState(false)
  const clicks = useRef<number[]>([])
  useEffect(() => {
    const handler = () => {
      const now = Date.now()
      clicks.current = [...clicks.current.filter(t => now - t < windowMs), now]
      if (clicks.current.length >= threshold) {
        clicks.current = []
        setTriggered(true)
        setTimeout(() => setTriggered(false), 2500)
      }
    }
    window.addEventListener("click", handler)
    return () => window.removeEventListener("click", handler)
  }, [threshold, windowMs])
  return triggered
}

export function FloatingCTA() {
  const [showCTA, setShowCTA] = useState(false)
  const [showVisitor, setShowVisitor] = useState(false)
  const visitorNum = useVisitorNumber()
  const rage = useRageClick()

  useEffect(() => {
    const t = setTimeout(() => setShowCTA(true), 5000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!showCTA) return
    const t = setTimeout(() => setShowVisitor(true), 2000)
    return () => clearTimeout(t)
  }, [showCTA])

  return (
    <>
      {/* Rage-click glitch overlay */}
      <AnimatePresence>
        {rage && (
          <motion.div
            key="rage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[9998] flex items-center justify-center"
          >
            <motion.div
              animate={{ x: [-4, 4, -3, 3, 0] }}
              transition={{ duration: 0.3, repeat: 3 }}
              className="rounded-xl border border-primary bg-background/95 px-8 py-6 font-mono text-center shadow-2xl"
            >
              <p className="text-2xl font-bold text-primary">calm down.</p>
              <p className="mt-1 text-sm text-muted-foreground">you clicked way too fast</p>
              <p className="mt-1 text-xs text-muted-foreground/50">the site is fine. probably.</p>
            </motion.div>
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-x-0 h-px"
                style={{ top: `${15 + i * 16}%`, background: "oklch(0.58 0.2 15 / 0.25)" }}
                animate={{ x: [-300, 300] }}
                transition={{ duration: 0.12 + i * 0.03, repeat: Infinity, repeatType: "reverse" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visitor counter */}
      <AnimatePresence>
        {showVisitor && visitorNum && (
          <motion.div
            key="visitor"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-6 z-40 select-none text-right font-mono text-[10px] text-muted-foreground/30"
          >
            visitor #{visitorNum.toLocaleString()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hire me CTA */}
      <AnimatePresence>
        {showCTA && (
          <motion.a
            key="cta"
            href="/#contact"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.35, ease: [0.215, 0.61, 0.355, 1] }}
            className="fixed bottom-[4.5rem] right-6 z-40 flex items-center gap-2 rounded-full border border-primary/40 bg-background/80 px-4 py-2 font-mono text-xs text-primary backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_16px_oklch(0.58_0.2_15/0.2)]"
          >
            available for hire <ArrowRight className="h-3 w-3" />
          </motion.a>
        )}
      </AnimatePresence>
    </>
  )
}

