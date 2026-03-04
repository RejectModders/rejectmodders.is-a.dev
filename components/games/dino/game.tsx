"use client"
import { useEffect, useRef, useCallback, useState } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const W = 600, H = 220
const GY = H - 48             // ground Y
const DINO_W = 30, DINO_H = 38
const GRAVITY = 0.7
const JUMP_FORCE = -13

interface Obstacle { x: number; w: number; h: number; hasArm: boolean }
interface Cloud { x: number; y: number; w: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; r: number }

export function DinoGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const s = useRef({
    y: GY - DINO_H, vy: 0, score: 0, hs: 0,
    speed: 5, alive: true, started: false,
    obstacles: [] as Obstacle[],
    clouds: [] as Cloud[],
    particles: [] as Particle[],
    frame: 0, legPhase: 0, dist: 0,
    spawnAccum: 0, lastTime: 0, raf: 0,
    groundX: 0, // scrolling ground offset
    hiScore: false,
  })
  const [disp, setDisp] = useState({ score: 0, hs: 0, over: false })

  const jump = useCallback(() => {
    const g = s.current
    if (!g.started) g.started = true
    if (g.y >= GY - DINO_H - 2 && g.alive) g.vy = JUMP_FORCE
  }, [])

  const spawnParticles = (x: number, y: number, color: string, n = 8) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const spd = 1 + Math.random() * 3
      s.current.particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 2, life: 1, r: 2 + Math.random() * 3 })
    }
  }

  const reset = useCallback(() => {
    const g = s.current
    Object.assign(g, { y: GY-DINO_H, vy:0, score:0, speed:5, alive:true, started:false, obstacles:[], particles:[], frame:0, dist:0, lastTime:0, spawnAccum:0, groundX:0, hiScore:false })
    g.hs = loadHS()["dino"] ?? 0
    // Pre-generate clouds
    g.clouds = Array.from({ length: 5 }, (_, i) => ({ x: 80 + i * 130, y: 25 + Math.random() * 45, w: 40 + Math.random() * 50 }))
    setDisp({ score: 0, hs: g.hs, over: false })
  }, [])

  useEffect(() => {
    reset()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!

    const drawDino = (dx: number, dy: number, alive: boolean, legPhase: number, jumping: boolean) => {
      ctx.fillStyle = primary
      // Body
      ctx.beginPath(); ctx.roundRect(dx + 2, dy + 6, DINO_W - 4, DINO_H - 12, 4); ctx.fill()
      // Head
      ctx.beginPath(); ctx.roundRect(dx + DINO_W - 14, dy - 10, 16, 18, 5); ctx.fill()
      // Eye
      ctx.fillStyle = "#000"
      ctx.beginPath(); ctx.arc(dx + DINO_W - 4, dy - 5, 3, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = "#fff"
      ctx.beginPath(); ctx.arc(dx + DINO_W - 5, dy - 6, 1.5, 0, Math.PI * 2); ctx.fill()
      // Nostril
      ctx.fillStyle = "#00000066"
      ctx.beginPath(); ctx.arc(dx + DINO_W + 1, dy - 3, 1.5, 0, Math.PI * 2); ctx.fill()
      // Arm
      ctx.fillStyle = primary
      ctx.beginPath(); ctx.roundRect(dx + DINO_W - 12, dy + 8, 8, 5, 2); ctx.fill()
      // Tail
      ctx.beginPath(); ctx.roundRect(dx - 6, dy + 12, 10, 6, 3); ctx.fill()
      ctx.beginPath(); ctx.roundRect(dx - 12, dy + 14, 8, 5, 3); ctx.fill()
      // Legs
      ctx.fillStyle = primary
      if (alive && !jumping) {
        if (legPhase === 0) {
          ctx.fillRect(dx + 4, dy + DINO_H - 14, 7, 14)
          ctx.fillRect(dx + 14, dy + DINO_H - 8, 7, 8)
        } else {
          ctx.fillRect(dx + 4, dy + DINO_H - 8, 7, 8)
          ctx.fillRect(dx + 14, dy + DINO_H - 14, 7, 14)
        }
      } else {
        ctx.fillRect(dx + 4, dy + DINO_H - 10, 7, 10)
        ctx.fillRect(dx + 14, dy + DINO_H - 10, 7, 10)
      }
    }

    const loop = (ts: number) => {
      const g = s.current
      const dt = g.lastTime === 0 ? 1 : Math.min((ts - g.lastTime) / 16.67, 3)
      g.lastTime = ts
      g.frame++

      if (g.started && g.alive && dt > 0) {
        g.vy += GRAVITY * dt
        g.y = Math.min(GY - DINO_H, g.y + g.vy * dt)
        const isGrounded = g.y >= GY - DINO_H - 1
        if (isGrounded) g.vy = Math.min(g.vy, 0)

        g.score += Math.round(dt * 1.2)
        g.dist += dt
        g.speed = 5 + g.score / 280
        g.legPhase = Math.floor(g.score / 8) % 2
        g.groundX = (g.groundX - g.speed * dt * 2 + W * 2) % W

        // Clouds scroll slowly
        for (const c of g.clouds) { c.x -= g.speed * dt * 0.3; if (c.x + c.w < 0) c.x = W + 10 }

        // Spawn obstacles
        const spawnInterval = Math.max(28, 80 - g.speed * 6)
        g.spawnAccum += dt
        if (g.spawnAccum >= spawnInterval) {
          g.spawnAccum = 0
          const last = g.obstacles.at(-1)
          const minGap = Math.max(70, 200 - g.speed * 12)
          if (!last || last.x < W - minGap) {
            const h = 22 + Math.random() * 30
            const w = 10 + Math.random() * 8
            const hasArm = Math.random() > 0.4
            g.obstacles.push({ x: W + 10, w, h, hasArm })
          }
        }

        g.obstacles = g.obstacles.filter(o => { o.x -= g.speed * dt; return o.x > -40 })

        // Update score display
        if (g.frame % 5 === 0) setDisp(d => d.score !== g.score ? { ...d, score: g.score } : d)

        // Collision (tight box)
        const dinoLeft = 42, dinoRight = 42 + DINO_W - 4
        for (const o of g.obstacles) {
          const oLeft = o.x + 2, oRight = o.x + o.w - 2
          const oTop = GY - o.h + 2
          if (dinoRight > oLeft && dinoLeft < oRight && g.y + DINO_H - 4 > oTop) {
            g.alive = false
            // If new high score
            const prevHs = g.hs
            saveHS("dino", g.score)
            g.hs = Math.max(g.hs, g.score)
            g.hiScore = g.hs > prevHs
            // Burst particles at dino pos
            spawnParticles(42 + DINO_W / 2, g.y + DINO_H / 2, primary, 14)
            setDisp({ score: g.score, hs: g.hs, over: true })
            break
          }
        }
      }

      // Update particles
      g.particles = g.particles.filter(p => p.life > 0)
      for (const p of g.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.04 }

      // ── Draw ──
      ctx.fillStyle = "#080808"; ctx.fillRect(0, 0, W, H)

      // Clouds
      ctx.fillStyle = "#ffffff0a"
      for (const c of g.clouds) {
        ctx.beginPath(); ctx.ellipse(c.x + c.w / 2, c.y, c.w / 2, c.w / 4.5, 0, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.ellipse(c.x + c.w * 0.3, c.y + 4, c.w * 0.3, c.w / 5, 0, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.ellipse(c.x + c.w * 0.7, c.y + 2, c.w * 0.3, c.w / 6, 0, 0, Math.PI * 2); ctx.fill()
      }

      // Ground lines (scrolling)
      ctx.strokeStyle = "#2a2a2a"; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(0, GY); ctx.lineTo(W, GY); ctx.stroke()
      // Dashes on ground
      ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 1; ctx.setLineDash([12, 20])
      ctx.beginPath(); ctx.moveTo(-g.groundX, GY + 8); ctx.lineTo(W - g.groundX + W, GY + 8); ctx.stroke()
      ctx.setLineDash([])

      // Score display
      ctx.fillStyle = primary + "88"; ctx.font = "bold 13px monospace"; ctx.textAlign = "right"; ctx.textBaseline = "top"
      ctx.fillText(String(g.score).padStart(5, "0"), W - 10, 10)
      if (g.hs > 0) { ctx.fillStyle = "#ffffff33"; ctx.fillText(`HI ${String(g.hs).padStart(5, "0")}`, W - 80, 10) }

      // Obstacles (pixel-art cacti)
      ctx.fillStyle = "#22c55e"
      for (const o of g.obstacles) {
        const ox = o.x, oy = GY - o.h
        // Main trunk
        ctx.beginPath(); ctx.roundRect(ox, oy, o.w, o.h, 3); ctx.fill()
        // Arms
        if (o.hasArm) {
          const armH = o.h * 0.3, armY = oy + o.h * 0.25
          ctx.beginPath(); ctx.roundRect(ox - o.w * 0.9, armY, o.w * 0.9, armH * 0.6, 2); ctx.fill()
          ctx.beginPath(); ctx.roundRect(ox - o.w * 0.9, armY - armH * 0.6, o.w * 0.5, armH * 0.6, 2); ctx.fill()
          ctx.beginPath(); ctx.roundRect(ox + o.w, armY + o.h * 0.1, o.w * 0.9, armH * 0.6, 2); ctx.fill()
          ctx.beginPath(); ctx.roundRect(ox + o.w * 0.5, armY + o.h * 0.1 - armH * 0.6, o.w * 0.5, armH * 0.6, 2); ctx.fill()
        }
        // Highlight
        ctx.fillStyle = "#34d36044"
        ctx.beginPath(); ctx.roundRect(ox + 2, oy + 2, o.w - 4, 6, 2); ctx.fill()
        ctx.fillStyle = "#22c55e"
      }

      // Dino
      const jumping = g.y < GY - DINO_H - 2
      drawDino(42, g.y, g.alive, g.legPhase, jumping)

      // Particles
      for (const p of g.particles) {
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = primary
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1

      // Start screen
      if (!g.started) {
        ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = primary; ctx.font = "bold 26px monospace"; ctx.textAlign = "center"
        ctx.fillText("DINO RUN", W / 2, H / 2 - 24)
        ctx.fillStyle = "#aaa"; ctx.font = "13px monospace"
        ctx.fillText("space / ↑ / tap  to jump", W / 2, H / 2 + 6)
        if (g.hs > 0) { ctx.fillStyle = "#fbbf24"; ctx.font = "bold 12px monospace"; ctx.fillText(`best: ${g.hs}`, W / 2, H / 2 + 30) }
        ctx.fillStyle = primary + "77"; ctx.font = "12px monospace"
        ctx.fillText("press any key to begin", W / 2, H / 2 + 52)
      }

      // Game over
      if (!g.alive) {
        ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = "#ef4444"; ctx.font = "bold 28px monospace"; ctx.textAlign = "center"
        ctx.fillText("GAME OVER", W / 2, H / 2 - 28)
        ctx.fillStyle = "#fff"; ctx.font = "bold 18px monospace"
        ctx.fillText(`score: ${g.score}`, W / 2, H / 2 + 4)
        if (g.hs > 0) {
          ctx.fillStyle = g.hiScore ? "#fbbf24" : "#888"
          ctx.font = `${g.hiScore ? "bold " : ""}13px monospace`
          ctx.fillText(g.hiScore ? `NEW BEST: ${g.hs}` : `best: ${g.hs}`, W / 2, H / 2 + 28)
        }
        ctx.fillStyle = "#555"; ctx.font = "12px monospace"; ctx.fillText("space / tap to retry", W / 2, H / 2 + 52)
      }

      g.raf = requestAnimationFrame(loop)
    }
    s.current.raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(s.current.raf)
  }, [primary, reset])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault()
        if (!s.current.alive) reset(); else jump()
      }
      if (e.key === "r" || e.key === "R") reset()
    }
    window.addEventListener("keydown", down)
    return () => window.removeEventListener("keydown", down)
  }, [jump, reset])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full items-center justify-between" style={{ maxWidth: W }}>
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> back
        </button>
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="text-primary font-bold">{String(disp.score).padStart(5, "0")}</span>
          {disp.hs > 0 && <span className="text-muted-foreground">best: {disp.hs}</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3 w-3" /></button>
        </div>
      </div>
      <canvas
        ref={canvasRef} width={W} height={H}
        className="rounded-xl border border-primary/20 touch-none cursor-pointer select-none"
        style={{ maxWidth: "100%", height: "auto" }}
        onClick={() => { if (!s.current.alive) reset(); else jump() }}
      />
      <p className="font-mono text-xs text-muted-foreground">space / ↑ / tap to jump · avoid cacti</p>
    </div>
  )
}
