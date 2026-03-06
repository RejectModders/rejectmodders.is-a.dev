"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import {
  Shield, Code2, Terminal, MapPin, Calendar, ExternalLink,
  Users, BookOpen, Zap, Globe, Bot, Rocket, GitMerge, Search
} from "lucide-react"
import { SKILLS } from "@/data/skills"
import { EASE, DUR, PAGE_START, PAGE_STEP, SCROLL_STEP, getStaggerDelay } from "@/lib/animation"

// ── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 12 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: DUR, delay, ease: EASE },
})
const underline = (delay = 0) => ({
  initial:    { scaleX: 0 },
  animate:    { scaleX: 1 },
  transition: { duration: 0.25, delay, ease: "easeOut" },
  style:      { originX: 0 } as React.CSSProperties,
})

// ── Interfaces & data ────────────────────────────────────────────────────────
interface GitHubStats {
  public_repos: number; followers: number; following: number
  avatar_url: string; created_at: string
}

function AnimatedNumber({ value, isInView }: { value: number | string; isInView: boolean }) {
  const num = typeof value === "string" ? parseInt(value) : value
  const isNum = !isNaN(num)
  const [display, setDisplay] = useState(isNum ? 0 : value)
  useEffect(() => {
    if (!isInView || !isNum) return
    let s = 0; const inc = num / (900 / 16)
    const t = setInterval(() => {
      s += inc
      if (s >= num) { setDisplay(typeof value === "string" && value.endsWith("+") ? `${num}+` : num); clearInterval(t) }
      else setDisplay(Math.floor(s))
    }, 16)
    return () => clearInterval(t)
  }, [isInView, num, isNum, value])
  return <>{display}</>
}


const orgs = [
  { name: "Disutils Team", role: "Former Lead / Founder", url: "https://github.com/disutils", avatar: `/api/avatar?url=${encodeURIComponent("https://avatars.githubusercontent.com/u/184031343?v=4")}`, description: "An org I built around Discord tooling and bot development. We shipped a few useful things but I eventually moved on to focus fully on security work. It was a good run.", highlights: ["Disckit Framework", "DisMusic Bot", "Inactive"] },
  { name: "VulnRadar", role: "Founder", url: "https://vulnradar.dev", avatar: `/api/avatar?url=${encodeURIComponent("https://avatars.githubusercontent.com/u/261703628?v=4")}`, description: "My current main project. VulnRadar scans websites for security vulnerabilities and gives you an actual useful report with severity levels and how to fix what it finds.", highlights: ["175+ Vulnerability Checks", "Instant Reports", "Fix Guidance"] },
]

const timelineItems = [
  {
    year: "Early 2023",
    title: "Zero to Coder",
    description: "Started from nothing. Picked up Python with no real direction, just messing around and seeing what stuck. Had no idea where it was going but I liked it enough to keep going.",
    icon: Zap,
    tag: "The Beginning",
  },
  {
    year: "Late 2023",
    title: "The Bot That Started It All",
    description: "There was a cheating company called Loop that I really wanted to be part of. I wasn't good enough yet so I just started building a Discord bot to try and get noticed. Never joined Loop but that bot is what got me obsessed with this stuff in the first place.",
    icon: Bot,
    tag: "Origin",
  },
  {
    year: "Early 2024",
    title: "UniBot",
    description: "Turned that bot into a real project and started an org around it called UniBot. My first actual thing with a community. Pretty rough at first but people used it, which honestly still surprises me.",
    icon: Bot,
    tag: "UniBot",
  },
  {
    year: "Mid 2024",
    title: "Disutils Team",
    description: "UniBot evolved and I rebranded the whole thing as Disutils Team. Built out Disckit, DisMusic, and a bunch of other utilities. We had a real community going and kept it alive for a full year. Genuinely proud of what we shipped.",
    icon: Code2,
    tag: "Disutils Team",
  },
  {
    year: "Late 2024 to Mid 2025",
    title: "A Full Year of Disutils",
    description: "Kept building and growing Disutils through the whole run. Picked up C, C++, and C# along the way. But I was spending more and more time reading about vulnerabilities and less time thinking about Discord bots. The interest was shifting.",
    icon: GitMerge,
    tag: "Expanding",
  },
  {
    year: "Mid 2025",
    title: "Zero-Trace",
    description: "Wound down Disutils after about a year and built Zero-Trace, a CLI security scanner for finding hidden vulnerabilities. This was the one that made everything click. Security stopped being a side interest and became the thing I actually wanted to do.",
    icon: Search,
    tag: "Zero-Trace",
  },
  {
    year: "Late 2025",
    title: "VulnRadar",
    description: "Zero-Trace turned into something way bigger. Founded VulnRadar as a proper platform with 175+ vulnerability checks, severity ratings, and fix guidance. Basically the tool I wished existed when I was just getting started.",
    icon: Shield,
    tag: "VulnRadar",
  },
  {
    year: "Early 2026",
    title: "Right Now",
    description: "Growing VulnRadar, shipping more open-source security tools, and trying to get better every day. Still feel like I'm early. A lot left to build.",
    icon: Rocket,
    tag: "Present",
  },
]

