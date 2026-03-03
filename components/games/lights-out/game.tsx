"use client"
import { useState, useCallback, useEffect } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const SIZES = { small: 5, medium: 7, large: 9 } as const
type Size = keyof typeof SIZES

function makeGrid(n: number): boolean[][] {
  return Array.from({ length: n }, () => Array(n).fill(false))
}
function toggle(grid: boolean[][], r: number, c: number, n: number): boolean[][] {
  const ng = grid.map(row => [...row])
  const neighbors: [number, number][] = [[r,c],[r-1,c],[r+1,c],[r,c-1],[r,c+1]]
  for (const [nr, nc] of neighbors)
    if (nr >= 0 && nr < n && nc >= 0 && nc < n) ng[nr][nc] = !ng[nr][nc]
  return ng
}
function randomPuzzle(n: number): boolean[][] {
  let g = makeGrid(n)
  // apply random toggles to generate a solvable puzzle
  let attempts = 0
  do {
    g = makeGrid(n)
    for (let i = 0; i < n * n * 2; i++) {
      const r = Math.floor(Math.random() * n), c = Math.floor(Math.random() * n)
      g = toggle(g, r, c, n)
    }
    attempts++
  } while (g.every(row => row.every(v => !v)) && attempts < 20) // ensure not already solved
  return g
}

export function LightsOutGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [size, setSize] = useState<Size>("medium")
  const n = SIZES[size]
  const [grid, setGrid] = useState(() => randomPuzzle(SIZES.medium))
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [hs, setHs] = useState(() => loadHS()["lights-out"] ?? 0)

  const newGame = useCallback((s: Size) => {
    setGrid(randomPuzzle(SIZES[s])); setMoves(0); setWon(false)
  }, [])

  const click = useCallback((r: number, c: number) => {
    if (won) return
    setGrid(prev => {
      const ng = toggle(prev, r, c, n)
      const allOff = ng.every(row => row.every(v => !v))
      if (allOff) {
        setWon(true)
        const m = moves + 1
        setHs(h => { const best = h === 0 ? m : Math.min(h, m); saveHS("lights-out", best); return best })
      }
      setMoves(m => m + 1)
      return ng
    })
  }, [won, n, moves])

  const CELL = Math.min(56, Math.floor(340 / n))

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> back
        </button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-muted-foreground">moves: {moves}</span>
          {hs > 0 && <span className="text-muted-foreground">best: {hs}</span>}
          <button onClick={() => newGame(size)} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="flex gap-2">
        {(Object.keys(SIZES) as Size[]).map(s => (
          <button key={s} onClick={() => { setSize(s); newGame(s) }}
            className="px-3 py-1 rounded-lg font-mono text-xs transition-colors"
            style={{ background: size === s ? primary : "#27272a", color: size === s ? "#000" : "#888" }}>
            {s} ({SIZES[s]}×{SIZES[s]})
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${n}, ${CELL}px)` }}>
          {grid.map((row, r) => row.map((on, c) => (
            <button key={`${r}-${c}`} onClick={() => click(r, c)}
              className="rounded-lg transition-all duration-150 active:scale-95"
              style={{
                width: CELL, height: CELL,
                background: on ? primary : "#1a1a1a",
                boxShadow: on ? `0 0 12px ${primary}88` : "none",
                border: `2px solid ${on ? primary : "#333"}`
              }} />
          )))}
        </div>
        {won && (
          <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-2 bg-black/80">
            <p className="font-bold text-2xl text-yellow-400">🎉 All Off!</p>
            <p className="font-mono text-sm text-muted-foreground">in {moves} moves</p>
            {hs > 0 && <p className="font-mono text-xs" style={{ color: primary }}>best: {hs}</p>}
            <button onClick={() => newGame(size)} className="mt-1 px-5 py-2 rounded-lg font-mono text-sm bg-primary text-primary-foreground">play again</button>
          </div>
        )}
      </div>
      <p className="font-mono text-xs text-muted-foreground">toggle a cell and its 4 neighbours · turn all off</p>
    </div>
  )
}

