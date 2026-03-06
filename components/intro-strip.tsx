"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Shield, Code2, MapPin, Zap, Github, Star, GitFork, Terminal, Lock, Bug, Cpu, ArrowRight, GitCommit, GitPullRequest, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import { SKILLS } from "@/data/skills"
import { EASE, DUR, SCROLL_STEP } from "@/lib/animation"

// ── GitHub stats ─────────────────────────────────────────────────────────────
interface GHStats { public_repos: number; followers: number; stars: number }

function useGitHubStats() {
  const [stats, setStats] = useState<GHStats | null>(null)
  useEffect(() => {
    fetch("/api/github/stats")
      .then(r => r.json())
      .then(d => { if (d.public_repos !== undefined) setStats(d) })
      .catch(() => {})
  }, [])
  return stats
}

// ── GitHub events feed ────────────────────────────────────────────────────────
interface GHEvent {
  id: string
  type: string
  repo: { name: string }
  created_at: string
  payload: {
    commits?: { sha: string; message: string }[]
    pull_request?: { title: string; number: number }
    issue?: { title: string; number: number }
    ref?: string
    ref_type?: string
  }
}

function useGitHubEvents() {
  const [events, setEvents] = useState<GHEvent[]>([])
  useEffect(() => {
    fetch("/api/github/activity")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setEvents(d) })
      .catch(() => {})
  }, [])
  return events
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function eventIcon(type: string) {
  switch (type) {
    case "PushEvent":        return <GitCommit className="h-3.5 w-3.5 text-primary" />
    case "PullRequestEvent": return <GitPullRequest className="h-3.5 w-3.5 text-blue-400" />
    case "IssuesEvent":      return <AlertCircle className="h-3.5 w-3.5 text-yellow-400" />
    default:                 return <Github className="h-3.5 w-3.5 text-muted-foreground" />
  }
}

function eventLabel(e: GHEvent): string {
  switch (e.type) {
    case "PushEvent": {
      const commits = e.payload.commits ?? []
      const msg = commits[0]?.message?.split("\n")[0] ?? "pushed"
      return msg.length > 60 ? msg.slice(0, 60) + "…" : msg
    }
    case "PullRequestEvent": return e.payload.pull_request?.title ?? "pull request"
    case "IssuesEvent":      return e.payload.issue?.title ?? "issue"
    case "CreateEvent":      return `created ${e.payload.ref_type ?? "branch"}${e.payload.ref ? ` "${e.payload.ref}"` : ""}`
    case "WatchEvent":       return "starred"
    default:                 return e.type.replace("Event", "").toLowerCase()
  }
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Count({ to, isInView }: { to: number; isInView: boolean }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!isInView) return
    let s = 0
    const inc = to / (700 / 16)
    const t = setInterval(() => {
      s += inc
      if (s >= to) { setVal(to); clearInterval(t) } else setVal(Math.floor(s))
    }, 16)
    return () => clearInterval(t)
  }, [isInView, to])
  return <>{val}</>
}

// ── Scrolling tools ticker ────────────────────────────────────────────────────
const TOOLS = [
  "Python", "C / C++", "TypeScript", "JavaScript", "Bash", "SQL", "C#",
  "Linux", "Git", "Next.js", "React", "Tailwind", "Framer Motion",
  "VulnRadar", "Cybersecurity", "Discord Bots", "Open Source",
]

