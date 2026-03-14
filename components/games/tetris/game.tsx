"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronDown, ChevronRight, RotateCcw, RotateCw, Volume2, VolumeX, ChevronsDown, Pause, Play } from "lucide-react"
import { getHS, saveHS, usePrimary } from "../helpers"
import { gameSounds } from "../sounds"

// ── Game Constants ───────────────────────────────────────────────────────────
const COLS = 10
const ROWS = 20
const CELL_SIZE = 24
const PREVIEW_CELL = 16
const BOARD_WIDTH = COLS * CELL_SIZE
const BOARD_HEIGHT = ROWS * CELL_SIZE

// Tetromino definitions with wall kick data
const TETROMINOES = {
  I: { shape: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], color: "#06b6d4" },
  O: { shape: [[1,1], [1,1]], color: "#fbbf24" },
  T: { shape: [[0,1,0], [1,1,1], [0,0,0]], color: "#a855f7" },
  S: { shape: [[0,1,1], [1,1,0], [0,0,0]], color: "#22c55e" },
  Z: { shape: [[1,1,0], [0,1,1], [0,0,0]], color: "#ef4444" },
  J: { shape: [[1,0,0], [1,1,1], [0,0,0]], color: "#3b82f6" },
  L: { shape: [[0,0,1], [1,1,1], [0,0,0]], color: "#f97316" },
} as const

type PieceType = keyof typeof TETROMINOES
type Cell = string | 0
type Board = Cell[][]
type GameState = "idle" | "playing" | "paused" | "gameover"

interface Piece {
  type: PieceType
  shape: number[][]
  color: string
  x: number
  y: number
}

// ── Utility Functions ────────────────────────────────────────────────────────
function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

function rotate(shape: number[][], clockwise = true): number[][] {
  const N = shape.length
  const rotated = shape.map(row => [...row])
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (clockwise) {
        rotated[c][N - 1 - r] = shape[r][c]
      } else {
        rotated[N - 1 - c][r] = shape[r][c]
      }
    }
  }
  return rotated
}

function fits(board: Board, shape: number[][], x: number, y: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const nx = x + c
        const ny = y + r
        if (nx < 0 || nx >= COLS || ny >= ROWS) return false
        if (ny >= 0 && board[ny][nx]) return false
      }
    }
  }
  return true
}

function getGhostY(board: Board, piece: Piece): number {
  let ghostY = piece.y
  while (fits(board, piece.shape, piece.x, ghostY + 1)) {
    ghostY++
  }
  return ghostY
}

function randomBag(): PieceType[] {
  const pieces: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"]
  // Fisher-Yates shuffle
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pieces[i], pieces[j]] = [pieces[j], pieces[i]]
  }
  return pieces
}

function createPiece(type: PieceType): Piece {
  const { shape, color } = TETROMINOES[type]
  return {
    type,
    shape: shape.map(row => [...row]),
    color,
    x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
    y: type === "I" ? -1 : 0,
  }
}

function getSpeed(level: number): number {
  // Classic NES-style speed curve
  const speeds = [800, 720, 630, 550, 470, 380, 300, 220, 130, 100, 80, 80, 80, 70, 70, 70, 50, 50, 50, 30]
  return speeds[Math.min(level - 1, speeds.length - 1)] ?? 30
}

