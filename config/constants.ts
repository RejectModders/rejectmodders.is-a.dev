/**
 * Centralized configuration for rejectmodders.dev
 * All repeated values should be imported from this file.
 */

// ── Domain Configuration ─────────────────────────────────────────────────────
export const SITE_URL = "https://rejectmodders.dev"
export const LEGACY_DOMAIN = "rejectmodders.is-a.dev"
export const LEGACY_URL = `https://${LEGACY_DOMAIN}`

// ── Site Metadata ────────────────────────────────────────────────────────────
export const SITE_NAME = "RejectModders"
export const SITE_TITLE = "RejectModders | Cybersecurity Developer"
export const SITE_DESCRIPTION = "Cybersecurity-focused developer from Missouri. Building security tools, writing code in Python, C, C++ and C#. Founder of Disutils & VulnRadar."
export const SITE_KEYWORDS = ["cybersecurity", "developer", "python", "security tools", "RejectModders", "VulnRadar", "Disutils"]
export const SITE_AUTHOR = "RejectModders"
export const SITE_LOCATION = "Missouri, USA"
export const SITE_ROLE = "Cybersecurity Developer"

// ── Theme Configuration ──────────────────────────────────────────────────────
export const THEME_COLOR = "#dc2626"

// ── External Links ───────────────────────────────────────────────────────────
export const GITHUB_URL = "https://github.com/RejectModders"
export const GITHUB_USERNAME = "RejectModders"
export const GITHUB_REPO_URL = "https://github.com/RejectModders/rejectmodders.dev"
export const VULNRADAR_URL = "https://vulnradar.dev"

// ── Contact Information ──────────────────────────────────────────────────────
// Email is split to deter scrapers - assemble at runtime
export const EMAIL_USER = "liam"
export const EMAIL_DOMAIN = "rejectmodders.dev"
export const getEmail = () => `${EMAIL_USER}@${EMAIL_DOMAIN}`

// ── API Endpoints ────────────────────────────────────────────────────────────
export const GITHUB_API_URL = "https://api.github.com"
export const GITHUB_USER_API = `${GITHUB_API_URL}/users/${GITHUB_USERNAME}`

// ── Caching Configuration ────────────────────────────────────────────────────
// Website content: 2-4 hours (7200-14400 seconds)
export const CACHE_DURATION_PAGE = 7200 // 2 hours
export const CACHE_DURATION_PAGE_MAX = 14400 // 4 hours
export const CACHE_DURATION_STATIC = 31536000 // 1 year for static assets

// GitHub Actions / API: 5-10 minutes (300-600 seconds)
export const CACHE_DURATION_API = 600 // 10 minutes
export const CACHE_DURATION_API_STALE = 1200 // 20 minutes stale-while-revalidate

// Avatar caching
export const CACHE_DURATION_AVATAR = 7200 // 2 hours
export const CACHE_DURATION_AVATAR_STALE = 14400 // 4 hours stale-while-revalidate

// ── Navigation Links ─────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: "Home", href: "/", external: false },
  { label: "About", href: "/about", external: false },
  { label: "Projects", href: "/projects", external: false },
  { label: "Friends", href: "/friends", external: false },
  { label: "Games", href: "/games", external: false },
  { label: "Spotify", href: "/spotify", external: false },
  { label: "Contact", href: "/#contact", external: false },
] as const

export const FOOTER_NAV_LINKS = [
  { href: "/", label: "Home", external: false },
  { href: "/about", label: "About", external: false },
  { href: "/projects", label: "Projects", external: false },
  { href: "/friends", label: "Friends", external: false },
  { href: VULNRADAR_URL, label: "VulnRadar", external: true },
] as const

// ── Sitemap Configuration ────────────────────────────────────────────────────
export const SITEMAP_ROUTES = [
  { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/projects", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/friends", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/spotify", changeFrequency: "daily" as const, priority: 0.5 },
  { path: "/admin", changeFrequency: "never" as const, priority: 0.1 },
] as const

// ── Skills / Languages ───────────────────────────────────────────────────────
export const TECH_TAGS = ["Python", "C / C++", "JavaScript", "TypeScript", "Bash"] as const

// ── Avatar Proxy Allowlist ───────────────────────────────────────────────────
export const AVATAR_ALLOWED_HOSTS = [
  // GitHub avatars
  "avatars.githubusercontent.com",
  "github.com",
  // Social avatars
  "unavatar.io",
  "www.gravatar.com",
  "pbs.twimg.com",
  "cdn.discordapp.com",
  // YouTube thumbnails
  "i.ytimg.com",
  "yt3.ggpht.com",
  // Image hosts
  "i.imgur.com",
  "giffiles.alphacoders.com",
  // Spotify stats cards
  "spotify-github-profile.kittinanx.com",
  "spotify-recently-played-readme.vercel.app",
] as const

export type AllowedHost = typeof AVATAR_ALLOWED_HOSTS[number]

// ── Feature Flags ────────────────────────────────────────────────────────────
export const FEATURES = {
  enableParticles: true,
  enableCustomCursor: true,
  enableTerminalEasterEgg: true,
  enableCommandPalette: true,
  enableScrollToTop: true,
  enableBugFixToast: true,
  enableFloatingCTA: true,
  enableLegacyDomainWarning: true,
} as const
