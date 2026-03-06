"use client"

import { useState, useEffect } from "react"

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolve any CSS color value (hsl, oklch, hex, rgb…) to a guaranteed
 * 6-digit lowercase hex string by painting it onto a 1×1 off-screen canvas.
 * Falls back to #dc2626 (red) if anything goes wrong.
 */
export function getCSSColor(varName: string): string {
  if (typeof window === "undefined") return "#dc2626"
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  if (!raw) return "#dc2626"
  try {
    const canvas = document.createElement("canvas")
    canvas.width = 1; canvas.height = 1
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = raw
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("")
  } catch {
    return "#dc2626"
  }
}

export function usePrimary() {
  const [c, setC] = useState("#dc2626")
  useEffect(() => {
    const update = () => setC(getCSSColor("--primary"))
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] })
    return () => obs.disconnect()
  }, [])
  return c
}

// ── HIGH SCORES v2 (localStorage) - Fresh start for rewritten games ───────────
export const HS_KEY = "rm_games_v2"
export function loadHS(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(HS_KEY) ?? "{}") } catch { return {} }
}
export function saveHS(game: string, score: number) {
  const hs = loadHS()
  if ((hs[game] ?? 0) < score) { hs[game] = score; localStorage.setItem(HS_KEY, JSON.stringify(hs)) }
}
export function getHS(game: string): number {
  return loadHS()[game] ?? 0
}

