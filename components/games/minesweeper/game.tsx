"use client"
import { useState, useCallback, useRef } from "react"
import { ChevronLeft, RotateCcw, Flag, Bomb } from "lucide-react"
import { loadHS, saveHS } from "../helpers"

const COLS = 16, ROWS = 16, MINES = 40

type Cell = { mine: boolean; revealed: boolean; flagged: boolean; adj: number }
type Board = Cell[][]

function makeBoard(): Board {
  // empty grid
  const b: Board = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ mine: false, revealed: false, flagged: false, adj: 0 }))
  )
  return b
}

function plantMines(b: Board, safeR: number, safeC: number): Board {
  const nb = b.map(r => r.map(c => ({ ...c })))
  let placed = 0
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    if (nb[r][c].mine) continue
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue
    nb[r][c].mine = true; placed++
  }
  // calc adjacency
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (nb[r][c].mine) continue
    let count = 0
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && nb[nr][nc].mine) count++
    }
    nb[r][c].adj = count
  }
  return nb
}

function floodReveal(b: Board, r: number, c: number): Board {
  const nb = b.map(row => row.map(cell => ({ ...cell })))
  const queue = [[r, c]]
  while (queue.length) {
    const [cr, cc] = queue.pop()!
    if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue
    const cell = nb[cr][cc]
    if (cell.revealed || cell.flagged) continue
    cell.revealed = true
    if (cell.adj === 0 && !cell.mine) {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) queue.push([cr + dr, cc + dc])
    }
  }
  return nb
}

const ADJ_COLORS = ["", "#3b82f6","#22c55e","#ef4444","#7c3aed","#b91c1c","#0891b2","#111","#888"]

export function MinesweeperGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [board, setBoard] = useState<Board>(makeBoard)
  const [status, setStatus] = useState<"idle"|"playing"|"won"|"lost">("idle")
  const [flags, setFlags] = useState(MINES)
  const [time, setTime] = useState(0)
  const [hs, setHs] = useState(() => loadHS()["minesweeper"] ?? 0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const reset = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setBoard(makeBoard()); setStatus("idle"); setFlags(MINES); setTime(0)
    setHs(loadHS()["minesweeper"] ?? 0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const reveal = useCallback((r: number, c: number) => {
    setBoard(prev => {
      const cell = prev[r][c]
      if (cell.revealed || cell.flagged) return prev

      let nb = prev
      if (status === "idle") {
        // first click — plant mines avoiding this cell, then start timer
        nb = plantMines(prev, r, c)
        setStatus("playing")
        const started = Date.now()
        timerRef.current = setInterval(() => setTime(Math.floor((Date.now() - started) / 1000)), 1000)
      }

      if (nb[r][c].mine) {
        // reveal all mines
        const blown = nb.map(row => row.map(cell => ({ ...cell, revealed: cell.mine ? true : cell.revealed })))
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
        setStatus("lost"); return blown
      }

      const revealed = floodReveal(nb, r, c)
      const remaining = revealed.flat().filter(c => !c.mine && !c.revealed).length
      if (remaining === 0) {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
        setStatus("won")
        setTime(t => { saveHS("minesweeper", t); setHs(h => Math.min(h === 0 ? t : h, t)); return t })
      }
      return revealed
    })
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFlag = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault()
    if (status !== "playing" && status !== "idle") return
    setBoard(prev => {
      const cell = prev[r][c]; if (cell.revealed) return prev
      const nb = prev.map(row => row.map(c => ({ ...c })))
      nb[r][c].flagged = !nb[r][c].flagged
      setFlags(f => nb[r][c].flagged ? f - 1 : f + 1)
      return nb
    })
  }, [status])

  // Long press for mobile flagging
  const longPressTimer = useRef<ReturnType<typeof setTimeout>|null>(null)
  const longPressTriggered = useRef(false)

  const handleTouchStart = useCallback((r: number, c: number) => {
    longPressTriggered.current = false
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true
      // Simulate right-click flag
      if (status !== "playing" && status !== "idle") return
      setBoard(prev => {
        const cell = prev[r][c]; if (cell.revealed) return prev
        const nb = prev.map(row => row.map(c => ({ ...c })))
        nb[r][c].flagged = !nb[r][c].flagged
        setFlags(f => nb[r][c].flagged ? f - 1 : f + 1)
        return nb
      })
    }, 400)
  }, [status])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
  }, [])

  const handleClick = useCallback((r: number, c: number) => {
    if (longPressTriggered.current) { longPressTriggered.current = false; return }
    reveal(r, c)
  }, [reveal])

  const cellSize = "min(calc((100vw - 2rem) / 16), 36px)"

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full items-center justify-between" style={{ maxWidth: "min(calc(16 * 36px + 2px), 100%)" }}>
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> back
        </button>
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="flex items-center gap-1 text-primary"><Flag className="h-3 w-3" /> {flags}</span>
          <span className="text-muted-foreground">⏱ {time}s</span>
          {hs > 0 && <span className="text-muted-foreground">best: {hs}s</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary transition-colors"><RotateCcw className="h-3 w-3" /></button>
        </div>
      </div>

      <div className="relative overflow-auto w-full flex justify-center">
        <div
          className="grid border border-primary/20 rounded-lg overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${COLS}, ${cellSize})` }}
        >
          {board.map((row, r) => row.map((cell, c) => {
            let bg = "bg-zinc-800 hover:bg-zinc-700"
            let content: React.ReactNode = null
            if (cell.revealed) {
              bg = cell.mine ? "bg-red-900" : "bg-zinc-900"
              if (cell.mine) content = <Bomb className="h-3 w-3 text-red-400" />
              else if (cell.adj > 0) content = <span className="font-bold text-xs select-none" style={{ color: ADJ_COLORS[cell.adj] }}>{cell.adj}</span>
            } else if (cell.flagged) {
              content = <Flag className="h-3 w-3 text-red-400" />
            }
            return (
              <button
                key={`${r}-${c}`}
                className={`flex items-center justify-center border border-zinc-700/30 transition-colors touch-manipulation ${bg}`}
                style={{ aspectRatio: "1", width: cellSize }}
                onClick={() => handleClick(r, c)}
                onContextMenu={e => toggleFlag(e, r, c)}
                onTouchStart={() => handleTouchStart(r, c)}
                onTouchEnd={handleTouchEnd}
              >
                {content}
              </button>
            )
          }))}
        </div>

        {(status === "won" || status === "lost") && (
          <div className="absolute inset-0 rounded-lg flex flex-col items-center justify-center gap-3 bg-black/75">
            <p className="font-bold text-2xl" style={{ color: status === "won" ? "#fbbf24" : "#fff" }}>
              {status === "won" ? "🎉 You Win!" : "💥 Game Over"}
            </p>
            {status === "won" && <p className="font-mono text-sm text-muted-foreground">time: {time}s</p>}
            {hs > 0 && status === "won" && <p className="font-mono text-xs" style={{ color: primary }}>best: {hs}s</p>}
            <button onClick={reset} className="mt-1 px-5 py-2 rounded-lg font-mono text-sm bg-primary text-primary-foreground hover:opacity-90">
              play again
            </button>
          </div>
        )}
      </div>
      <p className="font-mono text-xs text-muted-foreground hidden md:block">left click reveal · right click flag</p>
      <p className="font-mono text-xs text-muted-foreground md:hidden">tap to reveal · long press to flag</p>
    </div>
  )
}
