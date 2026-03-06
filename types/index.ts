/**
 * Centralized type definitions for rejectmodders.dev
 * Import from '@/types' or '@/types/index'
 */

// ── Navigation Types ─────────────────────────────────────────────────────────
export interface NavLink {
  label: string
  href: string
  external: boolean
}

export interface FooterLink {
  label: string
  href: string
  external: boolean
}

// ── Friend Types ─────────────────────────────────────────────────────────────
export interface FriendRaw {
  name: string
  isGF: boolean
  discord: string | null
  github: string | null
  twitter: string | null
  website: string | null
  youtube: string | null
  email: string | null
  avatar: string | null
}

export interface FriendResolved extends FriendRaw {
  resolvedAvatar: string | null
}

// ── GitHub Types ─────────────────────────────────────────────────────────────
export interface GitHubStats {
  public_repos: number
  followers: number
  following: number
  avatar_url: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  fork: boolean
  archived: boolean
  stargazers_count: number
  language: string | null
  topics: string[]
  pushed_at: string
  created_at: string
}

export interface GitHubEvent {
  id: string
  type: string
  repo: { name: string }
  payload: {
    commits?: { message: string }[]
    action?: string
    ref?: string
    ref_type?: string
  }
  created_at: string
}

// ── Skills Types ─────────────────────────────────────────────────────────────
export interface Skill {
  name: string
  level: number
}

// ── Games Types ──────────────────────────────────────────────────────────────
export type GameCategory = "arcade" | "puzzle" | "card" | "word" | "strategy"

export interface GameConfig {
  id: string
  title: string
  description: string
  category: GameCategory
  icon: React.ComponentType<{ className?: string }>
  color: string
  disabled?: boolean
}

// ── Sitemap Types ────────────────────────────────────────────────────────────
export interface SitemapRoute {
  path: string
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority: number
}

// ── API Response Types ───────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

// ── Animation Types ──────────────────────────────────────────────────────────
export interface AnimationVariants {
  hidden: object
  visible: object
}

export interface StaggerConfig {
  staggerChildren: number
  delayChildren?: number
}
