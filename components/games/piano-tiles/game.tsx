"use client"
import { useEffect, useRef, useCallback, useState } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const COLS = 4, VISIBLE = 5, TILE_H = 120
const COUNTDOWN_SECS = 4   // seconds of blank board before tiles appear

export function PianoTilesGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const s = useRef({
    tiles: [] as { col: number; y: number; hit: boolean }[],
    speed: 3, score: 0, alive: true, started: false, raf: 0,
    lastTime: 0, spawnAccum: 0, hs: 0,
    // countdown: ms remaining before tiles start; -1 = tiles already rolling
    countdown: COUNTDOWN_SECS * 1000,
    countdownStart: 0,
  })
  const [disp, setDisp] = useState({ score: 0, hs: 0, over: false, started: false })

  const W = 320, H = VISIBLE * TILE_H

  const spawnTile = useCallback(() => {
    const g = s.current
    g.tiles.push({ col: Math.floor(Math.random() * COLS), y: -TILE_H, hit: false })
  }, [])

  const reset = useCallback(() => {
    const g = s.current
    Object.assign(g, {
      tiles: [],
      speed: 3, score: 0, alive: true, started: false,
      lastTime: 0, spawnAccum: 0,
      countdown: COUNTDOWN_SECS * 1000,
      countdownStart: 0,
    })
    g.hs = loadHS()["piano-tiles"] ?? 0
    setDisp({ score: 0, hs: g.hs, over: false, started: false })
  }, [])

  const tap = useCallback((col: number) => {
    const g = s.current
    // After game over — retry on tap
    if (!g.alive) { reset(); return }
    // During countdown the tap means "I'm ready" — don't do anything else
    if (g.countdown > 0) return
    if (!g.started) g.started = true
    // Find the lowest unhit tile in the tapped column that's inside the visible area
    const candidates = g.tiles.filter(t => !t.hit && t.col === col && t.y + TILE_H > 0 && t.y < H)
    if (!candidates.length) {
      // Tapped empty column — game over
      g.alive = false
      saveHS("piano-tiles", g.score)
      g.hs = Math.max(g.hs, g.score)
      setDisp({ score: g.score, hs: g.hs, over: true, started: true })
      return
    }
    // Hit the bottommost visible one
    candidates.sort((a, b) => b.y - a.y)
    candidates[0].hit = true
    g.score++
    g.speed = 3 + g.score * 0.08
    setDisp(d => ({ ...d, score: g.score }))
  }, [reset, H])

  useEffect(() => {
    reset()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    const colW = W / COLS

    const loop = (ts: number) => {
      const g = s.current
      const dt = g.lastTime === 0 ? 0 : Math.min((ts - g.lastTime) / 16.67, 3)
      g.lastTime = ts

      // ── Countdown phase ────────────────────────────────────────────
      if (g.countdown > 0) {
        if (g.countdownStart === 0) g.countdownStart = ts
        const elapsed = ts - g.countdownStart
        g.countdown = Math.max(0, COUNTDOWN_SECS * 1000 - elapsed)
        const secsLeft = Math.ceil(g.countdown / 1000)

        // Draw blank white board with countdown
        ctx.fillStyle = "#f5f5f5"
        ctx.fillRect(0, 0, W, H)
        // Column dividers
        ctx.strokeStyle = "#ddd"; ctx.lineWidth = 1
        for (let i = 1; i < COLS; i++) {
          ctx.beginPath(); ctx.moveTo(i * colW, 0); ctx.lineTo(i * colW, H); ctx.stroke()
        }
        // Overlay
        ctx.fillStyle = "rgba(0,0,0,0.55)"
        ctx.fillRect(0, 0, W, H)
        // Title
        ctx.fillStyle = "#fff"
        ctx.font = "bold 22px monospace"
        ctx.textAlign = "center"
        ctx.fillText("PIANO TILES", W / 2, H / 2 - 56)
        // Sub-text
        ctx.fillStyle = "#ccc"
        ctx.font = "13px monospace"
        ctx.fillText("tap the black tiles!", W / 2, H / 2 - 20)
        // Countdown number
        ctx.fillStyle = primary
        ctx.font = "bold 72px monospace"
        ctx.textAlign = "center"
        ctx.fillText(String(secsLeft), W / 2, H / 2 + 50)
        ctx.fillStyle = "#aaa"
        ctx.font = "11px monospace"
        ctx.fillText("get ready…", W / 2, H / 2 + 78)
        if (g.hs > 0) {
          ctx.fillStyle = "#fbbf24"
          ctx.font = "12px monospace"
          ctx.fillText(`best: ${g.hs}`, W / 2, H / 2 + 104)
        }

        g.raf = requestAnimationFrame(loop)
        return
      }

      // ── Active play phase ──────────────────────────────────────────
      if (g.alive && dt > 0) {
        // Move tiles down
        for (const t of g.tiles) t.y += g.speed * dt
        // Spawn new tiles when needed
        g.spawnAccum += g.speed * dt
        if (g.spawnAccum >= TILE_H) {
          g.spawnAccum -= TILE_H
          spawnTile()
        }
        // Seed initial tiles on the very first frame after countdown
        if (g.tiles.length === 0) {
          for (let i = 0; i < VISIBLE; i++) {
            g.tiles.push({ col: Math.floor(Math.random() * COLS), y: -TILE_H * (VISIBLE - i), hit: false })
          }
        }
        // Miss check — unhit tile scrolled below canvas bottom
        for (const t of g.tiles) {
          if (!t.hit && t.y > H) {
            g.alive = false
            saveHS("piano-tiles", g.score)
            g.hs = Math.max(g.hs, g.score)
            setDisp({ score: g.score, hs: g.hs, over: true, started: true })
            break
          }
        }
        // Prune off-screen tiles
        g.tiles = g.tiles.filter(t => t.y < H + TILE_H)
      }

      // Draw background + column dividers
      ctx.fillStyle = "#f5f5f5"
      ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = "#ddd"; ctx.lineWidth = 1
      for (let i = 1; i < COLS; i++) {
        ctx.beginPath(); ctx.moveTo(i * colW, 0); ctx.lineTo(i * colW, H); ctx.stroke()
      }

      // Draw tiles
      for (const t of g.tiles) {
        if (t.y + TILE_H < 0 || t.y > H) continue
        ctx.fillStyle = t.hit ? "#ccc" : "#111"
        ctx.fillRect(t.col * colW + 2, t.y + 2, colW - 4, TILE_H - 4)
        if (t.hit) {
          ctx.fillStyle = primary + "55"
          ctx.fillRect(t.col * colW + 2, t.y + 2, colW - 4, TILE_H - 4)
        }
      }

      // Game-over overlay
      if (!g.alive) {
        ctx.fillStyle = "rgba(0,0,0,0.7)"
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = "#ef4444"
        ctx.font = "bold 22px monospace"
        ctx.textAlign = "center"
        ctx.fillText("GAME OVER", W / 2, H / 2 - 30)
        ctx.fillStyle = "#fff"
        ctx.font = "14px monospace"
        ctx.fillText(`score: ${g.score}`, W / 2, H / 2 + 5)
        if (g.hs > 0) {
          ctx.fillStyle = "#fbbf24"
          ctx.fillText(`best: ${g.hs}`, W / 2, H / 2 + 30)
        }
        ctx.fillStyle = "#888"
        ctx.font = "12px monospace"
        ctx.fillText("tap to retry", W / 2, H / 2 + 60)
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
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> back
        </button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-primary">score: {disp.score}</span>
          {disp.hs > 0 && <span className="text-muted-foreground">best: {disp.hs}</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onClick={handleClick}
        onTouchStart={handleTouch}
        className="rounded-xl border border-primary/20 touch-none cursor-pointer"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <p className="font-mono text-xs text-muted-foreground">tap black tiles · don't miss · don't tap white</p>
    </div>
  )
}
