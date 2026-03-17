"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState, useMemo } from "react"
import { Star, GitFork, ExternalLink, Code2, Search, Filter, Archive, ArrowUpRight } from "lucide-react"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
}

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 }
}

// Easing function for counters
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function ProjectAnimatedNumber({ value, isInView, startSignal }: {
  value: number
  isInView: boolean
  startSignal: number
}) {
  const [display, setDisplay] = useState(0)
  const fromRef  = useRef(0)
  const rafRef   = useRef(0)

  useEffect(() => {
    if (!isInView) return

    const from = fromRef.current
    const to   = value
    fromRef.current = value

    if (from === to) return

    const DURATION = 500
    const startTime = performance.now()

    cancelAnimationFrame(rafRef.current)

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / DURATION, 1)
      const eased = easeOut(progress)
      setDisplay(Math.round(from + (to - from) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(to)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, startSignal])

  return <>{display}</>
}

interface Repo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  topics: string[]
  updated_at: string
  fork: boolean
  archived: boolean
  owner: {
    login: string
    avatar_url: string
  }
}

const languageColors: Record<string, string> = {
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  EJS: "#a91e50",
  Rust: "#dea584",
  Go: "#00ADD8",
}

type FilterSource = "all" | "personal" | "disutils" | "vulnradar"

const sources: { key: FilterSource; label: string; description: string }[] = [
  { key: "all", label: "All", description: "Everything" },
  { key: "personal", label: "Personal", description: "RejectModders" },
  { key: "disutils", label: "Disutils Team", description: "Discord Utils (Inactive)" },
  { key: "vulnradar", label: "VulnRadar", description: "Security Research" },
]

