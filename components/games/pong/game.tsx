"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, RotateCcw, ChevronUp, ChevronDown } from "lucide-react"
import { loadHS, saveHS } from "../helpers"

const W = 600, H = 400
const PAD_H = 80, PAD_W = 10, BALL_R = 8
// All speeds in px/s — delta-time applied every frame
const INIT_BALL_SPD = 240   // starting speed
const MAX_BALL_SPD  = 480   // cap
const PAD_SPEED     = 320   // player paddle px/s
const AI_SPEED      = 230   // AI paddle px/s — deliberately slower so player can win

export function PongGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = useRef({
    ball: { x: W / 2, y: H / 2, vx: INIT_BALL_SPD, vy: 100 },
    p1: { y: H / 2 - PAD_H / 2 },
    p2: { y: H / 2 - PAD_H / 2 },
    score: { p1: 0, p2: 0 },
    keys: new Set<string>(),
    touchUp: false, touchDown: false,
    started: false, lastTime: 0, raf: 0, hs: 0,
  })
  const [display, setDisplay] = useState({ score: { p1: 0, p2: 0 }, started: false, hs: 0 })

  const launchBall = (toRight: boolean) => {
    const angle = (Math.random() * 0.5 - 0.25) // -0.25..0.25 rad
    const vx = (toRight ? 1 : -1) * INIT_BALL_SPD * Math.cos(angle)
    const vy = INIT_BALL_SPD * Math.sin(angle)
    return { x: W / 2, y: H / 2, vx, vy }
  }

  const reset = useCallback(() => {
    const s = state.current
    s.ball = launchBall(Math.random() > 0.5)
    s.p1 = { y: H / 2 - PAD_H / 2 }
    s.p2 = { y: H / 2 - PAD_H / 2 }
    s.score = { p1: 0, p2: 0 }
    s.started = false; s.lastTime = 0
    s.hs = loadHS()["pong"] ?? 0
    setDisplay({ score: { p1: 0, p2: 0 }, started: false, hs: s.hs })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    reset()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!

    const draw = (ts: number) => {
      const s = state.current
      const dt = s.lastTime === 0 ? 0 : Math.min((ts - s.lastTime) / 1000, 0.033)
      s.lastTime = ts

      // ── background ──────────────────────────────────────────────────────────
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)
      ctx.setLineDash([10, 8]); ctx.strokeStyle = "#ffffff12"; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke()
      ctx.setLineDash([])

      if (s.started && dt > 0) {
        // ── ball physics ───────────────────────────────────────────────────────
        s.ball.x += s.ball.vx * dt
        s.ball.y += s.ball.vy * dt

        // top/bottom walls
        if (s.ball.y - BALL_R < 0)  { s.ball.y = BALL_R;      s.ball.vy =  Math.abs(s.ball.vy) }
        if (s.ball.y + BALL_R > H)  { s.ball.y = H - BALL_R;  s.ball.vy = -Math.abs(s.ball.vy) }

        // ── player paddle (keyboard + touch) ──────────────────────────────────
        const goUp = s.keys.has("w") || s.keys.has("W") || s.keys.has("ArrowUp")   || s.touchUp
        const goDn = s.keys.has("s") || s.keys.has("S") || s.keys.has("ArrowDown") || s.touchDown
        if (goUp) s.p1.y = Math.max(0,          s.p1.y - PAD_SPEED * dt)
        if (goDn) s.p1.y = Math.min(H - PAD_H,  s.p1.y + PAD_SPEED * dt)

        // ── AI paddle ─────────────────────────────────────────────────────────
        const aiCenter = s.p2.y + PAD_H / 2
        if (aiCenter < s.ball.y - 6) s.p2.y = Math.min(H - PAD_H, s.p2.y + AI_SPEED * dt)
        else if (aiCenter > s.ball.y + 6) s.p2.y = Math.max(0,   s.p2.y - AI_SPEED * dt)

        // ── paddle collisions ─────────────────────────────────────────────────
        // left paddle (player)
        const p1Right = 20 + PAD_W
        if (s.ball.vx < 0 && s.ball.x - BALL_R <= p1Right && s.ball.x + BALL_R >= 20 &&
            s.ball.y >= s.p1.y && s.ball.y <= s.p1.y + PAD_H) {
          s.ball.x = p1Right + BALL_R
          s.ball.vx = Math.abs(s.ball.vx) * 1.06
          s.ball.vy += ((s.ball.y - (s.p1.y + PAD_H / 2)) / (PAD_H / 2)) * 80
        }
        // right paddle (AI)
        const p2Left = W - 20 - PAD_W
        if (s.ball.vx > 0 && s.ball.x + BALL_R >= p2Left && s.ball.x - BALL_R <= W - 20 &&
            s.ball.y >= s.p2.y && s.ball.y <= s.p2.y + PAD_H) {
          s.ball.x = p2Left - BALL_R
          s.ball.vx = -Math.abs(s.ball.vx) * 1.06
          s.ball.vy += ((s.ball.y - (s.p2.y + PAD_H / 2)) / (PAD_H / 2)) * 80
        }

        // clamp speed
        const spd = Math.hypot(s.ball.vx, s.ball.vy)
        if (spd > MAX_BALL_SPD) { s.ball.vx = s.ball.vx / spd * MAX_BALL_SPD; s.ball.vy = s.ball.vy / spd * MAX_BALL_SPD }

        // ── scoring ────────────────────────────────────────────────────────────
        if (s.ball.x < 0) {
          s.score.p2++
          s.ball = launchBall(true)   // serve toward player
          setDisplay(d => ({ ...d, score: { ...s.score } }))
        }
        if (s.ball.x > W) {
          s.score.p1++
          s.ball = launchBall(false)  // serve toward AI
          saveHS("pong", s.score.p1); s.hs = Math.max(s.hs, s.score.p1)
          setDisplay(d => ({ ...d, score: { ...s.score }, hs: s.hs }))
        }
      }

      // ── draw paddles ──────────────────────────────────────────────────────────
      ctx.fillStyle = primary
      ctx.beginPath(); ctx.roundRect(20, s.p1.y, PAD_W, PAD_H, 4); ctx.fill()
      // glow
      ctx.fillStyle = primary + "30"
      ctx.beginPath(); ctx.roundRect(20 - 4, s.p1.y - 2, PAD_W + 8, PAD_H + 4, 6); ctx.fill()

      ctx.fillStyle = "#777"
      ctx.beginPath(); ctx.roundRect(W - 20 - PAD_W, s.p2.y, PAD_W, PAD_H, 4); ctx.fill()

      // ── draw ball ─────────────────────────────────────────────────────────────
      ctx.fillStyle = primary + "35"
      ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, BALL_R + 5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = "#ffffff"
      ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2); ctx.fill()

      // ── scores ────────────────────────────────────────────────────────────────
      ctx.textAlign = "center"
      ctx.fillStyle = primary + "dd"; ctx.font = "bold 44px monospace"
      ctx.fillText(String(s.score.p1), W / 4, 58)
      ctx.fillStyle = "#444"; ctx.font = "bold 44px monospace"
      ctx.fillText(String(s.score.p2), (W / 4) * 3, 58)
      ctx.fillStyle = primary + "55"; ctx.font = "10px monospace"
      ctx.fillText("YOU", W / 4, 74); ctx.fillStyle = "#333"
      ctx.fillText("AI", (W / 4) * 3, 74)

      // ── start overlay ─────────────────────────────────────────────────────────
      if (!s.started) {
        ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = primary; ctx.font = "bold 34px monospace"; ctx.textAlign = "center"
        ctx.fillText("PONG", W / 2, H / 2 - 40)
        ctx.fillStyle = "#fff"; ctx.font = "14px monospace"
        ctx.fillText("W / S  or  ↑ / ↓  to move", W / 2, H / 2 + 2)
        ctx.fillStyle = "#888"; ctx.font = "12px monospace"
        ctx.fillText("press any key to start", W / 2, H / 2 + 26)
      }

      s.raf = requestAnimationFrame(draw)
    }
    state.current.raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(state.current.raf)
  }, [primary, reset])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      state.current.keys.add(e.key)
      if (!state.current.started) { state.current.started = true; setDisplay(d => ({ ...d, started: true })) }
      if (["ArrowUp","ArrowDown"," "].includes(e.key)) e.preventDefault()
    }
    const onUp = (e: KeyboardEvent) => state.current.keys.delete(e.key)
    window.addEventListener("keydown", onDown)
    window.addEventListener("keyup", onUp)
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp) }
  }, [])

  const startIfNeeded = () => {
    if (!state.current.started) { state.current.started = true; setDisplay(d => ({ ...d, started: true })) }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full items-center justify-between" style={{ maxWidth: W }}>
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> back
        </button>
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="text-primary">{display.score.p1} – {display.score.p2}</span>
          {display.hs > 0 && <span className="text-muted-foreground">best: {display.hs}</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary transition-colors">
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} width={W} height={H}
        className="rounded-xl border border-primary/30 touch-none select-none"
        style={{ maxWidth: "100%", height: "auto" }} />

      {/* Mobile touch controls */}
      <div className="flex items-center gap-6 md:hidden">
        <p className="font-mono text-xs text-muted-foreground">your paddle:</p>
        <div className="flex gap-3">
          <button
            onTouchStart={e => { e.preventDefault(); startIfNeeded(); state.current.touchUp = true }}
            onTouchEnd={e => { e.preventDefault(); state.current.touchUp = false }}
            onMouseDown={() => { startIfNeeded(); state.current.touchUp = true }}
            onMouseUp={() => { state.current.touchUp = false }}
            onMouseLeave={() => { state.current.touchUp = false }}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary select-none touch-none"
          ><ChevronUp className="h-7 w-7" /></button>
          <button
            onTouchStart={e => { e.preventDefault(); startIfNeeded(); state.current.touchDown = true }}
            onTouchEnd={e => { e.preventDefault(); state.current.touchDown = false }}
            onMouseDown={() => { startIfNeeded(); state.current.touchDown = true }}
            onMouseUp={() => { state.current.touchDown = false }}
            onMouseLeave={() => { state.current.touchDown = false }}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary select-none touch-none"
          ><ChevronDown className="h-7 w-7" /></button>
        </div>
      </div>
      <p className="font-mono text-xs text-muted-foreground hidden md:block">W / S or ↑ / ↓ to move · you vs AI</p>
    </div>
  )
}

