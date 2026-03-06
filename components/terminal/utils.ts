import { SITE_COLORS, applySiteColor } from "./colors"

// ── Cookie helpers ─────────────────────────────────────────────────────────────
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"))
  return match ? decodeURIComponent(match[1]) : null
}

export function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=${encodeURIComponent(value)};max-age=${days * 86400};path=/;SameSite=Lax`
}

// ── Load saved preferences on terminal init ────────────────────────────────────
export function loadSavedPreferences() {
  if (typeof document === "undefined") return
  // theme
  const theme = getCookie("rm_theme")
  if (theme === "light") {
    document.documentElement.classList.add("light")
    document.documentElement.classList.remove("dark")
  } else if (theme === "dark") {
    document.documentElement.classList.remove("light")
    document.documentElement.classList.add("dark")
  }
  // site color - apply CSS vars directly, no dispatch needed
  const color = getCookie("rm_site_color")
  if (color && SITE_COLORS[color]) applySiteColor(color)
  // NOTE: cursor color + style are read directly from cookies by custom-cursor.tsx
  // at its own useEffect init - no need to dispatch events here (causes flash)
}
