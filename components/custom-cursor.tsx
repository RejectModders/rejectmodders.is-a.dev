"use client"

import { useEffect, useRef, useState } from "react"

const lerp  = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

const R = 220, G = 38, B = 38
const rgb   = (a: number) => `rgba(${R},${G},${B},${clamp(a,0,1).toFixed(3)})`
const white = (a: number) => `rgba(255,255,255,${clamp(a,0,1).toFixed(3)})`

const TAIL_LEN = 18
const TAIL_GAP = 2

interface Ring { x: number; y: number; r: number; life: number; maxR: number }

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener("resize", resize)

    let mx = 0, my = 0
    let dx = 0, dy = 0   // dot  — fast
    let rx = 0, ry = 0   // ring — slow
    let vx = 0, vy = 0
    let speed = 0

    let clicking  = false
    let typing    = false
    let visible_  = false
    let rafId: number
    let frame = 0

    let clickBlend  = 0
    let typingBlend = 0

    const tail: { x: number; y: number }[] = Array.from({ length: TAIL_LEN }, () => ({ x: 0, y: 0 }))
    let tailHead = 0
    let tailFrame = 0

    const rings: Ring[] = []

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      if (!visible_) { visible_ = true; setVisible(true) }
      const el = e.target as HTMLElement
      typing = !!el.closest("input,textarea,[contenteditable]")
    }
    const onLeave = () => { visible_ = false; setVisible(false) }
    const onEnter = () => { visible_ = true;  setVisible(true)  }
    const onDown  = () => {
      clicking = true
      rings.push({ x: mx, y: my, r: 0, life: 1, maxR: 28 })
      setTimeout(() => { if (rings.length < 20) rings.push({ x: mx, y: my, r: 0, life: 1, maxR: 46 }) }, 70)
    }
    const onUp = () => { clicking = false }

    document.addEventListener("mousemove",  onMove)
    document.addEventListener("mouseleave", onLeave)
    document.addEventListener("mouseenter", onEnter)
    document.addEventListener("mousedown",  onDown)
    document.addEventListener("mouseup",    onUp)

    const drawIBeam = (x: number, y: number, a: number) => {
      const h = 20, cap = 6
      ctx.save()
      ctx.strokeStyle = rgb(a)
      ctx.lineWidth = 1.5
      ctx.lineCap = "round"
      ctx.beginPath(); ctx.moveTo(x, y - h/2); ctx.lineTo(x, y + h/2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x - cap/2, y - h/2); ctx.lineTo(x + cap/2, y - h/2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x - cap/2, y + h/2); ctx.lineTo(x + cap/2, y + h/2); ctx.stroke()
      ctx.restore()
    }

    const draw = () => {
      rafId = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (!visible_) return
      frame++

      // velocity
      vx    = lerp(vx, mx - dx, 0.3)
      vy    = lerp(vy, my - dy, 0.3)
      speed = clamp(Math.hypot(vx, vy), 0, 50)

      // dot follows mouse directly, ring lags behind
      dx = lerp(dx, mx, 0.55)
      dy = lerp(dy, my, 0.55)
      rx = lerp(rx, mx, 0.10)
      ry = lerp(ry, my, 0.10)

      clickBlend  = lerp(clickBlend,  clicking ? 1 : 0, 0.30)
      typingBlend = lerp(typingBlend, typing   ? 1 : 0, 0.18)

      // tail
      tailFrame++
      if (tailFrame % TAIL_GAP === 0) {
        tail[tailHead] = { x: dx, y: dy }
        tailHead = (tailHead + 1) % TAIL_LEN
      }

      // 1. comet tail
      if (speed > 1) {
        for (let i = 0; i < TAIL_LEN - 1; i++) {
          const ai = (tailHead + i)     % TAIL_LEN
          const bi = (tailHead + i + 1) % TAIL_LEN
          const t  = i / (TAIL_LEN - 1)
          const a  = t * t * 0.5 * clamp(speed / 12, 0, 1) * (1 - typingBlend)
          if (a < 0.005) continue
          ctx.beginPath()
          ctx.moveTo(tail[ai].x, tail[ai].y)
          ctx.lineTo(tail[bi].x, tail[bi].y)
          ctx.strokeStyle = rgb(a)
          ctx.lineWidth   = lerp(0.4, 2.0, t)
          ctx.lineCap     = "round"
          ctx.stroke()
        }
      }

      // 2. click shockwave rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const rg = rings[i]
        rg.life -= 0.04
        if (rg.life <= 0) { rings.splice(i, 1); continue }
        rg.r = rg.maxR * (1 - rg.life)
        const ea = rg.life * rg.life
        ctx.beginPath()
        ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2)
        ctx.strokeStyle = rgb(ea * 0.65)
        ctx.lineWidth   = 1.5 * ea
        ctx.stroke()
      }

      // 3. outer ring — plain circle, stretches with velocity
      const breathe = Math.sin(frame * 0.025) * 0.03 + 1
      const baseR   = 18 * breathe * lerp(1, 0.8, clickBlend)
      const stretch = clamp(speed / 20, 0, 0.55)
      const angle   = Math.atan2(vy, vx)
      ctx.save()
      ctx.translate(rx, ry)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.ellipse(0, 0, baseR * (1 + stretch), baseR * (1 - stretch * 0.45), 0, 0, Math.PI * 2)
      ctx.strokeStyle = rgb(0.28 + clickBlend * 0.25)
      ctx.lineWidth   = 1.1
      ctx.stroke()
      ctx.restore()

      // 4. dot / i-beam
      if (typingBlend > 0.05) {
        const t_ = performance.now() / 1000
        const blink = Math.sin(t_ * Math.PI * 1.4) * 0.5 + 0.5
        drawIBeam(dx, dy, typingBlend * lerp(0.5, 1, blink * 0.6 + 0.4))
      }
      if (typingBlend < 0.95) {
        const dotR = lerp(2.5, 2.5, 0) * lerp(1, 0.5, clickBlend) * (1 - typingBlend * 0.85)
        if (dotR > 0.2) {
          const glow = ctx.createRadialGradient(dx, dy, 0, dx, dy, dotR * 5)
          glow.addColorStop(0, rgb(0.22 * (1 - typingBlend)))
          glow.addColorStop(1, rgb(0))
          ctx.beginPath(); ctx.arc(dx, dy, dotR * 5, 0, Math.PI * 2)
          ctx.fillStyle = glow; ctx.fill()
          ctx.beginPath(); ctx.arc(dx, dy, dotR, 0, Math.PI * 2)
          ctx.fillStyle = `rgb(${R},${G},${B})`; ctx.fill()
          ctx.beginPath(); ctx.arc(dx - dotR * 0.3, dy - dotR * 0.3, dotR * 0.35, 0, Math.PI * 2)
          ctx.fillStyle = white(0.5); ctx.fill()
        }
      }

      // 5. lag thread
      const lag = Math.hypot(dx - rx, dy - ry)
      if (lag > 10 && typingBlend < 0.4) {
        ctx.save()
        ctx.setLineDash([2, 5])
        ctx.strokeStyle = rgb(clamp(lag / 100, 0, 0.15))
        ctx.lineWidth   = 0.6
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(dx, dy); ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()
      }
    }

    dx = rx = mx = window.innerWidth  / 2
    dy = ry = my = window.innerHeight / 2
    tail.forEach(p => { p.x = dx; p.y = dy })
    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize",      resize)
      document.removeEventListener("mousemove",  onMove)
      document.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mouseenter", onEnter)
      document.removeEventListener("mousedown",  onDown)
      document.removeEventListener("mouseup",    onUp)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.25s ease" }}
    />
  )
}
