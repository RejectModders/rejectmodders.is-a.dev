"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, RotateCcw, Volume2, VolumeX } from "lucide-react"
import { getHS, saveHS } from "../helpers"
import { gameSounds } from "../sounds"

const TCOLS = 10, TROWS = 20, TC = 28

const PIECES = [
  { shape: [[1,1,1,1]], color: "#06b6d4" },          // I
  { shape: [[1,1],[1,1]], color: "#fbbf24" },          // O
  { shape: [[0,1,0],[1,1,1]], color: "#a855f7" },     // T
  { shape: [[1,1,0],[0,1,1]], color: "#22c55e" },     // S
  { shape: [[0,1,1],[1,1,0]], color: "#ef4444" },     // Z
  { shape: [[1,0,0],[1,1,1]], color: "#f97316" },     // J
  { shape: [[0,0,1],[1,1,1]], color: "#3b82f6" },     // L
]

type TBoard = (string | 0)[][]

function emptyBoard(): TBoard { return Array.from({ length: TROWS }, () => Array(TCOLS).fill(0)) }

function rotate(shape: number[][]) {
  return shape[0].map((_, i) => shape.map(r => r[i]).reverse())
}

// Defined outside the component so it never changes reference
function fits(board: TBoard, shape: number[][], x: number, y: number) {
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      if (shape[r][c]) {
        const nx = x + c, ny = y + r
        if (nx < 0 || nx >= TCOLS || ny >= TROWS) return false
        if (ny >= 0 && board[ny][nx]) return false
      }
  return true
}

function spawnPiece() {
  const p = PIECES[Math.floor(Math.random() * PIECES.length)]
  return { shape: p.shape, color: p.color, x: Math.floor(TCOLS / 2) - Math.floor(p.shape[0].length / 2), y: 0 }
}

