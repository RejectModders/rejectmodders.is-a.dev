"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { Home, RefreshCw, Terminal } from "lucide-react"

const EASE = [0.215, 0.61, 0.355, 1] as const

function ScanLine() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 h-8 opacity-[0.04]"
      style={{ background: "linear-gradient(to bottom, transparent, oklch(0.93 0.005 90), transparent)" }}
      animate={{ top: ["-2rem", "100%"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
    />
  )
}

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [copied, setCopied] = useState(false)

  const errorId      = error.digest ?? "unknown"
  const errorMessage = error.message ?? "An unexpected error occurred."


  const terminalLines = [
    { prefix: "rejectmodders@is-a.dev:~$", cmd: " node server.js",             delay: 0.3,  cmdColor: "text-foreground" },
    { prefix: null, cmd: "  Server running on :3000",                           delay: 0.6,  cmdColor: "text-green-400" },
    { prefix: null, cmd: "",                                                     delay: 0.8,  cmdColor: "" },
    { prefix: null, cmd: "  [FATAL] Unhandled runtime exception",               delay: 0.9,  cmdColor: "text-red-400" },
    { prefix: null, cmd: `  Error: ${errorMessage.slice(0, 52)}`,               delay: 1.1,  cmdColor: "text-orange-400" },
    { prefix: null, cmd: `  at Object.<anonymous> (server.js:${Math.floor(Math.random()*200)+1}:12)`, delay: 1.25, cmdColor: "text-muted-foreground" },
    { prefix: null, cmd: "",                                                     delay: 1.4,  cmdColor: "" },
    { prefix: null, cmd: "  HTTP/2 500 Internal Server Error",                  delay: 1.5,  cmdColor: "text-red-400" },
    { prefix: null, cmd: `  digest: ${errorId}`,                                delay: 1.65, cmdColor: "text-muted-foreground" },
    { prefix: null, cmd: "",                                                     delay: 1.8,  cmdColor: "" },
    { prefix: null, cmd: "  Logged. You can retry below.",                      delay: 1.9,  cmdColor: "text-primary" },
  ]

  function copyDigest() {
    navigator.clipboard.writeText(errorId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4" style={{ overflow: "clip" }}>
      <div className="absolute inset-0 grid-bg opacity-10" />
      <ScanLine />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-128 w-128 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.65 0.18 40 / 0.07) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-2xl">

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="text-center"
        >
          <span className="font-mono text-sm text-orange-400">// 500 · internal server error</span>
          <h1 className="mt-1 font-mono text-[7rem] font-bold leading-none tracking-tight text-foreground md:text-[9rem]">
            500
          </h1>
          <p className="mt-1 font-mono text-base text-muted-foreground">
            Something broke on our end.
          </p>
        </motion.div>

        {/* Terminal card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: EASE }}
          className="mt-8 overflow-hidden rounded-xl border border-border bg-card text-left"
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 bg-muted/40">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <div className="h-3 w-3 rounded-full bg-[#28c840]" />
            <Terminal className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground">crash log — rejectmodders@is-a.dev</span>
          </div>

          {/* Output */}
          <div className="p-5 font-mono text-sm space-y-1">
            {terminalLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: line.delay, duration: 0.15 }}
                className="flex gap-2"
              >
                {line.prefix && (
                  <span className="shrink-0">
                    <span className="text-green-400">rejectmodders</span>
                    <span className="text-muted-foreground">@</span>
                    <span className="text-cyan-400">is-a.dev</span>
                    <span className="text-muted-foreground">:~$</span>
                  </span>
                )}
                <span className={line.cmdColor}>{line.cmd || "\u00a0"}</span>
              </motion.div>
            ))}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block h-4 w-2 rounded-sm bg-orange-400"
            />
          </div>
        </motion.div>

        {/* Digest */}
        {errorId !== "unknown" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 flex items-center justify-center gap-2"
          >
            <span className="font-mono text-xs text-muted-foreground/60">error id:</span>
            <button
              onClick={copyDigest}
              className="font-mono text-xs text-primary/70 underline underline-offset-2 transition hover:text-primary"
            >
              {copied ? "copied!" : errorId}
            </button>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: EASE }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <button
            onClick={reset}
            className="group inline-flex items-center gap-2 rounded-lg border border-orange-500/70 bg-orange-500/10 px-6 py-3 font-mono text-sm font-semibold text-orange-400 transition-all hover:bg-orange-500/20"
          >
            <RefreshCw className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
            retry
          </button>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-mono text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-secondary"
          >
            <Home className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
            ~/ home
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center font-mono text-xs text-muted-foreground/50"
        >
          Persistent?{" "}
          <a
            href="https://github.com/RejectModders/rejectmodders.is-a.dev/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/60 underline underline-offset-2 hover:text-primary"
          >
            open an issue
          </a>
        </motion.p>
      </div>
    </div>
  )
}
