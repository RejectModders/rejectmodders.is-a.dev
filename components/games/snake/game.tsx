"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, RotateCcw, ChevronUp, ChevronDown, ChevronRight } from "lucide-react"
import { loadHS, saveHS } from "../helpers"

const COLS = 24, ROWS = 20, CELL = 22

function rndFood(snake: {x:number;y:number}[]) {
  let f: {x:number;y:number}
  do { f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) } }
  while (snake.some(s => s.x === f.x && s.y === f.y))
  return f
}

export function SnakeGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = useRef({
    snake: [{ x: 12, y: 10 }],
    dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
    food: { x: 5, y: 5 },
    score: 0, alive: true, started: false, hs: 0,
    interval: 0 as unknown as ReturnType<typeof setInterval>,
    raf: 0,
    touchStartX: 0, touchStartY: 0,
    particles: [] as {x:number;y:number;vx:number;vy:number;life:number;maxLife:number;color:string}[],
    eatFlash: 0,
  })
  const [display, setDisplay] = useState({ score: 0, alive: true, started: false, hs: 0 })

  const reset = useCallback(() => {
    const s = state.current
    clearInterval(s.interval)
    s.snake = [{ x: 12, y: 10 }, { x: 11, y: 10 }, { x: 10, y: 10 }]
    s.dir = { x: 1, y: 0 }; s.nextDir = { x: 1, y: 0 }
    s.food = rndFood(s.snake)
    s.score = 0; s.alive = true; s.started = false
    s.particles = []; s.eatFlash = 0
    s.hs = loadHS()["snake"] ?? 0
    setDisplay({ score: 0, alive: true, started: false, hs: s.hs })
  }, [])

  const spawnParticles = (x: number, y: number, color: string, count = 8) => {
    const s = state.current
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const spd = 1.5 + Math.random() * 2
      s.particles.push({
        x: x * CELL + CELL / 2, y: y * CELL + CELL / 2,
        vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
        life: 1, maxLife: 0.4 + Math.random() * 0.4,
        color,
      })
    }
  }

  const steer = useCallback((nd: { x: number; y: number }) => {
    const s = state.current
    if (nd.x === -s.dir.x && nd.y === -s.dir.y) return
    s.nextDir = nd
    if (!s.started && s.alive) {
      s.started = true
      setDisplay(d => ({ ...d, started: true }))
      const SPEEDS = [160, 150, 135, 120, 105, 90]
      const getSpeed = () => Math.max(SPEEDS[SPEEDS.length-1], SPEEDS[Math.min(Math.floor(s.score / 5), SPEEDS.length-1)])
      const tick = () => {
        const ns = state.current
        if (!ns.alive) return
        ns.dir = { ...ns.nextDir }
        const head = { x: ns.snake[0].x + ns.dir.x, y: ns.snake[0].y + ns.dir.y }
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
          ns.alive = false; saveHS("snake", ns.score)
          ns.hs = Math.max(ns.hs, ns.score)
          // death particles along snake body
          ns.snake.forEach(seg => spawnParticles(seg.x, seg.y, primary, 3))
          setDisplay(d => ({ ...d, alive: false, hs: ns.hs }))
          clearInterval(ns.interval); return
        }
        if (ns.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
          ns.alive = false; saveHS("snake", ns.score)
          ns.hs = Math.max(ns.hs, ns.score)
          ns.snake.forEach(seg => spawnParticles(seg.x, seg.y, primary, 3))
          setDisplay(d => ({ ...d, alive: false, hs: ns.hs }))
          clearInterval(ns.interval); return
        }
        ns.snake.unshift(head)
        if (head.x === ns.food.x && head.y === ns.food.y) {
          ns.score++; ns.eatFlash = 8
          spawnParticles(ns.food.x, ns.food.y, "#fbbf24", 10)
          ns.food = rndFood(ns.snake)
          setDisplay(d => ({ ...d, score: ns.score }))
          // Speed up: restart interval at new speed
          clearInterval(ns.interval)
          ns.interval = setInterval(tick, getSpeed())
        } else {
          ns.snake.pop()
        }
      }
      s.interval = setInterval(tick, getSpeed())
    }
  }, [primary]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    reset()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    const W = COLS * CELL, H = ROWS * CELL

    const draw = (ts: number) => {
      const s = state.current
      ctx.fillStyle = "#080808"; ctx.fillRect(0, 0, W, H)

      // Subtle grid
      ctx.strokeStyle = "#ffffff09"; ctx.lineWidth = 0.5
      for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke() }
      for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke() }

      // Border
      ctx.strokeStyle = primary + "33"; ctx.lineWidth = 2
      ctx.strokeRect(1, 1, W - 2, H - 2)

      // Food — animated pulse
      if (s.alive || s.eatFlash > 0) {
        const pulse = 0.88 + 0.12 * Math.sin(ts / 220)
        const fx = s.food.x * CELL + CELL / 2, fy = s.food.y * CELL + CELL / 2
        const r = (CELL / 2 - 2) * pulse
        // Glow
        const grd = ctx.createRadialGradient(fx, fy, 0, fx, fy, r * 2)
        grd.addColorStop(0, "#fbbf2444")
        grd.addColorStop(1, "transparent")
        ctx.fillStyle = grd
        ctx.beginPath(); ctx.arc(fx, fy, r * 2, 0, Math.PI * 2); ctx.fill()
        // Apple dot
        ctx.fillStyle = "#fbbf24"
        ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = "#fff8"
        ctx.beginPath(); ctx.arc(fx - r * 0.28, fy - r * 0.28, r * 0.28, 0, Math.PI * 2); ctx.fill()
      }

      // Eat flash overlay
      if (s.eatFlash > 0) {
        s.eatFlash--
        ctx.fillStyle = `rgba(251,191,36,${s.eatFlash / 80})`
        ctx.fillRect(0, 0, W, H)
      }

      // Snake
      s.snake.forEach((seg, i) => {
        const isHead = i === 0
        const t = 1 - i / s.snake.length
        ctx.globalAlpha = Math.max(0.2, t * 0.95 + 0.05)
        ctx.fillStyle = isHead ? primary : primary + "cc"
        const pad = isHead ? 1 : Math.min(4, 1 + i * 0.15)
        const radius = isHead ? 6 : 3
        const x = seg.x * CELL + pad, y = seg.y * CELL + pad
        const sz = CELL - pad * 2
        ctx.beginPath()
        ctx.roundRect(x, y, sz, sz, radius)
        ctx.fill()
        // Head shine
        if (isHead) {
          ctx.fillStyle = "rgba(255,255,255,0.2)"
          ctx.beginPath()
          ctx.roundRect(x + 2, y + 2, sz - 4, sz / 2 - 2, 4)
          ctx.fill()
        }
      })
      ctx.globalAlpha = 1

      // Particles
      s.particles = s.particles.filter(p => p.life > 0)
      for (const p of s.particles) {
        p.x += p.vx; p.y += p.vy
        p.vy += 0.08 // slight gravity
        p.life -= 1 / (p.maxLife * 60)
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1

      // Overlays
      if (!s.started && s.alive) {
        ctx.fillStyle = "rgba(0,0,0,0.62)"; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = primary; ctx.font = "bold 30px monospace"; ctx.textAlign = "center"
        ctx.fillText("SNAKE", W / 2, H / 2 - 36)
        ctx.fillStyle = "#fff"; ctx.font = "13px monospace"
        ctx.fillText("arrow keys · WASD · swipe", W / 2, H / 2)
        ctx.fillStyle = "#555"; ctx.font = "12px monospace"
        ctx.fillText("walls & self = instant death", W / 2, H / 2 + 22)
        if (s.hs > 0) {
          ctx.fillStyle = "#fbbf24"; ctx.font = "bold 12px monospace"
          ctx.fillText(`best: ${s.hs}`, W / 2, H / 2 + 48)
        }
        ctx.fillStyle = primary + "aa"; ctx.font = "13px monospace"
        ctx.fillText("press any key to start", W / 2, H / 2 + 74)
      }
      if (!s.alive) {
        ctx.fillStyle = "rgba(0,0,0,0.72)"; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = "#ef4444"; ctx.font = "bold 32px monospace"; ctx.textAlign = "center"
        ctx.fillText("GAME OVER", W / 2, H / 2 - 44)
        ctx.fillStyle = "#fff"; ctx.font = "bold 22px monospace"
        ctx.fillText(`score: ${s.score}`, W / 2, H / 2 - 4)
        if (s.hs > 0) { ctx.fillStyle = "#fbbf24"; ctx.font = "bold 14px monospace"; ctx.fillText(`best: ${s.hs}`, W / 2, H / 2 + 26) }
        ctx.fillStyle = "#666"; ctx.font = "13px monospace"; ctx.fillText("press R or tap to restart", W / 2, H / 2 + 58)
      }

      s.raf = requestAnimationFrame(draw)
    }
    state.current.raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(state.current.raf); clearInterval(state.current.interval) }
  }, [primary, reset])

  // Keyboard
  useEffect(() => {
    const dirs: Record<string, { x: number; y: number }> = {
      ArrowUp: { x:0,y:-1 }, w: { x:0,y:-1 }, W: { x:0,y:-1 },
      ArrowDown: { x:0,y:1 }, s: { x:0,y:1 }, S: { x:0,y:1 },
      ArrowLeft: { x:-1,y:0 }, a: { x:-1,y:0 }, A: { x:-1,y:0 },
      ArrowRight: { x:1,y:0 }, d: { x:1,y:0 }, D: { x:1,y:0 },
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") { reset(); return }
      if (!state.current.alive && (e.key === " " || e.key === "Enter")) { reset(); return }
      if (dirs[e.key]) { e.preventDefault(); steer(dirs[e.key]) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [reset, steer])

  // Touch swipe
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    if (!state.current.alive) { reset(); return }
    state.current.touchStartX = e.touches[0].clientX
    state.current.touchStartY = e.touches[0].clientY
  }, [reset])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const dx = e.changedTouches[0].clientX - state.current.touchStartX
    const dy = e.changedTouches[0].clientY - state.current.touchStartY
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
    if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? { x:1,y:0 } : { x:-1,y:0 })
    else steer(dy > 0 ? { x:0,y:1 } : { x:0,y:-1 })
  }, [steer])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full max-w-[528px] items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> back
        </button>
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="text-primary font-bold">score: {display.score}</span>
          {display.hs > 0 && <span className="text-muted-foreground">best: {display.hs}</span>}
          <button onClick={reset} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
            <RotateCcw className="h-3 w-3" />
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
      <div className="grid grid-cols-3 gap-2 md:hidden w-44">
        <div />
        <button onTouchStart={e=>{e.preventDefault();steer({x:0,y:-1})}} onClick={()=>steer({x:0,y:-1})}
          className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none">
          <ChevronUp className="h-6 w-6" />
        </button>
        <div />
        <button onTouchStart={e=>{e.preventDefault();steer({x:-1,y:0})}} onClick={()=>steer({x:-1,y:0})}
          className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button onTouchStart={e=>{e.preventDefault();steer({x:0,y:1})}} onClick={()=>steer({x:0,y:1})}
          className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none">
          <ChevronDown className="h-6 w-6" />
        </button>
        <button onTouchStart={e=>{e.preventDefault();steer({x:1,y:0})}} onClick={()=>steer({x:1,y:0})}
          className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      <p className="font-mono text-xs text-muted-foreground hidden md:block">arrow keys / WASD · speed increases every 5 points</p>
    </div>
  )
}
