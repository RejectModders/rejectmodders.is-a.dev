"use client"
import { useState, useCallback } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#fbbf24", "#a855f7", "#f97316"]
const N = 12, MAX_MOVES = 22

function mkGrid(): number[][] {
  return Array.from({ length: N }, () => Array.from({ length: N }, () => Math.floor(Math.random() * COLORS.length)))
}

function flood(grid: number[][], newColor: number): number[][] {
  const ng = grid.map(r => [...r])
  const oldColor = ng[0][0]
  if (oldColor === newColor) return ng
  const stack: [number, number][] = [[0, 0]]
  const visited = new Set<string>()
  while (stack.length) {
    const [r, c] = stack.pop()!
    const key = `${r},${c}`
    if (visited.has(key)) continue
    if (r < 0 || r >= N || c < 0 || c >= N) continue
    if (ng[r][c] !== oldColor) continue
    visited.add(key)
    ng[r][c] = newColor
    stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1])
  }
  return ng
}

function isWon(grid: number[][]): boolean {
  const first = grid[0][0]
  return grid.every(r => r.every(c => c === first))
}

export function ColorFloodGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [grid, setGrid] = useState(mkGrid)
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [lost, setLost] = useState(false)
  const [hs, setHs] = useState(() => loadHS()["color-flood"] ?? 0)

  const reset = useCallback(() => { setGrid(mkGrid()); setMoves(0); setWon(false); setLost(false) }, [])

  const pick = useCallback((color: number) => {
    if (won || lost || grid[0][0] === color) return
    const ng = flood(grid, color)
    const nm = moves + 1
    setGrid(ng); setMoves(nm)
    if (isWon(ng)) {
      setWon(true)
      setHs(h => { const best = h === 0 ? nm : Math.min(h, nm); saveHS("color-flood", best); return best })
    } else if (nm >= MAX_MOVES) { setLost(true) }
  }, [grid, moves, won, lost])

  const filledCount = grid.flat().filter(c => c === grid[0][0]).length
  const pct = Math.round(filledCount / (N * N) * 100)

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5" /> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-primary">{moves}/{MAX_MOVES}</span>
          <span className="text-muted-foreground">{pct}%</span>
          {hs > 0 && <span className="text-muted-foreground">best: {hs}</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-xl overflow-hidden border border-primary/20">
        {grid.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <div key={c} style={{ width: 28, height: 28, background: COLORS[cell], transition: "background 0.15s" }} />
            ))}
          </div>
        ))}
      </div>

      {/* Color picker */}
      <div className="flex gap-2">
        {COLORS.map((color, i) => (
          <button key={i} onClick={() => pick(i)} disabled={won || lost}
            className="rounded-full transition-all"
            style={{
              width: 40, height: 40, background: color,
              border: grid[0][0] === i ? `3px solid #fff` : "3px solid transparent",
              opacity: grid[0][0] === i ? 0.5 : 1,
              boxShadow: grid[0][0] === i ? "none" : `0 2px 8px ${color}44`,
            }} />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: primary }} />
      </div>

      {won && (
        <div className="text-center">
          <p className="font-mono font-bold text-lg" style={{ color: primary }}>🎉 Flooded in {moves} moves!</p>
          <button onClick={reset} className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">play again</button>
        </div>
      )}
      {lost && (
        <div className="text-center">
          <p className="font-mono font-bold text-lg text-red-400">💀 Out of moves!</p>
          <button onClick={reset} className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">try again</button>
        </div>
      )}
      <p className="font-mono text-xs text-muted-foreground">pick a color to flood from top-left · fill the board in {MAX_MOVES} moves</p>
    </div>
  )
}

