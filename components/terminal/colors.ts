import type { Line } from "./types"

// ── Terminal color classes ─────────────────────────────────────────────────────
export const col = {
  primary: "text-primary",
  muted: "text-muted-foreground",
  fg: "text-foreground",
  green: "text-green-400",
  red: "text-red-400",
  yellow: "text-yellow-400",
  cyan: "text-cyan-400",
  orange: "text-orange-400",
  none: "",
}

// ── Line helpers ───────────────────────────────────────────────────────────────
export const L = (text: string, color = col.muted): Line => ({ text, color })
export const BR = (): Line => ({ text: "", color: "" })

// ── Site color map (oklch values) ──────────────────────────────────────────────
export const SITE_COLORS: Record<string, { dark: string; light: string; label: string }> = {
  red:    { dark: "oklch(0.55 0.26 13)",  light: "oklch(0.49 0.27 13)",  label: "red"    },
  orange: { dark: "oklch(0.65 0.20 48)",  light: "oklch(0.57 0.22 48)",  label: "orange" },
  yellow: { dark: "oklch(0.74 0.18 88)",  light: "oklch(0.60 0.20 88)",  label: "yellow" },
  green:  { dark: "oklch(0.60 0.20 142)", light: "oklch(0.50 0.22 142)", label: "green"  },
  cyan:   { dark: "oklch(0.64 0.17 200)", light: "oklch(0.52 0.19 200)", label: "cyan"   },
  blue:   { dark: "oklch(0.58 0.22 252)", light: "oklch(0.50 0.24 252)", label: "blue"   },
  purple: { dark: "oklch(0.60 0.28 295)", light: "oklch(0.52 0.29 295)", label: "purple" },
  pink:   { dark: "oklch(0.64 0.24 338)", light: "oklch(0.55 0.26 338)", label: "pink"   },
  white:  { dark: "oklch(0.92 0.00 0)",   light: "oklch(0.28 0.00 0)",   label: "white"  },
}

// ── Cursor colors ──────────────────────────────────────────────────────────────
export const CURSOR_COLORS: Record<string, [number, number, number]> = {
  red: [220, 38, 38],
  green: [34, 197, 94],
  blue: [59, 130, 246],
  cyan: [6, 182, 212],
  purple: [168, 85, 247],
  pink: [236, 72, 153],
  orange: [249, 115, 22],
  yellow: [234, 179, 8],
  white: [255, 255, 255],
}

export const CURSOR_STYLE_NAMES: Record<number, string> = {
  1: "default (ring + comet tail)",
  2: "crosshair",
  3: "minimal dot",
  4: "arrow",
  5: "scanner / tech ring",
}

// ── Site color application ─────────────────────────────────────────────────────
export function applySiteColor(colorName: string) {
  const entry = SITE_COLORS[colorName]
  if (!entry || typeof document === "undefined") return
  const isLight = document.documentElement.classList.contains("light")
  const val = isLight ? entry.light : entry.dark
  const root = document.documentElement
  const props = [
    "--primary", "--accent", "--ring", "--chart-1",
    "--sidebar-primary", "--sidebar-ring",
  ]
  props.forEach(p => root.style.setProperty(p, val))
  // For light colors (white, yellow, cyan, green) the button bg is near-white -
  // force a dark foreground so text is always readable
  const lightColors = new Set(["white", "yellow", "cyan", "green"])
  const fg = lightColors.has(colorName)
    ? "oklch(0.10 0 0)"   // near-black
    : "oklch(0.98 0 0)"   // near-white
  const fgProps = ["--primary-foreground", "--accent-foreground", "--sidebar-primary-foreground"]
  fgProps.forEach(p => root.style.setProperty(p, fg))
}
