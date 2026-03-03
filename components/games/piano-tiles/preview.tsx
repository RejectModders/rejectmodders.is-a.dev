"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function PianoTilesPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const COLS = 4, TILE_H = 36, colW = W / COLS
    type Tile = { col: number; y: number; hit: boolean }
    const tiles: Tile[] = []
    for (let i = 0; i < 6; i++) tiles.push({ col: Math.floor(Math.random() * COLS), y: -TILE_H + i * TILE_H, hit: false })
    let score = 0, speed = 1.5, raf = 0
    const draw = () => {
      // Move tiles
      for (const t of tiles) t.y += speed
      // Auto-tap the lowest unhit tile near bottom
      const lowest = tiles.filter(t => !t.hit && t.y + TILE_H > H * 0.6).sort((a, b) => b.y - a.y)[0]
      if (lowest && lowest.y > H * 0.65) { lowest.hit = true; score++; speed = 1.5 + score * 0.03 }
      // Respawn
      for (const t of tiles) {
        if (t.y > H + TILE_H) { t.y = -TILE_H; t.col = Math.floor(Math.random() * COLS); t.hit = false }
      }
      // Draw
      ctx.fillStyle = "#f5f5f5"; ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = "#ddd"; ctx.lineWidth = 0.5
      for (let i = 1; i < COLS; i++) { ctx.beginPath(); ctx.moveTo(i * colW, 0); ctx.lineTo(i * colW, H); ctx.stroke() }
      for (const t of tiles) {
        if (t.y + TILE_H < 0 || t.y > H) continue
        ctx.fillStyle = t.hit ? "#ddd" : "#111"
        ctx.fillRect(t.col * colW + 1, t.y + 1, colW - 2, TILE_H - 2)
        if (t.hit) { ctx.fillStyle = primary + "33"; ctx.fillRect(t.col * colW + 1, t.y + 1, colW - 2, TILE_H - 2) }
      }
      ctx.fillStyle = "#111"; ctx.font = "bold 10px monospace"; ctx.textAlign = "right"; ctx.textBaseline = "top"
      ctx.fillText(String(score), W - 6, 4)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}

