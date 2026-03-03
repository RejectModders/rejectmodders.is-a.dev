"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, RotateCcw, ChevronUp, ChevronDown, ChevronRight } from "lucide-react"
import { loadHS, saveHS } from "../helpers"

const SIZE = 4

type Grid = (number | 0)[][]

const TILE_COLORS: Record<number, { bg: string; fg: string }> = {
  0:    { bg: "#1a1a1a",  fg: "#888"    },
  2:    { bg: "#eee4da",  fg: "#776e65" },
  4:    { bg: "#ede0c8",  fg: "#776e65" },
  8:    { bg: "#f2b179",  fg: "#fff"    },
  16:   { bg: "#f59563",  fg: "#fff"    },
  32:   { bg: "#f67c5f",  fg: "#fff"    },
  64:   { bg: "#f65e3b",  fg: "#fff"    },
  128:  { bg: "#edcf72",  fg: "#fff"    },
  256:  { bg: "#edcc61",  fg: "#fff"    },
  512:  { bg: "#edc850",  fg: "#fff"    },
  1024: { bg: "#edc53f",  fg: "#fff"    },
  2048: { bg: "#edc22e",  fg: "#fff"    },
}

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function addRandom(g: Grid): Grid {
  const empty: [number, number][] = []
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!g[r][c]) empty.push([r, c])
  if (!empty.length) return g
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  const ng = g.map(row => [...row]) as Grid
  ng[r][c] = Math.random() < 0.9 ? 2 : 4
  return ng
}

function slideRow(row: number[]): { row: number[]; pts: number } {
  const nums = row.filter(Boolean)
  let pts = 0
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i] === nums[i + 1]) {
      nums[i] *= 2; pts += nums[i]; nums[i + 1] = 0
    }
  }
  const merged = nums.filter(Boolean)
  while (merged.length < SIZE) merged.push(0)
  return { row: merged, pts }
}

function move(g: Grid, dir: "left" | "right" | "up" | "down"): { grid: Grid; pts: number; moved: boolean } {
  let ng = g.map(r => [...r]) as Grid
  let pts = 0, moved = false

  const applyLeft = (grid: Grid) => {
    for (let r = 0; r < SIZE; r++) {
      const { row, pts: p } = slideRow(grid[r])
      if (row.join() !== grid[r].join()) moved = true
      grid[r] = row; pts += p
    }
  }
  const rotCW = (grid: Grid): Grid =>
    Array.from({ length: SIZE }, (_, r) => Array.from({ length: SIZE }, (_, c) => grid[SIZE - 1 - c][r]))
  const rotCCW = (grid: Grid): Grid =>
    Array.from({ length: SIZE }, (_, r) => Array.from({ length: SIZE }, (_, c) => grid[c][SIZE - 1 - r]))
  const flip = (grid: Grid): Grid => grid.map(r => [...r].reverse())

  if (dir === "left")  { applyLeft(ng) }
  if (dir === "right") { ng = flip(ng); applyLeft(ng); ng = flip(ng) }
  if (dir === "up")    { ng = rotCCW(ng); applyLeft(ng); ng = rotCW(ng) }
  if (dir === "down")  { ng = rotCW(ng); applyLeft(ng); ng = rotCCW(ng) }

  return { grid: ng, pts, moved }
}

function hasMove(g: Grid): boolean {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (!g[r][c]) return true
      if (c < SIZE - 1 && g[r][c] === g[r][c + 1]) return true
      if (r < SIZE - 1 && g[r][c] === g[r + 1][c]) return true
    }
  return false
}

