"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { loadHS, saveHS } from "../helpers"

const W = 420, H = 520
const PAD_W = 72, PAD_H = 12, BALL_R = 7
const PAD_Y = H - 48          // paddle Y position (fixed row)
const COLS = 10, ROWS = 6
const BRICK_W = (W - 20) / COLS
const BRICK_H = 16, BRICK_GAP = 3
// Speeds in px/s
const BALL_SPEED = 290
const PAD_SPEED  = 440

function makeBricks() {
  const colors = ["#ef4444","#f97316","#fbbf24","#22c55e","#3b82f6","#a855f7"]
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      x: 10 + c * BRICK_W,
      y: 55 + r * (BRICK_H + BRICK_GAP),
      alive: true,
      color: colors[r % colors.length],
    }))
  ).flat()
}

export function BreakoutGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = useRef({
    pad: W / 2 - PAD_W / 2,                   // just an X number
    ball: { x: W / 2, y: PAD_Y - 60, vx: 0, vy: 0 },
    bricks: makeBricks(),
    score: 0, lives: 3, alive: true, started: false,
    lastTime: 0, raf: 0, hs: 0,
    keys: new Set<string>(),
    touchX: null as number | null, // canvas-space X
  })
  const [display, setDisplay] = useState({ score: 0, lives: 3, alive: true, started: false, hs: 0, win: false })

  // Serve ball from paddle at a random upward angle
  const serveBall = (padX: number) => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 3)
    return {
      x: padX + PAD_W / 2,
      y: PAD_Y - BALL_R - 2,
      vx: BALL_SPEED * Math.cos(angle),
      vy: BALL_SPEED * Math.sin(angle),
    }
  }

  const reset = useCallback(() => {
    const s = state.current
    s.pad = W / 2 - PAD_W / 2
    s.ball = { x: W / 2, y: PAD_Y - BALL_R - 2, vx: 0, vy: 0 }
    s.bricks = makeBricks()
    s.score = 0; s.lives = 3; s.alive = true; s.started = false; s.lastTime = 0
    s.hs = loadHS()["breakout"] ?? 0
    setDisplay({ score: 0, lives: 3, alive: true, started: false, hs: s.hs, win: false })
  }, [])

  useEffect(() => {
    reset()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!

    // Scale canvas-coordinate touch from client coordinates
    const clientToCanvas = (clientX: number) => {
      const rect = canvas.getBoundingClientRect()
      return (clientX - rect.left) * (W / rect.width)
    }

    const draw = (ts: number) => {
      const s = state.current
      const dt = s.lastTime === 0 ? 0 : Math.min((ts - s.lastTime) / 1000, 0.033)
      s.lastTime = ts

      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)

      if (s.started && s.alive && dt > 0) {
        // ── paddle movement ─────────────────────────────────────────────────
        if (s.keys.has("ArrowLeft") || s.keys.has("a") || s.keys.has("A"))
          s.pad = Math.max(0, s.pad - PAD_SPEED * dt)
        if (s.keys.has("ArrowRight") || s.keys.has("d") || s.keys.has("D"))
          s.pad = Math.min(W - PAD_W, s.pad + PAD_SPEED * dt)
        if (s.touchX !== null)
          s.pad = Math.max(0, Math.min(W - PAD_W, s.touchX - PAD_W / 2))

        // ── ball movement ───────────────────────────────────────────────────
        s.ball.x += s.ball.vx * dt
        s.ball.y += s.ball.vy * dt

        // side walls
        if (s.ball.x - BALL_R < 0) { s.ball.x = BALL_R; s.ball.vx = Math.abs(s.ball.vx) }
        if (s.ball.x + BALL_R > W) { s.ball.x = W - BALL_R; s.ball.vx = -Math.abs(s.ball.vx) }
        // ceiling
        if (s.ball.y - BALL_R < 0) { s.ball.y = BALL_R; s.ball.vy = Math.abs(s.ball.vy) }

        // ── paddle collision ────────────────────────────────────────────────
        if (
          s.ball.vy > 0 &&
          s.ball.y + BALL_R >= PAD_Y &&
          s.ball.y + BALL_R <= PAD_Y + PAD_H + 4 &&
          s.ball.x >= s.pad && s.ball.x <= s.pad + PAD_W
        ) {
          s.ball.y = PAD_Y - BALL_R
          s.ball.vy = -Math.abs(s.ball.vy)
          // angle based on hit position — centre = straight up, edges = 60°
          const rel = (s.ball.x - (s.pad + PAD_W / 2)) / (PAD_W / 2)  // -1..1
          const angle = rel * (Math.PI / 3)
          const spd = Math.hypot(s.ball.vx, s.ball.vy)
          s.ball.vx = spd * Math.sin(angle)
          s.ball.vy = -spd * Math.cos(angle)
          // keep consistent speed
          const norm = Math.hypot(s.ball.vx, s.ball.vy)
          s.ball.vx = s.ball.vx / norm * BALL_SPEED
          s.ball.vy = s.ball.vy / norm * BALL_SPEED
        }

        // ── ball lost ───────────────────────────────────────────────────────
        if (s.ball.y - BALL_R > H) {
          s.lives--
          if (s.lives <= 0) {
            s.alive = false; saveHS("breakout", s.score)
            s.hs = Math.max(s.hs, s.score)
            setDisplay(d => ({ ...d, alive: false, lives: 0, hs: s.hs }))
          } else {
            s.ball = serveBall(s.pad)
            setDisplay(d => ({ ...d, lives: s.lives }))
          }
        }

        // ── brick collisions ────────────────────────────────────────────────
        for (const brick of s.bricks) {
          if (!brick.alive) continue
          const bRight  = brick.x + BRICK_W - BRICK_GAP
          const bBottom = brick.y + BRICK_H
          if (s.ball.x + BALL_R > brick.x && s.ball.x - BALL_R < bRight &&
              s.ball.y + BALL_R > brick.y && s.ball.y - BALL_R < bBottom) {
            brick.alive = false
            s.score += 10

            // overlap-based bounce axis
            const overlapL = s.ball.x + BALL_R - brick.x
            const overlapR = bRight - (s.ball.x - BALL_R)
            const overlapT = s.ball.y + BALL_R - brick.y
            const overlapB = bBottom - (s.ball.y - BALL_R)
            const minOverlapX = Math.min(overlapL, overlapR)
            const minOverlapY = Math.min(overlapT, overlapB)
            if (minOverlapX < minOverlapY) s.ball.vx *= -1
            else s.ball.vy *= -1

            setDisplay(d => ({ ...d, score: s.score }))
            break
          }
        }

        // ── win ─────────────────────────────────────────────────────────────
        if (s.bricks.every(b => !b.alive)) {
          s.alive = false; saveHS("breakout", s.score)
          s.hs = Math.max(s.hs, s.score)
          setDisplay(d => ({ ...d, alive: false, hs: s.hs, win: true }))
        }
      }

      // ── draw bricks ─────────────────────────────────────────────────────────
      state.current.bricks.forEach(brick => {
        if (!brick.alive) return
        ctx.fillStyle = brick.color
        ctx.beginPath(); ctx.roundRect(brick.x, brick.y, BRICK_W - BRICK_GAP, BRICK_H, 3); ctx.fill()
        ctx.fillStyle = "rgba(255,255,255,0.22)"
        ctx.fillRect(brick.x + 2, brick.y + 2, BRICK_W - BRICK_GAP - 4, 3)
      })

      // ── draw paddle ──────────────────────────────────────────────────────────
      const px = state.current.pad
      ctx.fillStyle = primary + "22"
      ctx.beginPath(); ctx.roundRect(px - 3, PAD_Y - 3, PAD_W + 6, PAD_H + 6, 7); ctx.fill()
      ctx.fillStyle = primary
      ctx.beginPath(); ctx.roundRect(px, PAD_Y, PAD_W, PAD_H, 5); ctx.fill()
      ctx.fillStyle = primary + "66"
      ctx.beginPath(); ctx.roundRect(px + 5, PAD_Y + 3, PAD_W - 10, 3, 2); ctx.fill()

      // ── draw ball ────────────────────────────────────────────────────────────
      ctx.fillStyle = primary + "30"
      ctx.beginPath(); ctx.arc(state.current.ball.x, state.current.ball.y, BALL_R + 4, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = "#ffffff"
      ctx.beginPath(); ctx.arc(state.current.ball.x, state.current.ball.y, BALL_R, 0, Math.PI * 2); ctx.fill()

      // ── lives ────────────────────────────────────────────────────────────────
      ctx.fillStyle = primary; ctx.font = "11px monospace"; ctx.textAlign = "left"
      for (let i = 0; i < state.current.lives; i++) {
        ctx.beginPath(); ctx.arc(14 + i * 20, H - 18, 5, 0, Math.PI * 2); ctx.fill()
      }

      // ── score ────────────────────────────────────────────────────────────────
      ctx.fillStyle = primary + "cc"; ctx.font = "bold 13px monospace"; ctx.textAlign = "right"
      ctx.fillText(`${state.current.score}`, W - 10, H - 12)

      // ── start overlay ────────────────────────────────────────────────────────
      if (!state.current.started) {
        ctx.fillStyle = "rgba(0,0,0,0.65)"; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = primary; ctx.font = "bold 28px monospace"; ctx.textAlign = "center"
        ctx.fillText("BREAKOUT", W / 2, H / 2 - 44)
        ctx.fillStyle = "#fff"; ctx.font = "14px monospace"
        ctx.fillText("← → / A D  to move", W / 2, H / 2 - 4)
        ctx.fillStyle = "#888"; ctx.font = "12px monospace"
        ctx.fillText("press any key or tap to start", W / 2, H / 2 + 22)
        if (state.current.hs > 0) { ctx.fillStyle = primary + "aa"; ctx.fillText(`best: ${state.current.hs}`, W / 2, H / 2 + 48) }
      }

      state.current.raf = requestAnimationFrame(draw)
    }
    state.current.raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(state.current.raf)
    // NOTE: no `display` in deps — avoids tearing down the loop every render
  }, [primary, reset])

  // Store clientToCanvas separately so touch handlers can call it
  const clientToCanvas = (clientX: number) => {
    const canvas = canvasRef.current; if (!canvas) return clientX
    const rect = canvas.getBoundingClientRect()
    return (clientX - rect.left) * (W / rect.width)
  }

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      state.current.keys.add(e.key)
      if (!state.current.started && state.current.alive) {
        state.current.started = true
        // serve ball on first keypress
        state.current.ball = serveBall(state.current.pad)
        setDisplay(d => ({ ...d, started: true }))
      }
      if (["ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault()
    }
    const onUp = (e: KeyboardEvent) => state.current.keys.delete(e.key)
    window.addEventListener("keydown", onDown)
    window.addEventListener("keyup", onUp)
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full items-center justify-between" style={{ maxWidth: W }}>
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> back
        </button>
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="text-primary">score: {display.score}</span>
          <span className="text-muted-foreground">lives: {display.lives}</span>
          <button onClick={reset} className="text-muted-foreground hover:text-primary transition-colors">
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="relative w-full" style={{ maxWidth: W }}>
        <canvas
          ref={canvasRef} width={W} height={H}
          className="rounded-xl border border-primary/30 touch-none select-none w-full"
          style={{ display: "block" }}
          onTouchStart={e => {
            e.preventDefault()
            const cx = clientToCanvas(e.touches[0].clientX)
            if (!state.current.started && state.current.alive) {
              state.current.started = true
              state.current.ball = serveBall(state.current.pad)
              setDisplay(d => ({ ...d, started: true }))
            }
            state.current.touchX = cx
          }}
          onTouchMove={e => { e.preventDefault(); state.current.touchX = clientToCanvas(e.touches[0].clientX) }}
          onTouchEnd={e => { e.preventDefault(); state.current.touchX = null }}
          onClick={() => {
            if (!state.current.started && state.current.alive) {
              state.current.started = true
              state.current.ball = serveBall(state.current.pad)
              setDisplay(d => ({ ...d, started: true }))
            }
          }}
        />
        {/* React overlay for game-over / win */}
        {!display.alive && display.started && (
          <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(0,0,0,0.78)" }}>
            <p className="font-bold text-2xl" style={{ color: display.win ? "#fbbf24" : "#fff" }}>
              {display.win ? "🎉 You Win!" : "Game Over"}
            </p>
            <p className="font-mono text-sm text-muted-foreground">score: {display.score}</p>
            {display.hs > 0 && <p className="font-mono text-xs text-primary/70">best: {display.hs}</p>}
            <button onClick={reset}
              className="mt-1 px-5 py-2 rounded-lg font-mono text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              play again
            </button>
          </div>
        )}
      </div>

      <p className="font-mono text-xs text-muted-foreground hidden md:block">← → to move paddle · drag on mobile</p>
      <p className="font-mono text-xs text-muted-foreground md:hidden">drag to move paddle</p>
    </div>
  )
}