export function ProjectsPageContent() {
  const ref = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  
  const isInView = useInView(ref, { once: true })
  const headerInView = useInView(headerRef, { once: true, amount: 0.5 })
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 })
  const filtersInView = useInView(filtersRef, { once: true, amount: 0.5 })
  const gridInView = useInView(gridRef, { once: true, amount: 0.1 })
  
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterSource>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    async function fetchAllRepos() {
      try {
        const res = await fetch("/api/github", { cache: "no-store" })
        if (!res.ok) return
        const allRepos: Repo[] = await res.json()

        const unique = Array.from(new Map(allRepos.map((r) => [r.id, r])).values())
          .filter((r) => !r.fork && r.name !== "RejectModders" && r.name !== ".github" && r.name !== "LICENSE")
          .sort((a, b) => {
            if (b.stargazers_count !== a.stargazers_count) return b.stargazers_count - a.stargazers_count
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          })

        setRepos(unique)
      } catch {
        // fallback handled by empty array
      } finally {
        setLoading(false)
      }
    }
    fetchAllRepos()
  }, [])

  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => {
      if (filter === "personal" && repo.owner.login !== "RejectModders") return false
      if (filter === "disutils" && repo.owner.login !== "disutils") return false
      if (filter === "vulnradar" && repo.owner.login !== "VulnRadar") return false
      if (showArchived && !repo.archived) return false
      if (!showArchived && repo.archived) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          repo.name.toLowerCase().includes(q) ||
          repo.description?.toLowerCase().includes(q) ||
          repo.language?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [repos, filter, searchQuery, showArchived])

  const languages = useMemo(() => {
    const langs = new Set(filteredRepos.map((r) => r.language).filter(Boolean))
    return Array.from(langs) as string[]
  }, [filteredRepos])

  const stats = useMemo(() => {
    const totalStars = filteredRepos.reduce((acc, r) => acc + r.stargazers_count, 0)
    const totalForks = filteredRepos.reduce((acc, r) => acc + r.forks_count, 0)
    const langs = new Set(filteredRepos.map((r) => r.language).filter(Boolean))
    return {
      totalRepos: filteredRepos.length,
      totalStars,
      totalForks,
      languages: langs.size,
    }
  }, [filteredRepos])

  const [statsSignal, setStatsSignal] = useState(0)
  useEffect(() => {
    setStatsSignal(s => s + 1)
  }, [stats])

  return (
    <div ref={ref} className="relative pt-24 pb-16 md:pt-32 md:pb-24" style={{ overflow: "clip" }}>
      <div className="mx-auto max-w-6xl px-4">
        {/* Header with animations */}
        <motion.div 
          ref={headerRef}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="mb-8"
        >
          <motion.span 
            variants={slideInLeft}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-sm text-primary inline-block"
          >
            {'// projects'}
          </motion.span>
          <motion.h1 
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl"
          >
            All <span className="text-gradient">Projects</span>
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={headerInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 h-1 w-20 rounded-full bg-primary origin-left"
          />
          <motion.p 
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 max-w-2xl text-lg text-muted-foreground"
          >
            Stuff I've built across my personal account and both orgs. Security tools, Discord bots, random side projects. A bit of everything.
          </motion.p>
        </motion.div>

        {/* Stats bar with stagger */}
        <motion.div 
          ref={statsRef}
          className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
          }}
        >
          {[
            { label: "Repositories", value: stats.totalRepos },
            { label: "Total Stars", value: stats.totalStars },
            { label: "Total Forks", value: stats.totalForks },
            { label: "Languages", value: stats.languages },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={scaleIn}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="card-hover rounded-lg border border-border bg-card p-4 text-center cursor-default"
            >
              <div className="font-mono text-2xl font-bold text-primary">
                <ProjectAnimatedNumber value={stat.value} isInView={isInView} startSignal={statsSignal} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters with animation */}
        <motion.div 
          ref={filtersRef}
          initial={{ opacity: 0, y: 15 }}
          animate={filtersInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Source filter */}
          <div className="flex flex-wrap gap-2">
            {sources.map((source, i) => (
              <motion.button
                key={source.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={filtersInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setFilter(source.key)}
                className={`rounded-lg px-4 py-2 font-mono text-xs ${
                  filter === source.key
                    ? "border border-primary/50 bg-primary/10 text-primary shadow-[0_0_10px_oklch(0.58_0.2_15/0.1)]"
                    : "border border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <span className="block font-semibold">{source.label}</span>
                <span className="block text-[10px] opacity-60">{source.description}</span>
              </motion.button>
            ))}
          </div>

          {/* Search + archived toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-xs ${
                showArchived
                  ? "border border-primary/50 bg-primary/10 text-primary"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Archive className="h-3.5 w-3.5" />
              {showArchived ? "Hide Archived" : "Show Archived"}
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search repos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 rounded-lg border border-border bg-card py-2 pl-9 pr-3 font-mono text-xs text-foreground placeholder-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 sm:w-56"
              />
            </div>
          </div>
        </motion.div>

        {/* Language chips */}
        {languages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={filtersInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-6 flex flex-wrap gap-2"
          >
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Filter className="h-3 w-3" /> Languages:
            </span>
            {languages.map((lang, i) => (
              <motion.span
                key={lang}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={filtersInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.03 }}
                className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: languageColors[lang] || "#888" }}
                />
                {lang}
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* Projects grid */}
        <div ref={gridRef}>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-6">
                  <div className="mb-3 h-5 w-1/2 rounded bg-muted" />
                  <div className="mb-2 h-4 w-full rounded bg-muted" />
                  <div className="mb-4 h-4 w-3/4 rounded bg-muted" />
                  <div className="flex gap-3">
                    <div className="h-3 w-16 rounded bg-muted" />
                    <div className="h-3 w-12 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate={gridInView ? "visible" : "hidden"}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
              }}
            >
              {filteredRepos.map((repo) => (
                <motion.a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="card-hover group relative flex flex-col rounded-xl border border-border bg-card p-6"
                >
                  {/* Archived badge */}
                  {repo.archived && (
                    <div className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      ARCHIVED
                    </div>
                  )}

                  {/* Org badge + repo name */}
                  <div className="mb-3 flex items-start gap-2">
                    <img
                      src={`/api/avatar?url=${encodeURIComponent(repo.owner.avatar_url)}`}
                      alt={`${repo.owner.login} avatar`}
                      className="mt-0.5 h-5 w-5 rounded-full"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {repo.owner.login}
                        </span>
                        <span className="text-muted-foreground/40">/</span>
                      </div>
                      <h3 className="truncate font-mono text-sm font-semibold text-foreground group-hover:text-primary">
                        {repo.name}
                      </h3>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  {/* Description */}
                  <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {repo.description || "No description provided."}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center gap-3">
                    {repo.language && (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: languageColors[repo.language] || "#888" }}
                        />
                        {repo.language}
                      </span>
                    )}
                    {repo.stargazers_count > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        {repo.stargazers_count}
                      </span>
                    )}
                    {repo.forks_count > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <GitFork className="h-3 w-3" />
                        {repo.forks_count}
                      </span>
                    )}
                    <span className="ml-auto text-[10px] text-muted-foreground/50">
                      {new Date(repo.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Homepage link */}
                  {repo.homepage && repo.homepage !== "" && (
                    <div className="mt-3 border-t border-border pt-3">
                      <span className="flex items-center gap-1.5 text-xs text-primary">
                        <ExternalLink className="h-3 w-3" />
                        {repo.homepage.replace(/^https?:\/\//, "")}
                      </span>
                    </div>
                  )}
                </motion.a>
              ))}
            </motion.div>
          )}
        </div>

        {!loading && filteredRepos.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="py-16 text-center"
          >
            <Code2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="font-mono text-sm text-muted-foreground">No repositories found matching your filters.</p>
          </motion.div>
        )}

        {/* View on GitHub */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={gridInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          {[
            { label: "RejectModders", url: "https://github.com/RejectModders" },
            { label: "Disutils Team", url: "https://github.com/disutils" },
            { label: "VulnRadar", url: "https://github.com/vulnradar" },
          ].map((org, i) => (
            <motion.a
              key={org.label}
              href={org.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={gridInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 font-mono text-sm text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              {org.label} on GitHub
              <ExternalLink className="h-3.5 w-3.5" />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
