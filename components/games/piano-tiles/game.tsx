"use client"
import { useEffect, useRef, useCallback, useState } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const COLS = 4, VISIBLE = 5, TILE_H = 120

export function PianoTilesGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const s = useRef({
    tiles: [] as { col: number; y: number; hit: boolean }[],
    speed: 3, score: 0, alive: true, started: false, raf: 0,
    lastTime: 0, spawnAccum: 0, hs: 0,
  })
  const [disp, setDisp] = useState({ score: 0, hs: 0, over: false, started: false })

  const W = 320, H = VISIBLE * TILE_H

  const spawnTile = useCallback(() => {
    const g = s.current
    g.tiles.push({ col: Math.floor(Math.random() * COLS), y: -TILE_H, hit: false })
  }, [])

  const reset = useCallback(() => {
    const g = s.current
    Object.assign(g, { tiles: [], speed: 3, score: 0, alive: true, started: false, lastTime: 0, spawnAccum: 0 })
    g.hs = loadHS()["piano-tiles"] ?? 0
    // Pre-spawn tiles
    for (let i = 0; i < VISIBLE + 1; i++) g.tiles.push({ col: Math.floor(Math.random() * COLS), y: -TILE_H + i * TILE_H, hit: false })
    setDisp({ score: 0, hs: g.hs, over: false, started: false })
  }, [])

  const tap = useCallback((col: number) => {
    const g = s.current
    if (!g.alive) { reset(); return }
    if (!g.started) g.started = true
    // Find the lowest unhit tile
    const candidates = g.tiles.filter(t => !t.hit && t.col === col && t.y + TILE_H > 0 && t.y < H)
    if (!candidates.length) {
      // Tapped wrong column — game over
      g.alive = false; saveHS("piano-tiles", g.score); g.hs = Math.max(g.hs, g.score)
      setDisp({ score: g.score, hs: g.hs, over: true, started: true })
      return
    }
    // Hit the lowest one
    candidates.sort((a, b) => b.y - a.y)
    candidates[0].hit = true
    g.score++; g.speed = 3 + g.score * 0.08
    if (g.score % 8 === 0) setDisp(d => ({ ...d, score: g.score }))
  }, [reset])

  useEffect(() => {
    reset()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    const colW = W / COLS

    const loop = (ts: number) => {
      const g = s.current
      const dt = g.lastTime === 0 ? 0 : Math.min((ts - g.lastTime) / 16.67, 3)
      g.lastTime = ts

      if (g.started && g.alive && dt > 0) {
        // Move tiles down
        for (const t of g.tiles) t.y += g.speed * dt
        // Spawn new tiles
        g.spawnAccum += g.speed * dt
        if (g.spawnAccum >= TILE_H) { g.spawnAccum -= TILE_H; spawnTile() }
        // Miss check — unhit tile went past bottom
        for (const t of g.tiles) {
          if (!t.hit && t.y > H) {
            g.alive = false; saveHS("piano-tiles", g.score); g.hs = Math.max(g.hs, g.score)
            setDisp({ score: g.score, hs: g.hs, over: true, started: true }); break
          }
        }
        // Cleanup
        g.tiles = g.tiles.filter(t => t.y < H + TILE_H)
        if (g.score % 4 === 0) setDisp(d => d.score !== g.score ? { ...d, score: g.score } : d)
      }

      // Draw
      ctx.fillStyle = "#f5f5f5"; ctx.fillRect(0, 0, W, H)
      // Column lines
      ctx.strokeStyle = "#ddd"; ctx.lineWidth = 1
      for (let i = 1; i < COLS; i++) { ctx.beginPath(); ctx.moveTo(i * colW, 0); ctx.lineTo(i * colW, H); ctx.stroke() }
      // Tiles
      for (const t of g.tiles) {
        if (t.y + TILE_H < 0 || t.y > H) continue
        ctx.fillStyle = t.hit ? "#ccc" : "#111"
        ctx.fillRect(t.col * colW + 2, t.y + 2, colW - 4, TILE_H - 4)
        if (t.hit) {
          ctx.fillStyle = primary + "44"
          ctx.fillRect(t.col * colW + 2, t.y + 2, colW - 4, TILE_H - 4)
        }
      }

      if (!g.started) {
        ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = "#fff"; ctx.font = "bold 24px monospace"; ctx.textAlign = "center"
        ctx.fillText("PIANO TILES", W / 2, H / 2 - 30)
        ctx.fillStyle = "#ccc"; ctx.font = "14px monospace"
        ctx.fillText("tap the black tiles!", W / 2, H / 2 + 10)
        if (g.hs > 0) { ctx.fillStyle = "#fbbf24"; ctx.fillText(`best: ${g.hs}`, W / 2, H / 2 + 35) }
      }
      if (!g.alive) {
        ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = "#ef4444"; ctx.font = "bold 22px monospace"; ctx.textAlign = "center"
        ctx.fillText("GAME OVER", W / 2, H / 2 - 30)
        ctx.fillStyle = "#fff"; ctx.font = "14px monospace"
        ctx.fillText(`score: ${g.score}`, W / 2, H / 2 + 5)
        if (g.hs > 0) { ctx.fillStyle = "#fbbf24"; ctx.fillText(`best: ${g.hs}`, W / 2, H / 2 + 30) }
        ctx.fillStyle = "#888"; ctx.font = "12px monospace"; ctx.fillText("tap to retry", W / 2, H / 2 + 60)
      }
      g.raf = requestAnimationFrame(loop)
    }
    s.current.raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(s.current.raf)
  }, [primary, reset, spawnTile])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (W / rect.width)
    const col = Math.floor(x / (W / COLS))
    tap(col)
  }, [tap])

  const handleTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    for (let i = 0; i < e.touches.length; i++) {
      const x = (e.touches[i].clientX - rect.left) * (W / rect.width)
      const col = Math.floor(x / (W / COLS))
      tap(col)
    }
  }, [tap])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full items-center justify-between" style={{ maxWidth: W }}>
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5" /> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-primary">score: {disp.score}</span>
          {disp.hs > 0 && <span className="text-muted-foreground">best: {disp.hs}</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <canvas ref={canvasRef} width={W} height={H}
        onClick={handleClick} onTouchStart={handleTouch}
        className="rounded-xl border border-primary/20 touch-none cursor-pointer"
        style={{ maxWidth: "100%", height: "auto" }} />
      <p className="font-mono text-xs text-muted-foreground">tap black tiles · don't miss · don't tap white</p>
    </div>
  )
}

