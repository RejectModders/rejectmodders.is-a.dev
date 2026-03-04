"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

export function SnakePreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const CELL = 11
    const COLS = Math.floor(W / CELL), ROWS = Math.floor(H / CELL)
    const STEP_MS = 80

    // Build a zig-zag demo path
    const buildPath = (): [number, number][] => {
      const p: [number, number][] = []
      for (let r = 1; r < ROWS - 1; r++) {
        if (r % 2 === 1) for (let c = 1; c < COLS - 1; c++) p.push([r, c])
        else for (let c = COLS - 2; c >= 1; c--) p.push([r, c])
      }
      return p
    }
    const PATH = buildPath()
    if (!PATH.length) return

    let headIdx = 0
    let len = 9
    const foodIdx = () => (headIdx + len + 8) % PATH.length
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
          len = Math.min(len + 4, PATH.length - 6)
          food = PATH[foodIdx()]
        }
      }

      ctx.fillStyle = "#080808"; ctx.fillRect(0, 0, W, H)

      // Grid dots
      ctx.fillStyle = "#ffffff07"
      for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
        ctx.fillRect(x * CELL + CELL / 2 - 0.5, y * CELL + CELL / 2 - 0.5, 1, 1)
      }

      // Food
      const pulse = 0.82 + 0.18 * Math.sin(now / 200)
      const fx = food[1] * CELL + CELL / 2, fy = food[0] * CELL + CELL / 2
      ctx.fillStyle = "#fbbf2466"
      ctx.beginPath(); ctx.arc(fx, fy, CELL * 0.55 * pulse, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = "#fbbf24"
      ctx.beginPath(); ctx.arc(fx, fy, CELL * 0.38 * pulse, 0, Math.PI * 2); ctx.fill()

      // Snake
      for (let i = snake.length - 1; i >= 0; i--) {
        const [r, c] = snake[i]
        const t = 1 - i / snake.length
        ctx.globalAlpha = Math.max(0.1, t * 0.9 + 0.1)
        ctx.fillStyle = primary
        const pad = i === 0 ? 1 : Math.min(3, 1 + i * 0.15)
        const radius = i === 0 ? 4 : 2
        ctx.beginPath()
        ctx.roundRect(c * CELL + pad, r * CELL + pad, CELL - pad * 2, CELL - pad * 2, radius)
        ctx.fill()
        if (i === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.2)"
          ctx.beginPath()
          ctx.roundRect(c * CELL + pad + 1, r * CELL + pad + 1, CELL - pad * 2 - 2, (CELL - pad * 2) / 2 - 1, 3)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [primary])

  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
