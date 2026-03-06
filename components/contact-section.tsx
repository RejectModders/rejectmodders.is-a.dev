"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Github, ExternalLink, Mail, MapPin, Users, BookOpen, ArrowRight } from "lucide-react"
import { GITHUB_URL, GITHUB_USER_API, VULNRADAR_URL, getEmail, SITE_LOCATION } from "@/config/constants"
import { EASE, DUR, SCROLL_STEP } from "@/lib/animation"

// Animated number counter
function AnimatedNumber({ value, isInView }: { value: number; isInView: boolean }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let s = 0; const inc = value / (900 / 16)
    const t = setInterval(() => {
      s += inc
      if (s >= value) { setDisplay(value); clearInterval(t) }
      else setDisplay(Math.floor(s))
    }, 16)
    return () => clearInterval(t)
  }, [isInView, value])

  return <>{display}</>
}

interface GitHubStats { public_repos: number; followers: number; following: number; avatar_url: string }

export function ContactSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  const [stats, setStats] = useState<GitHubStats | null>(null)

  useEffect(() => {
    fetch(GITHUB_USER_API)
      .then(r => r.json()).then(d => { if (d.public_repos !== undefined) setStats(d) }).catch(() => {})
  }, [])

  const links = [
    { href: GITHUB_URL, icon: Github, label: "Follow on GitHub", primary: true },
    { href: VULNRADAR_URL, icon: ExternalLink, label: "Visit vulnradar.dev", primary: false },
    // email is intentionally obfuscated - assembled at runtime to deter scrapers
    { href: getEmail(), icon: Mail, label: "Get in Touch", primary: false, isEmail: true },
  ]

  const statItems = stats ? [
    { icon: BookOpen, label: "Repos",     value: stats.public_repos },
    { icon: Users,    label: "Followers", value: stats.followers },
    { icon: Users,    label: "Following", value: stats.following },
  ] : []

  return (
    <section ref={ref} id="contact" className="relative py-24 md:py-32 scroll-mt-20" style={{ overflow: "clip" }}>
      {/* Ambient orb */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.45 0.18 15 / 0.07) 0%, transparent 70%)" }} />

      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: DUR, ease: EASE }}
          className="mb-10 text-center"
        >
          <span className="font-mono text-sm text-primary">{'// connect'}</span>
          <h2 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">{"Let's Work Together"}</h2>
          <motion.div
            initial={{ scaleX: 0 }} animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.03, ease: "easeOut" }} style={{ originX: 0.5 }}
            className="mx-auto mt-2 h-1 w-16 rounded-full bg-primary"
          />
          <p className="mt-3 text-muted-foreground">Whether it's a project collab, security stuff, or you just want to chat, I'm usually around.</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: DUR, delay: 0.05, ease: EASE }}
          className="card-hover relative mx-auto max-w-lg overflow-hidden rounded-xl border border-border bg-card p-8"
        >
          {/* Inner glow */}
          <div className="pointer-events-none absolute inset-0 rounded-xl"
            style={{ background: "linear-gradient(135deg, oklch(0.45 0.18 15 / 0.05) 0%, transparent 50%)" }} />

          {/* Avatar + name */}
          <div className="mb-6 flex flex-col items-center gap-3">
            {stats?.avatar_url && (
              <div className="relative">
                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.1, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full border-2 border-primary/40" />
                <img src={`/api/avatar?url=${encodeURIComponent(stats.avatar_url)}`} alt="RejectModders"
                  className="relative h-20 w-20 rounded-full border-2 border-primary/30 transition-transform duration-150 hover:scale-105" />
              </div>
            )}
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">RejectModders</h3>
              <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {SITE_LOCATION}
              </p>
            </div>
          </div>

          {/* Stats - CSS transitions only, NO Framer Motion whileHover */}
          {stats && (
            <div className="mb-6 grid grid-cols-3 gap-3">
              {statItems.map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 8 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: DUR, delay: 0.1 + i * SCROLL_STEP, ease: EASE }}
                  className="card-hover rounded-lg border border-border bg-secondary p-3 text-center cursor-default"
                >
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <s.icon className="h-3 w-3" />{s.label}
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold text-foreground">
                    <AnimatedNumber value={s.value} isInView={isInView} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Links - CSS transitions for hover, Framer only for entrance */}
          <div className="flex flex-col gap-3">
            {links.map((link, i) => {
              const sharedClass = `group card-hover flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium border ${
                link.primary
                  ? "border-primary bg-primary text-primary-foreground glow-red hover:brightness-110"
                  : "border-border bg-secondary text-secondary-foreground hover:bg-muted"
              }`
              const inner = (
                <>
                  <link.icon className="h-5 w-5 shrink-0" />
                  {link.label}
                  <ArrowRight className="ml-auto h-4 w-4 translate-x-0 opacity-0 transition-all duration-150 group-hover:translate-x-1 group-hover:opacity-100" />
                </>
              )
              return (
                <motion.div key={link.label}
                  initial={{ opacity: 0, y: 6 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: DUR, delay: 0.15 + i * SCROLL_STEP, ease: EASE }}
                >
                  {link.isEmail ? (
                    <button
                      onClick={() => { window.location.href = `mailto:${link.href}` }}
                      className={`w-full cursor-pointer ${sharedClass}`}
                    >
                      {inner}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={sharedClass}
                    >
                      {inner}
                    </a>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