function ToolsTicker() {
  const doubled = [...TOOLS, ...TOOLS]
  return (
    <div className="relative overflow-hidden py-3 border-y border-border/50">
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <motion.div
        className="flex gap-6 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((t, i) => (
          <span key={i} className="flex items-center gap-2 font-mono text-xs text-muted-foreground/50">
            <span className="h-1 w-1 rounded-full bg-primary/40" />
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ── What I do cards ───────────────────────────────────────────────────────────
const FOCUS_CARDS = [
  {
    icon: Shield,
    tag: "// security",
    title: "Vulnerability Research",
    desc: "I got into security because I wanted to understand how things break. VulnRadar came out of that. I needed a scanner that actually told me something useful, so I built one.",
    link: "https://vulnradar.dev",
    linkLabel: "vulnradar.dev",
  },
  {
    icon: Code2,
    tag: "// development",
    title: "Systems & Web Dev",
    desc: "I go back and forth between C/C++ for low-level stuff and Next.js for web. Stack doesn't really matter to me, I just pick whatever gets the job done cleanly.",
    link: "/projects",
    linkLabel: "see projects",
    internal: true,
  },
  {
    icon: Terminal,
    tag: "// automation",
    title: "Bots & Automation",
    desc: "Spent a solid year running Disutils Team and shipping Discord bots used by thousands of people. Learned a lot about building things people actually rely on.",
    link: "https://github.com/disutils",
    linkLabel: "disutils org",
  },
  {
    icon: Lock,
    tag: "// open source",
    title: "Building in Public",
    desc: "All my stuff is open source. Especially for security tools, if you can't read the code why would you trust it? Fork it, poke holes in it, whatever.",
    link: "https://github.com/RejectModders",
    linkLabel: "github.com/RejectModders",
  },
]

export function IntroStrip() {
  const ref      = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const actRef   = useRef<HTMLDivElement>(null)
  const focusRef = useRef<HTMLDivElement>(null)

  const isInView    = useInView(ref,      { once: true, margin: "-40px" })
  const statsInView = useInView(statsRef, { once: true, margin: "-40px" })
  const actInView   = useInView(actRef,   { once: true, margin: "-40px" })
  const focusInView = useInView(focusRef, { once: true, margin: "-60px" })

  const gh     = useGitHubStats()
  const events = useGitHubEvents()

  const statCards = [
    { icon: Github,  label: "Public Repos",  value: gh?.public_repos ?? null },
    { icon: Star,    label: "GitHub Stars",  value: gh?.stars        ?? null },
    { icon: GitFork, label: "Followers",     value: gh?.followers    ?? null },
    { icon: Cpu,     label: "Skills",        value: SKILLS.length,            static: true },
    { icon: Bug,     label: "Vuln Checks",   value: 175,                      suffix: "+", static: true },
  ]

  return (
    <div className="relative" style={{ overflow: "clip" }}>

      {/* ── 1. Quick-facts strip ──────────────────────────────────────────── */}
      <div ref={ref} className="py-6 md:py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
            { icon: MapPin,  label: "Based in",       value: "Missouri, USA",          mono: false },
              { icon: Code2,   label: "Primary stack",  value: "Python · C/C++ · JS/TS", mono: true  },
              { icon: Shield,  label: "Focus area",     value: "Cybersecurity & tooling", mono: false },
              { icon: Zap,     label: "Status",         value: "Available for hire",      mono: true  },
            ].map((card) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: DUR, delay: 0.05, ease: EASE }}
                className="flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/60"
              >
                <card.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{card.label}</p>
                  <p className={`mt-0.5 truncate text-sm font-medium text-primary ${card.mono ? "font-mono" : ""}`}>
                    {card.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Tools ticker ───────────────────────────────────────────────── */}
      <ToolsTicker />

      {/* ── 3. Stats ──────────────────────────────────────────────────────── */}
      <div ref={statsRef} className="py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: DUR, ease: EASE }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="font-mono text-sm text-primary">{"// by the numbers"}</span>
            <div className="h-px flex-1 bg-border" />
          </motion.div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: DUR, delay: 0.1 + i * SCROLL_STEP, ease: EASE }}
                className="card-hover flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-5 text-center"
              >
                <s.icon className="h-5 w-5 text-primary" />
                <p className="mt-1 font-mono text-3xl font-bold text-foreground">
                  {s.value === null ? (
                    <span className="text-muted-foreground/40 text-lg">–</span>
                  ) : (
                    <><Count to={s.value} isInView={statsInView} />{(s as {suffix?:string}).suffix ?? ""}</>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Live GitHub activity ────────────────────────────────────────── */}
      <div ref={actRef} className="py-10 md:py-14 bg-card/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={actInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: DUR, ease: EASE }}
                className="font-mono text-sm text-primary"
              >{"// live feed"}</motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={actInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: DUR, delay: 0.06, ease: EASE }}
                className="mt-1 text-2xl font-bold text-foreground md:text-3xl"
              >Recent Activity</motion.h2>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={actInView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
              <a
                href="https://github.com/RejectModders"
                target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                view on github <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          </div>

          {events.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {events.map((e, i) => (
                <motion.a
                  key={e.id}
                  href={`https://github.com/${e.repo.name}`}
                  target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={actInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: DUR, delay: 0.1 + i * SCROLL_STEP, ease: EASE }}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 transition-all duration-150 hover:border-primary/30 hover:-translate-y-0.5"
                >
                  <div className="mt-0.5 shrink-0">{eventIcon(e.type)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[10px] text-primary/70">{e.repo.name}</p>
                    <p className="mt-0.5 truncate text-xs text-foreground">{eventLabel(e)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-[10px] text-muted-foreground/50 font-mono">
                    <Clock className="h-2.5 w-2.5" />
                    {timeAgo(e.created_at)}
                  </div>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={actInView ? { opacity: 1 } : {}}
                  transition={{ delay: i * 0.05 }}
                  className="h-14 rounded-xl border border-border bg-card/50 animate-pulse"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 5. What I do ──────────────────────────────────────────────────── */}
      <div ref={focusRef} className="py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={focusInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: DUR, ease: EASE }}
            className="mb-8"
          >
            <span className="font-mono text-sm text-primary">{"// what I build"}</span>
            <h2 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">Areas of Focus</h2>
            <motion.div
              initial={{ scaleX: 0 }} animate={focusInView ? { scaleX: 1 } : {}}
              transition={{ duration: DUR, delay: 0.1, ease: "easeOut" }} style={{ originX: 0 }}
              className="mt-2 h-1 w-16 rounded-full bg-primary"
            />
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FOCUS_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                animate={focusInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: DUR, delay: 0.1 + i * SCROLL_STEP, ease: EASE }}
                className="card-hover group relative flex flex-col rounded-xl border border-border bg-card p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                    <card.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-mono text-[10px] text-primary">{card.tag}</span>
                </div>
                <h3 className="mb-2 text-sm font-bold text-foreground">{card.title}</h3>
                <p className="flex-1 text-xs leading-relaxed text-muted-foreground">{card.desc}</p>
                <div className="mt-4">
                  {(card as {internal?:boolean}).internal ? (
                    <Link href={card.link} className="flex items-center gap-1 font-mono text-[10px] text-primary/70 transition-colors hover:text-primary">
                      {card.linkLabel} <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <a href={card.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-mono text-[10px] text-primary/70 transition-colors hover:text-primary">
                      {card.linkLabel} <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-px bg-border" />
      </div>

    </div>
  )
}