// ── Section header (reusable pattern) ───────────────────────────────────────
function SectionHeader({ tag, title, inView }: { tag: string; title: string; inView: boolean }) {
  return (
    <div className="mb-10">
      <motion.span {...fadeUp(0.05)} animate={inView ? { opacity: 1, y: 0 } : {}} className="font-mono text-sm text-primary">{tag}</motion.span>
      <motion.h2 {...fadeUp(0.1)} animate={inView ? { opacity: 1, y: 0 } : {}} className="mt-2 text-3xl font-bold text-foreground md:text-4xl">{title}</motion.h2>
      <motion.div {...underline(0.15)} animate={inView ? { scaleX: 1 } : {}} className="mt-2 h-1 w-16 rounded-full bg-primary" />
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export function AboutPageContent() {
  const heroRef     = useRef<HTMLDivElement>(null)
  const skillsRef   = useRef<HTMLDivElement>(null)
  const orgsRef     = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const heroInView     = useInView(heroRef,     { once: true, margin: "-60px" })
  const skillsInView   = useInView(skillsRef,   { once: true, margin: "-60px" })
  const orgsInView     = useInView(orgsRef,     { once: true, margin: "-60px" })
  const timelineInView = useInView(timelineRef, { once: true, margin: "-60px" })

  const [stats, setStats] = useState<GitHubStats | null>(null)
  useEffect(() => {
    fetch("https://api.github.com/users/RejectModders")
      .then(r => r.json()).then(d => { if (d.public_repos !== undefined) setStats(d) }).catch(() => {})
  }, [])

  return (
    <div className="relative pt-24 pb-16 md:pt-32 md:pb-24" style={{ overflow: "clip" }}>
      <div className="mx-auto max-w-5xl px-4">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div ref={heroRef} className="mb-20">
          {/* Page title */}
          <motion.div {...fadeUp(PAGE_START)} animate={heroInView ? { opacity: 1, y: 0 } : {}} className="mb-8">
            <span className="font-mono text-sm text-primary">{'// about'}</span>
            <h1 className="mt-2 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
              About <span className="text-gradient">Me</span>
            </h1>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Avatar + stats */}
            <motion.div {...fadeUp(PAGE_START + 0.08)} animate={heroInView ? { opacity: 1, y: 0 } : {}} className="flex flex-col items-center lg:items-start">
              {stats?.avatar_url && (
                <div className="relative mb-6">
                  <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.1, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 rounded-2xl border-2 border-primary/40" />
                  <img src={`/api/avatar?url=${encodeURIComponent(stats.avatar_url)}`} alt="RejectModders" className="relative h-40 w-40 rounded-2xl border-2 border-primary/20 object-cover transition-transform duration-150 hover:scale-105" />
                  <motion.div {...fadeUp(PAGE_START + 0.15)} animate={heroInView ? { opacity: 1, y: 0 } : {}} className="absolute -bottom-2 -right-2 rounded-full border border-primary/30 bg-background px-3 py-1 font-mono text-xs text-primary animate-pulse-glow">
                    Hireable
                  </motion.div>
                </div>
              )}
              <div className="grid w-full grid-cols-2 gap-3">
                {[
                  { icon: BookOpen, value: stats?.public_repos || "9+", label: "Repos" },
                  { icon: Users,    value: stats?.followers    || "6",  label: "Followers" },
                  { icon: Calendar, value: "2023",                       label: "Joined GH" },
                  { icon: MapPin,   value: "Missouri",                   label: "Location", small: true },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    {...fadeUp(PAGE_START + 0.12 + i * 0.04)}
                    animate={heroInView ? { opacity: 1, y: 0 } : {}}
                    className="card-hover rounded-lg border border-border bg-card p-3 text-center cursor-default"
                  >
                    <s.icon className="mx-auto mb-1 h-4 w-4 text-primary" />
                    <div className={`font-mono font-bold text-foreground ${s.small ? "text-sm" : "text-lg"}`}>
                      {typeof s.value === "number" ? <AnimatedNumber value={s.value} isInView={heroInView} /> : s.value}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Bio */}
            <motion.div {...fadeUp(PAGE_START + 0.16)} animate={heroInView ? { opacity: 1, y: 0 } : {}} className="lg:col-span-2">
              <div className="card-hover rounded-xl border border-border bg-card p-6 md:p-8">
                <div className="mb-6 flex items-center gap-2">
                  {[["bg-[#ff5f57]","border-[#e0443e]"], ["bg-[#febc2e]","border-[#d4a012]"], ["bg-[#28c840]","border-[#1aab29]"]].map(([bg, border], i) => <div key={i} className={`h-3 w-3 rounded-full border ${bg} ${border}`} />)}
                  <span className="ml-2 font-mono text-xs text-muted-foreground">about.md</span>
                </div>
                <div className="space-y-5 leading-relaxed text-muted-foreground">
                  {[
                    { icon: Shield, text: <>{"Hey, I'm "}<strong className="text-foreground">RejectModders</strong>{" and I do security stuff out of "}<span className="inline-flex items-center gap-1 text-foreground"><MapPin className="h-3.5 w-3.5 text-primary" /> Missouri</span>{". I got into cybersecurity because I genuinely enjoy finding how things break, and then figuring out how to stop that from happening."}</> },
                    { icon: Code2, text: <>Most of my time is spent in <strong className="text-foreground">Python, C, C++, or C#</strong>. I've built everything from security scanners to Discord bots to little games. Honestly if an idea sounds fun I'll probably just start building it.</> },
                    { icon: Terminal, text: <>Security research is where I spend most of my focus right now. I like the idea of shipping open-source tools that actually help people find and patch real vulnerabilities before someone nasty does.</> },
                    { icon: Globe, text: <>I used to run <strong className="text-foreground">Disutils Team</strong>, a Discord tooling org that ran for a while before I wound it down. These days it's all about <strong className="text-foreground">VulnRadar</strong>. If you want to build something together, hit me up.</> },
                  ].map(({ icon: Icon, text }, i) => (
                    <p key={i} className="flex items-start gap-3"><Icon className="mt-1 h-5 w-5 shrink-0 text-primary" /><span>{text}</span></p>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="https://github.com/RejectModders" target="_blank" rel="noopener noreferrer" className="card-hover flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/10">
                    <ExternalLink className="h-3 w-3" /> GitHub Profile
                  </a>
                  <a href="https://vulnradar.dev" target="_blank" rel="noopener noreferrer" className="card-hover flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                    <ExternalLink className="h-3 w-3 text-primary" /> vulnradar.dev
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Skills ───────────────────────────────────────────────────── */}
        <div ref={skillsRef} className="mb-20">
          <SectionHeader tag="// skills" title="Tech Stack" inView={skillsInView} />
          <div className="card-hover rounded-xl border border-border bg-card p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              {[["bg-[#ff5f57]","border-[#e0443e]"], ["bg-[#febc2e]","border-[#d4a012]"], ["bg-[#28c840]","border-[#1aab29]"]].map(([bg, border], i) => <div key={i} className={`h-3 w-3 rounded-full border ${bg} ${border}`} />)}
              <span className="ml-2 font-mono text-xs text-muted-foreground">skills.json</span>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {SKILLS.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={skillsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: DUR, delay: 0.1 + i * SCROLL_STEP, ease: EASE }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{skill.name}</span>
                    <motion.span
                      className="font-mono text-xs text-primary"
                      initial={{ opacity: 0 }}
                      animate={skillsInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.2, delay: 0.1 + i * SCROLL_STEP }}
                    >
                      {skill.level > 100 ? skill.level : <AnimatedNumber value={skillsInView ? skill.level : 0} isInView={skillsInView} />}%
                    </motion.span>
                  </div>
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={skillsInView ? { width: `${Math.min(skill.level, 100)}%` } : {}}
                      transition={{ duration: 0.5, delay: 0.1 + i * SCROLL_STEP, ease: "easeOut" }}
                      className="h-full rounded-full bg-primary"
                      style={{ boxShadow: "0 0 8px color-mix(in oklch, var(--primary) 50%, transparent)" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Organizations ─────────────────────────────────────────────── */}
        <div ref={orgsRef} className="mb-20">
          <SectionHeader tag="// organizations" title="My Organizations" inView={orgsInView} />
          <div className="grid gap-6 md:grid-cols-2">
            {orgs.map((org, i) => (
              <motion.a
                key={org.name}
                href={org.url} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                animate={orgsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: DUR, delay: 0.1 + i * SCROLL_STEP, ease: EASE }}
                whileTap={{ scale: 0.98 }}
                className="card-hover group rounded-xl border border-border bg-card p-6 md:p-8"
              >
                <div className="mb-4 flex items-center gap-4">
                  <img src={org.avatar} alt={org.name} className="h-14 w-14 rounded-xl border border-border object-cover" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">{org.name}</h3>
                    <span className="font-mono text-xs text-primary">{org.role}</span>
                  </div>
                  <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{org.description}</p>
                <div className="flex flex-wrap gap-2">
                  {org.highlights.map(h => (
                    <span key={h} className="rounded-md border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-[10px] text-primary/80">{h}</span>
                  ))}
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* ── Timeline ──────────────────────────────────────────────────── */}
        <div ref={timelineRef}>
          <SectionHeader tag="// journey" title="My Timeline" inView={timelineInView} />
          <div className="relative">
            {/* Vertical line */}
            <motion.div
              initial={{ scaleY: 0 }} animate={timelineInView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ transformOrigin: "top" }}
              className="absolute left-5 top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-px"
            />
            {timelineItems.map((item, i) => {
              const Icon = item.icon
              const isRight = i % 2 !== 0
              return (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 12 }}
                  animate={timelineInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: DUR, delay: 0.1 + i * SCROLL_STEP, ease: EASE }}
                  className={`relative mb-10 flex flex-col gap-2 pl-14 md:w-1/2 md:pl-0 ${isRight ? "md:ml-auto md:pl-12" : "md:pr-12 md:text-right"}`}
                >
                  {/* Icon dot */}
                  <motion.div
                    initial={{ scale: 0 }} animate={timelineInView ? { scale: 1 } : {}}
                    transition={{ delay: 0.1 + i * SCROLL_STEP, type: "spring", stiffness: 500, damping: 20 }}
                    className={`absolute left-1.5 top-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background transition-colors duration-150 hover:bg-primary/10 ${isRight ? "md:-left-4" : "md:left-auto md:-right-4"}`}
                  >
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </motion.div>

                  {/* Year + tag */}
                  <div className={`flex items-center gap-2 ${isRight ? "" : "md:flex-row-reverse md:justify-end"}`}>
                    <span className="font-mono text-sm font-bold text-primary">{item.year}</span>
                    <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[10px] text-primary/70">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
