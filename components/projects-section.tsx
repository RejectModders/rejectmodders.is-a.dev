"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Star, GitFork, ArrowUpRight, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Repo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
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
  EJS: "#a91e50",
}

export function ProjectsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [repos, setRepos] = useState<Repo[]>([])

  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch("/api/github", { cache: "no-store" })
        if (!res.ok) return
        const all: Repo[] = await res.json()
        const unique = Array.from(new Map(all.map((r) => [r.id, r])).values())
          .filter((r) => !r.fork && !r.archived && r.name !== "RejectModders" && r.name !== ".github" && r.name !== "LICENSE")
          .sort((a, b) => {
            if (b.stargazers_count !== a.stargazers_count) return b.stargazers_count - a.stargazers_count
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          })
          .slice(0, 6)
        setRepos(unique)
      } catch {
        // fallback
      }
    }
    fetchRepos()
  }, [])

  return (
    <section ref={ref} id="projects" className="relative py-24 md:py-32" style={{ overflow: "clip" }}>
      <div className="mx-auto max-w-6xl px-4">
        {/* Section header */}
        <motion.div
          initial={false}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-12"
        >
          <motion.span
            initial={false}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-sm text-primary"
          >
            {'// projects'}
          </motion.span>
          <motion.h2
            initial={false}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-2 text-3xl font-bold text-foreground md:text-4xl"
          >
            Featured Projects
          </motion.h2>
          <motion.div
            initial={false}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-2 h-1 w-16 origin-left rounded-full bg-primary"
          />
          <motion.p
            initial={false}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-4 max-w-lg text-muted-foreground"
          >
            Open source projects from my personal account and organizations, fetched live from GitHub.
          </motion.p>
        </motion.div>

        {/* Projects grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo, i) => (
            <motion.a
              key={repo.id}
              initial={false}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover group relative flex flex-col rounded-xl border border-border bg-card p-5"
            >
              {/* Owner + name */}
              <div className="mb-3 flex items-start gap-2">
                <img
                  src={`/api/avatar?url=${encodeURIComponent(repo.owner.avatar_url)}`}
                  alt={`${repo.owner.login} avatar`}
                  className="mt-0.5 h-5 w-5 rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] text-muted-foreground/70">
                    {repo.owner.login}
                  </span>
                  <h3 className="truncate font-mono text-sm font-semibold text-foreground group-hover:text-primary">
                    {repo.name}
                  </h3>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
              </div>

              {/* Description */}
              <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
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
              </div>
            </motion.a>
          ))}
        </div>

        {/* View all link */}
        <motion.div
          initial={false}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.4, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-10 text-center"
        >
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-6 py-3 font-mono text-sm text-primary hover:bg-primary/10"
          >
            View all projects
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
