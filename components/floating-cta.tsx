"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ── Rage-click detection ──────────────────────────────────────────────────────
function useRageClick(threshold = 8, windowMs = 1200) {
  const [triggered, setTriggered] = useState(false)
  const clicks = useRef<number[]>([])
  useEffect(() => {
    const handler = () => {
      const now = Date.now()
      clicks.current = [...clicks.current.filter(t => now - t < windowMs), now]
      if (clicks.current.length >= threshold) {
        clicks.current = []
        setTriggered(true)
        setTimeout(() => setTriggered(false), 3500)
      }
    }
    window.addEventListener("click", handler)
    return () => window.removeEventListener("click", handler)
  }, [threshold, windowMs])
  return triggered
}

// pick a random crash scenario each time
const CRASH_SCENARIOS = [
  {
    title: "KERNEL PANIC",
    code: "0x000000D1",
    color: "#3b82f6",   // BSOD blue
    msg: "DRIVER_IRQL_NOT_LESS_OR_EQUAL",
    detail: "A process has exceeded the click rate limit.",
    lines: [
      "rejectmodders.is-a.dev has been stopped to prevent damage.",
      "If this is the first time you've seen this stop error,",
      "restart the site. Otherwise calm your clicking hand.",
      "",
      "Technical information:",
      "*** STOP: 0x000000D1 (0xRAGE, 0xCLICK, 0xFAST, 0xSLOW_DOWN)",
    ],
    emoji: "💙",
  },
  {
    title: "SEGMENTATION FAULT",
    code: "signal 11",
    color: "var(--primary)",  // site primary
    msg: "Segmentation fault (core dumped)",
    detail: "Process click_handler exceeded memory bounds.",
    lines: [
      "Program:  /usr/bin/rejectmodders-portfolio",
      "Signal:   SIGSEGV (Segmentation fault)",
      "PID:      69420",
      "Thread:   click_handler.tsx:42",
      "",
      "Backtrace:",
      "#0  rage_click () at floating-cta.tsx:8",
      "#1  window.addEventListener ('click') ...",
      "#2  your_finger () at IRL:??",
    ],
    emoji: "💥",
  },
  {
    title: "ERR_TOO_MANY_CLICKS",
    code: "429",
    color: "#f59e0b",
    msg: "Too Many Requests",
    detail: "Click rate limit exceeded. Please slow down.",
    lines: [
      "HTTP/2 429 Too Many Requests",
      "Retry-After: please-calm-down",
      "X-RateLimit-Limit: 8 clicks/1.2s",
      `X-RateLimit-Remaining: 0`,
      "X-RateLimit-Reset: when-you-chill",
      "",
      "Your IP has been temporarily throttled.",
      "This incident will be reported to /dev/null.",
    ],
    emoji: "🚫",
  },
  {
    title: "OUT OF MEMORY",
    code: "OOM",
    color: "#10b981",
    msg: "Killed (Out of Memory)",
    detail: "process click_handler was terminated by the OOM killer.",
    lines: [
      "[ 1337.420000] Out of memory: Kill process 69420 (click_handler)",
      "[ 1337.420001] Killed process 69420, UID 1000",
      "[ 1337.420002] total-vm:420kB, anon-rss:69kB",
      "",
      "All available click memory has been consumed.",
      "Suggestion: touch grass. Or just stop clicking.",
    ],
    emoji: "💾",
  },
  {
    title: "PROCESS TERMINATED",
    code: "SIGTERM",
    color: "#a855f7",
    msg: "rm@rejectmodders.is-a.dev: process killed",
    detail: "The click daemon has been terminated.",
    lines: [
      "$ ps aux | grep click",
      "rm   69420  420.0  0.0  RAGE  click_daemon",
      "",
      "$ kill -9 69420",
      "bash: [1]+ Killed   click_daemon",
      "",
      "Process 69420 has been cleaned up.",
      "Your clicking privileges have been revoked.",
    ],
    emoji: "☠️",
  },
]

function RageCrash() {
  const scenario = useRef(CRASH_SCENARIOS[Math.floor(Math.random() * CRASH_SCENARIOS.length)]).current
  const isBSOD   = scenario.title === "KERNEL PANIC"

  if (isBSOD) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="pointer-events-none fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: scenario.color, fontFamily: "monospace" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-xl w-full text-white"
        >
          <div className="text-6xl mb-6">{scenario.emoji}</div>
          <div className="text-2xl font-bold mb-2">Your PC ran into a problem.</div>
          <div className="text-sm opacity-80 mb-6">
            {scenario.detail}
          </div>
          <div className="text-5xl font-bold mb-6">0% complete</div>
          <div className="text-sm opacity-70 space-y-1">
            {scenario.lines.map((l, i) => <div key={i}>{l || "\u00a0"}</div>)}
          </div>
          <div className="mt-6 text-xs opacity-50">
            Stop code: {scenario.msg}
          </div>
        </motion.div>
        {/* scanlines */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)"
        }} />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
    >
      {/* Glitch scan lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-x-0 h-px opacity-30"
          style={{ top: `${10 + i * 15}%`, backgroundColor: scenario.color }}
          animate={{ x: [-200, 200], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 0.08 + i * 0.02, repeat: Infinity, repeatType: "reverse" }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative w-full max-w-lg overflow-hidden rounded-lg border font-mono text-sm"
        style={{ borderColor: scenario.color + "66", backgroundColor: "#0a0f1a" }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: scenario.color + "44", backgroundColor: "#0d1425" }}>
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-xs" style={{ color: scenario.color }}>
            {scenario.title} - {scenario.code}
          </span>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{scenario.emoji}</span>
            <div>
              <div className="font-bold text-base" style={{ color: scenario.color }}>
                {scenario.msg}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{scenario.detail}</div>
            </div>
          </div>

          <div className="rounded border p-3 text-xs space-y-0.5" style={{ borderColor: scenario.color + "33", backgroundColor: "#060b14" }}>
            {scenario.lines.map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 * i }}
                className="text-slate-300"
              >
                {l || "\u00a0"}
              </motion.div>
            ))}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-2 h-3.5 rounded-sm"
              style={{ backgroundColor: scenario.color }}
            />
          </div>

          <div className="text-xs text-slate-500 text-center pt-1">
            auto-recovering in 3 seconds…  calm your clicking hand.
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function FloatingCTA() {
  const rage = useRageClick()

  return (
    <>
      {/* Rage-click crash overlay */}
      <AnimatePresence>
        {rage && <RageCrash key={Date.now()} />}
      </AnimatePresence>
    </>
  )
}