export function Game2048({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [grid, setGrid] = useState<Grid>(() => addRandom(addRandom(emptyGrid())))
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => loadHS()["2048"] ?? 0)
  const [over, setOver] = useState(false)
  const [won, setWon] = useState(false)
  const [continueAfterWin, setContinueAfterWin] = useState(false)

  const doMove = useCallback((dir: "left" | "right" | "up" | "down") => {
    setGrid(g => {
      const { grid: ng, pts, moved } = move(g, dir)
      if (!moved) return g
      const withNew = addRandom(ng)
      setScore(s => {
        const ns = s + pts
        setBest(b => {
          const nb = Math.max(b, ns)
          saveHS("2048", nb)
          return nb
        })
        return ns
      })
      if (!continueAfterWin && withNew.some(r => r.some(v => v === 2048))) setWon(true)
      if (!hasMove(withNew)) setOver(true)
      return withNew
    })
  }, [continueAfterWin])

  const restart = useCallback(() => {
    setGrid(addRandom(addRandom(emptyGrid())))
    setScore(0); setOver(false); setWon(false); setContinueAfterWin(false)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, "left"|"right"|"up"|"down"> = {
        ArrowLeft:"left", a:"left", A:"left",
        ArrowRight:"right", d:"right", D:"right",
        ArrowUp:"up", w:"up", W:"up",
        ArrowDown:"down", s:"down", S:"down",
      }
      if (map[e.key]) { e.preventDefault(); doMove(map[e.key]) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [doMove])

  // Touch swipe
  const touchRef = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    const dy = e.changedTouches[0].clientY - touchRef.current.y
    if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? "right" : "left")
    else doMove(dy > 0 ? "down" : "up")
    touchRef.current = null
  }

  const CELL = 72, GAP = 8
  const BOARD = SIZE * CELL + (SIZE + 1) * GAP

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      {/* top bar */}
      <div className="flex w-full items-center justify-between" style={{ maxWidth: BOARD }}>
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> back
        </button>
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="text-primary">score: {score}</span>
          <span className="text-muted-foreground">best: {best}</span>
          <button onClick={restart} className="text-muted-foreground hover:text-primary transition-colors">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* board */}
      <div
        className="relative rounded-xl touch-none"
        style={{ width: BOARD, height: BOARD, background: "#111", padding: GAP, gap: GAP }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* background cells */}
        <div className="absolute inset-0 rounded-xl p-[8px] grid gap-[8px]" style={{ gridTemplateColumns: `repeat(${SIZE},1fr)` }}>
          {Array.from({ length: SIZE * SIZE }).map((_, i) => (
            <div key={i} className="rounded-lg" style={{ background: "#1a1a1a" }} />
          ))}
        </div>

        {/* tiles */}
        <div className="relative grid gap-[8px]" style={{ gridTemplateColumns: `repeat(${SIZE},1fr)`, zIndex: 1 }}>
          {grid.flat().map((val, i) => {
            const colors = TILE_COLORS[val] ?? TILE_COLORS[2048]
            return (
              <div
                key={i}
                className="flex items-center justify-center rounded-lg font-bold transition-all duration-100"
                style={{
                  width: CELL, height: CELL,
                  background: colors.bg,
                  color: colors.fg,
                  fontSize: val >= 1024 ? 18 : val >= 128 ? 22 : 26,
                  opacity: val ? 1 : 0,
                }}
              >
                {val || ""}
              </div>
            )
          })}
        </div>

        {/* overlays */}
        {(over || (won && !continueAfterWin)) && (
          <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-3 z-20"
            style={{ background: "rgba(0,0,0,0.75)" }}>
            <p className="font-bold text-2xl" style={{ color: won ? "#fbbf24" : "#fff" }}>
              {won ? "🎉 2048!" : "Game Over"}
            </p>
            <p className="font-mono text-sm text-muted-foreground">score: {score}</p>
            <div className="flex gap-3">
              {won && !over && (
                <button onClick={() => setContinueAfterWin(true)}
                  className="px-4 py-2 rounded-lg font-mono text-xs border border-primary/40 text-primary hover:bg-primary/10 transition-colors">
                  keep going
                </button>
              )}
              <button onClick={restart}
                className="px-4 py-2 rounded-lg font-mono text-xs bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                new game
              </button>
            </div>
          </div>
        )}
      </div>

      {/* mobile d-pad */}
      <div className="grid grid-cols-3 gap-2 md:hidden mt-1">
        <div />
        <button onClick={() => doMove("up")} className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none">
          <ChevronUp className="h-6 w-6" />
        </button>
        <div />
        <button onClick={() => doMove("left")} className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button onClick={() => doMove("down")} className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none">
          <ChevronDown className="h-6 w-6" />
        </button>
        <button onClick={() => doMove("right")} className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 active:bg-primary/30 text-primary touch-none">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <p className="font-mono text-xs text-muted-foreground hidden md:block">arrow keys / WASD · swipe on mobile</p>
    </div>
  )
}

