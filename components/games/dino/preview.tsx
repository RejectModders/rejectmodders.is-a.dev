"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

export function DinoPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const GY = H - 20, DW = 18, DH = 24
    const GRAVITY = 0.45, JUMP = -9

    const dino = { y: GY - DH, vy: 0, leg: 0 }
    const cacti: { x: number; w: number; h: number }[] = [
      { x: W + 20, w: 8, h: 20 }, { x: W + 140, w: 7, h: 28 }
    ]
    const clouds: { x: number; y: number; w: number }[] = [
      { x: 60, y: 14, w: 36 }, { x: 180, y: 20, w: 28 }, { x: 240, y: 10, w: 42 }
    ]
    let score = 0, speed = 2.5, frame = 0, raf = 0, lastJump = 0, groundX = 0

    const drawDino = (dx: number, dy: number) => {
      ctx.fillStyle = primary
      ctx.beginPath(); ctx.roundRect(dx + 1, dy + 4, DW - 2, DH - 8, 3); ctx.fill()
      ctx.beginPath(); ctx.roundRect(dx + DW - 9, dy - 7, 10, 12, 4); ctx.fill()
      ctx.fillStyle = "#000"
      ctx.beginPath(); ctx.arc(dx + DW - 3, dy - 3, 2.5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = primary
      // Tail
      ctx.beginPath(); ctx.roundRect(dx - 4, dy + 8, 6, 4, 2); ctx.fill()
      // Legs
      const isGrounded = dino.y >= GY - DH - 2
      if (isGrounded) {
        if (dino.leg === 0) {
          ctx.fillRect(dx + 2, dy + DH - 9, 5, 9)
          ctx.fillRect(dx + 9, dy + DH - 5, 5, 5)
        } else {
          ctx.fillRect(dx + 2, dy + DH - 5, 5, 5)
          ctx.fillRect(dx + 9, dy + DH - 9, 5, 9)
        }
      } else {
        ctx.fillRect(dx + 2, dy + DH - 7, 5, 7)
        ctx.fillRect(dx + 9, dy + DH - 7, 5, 7)
      }
    }

    const loop = () => {
      frame++
      speed = 2.5 + score / 600
      score++
      dino.leg = Math.floor(score / 6) % 2
      dino.vy += GRAVITY
      dino.y = Math.min(GY - DH, dino.y + dino.vy)
      if (dino.y >= GY - DH) { dino.vy = 0 }
      groundX = (groundX - speed * 2.2 + W * 4) % W

      // Auto jump
      const nearest = cacti.filter(c => c.x > 28).sort((a, b) => a.x - b.x)[0]
      if (nearest && nearest.x < 90 && dino.y >= GY - DH - 2 && frame - lastJump > 28) {
        dino.vy = JUMP; lastJump = frame
      }

      for (const c of cacti) { c.x -= speed }
      cacti.forEach((c, i) => {
        if (c.x < -20) {
          const prev = cacti[(i + 1) % 2]
          c.x = Math.max(W + 60, prev.x + 90 + Math.random() * 60)
          c.h = 18 + Math.random() * 22; c.w = 7 + Math.random() * 5
        }
      })
      for (const cl of clouds) { cl.x -= speed * 0.25; if (cl.x + cl.w < 0) cl.x = W + 10 }

      // Draw
      ctx.fillStyle = "#080808"; ctx.fillRect(0, 0, W, H)

      // Clouds
      ctx.fillStyle = "#ffffff0b"
      for (const c of clouds) {
        ctx.beginPath(); ctx.ellipse(c.x + c.w / 2, c.y, c.w / 2, c.w / 5, 0, 0, Math.PI * 2); ctx.fill()
      }

      // Ground
      ctx.strokeStyle = "#2a2a2a"; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(0, GY); ctx.lineTo(W, GY); ctx.stroke()
      ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 1; ctx.setLineDash([10, 18])
      ctx.beginPath(); ctx.moveTo(-groundX, GY + 6); ctx.lineTo(W - groundX + W, GY + 6); ctx.stroke()
      ctx.setLineDash([])

      // Cacti
      ctx.fillStyle = "#22c55e"
      for (const c of cacti) {
        ctx.beginPath(); ctx.roundRect(c.x, GY - c.h, c.w, c.h, 2); ctx.fill()
        ctx.beginPath(); ctx.roundRect(c.x - c.w * 0.7, GY - c.h * 0.7, c.w * 0.7, c.h * 0.28, 2); ctx.fill()
        ctx.beginPath(); ctx.roundRect(c.x + c.w, GY - c.h * 0.75, c.w * 0.7, c.h * 0.28, 2); ctx.fill()
      }

      // Dino
      drawDino(28, dino.y)

      // Score
      ctx.fillStyle = primary + "88"; ctx.font = "bold 10px monospace"; ctx.textAlign = "right"; ctx.textBaseline = "top"
      ctx.fillText(String(score).padStart(5, "0"), W - 6, 6)

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
