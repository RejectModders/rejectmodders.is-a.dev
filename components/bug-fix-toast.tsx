"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const MESSAGES = [
  {
    title: "Critical Bug Patched!",
    body: "Oh god, thank goodness we fixed that bug when you found it. That was close.",
    sub: "Hotfix v2.0.1 deployed successfully",
  },
  {
    title: "Emergency Fix Applied",
    body: "Whoa. We have no idea how that happened but it's fixed now. Please don't tell anyone.",
    sub: "rm-bugfix-daemon restored system integrity",
  },
  {
    title: "Bug Squashed ✓",
    body: "Our engineers were paged at 3am for this. You're welcome. Everything is normal again.",
    sub: "Incident #4201 resolved - severity: catastrophic",
  },
  {
    title: "Self-Healing System Activated",
    body: "Honestly we're just as surprised as you are that this worked. Website restored.",
    sub: "AI patch engine v0.0.1-alpha (unstable) saved the day",
  },
  {
    title: "Yeah... about that",
    body: "We saw what happened. We fixed it. We're pretending it never happened. Agreed?",
    sub: "Bug report suppressed. Logs deleted.",
  },
]


export function BugFixToast() {
  const [visible, setVisible] = useState(false)
  const [msg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)])
  const [progress, setProgress] = useState(100)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const DURATION = 8000

  useEffect(() => {
    const onFix = () => {
      setVisible(true)
      const start = Date.now()
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - start
        const remaining = Math.max(0, 1 - elapsed / DURATION)
        setProgress(remaining * 100)
        if (remaining <= 0) {
          clearInterval(timerRef.current!)
          setVisible(false)
        }
      }, 50)
    }

    window.addEventListener("rm:bug-fix-toast", onFix)
    return () => {
      window.removeEventListener("rm:bug-fix-toast", onFix)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const dismiss = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0,   opacity: 1 }}
          exit={{   x: 420, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="fixed bottom-6 right-6 z-[99999] w-[340px] select-none"
        >
          {/* card */}
          <div
            className="relative overflow-hidden rounded-xl border border-green-500/30 bg-black/90 backdrop-blur-md shadow-2xl shadow-green-900/30 cursor-pointer"
            onClick={dismiss}
          >
            {/* progress bar */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-green-500/60 transition-none"
              style={{ width: `${progress}%` }} />

            <div className="p-4 flex gap-3">
              {/* icon */}
              <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>

              {/* text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-green-400 leading-tight">{msg.title}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss() }}
                    className="flex-shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors mt-0.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-sm text-zinc-300 leading-snug">{msg.body}</p>
                <p className="mt-1.5 text-[11px] text-zinc-600 font-mono truncate">{msg.sub}</p>
              </div>
            </div>

            {/* scanline shimmer */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ y: "-100%" }}
              animate={{ y: "200%" }}
              transition={{ duration: 1.2, ease: "linear", delay: 0.3 }}
              style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(74,222,128,0.04) 50%, transparent 100%)",
                height: "50%",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

