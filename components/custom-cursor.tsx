"use client"

import { useEffect, useRef, useState } from "react"

// Brand red
const CR = 220, CG = 38, CB = 38

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

interface Slash {
  x: number; y: number
  angle: number
  life: number
  len: number
}

interface Splat {
  x: number; y: number
  dx: number; dy: number
  life: number
  len: number
  thick: number
}

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

    // raw mouse
    let mx = 0, my = 0
    let px = 0, py = 0

    // crosshair — tight follow
    let cx = 0, cy = 0
    // ghost diamond — loose follow
    let gx = 0, gy = 0

    // velocity
    let vx = 0, vy = 0
    let speed = 0

    // state
    let hovering  = false
    let clicking  = false
    let visible_  = false
    let rafId: number

    // slash trail
    const slashes: Slash[] = []
    let slashTimer = 0

    // ink splats
    const splats: Splat[] = []

    // hover glow alpha (smooth)
    let hoverAlpha = 0

    // ── events ───────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      px = mx; py = my
      mx = e.clientX; my = e.clientY
      if (!visible_) { visible_ = true; setVisible(true) }
      const el = e.target as HTMLElement
      hovering = !!el.closest("a, button, [role='button'], input, textarea, select, .card-hover")
    }
    const onLeave = () => { visible_ = false; setVisible(false) }
    const onEnter = () => { visible_ = true;  setVisible(true) }
    const onDown  = () => {
      clicking = true
      const count = 10 + Math.floor(Math.random() * 5)
      const bias  = Math.atan2(vy, vx)
      for (let i = 0; i < count; i++) {
        const angle = bias + (Math.random() - 0.5) * Math.PI * 1.6
        const spd   = 2.5 + Math.random() * 5
        splats.push({
          x: mx, y: my,
          dx: Math.cos(angle) * spd,
          dy: Math.sin(angle) * spd,
          life:  1,
          len:   6 + Math.random() * 14,
          thick: 0.8 + Math.random() * 1.6,
        })
      }
    }
    const onUp = () => { clicking = false }

    document.addEventListener("mousemove",  onMove)
    document.addEventListener("mouseleave", onLeave)
    document.addEventListener("mouseenter", onEnter)
    document.addEventListener("mousedown",  onDown)
    document.addEventListener("mouseup",    onUp)

    // ── helpers ──────────────────────────────────────────────────────
    const col = (a: number) => `rgba(${CR},${CG},${CB},${clamp(a, 0, 1)})`

    const drawCrosshair = (x: number, y: number, armLen: number, gap: number, alpha: number) => {
      ctx.save()
      ctx.strokeStyle = col(alpha)
      ctx.lineWidth   = 1.5
      ctx.lineCap     = "round"
      ctx.beginPath(); ctx.moveTo(x,       y - gap); ctx.lineTo(x,           y - gap - armLen); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x,       y + gap); ctx.lineTo(x,           y + gap + armLen); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x - gap, y      ); ctx.lineTo(x - gap - armLen, y           ); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x + gap, y      ); ctx.lineTo(x + gap + armLen, y           ); ctx.stroke()
      ctx.restore()
    }

    // ── draw loop ────────────────────────────────────────────────────
    const draw = () => {
      rafId = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (!visible_) return

      const t = performance.now() / 1000

      vx    = lerp(vx, mx - px, 0.25)
      vy    = lerp(vy, my - py, 0.25)
      speed = clamp(Math.hypot(vx, vy), 0, 40)

      cx = lerp(cx, mx, 0.42)
      cy = lerp(cy, my, 0.42)
      gx = lerp(gx, mx, 0.10)
      gy = lerp(gy, my, 0.10)

      hoverAlpha = lerp(hoverAlpha, hovering ? 1 : 0, 0.12)

      // ── slash trail ──────────────────────────────────────────────
      slashTimer++
      if (speed > 2 && slashTimer % 3 === 0) {
        slashes.push({
          x: cx, y: cy,
          angle: Math.atan2(vy, vx) + Math.PI / 2,
          life:  1,
          len:   clamp(speed * 0.9, 4, 18),
        })
      }
      for (let i = slashes.length - 1; i >= 0; i--) {
        const s = slashes[i]
        s.life -= 0.055
        if (s.life <= 0) { slashes.splice(i, 1); continue }
        const hw = Math.cos(s.angle) * s.len * 0.5
        const hh = Math.sin(s.angle) * s.len * 0.5
        ctx.beginPath()
        ctx.moveTo(s.x - hw, s.y - hh)
        ctx.lineTo(s.x + hw, s.y + hh)
        ctx.strokeStyle = col(s.life * 0.45)
        ctx.lineWidth   = 1
        ctx.lineCap     = "round"
        ctx.stroke()
      }

      // ── tension line: ghost → crosshair ──────────────────────────
      const tensionDist = Math.hypot(cx - gx, cy - gy)
      if (tensionDist > 4) {
        ctx.save()
        ctx.setLineDash([3, 5])
        ctx.strokeStyle = col(clamp(tensionDist / 80, 0, 0.30))
        ctx.lineWidth   = 0.8
        ctx.beginPath()
        ctx.moveTo(gx, gy)
        ctx.lineTo(cx, cy)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()
      }

      // ── ghost diamond (squish along velocity) ────────────────────
      const breathe    = Math.sin(t * 1.8) * 0.06 + 1
      const baseR      = hovering ? 18 : 13
      const stretch    = clamp(speed / 14, 0, 0.6)
      const moveAngle  = Math.atan2(vy, vx)
      const ghostRx    = baseR * (1 + stretch) * breathe
      const ghostRy    = baseR * (1 - stretch * 0.5) * breathe
      const ghostA     = lerp(0.28, 0.60, hoverAlpha) + (clicking ? 0.15 : 0)

      ctx.save()
      ctx.translate(gx, gy)
      ctx.rotate(moveAngle + Math.PI / 4)
      ctx.strokeStyle = col(ghostA)
      ctx.lineWidth   = lerp(1.1, 1.9, hoverAlpha)
      ctx.beginPath()
      ctx.moveTo( ghostRx,  0); ctx.lineTo(0,  ghostRy)
      ctx.lineTo(-ghostRx,  0); ctx.lineTo(0, -ghostRy)
      ctx.closePath(); ctx.stroke()
      // inner echo
      ctx.strokeStyle = col(ghostA * 0.35)
      ctx.lineWidth   = 0.7
      ctx.beginPath()
      ctx.moveTo( ghostRx * 0.45,  0); ctx.lineTo(0,  ghostRy * 0.45)
      ctx.lineTo(-ghostRx * 0.45,  0); ctx.lineTo(0, -ghostRy * 0.45)
      ctx.closePath(); ctx.stroke()
      ctx.restore()

      // ── ink splats ────────────────────────────────────────────────
      for (let i = splats.length - 1; i >= 0; i--) {
        const s = splats[i]
        s.x += s.dx; s.y += s.dy
        s.dx *= 0.88; s.dy *= 0.88
        s.life -= 0.04
        if (s.life <= 0) { splats.splice(i, 1); continue }
        const a   = Math.atan2(s.dy, s.dx)
        const ex  = s.x + Math.cos(a) * s.len * s.life
        const ey  = s.y + Math.sin(a) * s.len * s.life
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(ex,  ey)
        ctx.strokeStyle = col(s.life * 0.85)
        ctx.lineWidth   = s.thick * s.life
        ctx.lineCap     = "round"
        ctx.stroke()
      }

      // ── crosshair ────────────────────────────────────────────────
      const armLen = hovering ? 11 : 7
      const armGap = clicking  ? 1 : 4
      drawCrosshair(cx, cy, armLen, armGap, 0.95)

      // 45° corner ticks — scope feel
      ctx.save()
      ctx.strokeStyle = col(0.40)
      ctx.lineWidth   = 1
      ctx.lineCap     = "round"
      for (const [sx, sy] of [[-1,-1],[1,-1],[1,1],[-1,1]] as [number,number][]) {
        ctx.beginPath()
        ctx.moveTo(cx + sx * (armGap + 2), cy + sy * (armGap + 2))
        ctx.lineTo(cx + sx * (armGap + armLen * 0.55), cy + sy * (armGap + armLen * 0.55))
        ctx.stroke()
      }
      ctx.restore()

      // center dot
      const dotR = clicking ? 1.5 : 2.5
      ctx.beginPath()
      ctx.arc(cx, cy, dotR, 0, Math.PI * 2)
      ctx.fillStyle = `rgb(${CR},${CG},${CB})`
      ctx.fill()

      // soft hover glow behind crosshair
      if (hoverAlpha > 0.01) {
        const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, armLen * 2.8)
        hg.addColorStop(0, col(0.16 * hoverAlpha))
        hg.addColorStop(1, col(0))
        ctx.beginPath()
        ctx.arc(cx, cy, armLen * 2.8, 0, Math.PI * 2)
        ctx.fillStyle = hg
        ctx.fill()
      }
    }

    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize",     resize)
      document.removeEventListener("mousemove",  onMove)
      document.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mouseenter", onEnter)
      document.removeEventListener("mousedown",  onDown)
      document.removeEventListener("mouseup",    onUp)
    }
  }, [])

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-9999"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
    />
  )
}