// ── Tetris Game Component ────────────────────────────────────────────────────
export function TetrisGame({ onBack }: { primary?: string; onBack: () => void }) {
  const primary = usePrimary()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nextCanvasRef = useRef<HTMLCanvasElement>(null)
  const holdCanvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const rafRef = useRef<number>(0)
  const lastMoveRef = useRef<{ left: number; right: number; down: number }>({ left: 0, right: 0, down: 0 })

  const [gameState, setGameState] = useState<GameState>("idle")
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [highScore, setHighScore] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Game state refs
  const boardRef = useRef<Board>(createBoard())
  const pieceRef = useRef<Piece | null>(null)
  const bagRef = useRef<PieceType[]>([])
  const holdPieceRef = useRef<PieceType | null>(null)
  const canHoldRef = useRef(true)
  const scoreRef = useRef(0)
  const linesRef = useRef(0)
  const levelRef = useRef(1)
  const comboRef = useRef(0)

  // Load high score
  useEffect(() => {
    setHighScore(getHS("tetris"))
  }, [])

  // ── Piece Management ───────────────────────────────────────────────────────
  const getNextPiece = useCallback((): PieceType => {
    if (bagRef.current.length === 0) {
      bagRef.current = randomBag()
    }
    return bagRef.current.shift()!
  }, [])

  const spawnPiece = useCallback((): boolean => {
    const type = getNextPiece()
    const piece = createPiece(type)
    
    if (!fits(boardRef.current, piece.shape, piece.x, piece.y)) {
      return false // Game over
    }
    
    pieceRef.current = piece
    canHoldRef.current = true
    return true
  }, [getNextPiece])

  // ── Game Actions ───────────────────────────────────────────────────────────
  const lockPiece = useCallback(() => {
    const piece = pieceRef.current
    if (!piece) return

    // Place piece on board
    const board = boardRef.current
    piece.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell && piece.y + r >= 0) {
          board[piece.y + r][piece.x + c] = piece.color
        }
      })
    })

    // Clear lines
    let clearedLines = 0
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(cell => cell !== 0)) {
        board.splice(r, 1)
        board.unshift(Array(COLS).fill(0))
        clearedLines++
        r++ // Check same row again
      }
    }

    // Update score
    if (clearedLines > 0) {
      const basePoints = [0, 100, 300, 500, 800][clearedLines] ?? 800
      const comboBonus = comboRef.current * 50
      scoreRef.current += (basePoints + comboBonus) * levelRef.current
      linesRef.current += clearedLines
      comboRef.current++
      
      // Level up every 10 lines
      const newLevel = Math.floor(linesRef.current / 10) + 1
      if (newLevel > levelRef.current) {
        levelRef.current = newLevel
        setLevel(newLevel)
        gameSounds.play("levelup")
        
        // Update game speed
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current)
          gameLoopRef.current = setInterval(tick, getSpeed(newLevel))
        }
      }
      
      // Play sound
      if (clearedLines === 4) {
        gameSounds.play("levelup") // Tetris!
      } else {
        gameSounds.play("eat")
      }
      
      setScore(scoreRef.current)
      setLines(linesRef.current)
    } else {
      comboRef.current = 0
    }

    // Spawn next piece
    if (!spawnPiece()) {
      gameOver()
    }
  }, [spawnPiece])

  const tick = useCallback(() => {
    const piece = pieceRef.current
    if (!piece) return

    if (fits(boardRef.current, piece.shape, piece.x, piece.y + 1)) {
      piece.y++
    } else {
      lockPiece()
    }
  }, [lockPiece])

  const movePiece = useCallback((dx: number, dy: number): boolean => {
    const piece = pieceRef.current
    if (!piece) return false

    if (fits(boardRef.current, piece.shape, piece.x + dx, piece.y + dy)) {
      piece.x += dx
      piece.y += dy
      return true
    }
    return false
  }, [])

  const rotatePiece = useCallback((clockwise = true) => {
    const piece = pieceRef.current
    if (!piece || piece.type === "O") return // O piece doesn't rotate

    const rotated = rotate(piece.shape, clockwise)
    
    // Try basic rotation
    if (fits(boardRef.current, rotated, piece.x, piece.y)) {
      piece.shape = rotated
      return
    }
    
    // Wall kick attempts
    const kicks = piece.type === "I" 
      ? [[-2, 0], [2, 0], [-2, -1], [2, -1]]
      : [[-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1]]
    
    for (const [kx, ky] of kicks) {
      if (fits(boardRef.current, rotated, piece.x + kx, piece.y + ky)) {
        piece.shape = rotated
        piece.x += kx
        piece.y += ky
        return
      }
    }
  }, [])

  const hardDrop = useCallback(() => {
    const piece = pieceRef.current
    if (!piece) return

    const ghostY = getGhostY(boardRef.current, piece)
    scoreRef.current += (ghostY - piece.y) * 2 // Bonus points for hard drop
    setScore(scoreRef.current)
    piece.y = ghostY
    lockPiece()
  }, [lockPiece])

  const holdPiece = useCallback(() => {
    if (!canHoldRef.current || !pieceRef.current) return

    const currentType = pieceRef.current.type
    
    if (holdPieceRef.current) {
      // Swap with held piece
      const heldType = holdPieceRef.current
      holdPieceRef.current = currentType
      pieceRef.current = createPiece(heldType)
    } else {
      // First hold
      holdPieceRef.current = currentType
      spawnPiece()
    }
    
    canHoldRef.current = false
  }, [spawnPiece])

  // ── Game State Management ──────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    
    boardRef.current = createBoard()
    pieceRef.current = null
    bagRef.current = []
    holdPieceRef.current = null
    canHoldRef.current = true
    scoreRef.current = 0
    linesRef.current = 0
    levelRef.current = 1
    comboRef.current = 0
    
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameState("idle")
    setHighScore(getHS("tetris"))
  }, [])

  const startGame = useCallback(() => {
    if (gameState === "playing") return
    
    resetGame()
    spawnPiece()
    setGameState("playing")
    gameSounds.play("start")
    
    gameLoopRef.current = setInterval(tick, getSpeed(1))
  }, [gameState, resetGame, spawnPiece, tick])

  const pauseGame = useCallback(() => {
    if (gameState === "playing") {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      setGameState("paused")
    } else if (gameState === "paused") {
      gameLoopRef.current = setInterval(tick, getSpeed(levelRef.current))
      setGameState("playing")
    }
  }, [gameState, tick])

  const gameOver = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    setGameState("gameover")
    gameSounds.play("die")

    const finalScore = scoreRef.current
    if (finalScore > getHS("tetris")) {
      saveHS("tetris", finalScore)
      setHighScore(finalScore)
    }
  }, [])

  // ── Keyboard Controls ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        resetGame()
        return
      }
      
      if (gameState === "gameover" && (e.key === " " || e.key === "Enter")) {
        startGame()
        return
      }
      
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        pauseGame()
        return
      }
      
      if (gameState === "idle") {
        startGame()
        return
      }
      
      if (gameState !== "playing") return
      
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          movePiece(-1, 0)
          e.preventDefault()
          break
        case "ArrowRight":
        case "d":
        case "D":
          movePiece(1, 0)
          e.preventDefault()
          break
        case "ArrowDown":
        case "s":
        case "S":
          if (movePiece(0, 1)) {
            scoreRef.current += 1 // Soft drop bonus
            setScore(scoreRef.current)
          }
          e.preventDefault()
          break
        case "ArrowUp":
        case "w":
        case "W":
        case "x":
        case "X":
          rotatePiece(true)
          e.preventDefault()
          break
        case "z":
        case "Z":
          rotatePiece(false)
          e.preventDefault()
          break
        case " ":
          hardDrop()
          e.preventDefault()
          break
        case "c":
        case "C":
        case "Shift":
          holdPiece()
          e.preventDefault()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameState, movePiece, rotatePiece, hardDrop, holdPiece, startGame, pauseGame, resetGame])

  // ── Touch Controls ─────────────────────────────────────────────────────────
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    if (!touchStartRef.current) return

    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    const dt = Date.now() - touchStartRef.current.time

    // Tap detection
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30 && dt < 200) {
      if (gameState === "idle" || gameState === "gameover") {
        startGame()
      } else if (gameState === "playing") {
        rotatePiece(true)
      }
      return
    }

    if (gameState !== "playing") return

    // Swipe detection
    if (Math.abs(dy) > Math.abs(dx) && dy > 50) {
      hardDrop()
    }
  }, [gameState, startGame, rotatePiece, hardDrop])

  // ── Rendering ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    const drawCell = (x: number, y: number, color: string, size: number, alpha = 1) => {
      ctx.globalAlpha = alpha
      ctx.fillStyle = color
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
      
      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.2)"
      ctx.fillRect(x + 1, y + 1, size - 2, 4)
      
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)"
      ctx.fillRect(x + 1, y + size - 5, size - 2, 4)
      
      ctx.globalAlpha = 1
    }

    const render = () => {
      // Background
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT)

      // Grid
      ctx.strokeStyle = "#ffffff08"
      ctx.lineWidth = 0.5
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath()
        ctx.moveTo(x * CELL_SIZE, 0)
        ctx.lineTo(x * CELL_SIZE, BOARD_HEIGHT)
        ctx.stroke()
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * CELL_SIZE)
        ctx.lineTo(BOARD_WIDTH, y * CELL_SIZE)
        ctx.stroke()
      }

      // Border
      ctx.strokeStyle = primary + "40"
      ctx.lineWidth = 2
      ctx.strokeRect(1, 1, BOARD_WIDTH - 2, BOARD_HEIGHT - 2)

      // Placed blocks
      const board = boardRef.current
      board.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell) {
            drawCell(c * CELL_SIZE, r * CELL_SIZE, cell as string, CELL_SIZE)
          }
        })
      })

      // Ghost piece
      const piece = pieceRef.current
      if (piece && gameState === "playing") {
        const ghostY = getGhostY(board, piece)
        piece.shape.forEach((row, r) => {
          row.forEach((cell, c) => {
            if (cell) {
              ctx.fillStyle = piece.color + "33"
              ctx.fillRect(
                (piece.x + c) * CELL_SIZE + 1,
                (ghostY + r) * CELL_SIZE + 1,
                CELL_SIZE - 2,
                CELL_SIZE - 2
              )
            }
          })
        })
      }

      // Active piece
      if (piece) {
        piece.shape.forEach((row, r) => {
          row.forEach((cell, c) => {
            if (cell && piece.y + r >= 0) {
              drawCell(
                (piece.x + c) * CELL_SIZE,
                (piece.y + r) * CELL_SIZE,
                piece.color,
                CELL_SIZE
              )
            }
          })
        })
      }

      // Overlays
      if (gameState === "idle") {
        ctx.fillStyle = "rgba(0,0,0,0.75)"
        ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT)

        ctx.textAlign = "center"
        ctx.fillStyle = primary
        ctx.font = "bold 28px monospace"
        ctx.fillText("TETRIS", BOARD_WIDTH / 2, BOARD_HEIGHT / 2 - 60)

        ctx.fillStyle = "#ffffff"
        ctx.font = "11px monospace"
        ctx.fillText("Arrow Keys / WASD", BOARD_WIDTH / 2, BOARD_HEIGHT / 2 - 20)
        ctx.fillText("Space = Hard Drop", BOARD_WIDTH / 2, BOARD_HEIGHT / 2)
        ctx.fillText("C/Shift = Hold", BOARD_WIDTH / 2, BOARD_HEIGHT / 2 + 20)

        if (highScore > 0) {
          ctx.fillStyle = "#fbbf24"
          ctx.font = "bold 12px monospace"
          ctx.fillText(`Best: ${highScore}`, BOARD_WIDTH / 2, BOARD_HEIGHT / 2 + 50)
        }

        ctx.fillStyle = primary + "cc"
        ctx.font = "11px monospace"
        ctx.fillText("Press any key to start", BOARD_WIDTH / 2, BOARD_HEIGHT / 2 + 80)
      }

      if (gameState === "paused") {
        ctx.fillStyle = "rgba(0,0,0,0.75)"
        ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT)

        ctx.textAlign = "center"
        ctx.fillStyle = primary
        ctx.font = "bold 24px monospace"
        ctx.fillText("PAUSED", BOARD_WIDTH / 2, BOARD_HEIGHT / 2 - 10)

        ctx.fillStyle = "#666666"
        ctx.font = "11px monospace"
        ctx.fillText("Press P or Esc to resume", BOARD_WIDTH / 2, BOARD_HEIGHT / 2 + 20)
      }

      if (gameState === "gameover") {
        ctx.fillStyle = "rgba(0,0,0,0.8)"
        ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT)

        ctx.textAlign = "center"
        ctx.fillStyle = "#ef4444"
        ctx.font = "bold 24px monospace"
        ctx.fillText("GAME OVER", BOARD_WIDTH / 2, BOARD_HEIGHT / 2 - 50)

        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 18px monospace"
        ctx.fillText(`Score: ${scoreRef.current}`, BOARD_WIDTH / 2, BOARD_HEIGHT / 2 - 10)

        ctx.fillStyle = "#aaaaaa"
        ctx.font = "14px monospace"
        ctx.fillText(`Lines: ${linesRef.current}  Lv: ${levelRef.current}`, BOARD_WIDTH / 2, BOARD_HEIGHT / 2 + 15)

        if (highScore > 0) {
          ctx.fillStyle = "#fbbf24"
          ctx.font = "bold 12px monospace"
          ctx.fillText(`Best: ${highScore}`, BOARD_WIDTH / 2, BOARD_HEIGHT / 2 + 45)
        }

        ctx.fillStyle = "#666666"
        ctx.font = "11px monospace"
        ctx.fillText("Press R or tap to restart", BOARD_WIDTH / 2, BOARD_HEIGHT / 2 + 75)
      }

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [primary, gameState, highScore])

  // ── Render Next Piece Preview ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = nextCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const size = PREVIEW_CELL * 4

    const render = () => {
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, size, size)

      ctx.strokeStyle = primary + "30"
      ctx.lineWidth = 1
      ctx.strokeRect(0.5, 0.5, size - 1, size - 1)

      if (bagRef.current.length > 0) {
        const nextType = bagRef.current[0]
        const { shape, color } = TETROMINOES[nextType]
        const offsetX = (size - shape[0].length * PREVIEW_CELL) / 2
        const offsetY = (size - shape.length * PREVIEW_CELL) / 2

        shape.forEach((row, r) => {
          row.forEach((cell, c) => {
            if (cell) {
              ctx.fillStyle = color
              ctx.fillRect(
                offsetX + c * PREVIEW_CELL + 1,
                offsetY + r * PREVIEW_CELL + 1,
                PREVIEW_CELL - 2,
                PREVIEW_CELL - 2
              )
              ctx.fillStyle = "rgba(255,255,255,0.2)"
              ctx.fillRect(
                offsetX + c * PREVIEW_CELL + 1,
                offsetY + r * PREVIEW_CELL + 1,
                PREVIEW_CELL - 2,
                3
              )
            }
          })
        })
      }
    }

    const interval = setInterval(render, 100)
    render()
    return () => clearInterval(interval)
  }, [primary])

  // ── Render Hold Piece Preview ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = holdCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const size = PREVIEW_CELL * 4

    const render = () => {
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, size, size)

      ctx.strokeStyle = primary + "30"
      ctx.lineWidth = 1
      ctx.strokeRect(0.5, 0.5, size - 1, size - 1)

      const holdType = holdPieceRef.current
      if (holdType) {
        const { shape, color } = TETROMINOES[holdType]
        const offsetX = (size - shape[0].length * PREVIEW_CELL) / 2
        const offsetY = (size - shape.length * PREVIEW_CELL) / 2
        const alpha = canHoldRef.current ? 1 : 0.4

        shape.forEach((row, r) => {
          row.forEach((cell, c) => {
            if (cell) {
              ctx.globalAlpha = alpha
              ctx.fillStyle = color
              ctx.fillRect(
                offsetX + c * PREVIEW_CELL + 1,
                offsetY + r * PREVIEW_CELL + 1,
                PREVIEW_CELL - 2,
                PREVIEW_CELL - 2
              )
              ctx.fillStyle = "rgba(255,255,255,0.2)"
              ctx.fillRect(
                offsetX + c * PREVIEW_CELL + 1,
                offsetY + r * PREVIEW_CELL + 1,
                PREVIEW_CELL - 2,
                3
              )
              ctx.globalAlpha = 1
            }
          })
        })
      }
    }

    const interval = setInterval(render, 100)
    render()
    return () => clearInterval(interval)
  }, [primary])

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg">
      {/* Header */}
      <div className="flex w-full items-center justify-between px-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> back
        </button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-primary font-bold">Score: {score}</span>
          <span className="text-muted-foreground">Lv: {level}</span>
          <button
            onClick={() => setSoundEnabled(gameSounds.toggle())}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
          {gameState === "playing" && (
            <button
              onClick={pauseGame}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              title="Pause"
            >
              <Pause className="h-3.5 w-3.5" />
            </button>
          )}
          {gameState === "paused" && (
            <button
              onClick={pauseGame}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              title="Resume"
            >
              <Play className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
            title="Restart game"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex gap-4 items-start">
        {/* Side Panel - Hold */}
        <div className="hidden sm:flex flex-col gap-2">
          <span className="font-mono text-[10px] text-muted-foreground text-center">HOLD</span>
          <canvas
            ref={holdCanvasRef}
            width={PREVIEW_CELL * 4}
            height={PREVIEW_CELL * 4}
            className="rounded-lg"
          />
          <div className="mt-4 font-mono text-[10px] text-muted-foreground text-center space-y-1">
            <div>Lines</div>
            <div className="text-primary font-bold text-sm">{lines}</div>
          </div>
        </div>

        {/* Main Canvas */}
        <canvas
          ref={canvasRef}
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="rounded-xl border border-primary/30 touch-none select-none"
          style={{ maxWidth: "100%", height: "auto" }}
        />

        {/* Side Panel - Next */}
        <div className="hidden sm:flex flex-col gap-2">
          <span className="font-mono text-[10px] text-muted-foreground text-center">NEXT</span>
          <canvas
            ref={nextCanvasRef}
            width={PREVIEW_CELL * 4}
            height={PREVIEW_CELL * 4}
            className="rounded-lg"
          />
          {highScore > 0 && (
            <div className="mt-4 font-mono text-[10px] text-muted-foreground text-center space-y-1">
              <div>Best</div>
              <div className="text-yellow-500 font-bold text-sm">{highScore}</div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="flex flex-col gap-3 md:hidden w-full max-w-sm px-2">
        {/* Top row: Hold + Info + Pause */}
        <div className="flex justify-between items-center">
          <button
            onTouchStart={(e) => { e.preventDefault(); if (gameState === "playing") holdPiece() }}
            className="flex h-11 px-4 items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary font-mono text-xs touch-none"
          >
            <span>HOLD</span>
          </button>
          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <span>Ln: {lines}</span>
            {highScore > 0 && <span className="text-yellow-500">Hi: {highScore}</span>}
          </div>
          <button
            onTouchStart={(e) => { e.preventDefault(); pauseGame() }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none"
          >
            {gameState === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>
        
        {/* Main controls - D-pad style */}
        <div className="flex justify-between items-center gap-3">
          {/* Left side: Rotate buttons */}
          <div className="flex flex-col gap-2">
            <button
              onTouchStart={(e) => { e.preventDefault(); if (gameState === "playing") rotatePiece(false) }}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); if (gameState === "playing") rotatePiece(true) }}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none"
            >
              <RotateCw className="h-5 w-5" />
            </button>
          </div>
          
          {/* Center: Movement controls */}
          <div className="flex items-center gap-2">
            <button
              onTouchStart={(e) => { e.preventDefault(); if (gameState === "idle") startGame(); else if (gameState === "playing") movePiece(-1, 0) }}
              className="flex h-16 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); if (gameState === "idle") startGame(); else if (gameState === "playing") { movePiece(0, 1); scoreRef.current += 1; setScore(scoreRef.current) } }}
              className="flex h-16 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none"
            >
              <ChevronDown className="h-7 w-7" />
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); if (gameState === "idle") startGame(); else if (gameState === "playing") movePiece(1, 0) }}
              className="flex h-16 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
          
          {/* Right side: Hard drop */}
          <button
            onTouchStart={(e) => { e.preventDefault(); if (gameState === "idle") startGame(); else if (gameState === "playing") hardDrop() }}
            className="flex h-24 w-16 flex-col items-center justify-center gap-1 rounded-xl border border-primary/40 bg-primary/20 active:bg-primary/40 text-primary font-mono text-xs touch-none"
          >
            <ChevronsDown className="h-6 w-6" />
            <span>DROP</span>
          </button>
        </div>
      </div>

      {/* Desktop Instructions */}
      <p className="font-mono text-xs text-muted-foreground hidden md:block text-center">
        ← → move | ↑/X rotate | ↓ soft drop | Space hard drop | C/Shift hold | P pause
      </p>
    </div>
  )
}
