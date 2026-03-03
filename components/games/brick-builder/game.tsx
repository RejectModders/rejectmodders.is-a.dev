"use client"
import { useState, useCallback, useEffect } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

// 0=empty, 1=wall, 2=floor, 3=target, 4=box, 5=box-on-target, 6=player, 7=player-on-target
type Cell = number
const LEVELS: { grid: Cell[][]; name: string }[] = [
  {
    name: "Tutorial",
    grid: [
      [1,1,1,1,1,0],
      [1,2,2,2,1,0],
      [1,2,4,3,1,0],
      [1,6,2,2,1,0],
      [1,1,1,1,1,0],
    ],
  },
  {
    name: "Two Boxes",
    grid: [
      [1,1,1,1,1,1],
      [1,2,2,2,2,1],
      [1,2,4,4,2,1],
      [1,6,2,2,2,1],
      [1,2,3,3,2,1],
      [1,1,1,1,1,1],
    ],
  },
  {
    name: "Corner",
    grid: [
      [1,1,1,1,1,1],
      [1,3,2,2,2,1],
      [1,2,1,4,2,1],
      [1,2,4,2,2,1],
      [1,2,2,6,3,1],
      [1,1,1,1,1,1],
    ],
  },
  {
    name: "L-Shape",
    grid: [
      [0,1,1,1,1,0],
      [1,1,2,2,1,0],
      [1,6,4,2,1,0],
      [1,2,4,2,1,1],
      [1,3,2,2,3,1],
      [1,1,1,1,1,1],
    ],
  },
  {
    name: "Three Pack",
    grid: [
      [1,1,1,1,1,1,1],
      [1,2,2,3,2,2,1],
      [1,2,1,3,1,2,1],
      [1,2,4,4,4,2,1],
      [1,2,2,6,2,3,1],
      [1,1,1,1,1,1,1],
    ],
  },
]

function cloneGrid(g: Cell[][]): Cell[][] { return g.map(r => [...r]) }

function findPlayer(g: Cell[][]): [number, number] {
  for (let r = 0; r < g.length; r++) for (let c = 0; c < g[r].length; c++)
    if (g[r][c] === 6 || g[r][c] === 7) return [r, c]
  return [0, 0]
}

function isWon(g: Cell[][]): boolean {
  for (let r = 0; r < g.length; r++) for (let c = 0; c < g[r].length; c++)
    if (g[r][c] === 3 || g[r][c] === 7) return false // target without box, or player on target without box
  // Check: all targets must have boxes (cell value 5)
  for (let r = 0; r < g.length; r++) for (let c = 0; c < g[r].length; c++)
    if (g[r][c] === 4) return false // box not on target
  return true
}

function tryMove(grid: Cell[][], dr: number, dc: number): Cell[][] | null {
  const g = cloneGrid(grid)
  const [pr, pc] = findPlayer(g)
  const nr = pr + dr, nc = pc + dc
  if (nr < 0 || nr >= g.length || nc < 0 || nc >= g[0].length) return null

  const target = g[nr][nc]
  // Wall
  if (target === 1) return null
  // Box or box-on-target
  if (target === 4 || target === 5) {
    const br = nr + dr, bc = nc + dc
    if (br < 0 || br >= g.length || bc < 0 || bc >= g[0].length) return null
    const behind = g[br][bc]
    if (behind === 1 || behind === 4 || behind === 5) return null // can't push
    // Move box
    g[br][bc] = behind === 3 ? 5 : 4 // box or box-on-target
    g[nr][nc] = target === 5 ? 3 : 2 // reveal target or floor
  }
  // Move player
  const dest = g[nr][nc]
  g[nr][nc] = dest === 3 ? 7 : 6 // player or player-on-target
  g[pr][pc] = g[pr][pc] === 7 ? 3 : (grid[pr][pc] === 7 ? 3 : 2) // leave target or floor
  // Fix: check original cell
  const origCell = grid[pr][pc]
  g[pr][pc] = (origCell === 6) ? 2 : (origCell === 7) ? 3 : 2
  return g
}

