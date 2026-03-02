"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Terminal, Home, Search } from "lucide-react"

const EASE = [0.215, 0.61, 0.355, 1] as const

const terminalLines = [
  { text: "$ curl -I https://rejectmodders.is-a.dev$PATH", delay: 0.5,  color: "text-foreground" },
  { text: "  Resolving DNS...",                            delay: 0.85, color: "text-muted-foreground" },
  { text: "  Connected to rejectmodders.is-a.dev",        delay: 1.1,  color: "text-green-400" },
  { text: "",                                              delay: 1.3,  color: "" },
  { text: "  HTTP/2 404",                                  delay: 1.4,  color: "text-red-400" },
  { text: "  content-type: text/html",                     delay: 1.55, color: "text-muted-foreground" },
  { text: "  x-robots-tag: noindex",                       delay: 1.7,  color: "text-muted-foreground" },
  { text: "",                                              delay: 1.85, color: "" },
  { text: "$ traceroute $PATH",                            delay: 1.9,  color: "text-foreground" },
  { text: "  1  gateway (192.168.1.1)  0.4 ms",           delay: 2.2,  color: "text-muted-foreground" },
  { text: "  2  * * *  (hop unreachable)",                 delay: 2.45, color: "text-orange-400" },
  { text: "  3  * * *  (destination host unreachable)",    delay: 2.7,  color: "text-red-400" },
  { text: "",                                              delay: 2.9,  color: "" },
  { text: "  Error: route not mapped on this server.",     delay: 3.0,  color: "text-primary" },
  { text: "  The page you requested does not exist.",      delay: 3.25, color: "text-muted-foreground" },
]

function Glitch({ text }: { text: string }) {
  const [glitching, setGlitching] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true)
      setTimeout(() => setGlitching(false), 150)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="relative inline-block select-none">
      <span className={glitching ? "opacity-0" : "opacity-100"}>{text}</span>
      {glitching && (
        <>
          <span className="absolute inset-0 translate-x-1 text-red-400 opacity-70">{text}</span>
          <span className="absolute inset-0 -translate-x-1 text-blue-400 opacity-70">{text}</span>
        </>
      )}
    </span>
  )
}

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

export default function NotFound() {
  const [path, setPath] = useState("")
  useEffect(() => { setPath(window.location.pathname) }, [])

  const filledLines = terminalLines.map(l => ({
    ...l,
    text: l.text.replace("$PATH", path),
  }))

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4" style={{ overflow: "clip" }}>

      {/* Grid bg */}
      <div className="absolute inset-0 grid-bg opacity-10" />

      {/* Scan line */}
      <ScanLine />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-128 w-128 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.58 0.2 15 / 0.07) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-xl text-center">

        {/* Label + code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <span className="font-mono text-sm text-primary">{"// 404 · not found"}</span>
          <h1 className="mt-2 font-mono text-[7rem] font-bold leading-none tracking-tight text-foreground md:text-[9rem]">
            <Glitch text="404" />
          </h1>
          <p className="mt-1 font-mono text-base text-muted-foreground md:text-lg">
            This route doesn&apos;t exist on the server.
          </p>
          {path && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-1.5 font-mono text-sm text-primary/70"
            >
              <span className="text-muted-foreground">tried: </span>{path}
            </motion.p>
          )}
        </motion.div>

        {/* Terminal card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
          className="mt-8 overflow-hidden rounded-xl border border-border bg-card text-left"
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <div className="h-3 w-3 rounded-full bg-[#28c840]" />
            <Terminal className="ml-3 h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground">bash — diagnostic</span>
          </div>
          <div className="space-y-1.5 p-5 font-mono text-sm">
            {filledLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: line.delay, duration: 0.2 }}
                className={line.color}
              >
                {line.text || <span>&nbsp;</span>}
              </motion.div>
            ))}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block h-4 w-2 rounded-sm bg-primary"
            />
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-6 py-3 font-mono text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
          >
            <Home className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
            Back to home
          </Link>
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-mono text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-secondary"
          >
            <Search className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
            Browse projects
          </Link>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 font-mono text-xs text-muted-foreground/50"
        >
          If you think this is a mistake,{" "}
          <a
            href="https://github.com/RejectModders/rejectmodders.is-a.dev/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/60 underline underline-offset-2 hover:text-primary"
          >
            open an issue
          </a>
          .
        </motion.p>

      </div>
    </div>
  )
}

