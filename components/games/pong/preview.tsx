"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

export function PongPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const PH = 30, PW = 6, BR = 4
    const BALL_SPD = 110, P1_SPD = 115, P2_SPD = 65

    let lt = 0, raf = 0
    let ball = { x: W * 0.35, y: H * 0.45, vx: BALL_SPD, vy: 40 }
    let p1y = H / 2 - PH / 2, p2y = H / 2 - PH / 2
    let sc = { l: 0, r: 0 }
    let p2err = 0, nextErrTime = 0

    const draw = (ts: number) => {
      const dt = lt === 0 ? 0 : Math.min((ts - lt) / 1000, 0.05); lt = ts

      if (dt > 0) {
        // Randomly make AI miss sometimes
        if (ts > nextErrTime) { p2err = (Math.random() - 0.5) * 28; nextErrTime = ts + 700 + Math.random() * 700 }

        // Move paddles
        const c1 = (cur: number, tgt: number) => { const d = tgt - PH / 2 - cur; return Math.max(0, Math.min(H - PH, cur + Math.sign(d) * Math.min(P1_SPD * dt, Math.abs(d)))) }
        const c2 = (cur: number, tgt: number) => { const d = (tgt + p2err) - PH / 2 - cur; return Math.max(0, Math.min(H - PH, cur + Math.sign(d) * Math.min(P2_SPD * dt, Math.abs(d)))) }

        p1y = c1(p1y, ball.vx < 0 ? ball.y : H / 2)
        p2y = c2(p2y, ball.vx > 0 ? ball.y : H / 2)

        ball.x += ball.vx * dt; ball.y += ball.vy * dt

        if (ball.y - BR < 0) { ball.y = BR; ball.vy = Math.abs(ball.vy) }
        if (ball.y + BR > H) { ball.y = H - BR; ball.vy = -Math.abs(ball.vy) }

        // Left paddle (player — matches game)
        const p1x = 13 + PW
        if (ball.x - BR < p1x && ball.x + BR > 13 && ball.y > p1y && ball.y < p1y + PH && ball.vx < 0) {
          ball.x = p1x + BR; ball.vx = Math.abs(ball.vx) * 1.04
          ball.vy += ((ball.y - (p1y + PH / 2)) / (PH / 2)) * 22
        }
        // Right paddle (AI)
        const p2x = W - 13 - PW
        if (ball.x + BR > p2x && ball.x - BR < W - 13 && ball.y > p2y && ball.y < p2y + PH && ball.vx > 0) {
          ball.x = p2x - BR; ball.vx = -Math.abs(ball.vx) * 1.04
          ball.vy += ((ball.y - (p2y + PH / 2)) / (PH / 2)) * 22
        }

        // Clamp speed
        const spd = Math.hypot(ball.vx, ball.vy)
        if (spd > 200) { ball.vx = ball.vx / spd * 200; ball.vy = ball.vy / spd * 200 }

        if (ball.x < 0) { sc.r++; p2err = 0; ball = { x: W / 2, y: H / 2, vx: BALL_SPD, vy: (Math.random() - 0.5) * 60 } }
        if (ball.x > W) { sc.l++; ball = { x: W / 2, y: H / 2, vx: -BALL_SPD, vy: (Math.random() - 0.5) * 60 } }
      }

      ctx.fillStyle = "#080808"; ctx.fillRect(0, 0, W, H)

      // Center dashed line
      ctx.setLineDash([5, 7]); ctx.strokeStyle = "#ffffff10"; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke()
      ctx.setLineDash([])

      // Scores
      ctx.fillStyle = primary + "99"; ctx.font = "bold 20px monospace"; ctx.textAlign = "center"
      ctx.fillText(String(sc.l), W / 4, 28)
      ctx.fillStyle = "#333"; ctx.fillText(String(sc.r), W * 3 / 4, 28)

      // Left paddle (primary — player) with glow
      ctx.fillStyle = primary + "2a"
      ctx.beginPath(); ctx.roundRect(13 - 4, p1y - 2, PW + 8, PH + 4, 5); ctx.fill()
      ctx.fillStyle = primary
      ctx.beginPath(); ctx.roundRect(13, p1y, PW, PH, 3); ctx.fill()

      // Right paddle (AI)
      ctx.fillStyle = "#555"
      ctx.beginPath(); ctx.roundRect(W - 13 - PW, p2y, PW, PH, 3); ctx.fill()

      // Ball glow
      ctx.fillStyle = primary + "33"
      ctx.beginPath(); ctx.arc(ball.x, ball.y, BR + 4, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = "#fff"
      ctx.beginPath(); ctx.arc(ball.x, ball.y, BR, 0, Math.PI * 2); ctx.fill()

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [primary])

  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
