"use client"
import { useState, useCallback } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const ROWS = 6, COLS = 7
type Cell = 0 | 1 | 2
type Board = Cell[][]

function mkBoard(): Board { return Array.from({ length: ROWS }, () => Array(COLS).fill(0)) }

function drop(board: Board, col: number, player: Cell): { board: Board; row: number } | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      const nb = board.map(r => [...r]) as Board
      nb[r][col] = player
      return { board: nb, row: r }
    }
  }
  return null
}

function checkWin(board: Board, player: Cell): [number, number][] | null {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (board[r][c] !== player) continue
    for (const [dr, dc] of dirs) {
      const cells: [number, number][] = [[r, c]]
      for (let i = 1; i < 4; i++) {
        const nr = r + dr * i, nc = c + dc * i
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== player) break
        cells.push([nr, nc])
      }
      if (cells.length === 4) return cells
    }
  }
  return null
}

function aiMove(board: Board): number {
  // 1. Win if possible
  for (let c = 0; c < COLS; c++) {
    const res = drop(board, c, 2)
    if (res && checkWin(res.board, 2)) return c
  }
  // 2. Block player win
  for (let c = 0; c < COLS; c++) {
    const res = drop(board, c, 1)
    if (res && checkWin(res.board, 1)) return c
  }
  // 3. Prefer center, then score positions
  const scores = Array(COLS).fill(0)
  for (let c = 0; c < COLS; c++) {
    const res = drop(board, c, 2)
    if (!res) { scores[c] = -1000; continue }
    scores[c] += (3 - Math.abs(c - 3)) * 3 // center preference
    // Check if dropping here gives opponent a win above
    const above = drop(res.board, c, 1)
    if (above && checkWin(above.board, 1)) scores[c] -= 50
  }
  const max = Math.max(...scores)
  const best = scores.map((s, i) => s === max ? i : -1).filter(i => i >= 0)
  return best[Math.floor(Math.random() * best.length)]
}

export function ConnectFourGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [board, setBoard] = useState<Board>(mkBoard)
  const [turn, setTurn] = useState<1 | 2>(1)
  const [status, setStatus] = useState<"play" | "won" | "lost" | "draw">("play")
  const [winCells, setWinCells] = useState<[number, number][]>([])
  const [, setHs] = useState(() => loadHS()["connect-four"] ?? 0)
  const [lastCol, setLastCol] = useState(-1)

  const reset = useCallback(() => {
    setBoard(mkBoard()); setTurn(1); setStatus("play"); setWinCells([]); setLastCol(-1)
  }, [])

  const playCol = useCallback((col: number) => {
    if (status !== "play" || turn !== 1) return
    const res = drop(board, col, 1)
    if (!res) return
    setBoard(res.board); setLastCol(col)
    const pw = checkWin(res.board, 1)
    if (pw) {
      setWinCells(pw); setStatus("won")
      setHs(h => { const best = Math.max(h, 1); saveHS("connect-four", best); return best })
      return
    }
    if (res.board[0].every(c => c !== 0)) { setStatus("draw"); return }
    setTurn(2)
    setTimeout(() => {
      const ac = aiMove(res.board)
      const ar = drop(res.board, ac, 2)
      if (!ar) return
      setBoard(ar.board); setLastCol(ac)
      const aw = checkWin(ar.board, 2)
      if (aw) { setWinCells(aw); setStatus("lost"); return }
      if (ar.board[0].every(c => c !== 0)) { setStatus("draw"); return }
      setTurn(1)
    }, 400)
  }, [board, turn, status])

  const isWin = (r: number, c: number) => winCells.some(([wr, wc]) => wr === r && wc === c)

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5" /> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-muted-foreground">
            {status === "play" ? (turn === 1 ? "your turn" : "AI thinking…") : status === "won" ? "🎉 you win!" : status === "lost" ? "💀 AI wins" : "draw!"}
          </span>
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Column drop buttons */}
      <div className="flex gap-1">
        {Array.from({ length: COLS }, (_, c) => (
          <button key={c} onClick={() => playCol(c)} disabled={status !== "play" || turn !== 1 || board[0][c] !== 0}
            className="w-10 h-6 rounded-t-lg font-mono text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-20"
            style={{ borderBottom: lastCol === c ? `2px solid ${primary}` : "2px solid transparent" }}>
            ▼
          </button>
        ))}
      </div>

      {/* Board */}
      <div className="rounded-2xl p-2" style={{ background: "#1e3a8f" }}>
        {board.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((cell, c) => (
              <button key={c} onClick={() => playCol(c)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: 42, height: 42, margin: 2,
                  background: cell === 1 ? "#ef4444" : cell === 2 ? "#fbbf24" : "#0a1628",
                  boxShadow: isWin(r, c) ? `0 0 12px 3px ${cell === 1 ? "#ef4444" : "#fbbf24"}` : cell ? "inset 0 -2px 4px rgba(0,0,0,0.3)" : "inset 0 2px 4px rgba(0,0,0,0.4)",
                  border: isWin(r, c) ? "2px solid #fff" : "2px solid transparent",
                }}>
              </button>
            ))}
          </div>
        ))}
      </div>

      {(status === "won" || status === "lost" || status === "draw") && (
        <button onClick={reset} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">play again</button>
      )}
      <p className="font-mono text-xs text-muted-foreground">🔴 you · 🟡 AI · click column to drop</p>
    </div>
  )
}

