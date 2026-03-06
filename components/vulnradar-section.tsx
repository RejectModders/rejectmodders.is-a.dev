"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Shield, Zap, FileSearch, ArrowRight, ExternalLink, CheckCircle2 } from "lucide-react"
import { EASE, DUR, SCROLL_STEP } from "@/lib/animation"

const features = [
  { icon: FileSearch, label: "175+ Vulnerability Checks", desc: "SQLi, XSS, SSRF, open redirects, misconfigs and more" },
  { icon: Zap,        label: "Instant Reports",           desc: "Full severity-rated report the moment a scan finishes" },
  { icon: Shield,     label: "Fix Guidance",              desc: "Every finding comes with an actual explanation of how to fix it" },
  { icon: CheckCircle2, label: "Open Source",             desc: "Built in public - you can read, fork, or contribute" },
]

export function VulnRadarSection() {
  const ref    = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} id="vulnradar" className="relative py-24 md:py-32" style={{ overflow: "clip" }}>

      {/* Ambient red glow - left side */}
      <div className="pointer-events-none absolute -left-32 top-1/2 -z-10 h-96 w-96 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--primary) 12%, transparent) 0%, transparent 70%)" }} />

      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

          {/* ── Left: copy ───────────────────────────────────────────── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: DUR, ease: EASE }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-mono text-xs text-primary">Flagship Project</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: DUR, delay: 0.06, ease: EASE }}
            >
              <span className="font-mono text-sm text-primary">{"// vulnradar"}</span>
              <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                Security scanning,{" "}
                <span className="text-gradient">done right</span>
              </h2>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: DUR, delay: 0.12, ease: "easeOut" }}
                style={{ originX: 0 }}
                className="mt-2 h-1 w-16 rounded-full bg-primary"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: DUR, delay: 0.14, ease: EASE }}
              className="mt-5 text-lg leading-relaxed text-muted-foreground"
            >
              VulnRadar is the security tool I built because nothing else did exactly what I wanted.
              Scan any website, get a real report with severity ratings, and know exactly what to fix.
            </motion.p>

            {/* Features */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: DUR, delay: 0.18 + i * SCROLL_STEP, ease: EASE }}
                  className="card-hover flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{f.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: DUR, delay: 0.46, ease: EASE }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <a
                href="https://vulnradar.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="group card-hover inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-5 py-2.5 font-mono text-sm font-semibold text-primary-foreground glow-red transition-all hover:brightness-110"
              >
                Visit VulnRadar
                <ExternalLink className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href="https://github.com/vulnradar"
                target="_blank"
                rel="noopener noreferrer"
                className="card-hover inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                GitHub Org
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          </div>

          {/* ── Right: terminal mockup ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: DUR, delay: 0.1, ease: EASE }}
          >
            <div className="card-hover relative overflow-hidden rounded-2xl border border-border bg-card">
              {/* Terminal titlebar */}
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 font-mono text-xs text-muted-foreground">vulnradar - scan</span>
              </div>

              {/* Terminal body */}
              <div className="p-5 font-mono text-sm">
                <TerminalLines isInView={isInView} />
              </div>

              {/* Red corner glow */}
              <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full"
                style={{ background: "radial-gradient(circle at 100% 100%, color-mix(in oklch, var(--primary) 10%, transparent), transparent 70%)" }} />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

// Animated terminal lines
const lines = [
  { delay: 0.3,  text: "$ vulnradar scan https://example.com",           color: "text-foreground" },
  { delay: 0.7,  text: "  Scanning target...",                            color: "text-muted-foreground" },
  { delay: 1.1,  text: "  Running 175 vulnerability checks",              color: "text-muted-foreground" },
  { delay: 1.6,  text: "",                                                 color: "" },
  { delay: 1.7,  text: "  [CRITICAL] SQL Injection - /api/search",        color: "text-red-400" },
  { delay: 2.0,  text: "  [HIGH]     XSS - /search?q=",                   color: "text-orange-400" },
  { delay: 2.3,  text: "  [MEDIUM]   Missing HSTS header",                color: "text-yellow-400" },
  { delay: 2.6,  text: "  [INFO]     3 outdated dependencies",            color: "text-blue-400" },
  { delay: 2.9,  text: "",                                                 color: "" },
  { delay: 3.0,  text: "  Scan complete. 12 findings across 4 severities", color: "text-muted-foreground" },
  { delay: 3.3,  text: "  Report saved → vulnradar.dev/r/abc123",         color: "text-primary" },
]

function TerminalLines({ isInView }: { isInView: boolean }) {
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.3, delay: line.delay, ease: "easeOut" }}
          className={`leading-relaxed ${line.color}`}
        >
          {line.text || <span>&nbsp;</span>}
        </motion.div>
      ))}
      {/* Blinking cursor */}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="inline-block h-4 w-2 rounded-sm bg-primary"
      />
    </div>
  )
}

