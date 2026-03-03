"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

export function SnakePreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const CELL = 13
    const COLS = Math.floor(W / CELL), ROWS = Math.floor(H / CELL)
    const STEP_MS = 95

    // boustrophedon (zigzag) fill — looks like a skilled player
    const buildPath = (): [number, number][] => {
      const p: [number, number][] = []
      for (let r = 1; r < ROWS - 1; r++) {
        if (r % 2 === 1) { for (let c = 1; c < COLS - 1; c++) p.push([r, c]) }
        else { for (let c = COLS - 2; c >= 1; c--) p.push([r, c]) }
      }
      return p
    }
    const PATH = buildPath()
    if (!PATH.length) return

    let headIdx = 0
    let len = 7
    const foodIdx = () => (headIdx + len + 6) % PATH.length
    let food = PATH[foodIdx()]
    let snake: [number, number][] = Array.from({ length: len }, (_, i) => PATH[(headIdx - i + PATH.length) % PATH.length])
    let lastStep = 0, raf = 0

    const draw = (now: number) => {
      if (now - lastStep >= STEP_MS) {
        lastStep = now
        headIdx = (headIdx + 1) % PATH.length
        const head = PATH[headIdx]
        snake = [head, ...snake.slice(0, len - 1)]
        if (head[0] === food[0] && head[1] === food[1]) {
          len = Math.min(len + 3, PATH.length - 5)
          food = PATH[foodIdx()]
        }
      }

      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = primary + "12"; ctx.lineWidth = 0.5
      for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke() }
      for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke() }

      const pulse = 0.78 + 0.22 * Math.sin(now / 200)
      ctx.fillStyle = "#fbbf24"
      ctx.beginPath(); ctx.arc(food[1] * CELL + CELL / 2, food[0] * CELL + CELL / 2, (CELL / 2 - 1) * pulse, 0, Math.PI * 2); ctx.fill()

      for (let i = snake.length - 1; i >= 0; i--) {
        const [r, c] = snake[i]
        ctx.globalAlpha = i === 0 ? 1 : Math.max(0.15, (1 - i / snake.length) * 0.9)
        ctx.fillStyle = primary
        const pad = i === 0 ? 1 : 2
        rr(ctx, c * CELL + pad, r * CELL + pad, CELL - pad * 2, CELL - pad * 2, i === 0 ? 4 : 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [primary])

  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}