export function TetrisGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = useRef({
    board: emptyBoard() as TBoard,
    piece: null as null | { shape: number[][], color: string, x: number, y: number },
    score: 0, lines: 0, level: 1, alive: true, started: false, hs: 0,
    interval: 0 as unknown as ReturnType<typeof setInterval>,
    raf: 0,
  })
  const [display, setDisplay] = useState({ score: 0, lines: 0, level: 1, alive: true, started: false, hs: 0 })
  const [soundEnabled, setSoundEnabled] = useState(true)

  const place = useCallback(() => {
    const s = state.current; if (!s.piece) return
    const { shape, color, x, y } = s.piece
    const nb = s.board.map(r => [...r]) as TBoard
    shape.forEach((row, r) => row.forEach((v, c) => { if (v && y + r >= 0) nb[y + r][x + c] = color }))
    // clear lines
    let cleared = 0
    const filtered = nb.filter(row => row.some(cell => !cell))
    cleared = TROWS - filtered.length
    const newBoard = [...Array.from({ length: cleared }, () => Array(TCOLS).fill(0) as (string | 0)[]), ...filtered] as TBoard
    s.board = newBoard
    const pts = [0, 100, 300, 500, 800][cleared] ?? 0
    const oldLevel = s.level
    s.score += pts * s.level; s.lines += cleared; s.level = Math.floor(s.lines / 10) + 1
    
    // Play sounds
    if (cleared > 0) {
      if (cleared >= 4) gameSounds.play("levelup") // Tetris!
      else gameSounds.play("eat")
    }
    if (s.level > oldLevel) gameSounds.play("levelup")
    const next = spawnPiece()
    if (!fits(s.board, next.shape, next.x, next.y)) {
      s.alive = false; s.piece = null; saveHS("tetris", s.score)
      s.hs = Math.max(s.hs, s.score)
      gameSounds.play("die")
      setDisplay(d => ({ ...d, alive: false, hs: s.hs })); clearInterval(s.interval); return
    }
    s.piece = next
    setDisplay(d => ({ ...d, score: s.score, lines: s.lines, level: s.level }))
    // Update interval speed when level changes
    clearInterval(s.interval)
    s.interval = setInterval(() => {
      const ss = state.current; if (!ss.alive || !ss.piece) return
      if (fits(ss.board, ss.piece.shape, ss.piece.x, ss.piece.y + 1)) ss.piece.y++
      else place()
    }, Math.max(100, 600 - (s.level - 1) * 50))
  }, [])

  const tick = useCallback(() => {
    const s = state.current; if (!s.alive || !s.piece) return
    if (fits(s.board, s.piece.shape, s.piece.x, s.piece.y + 1)) s.piece.y++
    else place()
  }, [place])

  const reset = useCallback(() => {
    const s = state.current; clearInterval(s.interval)
    s.board = emptyBoard(); s.piece = null; s.score = 0; s.lines = 0; s.level = 1; s.alive = true; s.started = false
    s.hs = getHS("tetris")
    setDisplay({ score: 0, lines: 0, level: 1, alive: true, started: false, hs: s.hs })
  }, [])

  const startGame = useCallback(() => {
    const s = state.current; if (s.started) return
    s.piece = spawnPiece(); s.started = true
    gameSounds.play("start")
    setDisplay(d => ({ ...d, started: true }))
    s.interval = setInterval(tick, Math.max(100, 600 - (s.level - 1) * 50))
  }, [tick])

  useEffect(() => {
    reset()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    const W = TCOLS * TC, H = TROWS * TC

    const draw = () => {
      const s = state.current
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)

      // grid
      ctx.strokeStyle = "#ffffff08"; ctx.lineWidth = 0.5
      for (let x = 0; x <= TCOLS; x++) { ctx.beginPath(); ctx.moveTo(x * TC, 0); ctx.lineTo(x * TC, H); ctx.stroke() }
      for (let y = 0; y <= TROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * TC); ctx.lineTo(W, y * TC); ctx.stroke() }

      // board
      s.board.forEach((row, r) => row.forEach((cell, c) => {
        if (!cell) return
        ctx.fillStyle = cell as string
        ctx.fillRect(c * TC + 1, r * TC + 1, TC - 2, TC - 2)
        ctx.fillStyle = "rgba(255,255,255,0.15)"
        ctx.fillRect(c * TC + 1, r * TC + 1, TC - 2, 4)
      }))

      // ghost piece
      if (s.piece) {
        let gy = s.piece.y
        while (fits(s.board, s.piece.shape, s.piece.x, gy + 1)) gy++
        s.piece.shape.forEach((row, r) => row.forEach((v, c) => {
          if (!v) return
          ctx.fillStyle = s.piece!.color + "33"
          ctx.fillRect((s.piece!.x + c) * TC + 1, (gy + r) * TC + 1, TC - 2, TC - 2)
        }))
      }

      // active piece
      if (s.piece) {
        s.piece.shape.forEach((row, r) => row.forEach((v, c) => {
          if (!v) return
          ctx.fillStyle = s.piece!.color
          ctx.fillRect((s.piece!.x + c) * TC + 1, (s.piece!.y + r) * TC + 1, TC - 2, TC - 2)
          ctx.fillStyle = "rgba(255,255,255,0.2)"
          ctx.fillRect((s.piece!.x + c) * TC + 1, (s.piece!.y + r) * TC + 1, TC - 2, 4)
        }))
      }

      // overlays
      if (!s.started) {
        ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = primary; ctx.font = "bold 26px monospace"; ctx.textAlign = "center"
        ctx.fillText("TETRIS", W / 2, H / 2 - 50)
        ctx.fillStyle = "#fff"; ctx.font = "13px monospace"
        ctx.fillText("← → move   ↑ rotate", W / 2, H / 2 - 5)
        ctx.fillText("↓ soft drop   space hard drop", W / 2, H / 2 + 20)
        ctx.fillStyle = "#aaa"; ctx.fillText("press any key to start", W / 2, H / 2 + 55)
        if (s.hs > 0) { ctx.fillStyle = primary + "aa"; ctx.font = "13px monospace"; ctx.fillText(`best: ${s.hs}`, W / 2, H / 2 + 80) }
      }
      if (!s.alive) {
        ctx.fillStyle = "rgba(0,0,0,0.65)"; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = primary; ctx.font = "bold 26px monospace"; ctx.textAlign = "center"
        ctx.fillText("GAME OVER", W / 2, H / 2 - 50)
        ctx.fillStyle = "#fff"; ctx.font = "20px monospace"; ctx.fillText(`score: ${s.score}`, W / 2, H / 2 - 10)
        ctx.fillText(`lines: ${s.lines}  lv: ${s.level}`, W / 2, H / 2 + 20)
        if (s.hs > 0) { ctx.fillStyle = "#fbbf24"; ctx.font = "14px monospace"; ctx.fillText(`best: ${s.hs}`, W / 2, H / 2 + 50) }
        ctx.fillStyle = "#aaa"; ctx.font = "13px monospace"; ctx.fillText("press R to restart", W / 2, H / 2 + 80)
      }

      s.raf = requestAnimationFrame(draw)
    }
    state.current.raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(state.current.raf); clearInterval(state.current.interval) }
  // fits is defined outside the component — stable reference, no need in deps
  }, [primary, reset])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = state.current
      if (e.key === "r" || e.key === "R") { reset(); return }
      if (!s.alive) return
      if (!s.started) { startGame(); return }
      if (!s.piece) return
      if (e.key === "ArrowLeft" && fits(s.board, s.piece.shape, s.piece.x - 1, s.piece.y)) { s.piece.x--; e.preventDefault() }
      if (e.key === "ArrowRight" && fits(s.board, s.piece.shape, s.piece.x + 1, s.piece.y)) { s.piece.x++; e.preventDefault() }
      if (e.key === "ArrowDown") { tick(); e.preventDefault() }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        const rot = rotate(s.piece.shape)
        if (fits(s.board, rot, s.piece.x, s.piece.y)) s.piece.shape = rot
      }
      if (e.key === " ") {
        e.preventDefault()
        while (fits(s.board, s.piece.shape, s.piece.x, s.piece.y + 1)) s.piece.y++
        place()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [reset, startGame, tick, place])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full items-center justify-between" style={{ maxWidth: TCOLS * TC }}>
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> back
        </button>
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="text-primary">score: {display.score}</span>
          <span className="text-muted-foreground">lv: {display.level}</span>
          <button
            onClick={() => setSoundEnabled(gameSounds.toggle())}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
          <button onClick={reset} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors" title="Restart game">
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} width={TCOLS * TC} height={TROWS * TC}
        className="rounded-xl border border-primary/30 touch-none select-none"
        style={{ maxWidth: "100%", height: "auto" }} />
      {/* Mobile controls */}
      <div className="flex items-center gap-3 md:hidden">
        {[
          { label: "←", action: () => { const s = state.current; if (s.piece && fits(s.board, s.piece.shape, s.piece.x - 1, s.piece.y)) s.piece.x-- } },
          { label: "↻", action: () => { const s = state.current; if (!s.piece) return; const rot = rotate(s.piece.shape); if (fits(s.board, rot, s.piece.x, s.piece.y)) s.piece.shape = rot } },
          { label: "→", action: () => { const s = state.current; if (s.piece && fits(s.board, s.piece.shape, s.piece.x + 1, s.piece.y)) s.piece.x++ } },
          { label: "↓", action: () => tick() },
          { label: "⬇", action: () => { const s = state.current; if (!s.piece) return; while (fits(s.board, s.piece.shape, s.piece.x, s.piece.y + 1)) s.piece.y++; place() } },
        ].map(btn => (
          <button
            key={btn.label}
            onTouchStart={e => { e.preventDefault(); if (!state.current.started) startGame(); btn.action() }}
            onClick={() => { if (!state.current.started) startGame(); btn.action() }}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary font-bold text-lg touch-none select-none"
          >
            {btn.label}
          </button>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground hidden md:block">← → move · ↑ rotate · space hard drop</p>
      <p className="font-mono text-xs text-muted-foreground md:hidden">use buttons · ⬇ = hard drop</p>
    </div>
  )
}

