"use client"

import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

// ── Preview Constants ────────────────────────────────────────────────────────
const CELL = 10
const SPEED = 100 // Slightly slower for preview

export function SnakePreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const W = canvas.width
    const H = canvas.height
    const COLS = Math.floor(W / CELL)
    const ROWS = Math.floor(H / CELL)

    // Game state
    let snake = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ]
    let direction = { x: 1, y: 0 }
    let nextDirection = { x: 1, y: 0 }
    let food = { x: 14, y: 8 }
    let lastMove = 0
    let raf = 0
    let movesSinceLastTurn = 0
    let targetDirection: { x: number; y: number } | null = null

    const randomFood = () => {
      let f
      do {
        f = {
          x: Math.floor(Math.random() * (COLS - 2)) + 1,
          y: Math.floor(Math.random() * (ROWS - 2)) + 1,
        }
      } while (snake.some((s) => s.x === f.x && s.y === f.y))
      return f
    }

    const resetGame = () => {
      snake = [
        { x: 8, y: 8 },
        { x: 7, y: 8 },
        { x: 6, y: 8 },
      ]
      direction = { x: 1, y: 0 }
      nextDirection = { x: 1, y: 0 }
      food = randomFood()
      movesSinceLastTurn = 0
      targetDirection = null
    }

    // Human-like AI: doesn't always take optimal path, reacts with delay
    const thinkLikeHuman = () => {
      const head = snake[0]
      movesSinceLastTurn++

      // Humans don't turn every single frame - keep going straight sometimes
      if (movesSinceLastTurn < 2 + Math.floor(Math.random() * 2)) {
        // Check if we can continue in current direction
        const nextPos = { x: head.x + direction.x, y: head.y + direction.y }
        const willHitWall = nextPos.x < 0 || nextPos.x >= COLS || nextPos.y < 0 || nextPos.y >= ROWS
        const willHitSelf = snake.some((s) => s.x === nextPos.x && s.y === nextPos.y)
        
        if (!willHitWall && !willHitSelf) {
          return // Keep going straight
        }
      }

      // Time to make a decision
      const dx = food.x - head.x
      const dy = food.y - head.y

      // Build list of possible turns (no reversing)
      const candidates: { x: number; y: number }[] = []
      
      if (direction.x !== 0) {
        // Currently moving horizontally, can turn up or down
        candidates.push({ x: 0, y: -1 }, { x: 0, y: 1 })
        // Can also keep going same direction
        if (direction.x === 1) candidates.push({ x: 1, y: 0 })
        else candidates.push({ x: -1, y: 0 })
      } else {
        // Currently moving vertically, can turn left or right
        candidates.push({ x: -1, y: 0 }, { x: 1, y: 0 })
        // Can also keep going same direction
        if (direction.y === 1) candidates.push({ x: 0, y: 1 })
        else candidates.push({ x: 0, y: -1 })
      }

      // Filter out moves that would cause immediate death
      const safe = candidates.filter((d) => {
        const next = { x: head.x + d.x, y: head.y + d.y }
        if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) return false
        if (snake.some((s) => s.x === next.x && s.y === next.y)) return false
        return true
      })

      if (safe.length === 0) return // No safe moves, will die

      // Pick a direction - mostly chase food, but sometimes make "mistakes"
      if (Math.random() < 0.85) {
        // Chase food - pick direction that gets closer
        safe.sort((a, b) => {
          const aDist = Math.abs(head.x + a.x - food.x) + Math.abs(head.y + a.y - food.y)
          const bDist = Math.abs(head.x + b.x - food.x) + Math.abs(head.y + b.y - food.y)
          return aDist - bDist
        })
        nextDirection = safe[0]
      } else {
        // Random safe direction (human mistake/exploration)
        nextDirection = safe[Math.floor(Math.random() * safe.length)]
      }

      movesSinceLastTurn = 0
    }

    const draw = (time: number) => {
      // Move snake at fixed intervals
      if (time - lastMove >= SPEED) {
        lastMove = time

        // AI thinks before moving
        thinkLikeHuman()
        direction = nextDirection

        const head = {
          x: snake[0].x + direction.x,
          y: snake[0].y + direction.y,
        }

        // Check collision - game over, reset
        const hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS
        const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y)

        if (hitWall || hitSelf) {
          resetGame()
        } else {
          snake = [head, ...snake]
          if (head.x === food.x && head.y === food.y) {
            food = randomFood()
            // Keep tail (grow)
          } else {
            snake.pop()
          }
        }
      }

      // === RENDER ===
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, W, H)

      // Grid dots
      ctx.fillStyle = "#ffffff08"
      for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
          ctx.fillRect(x * CELL + CELL / 2 - 0.5, y * CELL + CELL / 2 - 0.5, 1, 1)
        }
      }

      // Food with pulse
      const pulse = 0.85 + 0.15 * Math.sin(time / 180)
      const fx = food.x * CELL + CELL / 2
      const fy = food.y * CELL + CELL / 2
      const fr = (CELL / 2 - 1) * pulse

      ctx.fillStyle = "#fbbf2444"
      ctx.beginPath()
      ctx.arc(fx, fy, fr * 1.8, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#fbbf24"
      ctx.beginPath()
      ctx.arc(fx, fy, fr, 0, Math.PI * 2)
      ctx.fill()

      // Snake body
      snake.forEach((seg, i) => {
        const isHead = i === 0
        const alpha = Math.max(0.3, 1 - (i / snake.length) * 0.7)
        ctx.globalAlpha = alpha

        ctx.fillStyle = primary
        const pad = isHead ? 0.5 : 1
        const radius = isHead ? 3 : 2

        ctx.beginPath()
        ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, radius)
        ctx.fill()

        if (isHead) {
          ctx.fillStyle = "rgba(255,255,255,0.25)"
          ctx.beginPath()
          ctx.roundRect(
            seg.x * CELL + pad + 1,
            seg.y * CELL + pad + 1,
            CELL - pad * 2 - 2,
            (CELL - pad * 2) / 2 - 1,
            2
          )
          ctx.fill()
        }
      })
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [primary])

  return <canvas ref={canvasRef} width={280} height={160} className="w-full h-full" />
}
