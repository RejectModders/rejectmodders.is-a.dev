"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Home, User, FolderGit2, Users, Music, Gamepad2, Terminal, ExternalLink, ArrowRight } from "lucide-react"

const ITEMS = [
  { group: "Pages", icon: Home,        label: "Home",           href: "/",         internal: true },
  { group: "Pages", icon: User,        label: "About",          href: "/about",    internal: true },
  { group: "Pages", icon: FolderGit2,  label: "Projects",       href: "/projects", internal: true },
  { group: "Pages", icon: Users,       label: "Friends",        href: "/friends",  internal: true },
  { group: "Pages", icon: Gamepad2,    label: "Games",          href: "/games",    internal: true },
  { group: "Pages", icon: Music,       label: "Spotify",        href: "/spotify",  internal: true },
  { group: "Sections", icon: ArrowRight, label: "Contact",      href: "/#contact", internal: true },
  { group: "Sections", icon: ArrowRight, label: "Skills",       href: "/#about",   internal: true },
  { group: "Sections", icon: ArrowRight, label: "Projects (home)", href: "/#projects", internal: true },
  { group: "Links", icon: ExternalLink, label: "GitHub",        href: "https://github.com/RejectModders", internal: false },
  { group: "Links", icon: ExternalLink, label: "VulnRadar",     href: "https://vulnradar.dev",            internal: false },
  { group: "Easter egg", icon: Terminal, label: "Open Terminal (hint…)", href: null, internal: false },
]

export function CommandPalette() {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState("")
  const [selected, setSelected] = useState(0)
  const router = useRouter()

  const close = useCallback(() => { setOpen(false); setQuery("") }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(o => !o) }
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [close])

  const filtered = ITEMS.filter(i =>
    i.label.toLowerCase().includes(query.toLowerCase()) ||
    i.group.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => { setSelected(0) }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)) }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === "Enter")     { e.preventDefault(); activate(filtered[selected]) }
  }

  const activate = (item: typeof ITEMS[0]) => {
    if (!item) return
    close()
    if (item.label === "Open Terminal (hint…)") {
      window.dispatchEvent(new CustomEvent("rm:open-terminal"))
      return
    }
    if (!item.href) return
    if (item.internal) router.push(item.href)
    else window.open(item.href, "_blank", "noopener")
  }

  const groups = [...new Set(filtered.map(i => i.group))]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
          onClick={close}
        >
          <motion.div
            key="palette"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, sections, links..."
                className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
              />
              <kbd className="rounded border border-border px-1.5 font-mono text-[10px] text-muted-foreground/50">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {filtered.length === 0 && (
                <p className="px-4 py-6 text-center font-mono text-sm text-muted-foreground/50">
                  No results for &quot;{query}&quot;
                </p>
              )}
              {groups.map(group => (
                <div key={group}>
                  <p className="px-4 pb-1 pt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/40">
                    {group}
                  </p>
                  {filtered.filter(i => i.group === group).map(item => {
                    const idx = filtered.indexOf(item)
                    const Icon = item.icon
                    return (
                      <button
                        key={item.label}
                        onClick={() => activate(item)}
                        onMouseEnter={() => setSelected(idx)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          selected === idx ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 font-mono text-sm">{item.label}</span>
                        {!item.internal && item.href && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground/40" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 border-t border-border px-4 py-2">
              <span className="font-mono text-[10px] text-muted-foreground/40">↑↓ navigate</span>
              <span className="font-mono text-[10px] text-muted-foreground/40">↵ select</span>
              <span className="font-mono text-[10px] text-muted-foreground/40">esc close</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground/30">⌘K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

