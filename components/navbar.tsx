"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sun, Moon, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { NAV_LINKS, GITHUB_URL } from "@/config/constants"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      {/* Header animates first - content waits for this to complete */}
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ willChange: "transform, opacity" }}
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "border-b border-border bg-background/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          {/* Logo */}
          <Link href="/" className="group font-mono text-sm font-bold text-foreground">
            {"<"}
            <span className="text-primary transition-colors group-hover:text-foreground">RM</span>
            {" />"}
          </Link>

          {/* Desktop links - all appear together, no stagger */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href.replace("/#", "/"))
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`animated-underline font-mono text-sm transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono text-sm text-primary transition-all hover:bg-primary/20 hover:shadow-[0_0_15px_oklch(0.58_0.2_15/0.2)]"
            >
              GitHub
            </a>
            {/* Cmd+K */}
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              aria-label="Search site, press Command K"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              <kbd className="hidden text-[10px] sm:inline" aria-hidden="true">⌘K</kbd>
            </button>
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-foreground md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed inset-x-0 top-15 z-40 border-b border-border bg-background/95 backdrop-blur-xl md:hidden"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col gap-1 px-4 py-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-3 py-2.5 font-mono text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 flex gap-2">
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 block rounded-md bg-primary px-3 py-2.5 text-center font-mono text-sm text-primary-foreground"
                  >
                    GitHub
                  </a>
                  {mounted && (
                    <button
                      onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); setMobileOpen(false) }}
                      className="flex items-center justify-center rounded-md border border-border px-3 py-2.5 font-mono text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      title="Toggle theme"
                    >
                      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
