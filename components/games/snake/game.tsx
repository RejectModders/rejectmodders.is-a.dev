"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, RotateCcw, ChevronUp, ChevronDown, ChevronRight } from "lucide-react"
import { loadHS, saveHS } from "../helpers"

const COLS = 20, ROWS = 20, CELL = 20

export function SnakeGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = useRef({
    snake: [{ x: 10, y: 10 }],
    dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
    food: { x: 5, y: 5 },
    score: 0, alive: true, started: false, hs: 0,
    interval: 0 as unknown as ReturnType<typeof setInterval>,
    raf: 0,
    // swipe tracking
    touchStartX: 0, touchStartY: 0,
  })
  const [display, setDisplay] = useState({ score: 0, alive: true, started: false, hs: 0 })

  const rndFood = (snake: { x: number; y: number }[]) => {
    let f: { x: number; y: number }
    do { f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) } }
    while (snake.some(s => s.x === f.x && s.y === f.y))
    return f
  }

  const reset = useCallback(() => {
    const s = state.current
    clearInterval(s.interval)
    s.snake = [{ x: 10, y: 10 }]; s.dir = { x: 1, y: 0 }; s.nextDir = { x: 1, y: 0 }
    s.food = rndFood(s.snake); s.score = 0; s.alive = true; s.started = false
    s.hs = loadHS()["snake"] ?? 0
    setDisplay({ score: 0, alive: true, started: false, hs: s.hs })
  }, [])

  const steer = useCallback((nd: { x: number; y: number }) => {
    const s = state.current
    // prevent 180-degree turn
    if (nd.x === -s.dir.x && nd.y === -s.dir.y) return
    s.nextDir = nd
    if (!s.started && s.alive) {
      s.started = true
      setDisplay(d => ({ ...d, started: true }))
      s.interval = setInterval(() => {
        const ns = state.current
        if (!ns.alive) return
        ns.dir = { ...ns.nextDir }
        const head = { x: ns.snake[0].x + ns.dir.x, y: ns.snake[0].y + ns.dir.y }
        // wall collision kills
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
          ns.alive = false; saveHS("snake", ns.score)
          ns.hs = Math.max(ns.hs, ns.score)
          setDisplay(d => ({ ...d, alive: false, hs: ns.hs }))
          clearInterval(ns.interval); return
        }
        // self collision kills
        if (ns.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
          ns.alive = false; saveHS("snake", ns.score)
          ns.hs = Math.max(ns.hs, ns.score)
          setDisplay(d => ({ ...d, alive: false, hs: ns.hs }))
          clearInterval(ns.interval); return
        }
        ns.snake.unshift(head)
        if (head.x === ns.food.x && head.y === ns.food.y) {
          ns.score++; ns.food = rndFood(ns.snake)
          setDisplay(d => ({ ...d, score: ns.score }))
        } else ns.snake.pop()
      }, 130)
    }
  }, [])

  useEffect(() => {
    reset()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    const W = COLS * CELL, H = ROWS * CELL

    const draw = () => {
      const s = state.current
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)

      // wall border
      ctx.strokeStyle = primary + "44"; ctx.lineWidth = 2
      ctx.strokeRect(1, 1, W - 2, H - 2)

      // grid
      ctx.strokeStyle = primary + "11"; ctx.lineWidth = 0.5
      for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke() }
      for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke() }

      // food — pulsing
      const pulse = 0.85 + 0.15 * Math.sin(Date.now() / 280)
      const fx = s.food.x * CELL + CELL / 2, fy = s.food.y * CELL + CELL / 2
      ctx.fillStyle = "#fbbf24"
      ctx.beginPath(); ctx.arc(fx, fy, (CELL / 2 - 2) * pulse, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = "#fff"
      ctx.beginPath(); ctx.arc(fx - 2, fy - 2, 2, 0, Math.PI * 2); ctx.fill()

      // snake — draw tail-first so head is on top
      s.snake.forEach((seg, i) => {
        ctx.globalAlpha = i === 0 ? 1 : Math.max(0.25, 1 - i / s.snake.length)
        ctx.fillStyle = primary
        const pad = i === 0 ? 1 : 2
        ctx.beginPath()
        ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, i === 0 ? 5 : 3)
        ctx.fill()
      })
      ctx.globalAlpha = 1

      // overlays
      if (!s.started) {
        ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = primary; ctx.font = "bold 22px monospace"; ctx.textAlign = "center"
        ctx.fillText("SNAKE", W / 2, H / 2 - 30)
        ctx.fillStyle = "#fff"; ctx.font = "14px monospace"
        ctx.fillText("arrow keys / WASD / swipe", W / 2, H / 2 + 5)
        ctx.fillStyle = "#aaa"; ctx.font = "13px monospace"
        ctx.fillText("walls & self = death", W / 2, H / 2 + 28)
        if (s.hs > 0) { ctx.fillStyle = primary + "aa"; ctx.fillText(`best: ${s.hs}`, W / 2, H / 2 + 52) }
      }
      if (!s.alive) {
        ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = primary; ctx.font = "bold 26px monospace"; ctx.textAlign = "center"
        ctx.fillText("GAME OVER", W / 2, H / 2 - 40)
        ctx.fillStyle = "#fff"; ctx.font = "20px monospace"
        ctx.fillText(`score: ${s.score}`, W / 2, H / 2)
        if (s.hs > 0) { ctx.fillStyle = "#fbbf24"; ctx.font = "14px monospace"; ctx.fillText(`best: ${s.hs}`, W / 2, H / 2 + 30) }
        ctx.fillStyle = "#aaa"; ctx.font = "13px monospace"; ctx.fillText("press R or tap to restart", W / 2, H / 2 + 60)
      }

      s.raf = requestAnimationFrame(draw)
    }
    state.current.raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(state.current.raf); clearInterval(state.current.interval) }
  }, [primary, reset])

  // keyboard
  useEffect(() => {
    const dirs: Record<string, { x: number; y: number }> = {
      ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") { reset(); return }
      if (dirs[e.key]) { e.preventDefault(); steer(dirs[e.key]) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [reset, steer])

  // swipe on canvas
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const t = e.touches[0]
    state.current.touchStartX = t.clientX
    state.current.touchStartY = t.clientY
    if (!state.current.alive) { reset(); return }
  }, [reset])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const t = e.changedTouches[0]
    const dx = t.clientX - state.current.touchStartX
    const dy = t.clientY - state.current.touchStartY
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
    if (Math.abs(dx) > Math.abs(dy)) {
      steer(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 })
    } else {
      steer(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 })
    }
  }, [steer])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full max-w-sm items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> back
        </button>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-primary">score: {display.score}</span>
          <button onClick={reset} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
            <RotateCcw className="h-3 w-3" /> reset
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={COLS * CELL}
        height={ROWS * CELL}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="rounded-xl border border-primary/30 touch-none select-none"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      {/* Mobile d-pad */}
      <div className="grid grid-cols-3 gap-2 md:hidden w-40">
        <div />
        <button
          onTouchStart={e => { e.preventDefault(); steer({ x: 0, y: -1 }) }}
          onClick={() => steer({ x: 0, y: -1 })}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
        <div />
        <button
          onTouchStart={e => { e.preventDefault(); steer({ x: -1, y: 0 }) }}
          onClick={() => steer({ x: -1, y: 0 })}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onTouchStart={e => { e.preventDefault(); steer({ x: 0, y: 1 }) }}
          onClick={() => steer({ x: 0, y: 1 })}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
        <button
          onTouchStart={e => { e.preventDefault(); steer({ x: 1, y: 0 }) }}
          onClick={() => steer({ x: 1, y: 0 })}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      <p className="font-mono text-xs text-muted-foreground hidden md:block">arrow keys / WASD to move</p>
      <p className="font-mono text-xs text-muted-foreground md:hidden">swipe or use d-pad</p>
    </div>
  )
}

