"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronUp, ChevronDown, ChevronRight, RotateCcw, Volume2, VolumeX } from "lucide-react"
import { saveHS, getHS, usePrimary } from "../helpers"
import { gameSounds } from "../sounds"

// ── Game Constants ───────────────────────────────────────────────────────────
const GRID_SIZE = 20
const CELL_SIZE = 20
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE
const INITIAL_SPEED = 150
const SPEED_INCREMENT = 5
const MIN_SPEED = 60

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"
type Point = { x: number; y: number }
type GameState = "idle" | "playing" | "gameover"

const DIRECTIONS: Record<Direction, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

const OPPOSITE: Record<Direction, Direction> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
}

// ── Utility Functions ────────────────────────────────────────────────────────
function randomFood(snake: Point[]): Point {
  let food: Point
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  } while (snake.some((s) => s.x === food.x && s.y === food.y))
  return food
}

function getSpeed(score: number): number {
  return Math.max(MIN_SPEED, INITIAL_SPEED - Math.floor(score / 3) * SPEED_INCREMENT)
}

// ── Snake Game Component ─────────────────────────────────────────────────────
export function SnakeGame({ onBack }: { primary?: string; onBack: () => void }) {
  const primary = usePrimary()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const rafRef = useRef<number>(0)

  const [gameState, setGameState] = useState<GameState>("idle")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Game state refs for animation loop access
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }])
  const directionRef = useRef<Direction>("RIGHT")
  const nextDirectionRef = useRef<Direction>("RIGHT")
  const foodRef = useRef<Point>({ x: 5, y: 5 })
  const scoreRef = useRef(0)

  // Load high score on mount
  useEffect(() => {
    setHighScore(getHS("snake"))
  }, [])

  // ── Game Logic ─────────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
    directionRef.current = "RIGHT"
    nextDirectionRef.current = "RIGHT"
    foodRef.current = randomFood(snakeRef.current)
    scoreRef.current = 0
    setScore(0)
    setGameState("idle")
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
  }, [])

  const startGame = useCallback(() => {
    if (gameState === "playing") return
    resetGame()
    setGameState("playing")
    gameSounds.play("start")

    const tick = () => {
      const snake = snakeRef.current
      const dir = DIRECTIONS[nextDirectionRef.current]
      directionRef.current = nextDirectionRef.current

      const head = {
        x: snake[0].x + dir.x,
        y: snake[0].y + dir.y,
      }

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        gameOver()
        return
      }

      // Self collision
      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        gameOver()
        return
      }

      // Move snake
      const newSnake = [head, ...snake]

      // Check food
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        scoreRef.current++
        setScore(scoreRef.current)
        foodRef.current = randomFood(newSnake)
        gameSounds.play("eat")

        // Check for speed increase (every 3 points)
        const newSpeed = getSpeed(scoreRef.current)
        const oldSpeed = getSpeed(scoreRef.current - 1)
        if (newSpeed < oldSpeed) {
          gameSounds.play("levelup")
        }

        // Restart interval with new speed
        if (gameLoopRef.current) clearInterval(gameLoopRef.current)
        gameLoopRef.current = setInterval(tick, newSpeed)
      } else {
        newSnake.pop()
      }

      snakeRef.current = newSnake
    }

    gameLoopRef.current = setInterval(tick, INITIAL_SPEED)
  }, [gameState, resetGame])

  const gameOver = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    setGameState("gameover")
    gameSounds.play("die")

    const finalScore = scoreRef.current
    const currentHS = getHS("snake")
    if (finalScore > currentHS) {
      saveHS("snake", finalScore)
      setHighScore(finalScore)
    }
  }, [])

  const changeDirection = useCallback(
    (newDir: Direction) => {
      if (gameState === "idle") {
        startGame()
      }
      if (OPPOSITE[newDir] !== directionRef.current) {
        nextDirectionRef.current = newDir
      }
    },
    [gameState, startGame]
  )

  // ── Keyboard Controls ──────────────────────────────────────────────────────
  useEffect(() => {
    const keyMap: Record<string, Direction> = {
      ArrowUp: "UP",
      ArrowDown: "DOWN",
      ArrowLeft: "LEFT",
      ArrowRight: "RIGHT",
      w: "UP",
      W: "UP",
      s: "DOWN",
      S: "DOWN",
      a: "LEFT",
      A: "LEFT",
      d: "RIGHT",
      D: "RIGHT",
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        resetGame()
        return
      }
      if (gameState === "gameover" && (e.key === " " || e.key === "Enter")) {
        resetGame()
        return
      }
      const dir = keyMap[e.key]
      if (dir) {
        e.preventDefault()
        changeDirection(dir)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [changeDirection, gameState, resetGame])

  // ── Touch Controls ─────────────────────────────────────────────────────────
  const touchStartRef = useRef<Point | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      if (!touchStartRef.current) return

      const dx = e.changedTouches[0].clientX - touchStartRef.current.x
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y

      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
        if (gameState === "gameover") resetGame()
        return
      }

      if (Math.abs(dx) > Math.abs(dy)) {
        changeDirection(dx > 0 ? "RIGHT" : "LEFT")
      } else {
        changeDirection(dy > 0 ? "DOWN" : "UP")
      }
    },
    [changeDirection, gameState, resetGame]
  )

  // ── Rendering ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    const render = (time: number) => {
      // Background
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

      // Grid
      ctx.strokeStyle = "#ffffff08"
      ctx.lineWidth = 0.5
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath()
        ctx.moveTo(i * CELL_SIZE, 0)
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, i * CELL_SIZE)
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE)
        ctx.stroke()
      }

      // Border
      ctx.strokeStyle = primary + "40"
      ctx.lineWidth = 2
      ctx.strokeRect(1, 1, CANVAS_SIZE - 2, CANVAS_SIZE - 2)

      // Food with pulse animation
      const pulse = 0.85 + 0.15 * Math.sin(time / 200)
      const food = foodRef.current
      const fx = food.x * CELL_SIZE + CELL_SIZE / 2
      const fy = food.y * CELL_SIZE + CELL_SIZE / 2
      const fr = (CELL_SIZE / 2 - 2) * pulse

      // Food glow
      const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr * 2)
      glow.addColorStop(0, "#fbbf2444")
      glow.addColorStop(1, "transparent")
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(fx, fy, fr * 2, 0, Math.PI * 2)
      ctx.fill()

      // Food body
      ctx.fillStyle = "#fbbf24"
      ctx.beginPath()
      ctx.arc(fx, fy, fr, 0, Math.PI * 2)
      ctx.fill()

      // Food shine
      ctx.fillStyle = "#ffffff55"
      ctx.beginPath()
      ctx.arc(fx - fr * 0.3, fy - fr * 0.3, fr * 0.25, 0, Math.PI * 2)
      ctx.fill()

      // Snake
      const snake = snakeRef.current
      snake.forEach((segment, i) => {
        const isHead = i === 0
        const alpha = Math.max(0.3, 1 - (i / snake.length) * 0.7)
        ctx.globalAlpha = alpha

        const x = segment.x * CELL_SIZE + 1
        const y = segment.y * CELL_SIZE + 1
        const size = CELL_SIZE - 2
        const radius = isHead ? 6 : 4

        ctx.fillStyle = isHead ? primary : primary + "dd"
        ctx.beginPath()
        ctx.roundRect(x, y, size, size, radius)
        ctx.fill()

        // Head shine
        if (isHead) {
          ctx.fillStyle = "rgba(255,255,255,0.25)"
          ctx.beginPath()
          ctx.roundRect(x + 2, y + 2, size - 4, size / 2 - 2, 4)
          ctx.fill()
        }
      })
      ctx.globalAlpha = 1

      // Overlays
      if (gameState === "idle") {
        ctx.fillStyle = "rgba(0,0,0,0.7)"
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

        ctx.textAlign = "center"
        ctx.fillStyle = primary
        ctx.font = "bold 28px monospace"
        ctx.fillText("SNAKE", CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 40)

        ctx.fillStyle = "#ffffff"
        ctx.font = "12px monospace"
        ctx.fillText("Arrow Keys / WASD / Swipe", CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 5)

        ctx.fillStyle = "#666666"
        ctx.font = "11px monospace"
        ctx.fillText("Avoid walls and yourself", CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 18)

        if (highScore > 0) {
          ctx.fillStyle = "#fbbf24"
          ctx.font = "bold 11px monospace"
          ctx.fillText(`Best: ${highScore}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 42)
        }

        ctx.fillStyle = primary + "cc"
        ctx.font = "11px monospace"
        ctx.fillText("Press any arrow to start", CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 65)
      }

      if (gameState === "gameover") {
        ctx.fillStyle = "rgba(0,0,0,0.8)"
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

        ctx.textAlign = "center"
        ctx.fillStyle = "#ef4444"
        ctx.font = "bold 26px monospace"
        ctx.fillText("GAME OVER", CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 35)

        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 18px monospace"
        ctx.fillText(`Score: ${scoreRef.current}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 5)

        if (highScore > 0) {
          ctx.fillStyle = "#fbbf24"
          ctx.font = "bold 12px monospace"
          ctx.fillText(`Best: ${highScore}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 30)
        }

        ctx.fillStyle = "#666666"
        ctx.font = "11px monospace"
        ctx.fillText("Press R or tap to restart", CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 55)
      }

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [primary, gameState, highScore])

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* Header */}
      <div className="flex w-full items-center justify-between px-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> back
        </button>
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="text-primary font-bold">Score: {score}</span>
          {highScore > 0 && <span className="text-muted-foreground">Best: {highScore}</span>}
          <button
            onClick={() => setSoundEnabled(gameSounds.toggle())}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
            title="Restart game"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="rounded-xl border border-primary/30 touch-none select-none"
        style={{ maxWidth: "100%", height: "auto" }}
      />

      {/* Mobile D-Pad */}
      <div className="flex flex-col items-center gap-2 md:hidden">
        <button
          onTouchStart={(e) => {
            e.preventDefault()
            changeDirection("UP")
          }}
          className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none"
        >
          <ChevronUp className="h-7 w-7" />
        </button>
        <div className="flex gap-2">
          <button
            onTouchStart={(e) => {
              e.preventDefault()
              changeDirection("LEFT")
            }}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            onTouchStart={(e) => {
              e.preventDefault()
              changeDirection("DOWN")
            }}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none"
          >
            <ChevronDown className="h-7 w-7" />
          </button>
          <button
            onTouchStart={(e) => {
              e.preventDefault()
              changeDirection("RIGHT")
            }}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </div>
      </div>

      {/* Desktop Instructions */}
      <p className="font-mono text-xs text-muted-foreground hidden md:block">
        Arrow Keys / WASD to move | R to restart | Speed increases with score
      </p>
    </div>
  )
}