export function BrickBuilderGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [level, setLevel] = useState(0)
  const [grid, setGrid] = useState(() => cloneGrid(LEVELS[0].grid))
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [history, setHistory] = useState<Cell[][][]>([])
  const [hs, setHs] = useState(() => loadHS()["brick-builder"] ?? 0)

  const loadLevel = useCallback((lvl: number) => {
    const l = LEVELS[lvl % LEVELS.length]
    setGrid(cloneGrid(l.grid)); setMoves(0); setWon(false); setHistory([])
    setLevel(lvl % LEVELS.length)
  }, [])

  const reset = useCallback(() => loadLevel(level), [level, loadLevel])

  const move = useCallback((dr: number, dc: number) => {
    if (won) return
    const ng = tryMove(grid, dr, dc)
    if (!ng) return
    setHistory(h => [...h.slice(-50), cloneGrid(grid)])
    setGrid(ng); setMoves(m => m + 1)
    if (isWon(ng)) {
      setWon(true)
      const best = Math.max(level + 1, hs)
      setHs(best); saveHS("brick-builder", best)
    }
  }, [grid, won, level, hs])

  const undo = useCallback(() => {
    if (!history.length || won) return
    setGrid(history[history.length - 1])
    setHistory(h => h.slice(0, -1))
    setMoves(m => m - 1)
  }, [history, won])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") { e.preventDefault(); move(-1, 0) }
      if (e.key === "ArrowDown" || e.key === "s") { e.preventDefault(); move(1, 0) }
      if (e.key === "ArrowLeft" || e.key === "a") { e.preventDefault(); move(0, -1) }
      if (e.key === "ArrowRight" || e.key === "d") { e.preventDefault(); move(0, 1) }
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo() }
      if (e.key === "r" || e.key === "R") reset()
    }
    window.addEventListener("keydown", down); return () => window.removeEventListener("keydown", down)
  }, [move, undo, reset])

  const CELL = 48
  const COLORS: Record<number, string> = {
    0: "transparent", 1: "#444", 2: "#1a1a1a", 3: "#1a1a1a",
    4: "#b45309", 5: "#b45309", 6: primary, 7: primary,
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5" /> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-muted-foreground">lv.{level + 1} "{LEVELS[level].name}"</span>
          <span className="text-primary">moves: {moves}</span>
          <button onClick={undo} disabled={!history.length} className="text-muted-foreground hover:text-primary disabled:opacity-30 font-mono text-xs">undo</button>
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Level select */}
      <div className="flex gap-1.5">
        {LEVELS.map((l, i) => (
          <button key={i} onClick={() => loadLevel(i)}
            className="px-2.5 py-1 rounded font-mono text-xs transition-colors"
            style={{ background: level === i ? primary : "#1a1a1a", color: level === i ? "#000" : "#888", border: `1px solid ${level === i ? primary : "#333"}` }}>
            {i + 1}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="rounded-xl border border-primary/20 p-2" style={{ background: "#111" }}>
        {grid.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <div key={c} className="flex items-center justify-center" style={{ width: CELL, height: CELL }}>
                {cell === 0 ? null : (
                  <div className="rounded-md flex items-center justify-center transition-all"
                    style={{
                      width: cell === 1 ? CELL : CELL - 4, height: cell === 1 ? CELL : CELL - 4,
                      background: COLORS[cell],
                      border: cell === 4 || cell === 5 ? "2px solid #92400e" : cell === 1 ? "none" : `1px solid #333`,
                      boxShadow: cell === 5 ? `0 0 10px ${primary}44` : cell === 6 || cell === 7 ? `0 0 8px ${primary}44` : "none",
                    }}>
                    {(cell === 3 || cell === 5 || cell === 7) && (
                      <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: primary + "88", background: cell === 5 ? primary + "44" : "transparent" }} />
                    )}
                    {(cell === 4) && <span className="text-lg">📦</span>}
                    {(cell === 5) && <span className="text-lg">📦</span>}
                    {(cell === 6 || cell === 7) && <span className="text-lg">🧑</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-1 w-32">
        <div />
        <button onClick={() => move(-1, 0)} className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-center font-mono text-sm">↑</button>
        <div />
        <button onClick={() => move(0, -1)} className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-center font-mono text-sm">←</button>
        <button onClick={() => move(1, 0)} className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-center font-mono text-sm">↓</button>
        <button onClick={() => move(0, 1)} className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-center font-mono text-sm">→</button>
      </div>

      {won && (
        <div className="text-center">
          <p className="font-mono font-bold text-lg" style={{ color: primary }}>🎉 Level {level + 1} complete!</p>
          {level + 1 < LEVELS.length ? (
            <button onClick={() => loadLevel(level + 1)} className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">next level</button>
          ) : (
            <p className="font-mono text-sm text-muted-foreground mt-1">All levels complete!</p>
          )}
        </div>
      )}
      <p className="font-mono text-xs text-muted-foreground">arrows/WASD to move · push 📦 onto targets · Ctrl+Z undo</p>
    </div>
  )
}

