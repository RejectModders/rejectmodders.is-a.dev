"use client"
import { useState, useCallback } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

type Cell = "" | "X" | "O"
type Board = Cell[]
const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

function checkWinner(b: Board): { winner: Cell; line: number[] } | null {
  for (const l of WINS) {
    if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return { winner: b[l[0]], line: l }
  }
  return null
}

function minimax(b: Board, isMax: boolean, depth: number): number {
  const w = checkWinner(b)
  if (w) return w.winner === "O" ? 10 - depth : depth - 10
  if (b.every(c => c)) return 0
  let best = isMax ? -Infinity : Infinity
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue
    b[i] = isMax ? "O" : "X"
    const s = minimax(b, !isMax, depth + 1)
    b[i] = ""
    best = isMax ? Math.max(best, s) : Math.min(best, s)
  }
  return best
}

function aiBestMove(b: Board): number {
  let best = -Infinity, move = -1
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue
    b[i] = "O"; const s = minimax(b, false, 0); b[i] = ""
    if (s > best) { best = s; move = i }
  }
  return move
}

export function TicTacToeGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [board, setBoard] = useState<Board>(Array(9).fill(""))
  const [status, setStatus] = useState<"play"|"won"|"lost"|"draw">("play")
  const [winLine, setWinLine] = useState<number[]>([])
  const [, setHs] = useState(() => loadHS()["tic-tac-toe"] ?? 0)
  const [thinking, setThinking] = useState(false)

  const reset = useCallback(() => { setBoard(Array(9).fill("")); setStatus("play"); setWinLine([]); setThinking(false) }, [])

  const play = useCallback((i: number) => {
    if (status !== "play" || board[i] || thinking) return
    const nb = [...board] as Board; nb[i] = "X"; setBoard(nb)
    const w = checkWinner(nb)
    if (w) { setWinLine(w.line); setStatus("won"); setHs(h => { const best = Math.max(h,1); saveHS("tic-tac-toe",best); return best }); return }
    if (nb.every(c => c)) { setStatus("draw"); return }
    setThinking(true)
    setTimeout(() => {
      const ai = aiBestMove([...nb]); if (ai >= 0) nb[ai] = "O"; setBoard([...nb])
      const aw = checkWinner(nb)
      if (aw) { setWinLine(aw.line); setStatus("lost"); setThinking(false); return }
      if (nb.every(c => c)) setStatus("draw")
      setThinking(false)
    }, 300)
  }, [board, status, thinking])

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xs mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5" /> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-muted-foreground">
            {status === "play" ? (thinking ? "AI thinking…" : "your turn (X)") : status === "won" ? "🎉 you win!" : status === "lost" ? "💀 AI wins" : "draw!"}
          </span>
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => {
          const isWin = winLine.includes(i)
          return (
            <button key={i} onClick={() => play(i)} disabled={!!cell || status !== "play" || thinking}
              className="flex items-center justify-center rounded-xl font-mono font-bold text-3xl transition-all"
              style={{ width: 80, height: 80, background: isWin ? primary + "33" : "#1a1a1a", border: `2px solid ${isWin ? primary : "#333"}`,
                color: cell === "X" ? primary : cell === "O" ? "#fbbf24" : "transparent", boxShadow: isWin ? `0 0 15px ${primary}44` : "none" }}>
              {cell || "·"}
            </button>
          )
        })}
      </div>
      {status !== "play" && <button onClick={reset} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">play again</button>}
      <p className="font-mono text-xs text-muted-foreground">you are X · AI is O (unbeatable)</p>
    </div>
  )
}
