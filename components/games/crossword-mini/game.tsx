"use client"
import { useState, useCallback } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

type Dir = "across" | "down"
type Clue = { num: number; dir: Dir; r: number; c: number; answer: string; clue: string }

const PUZZLES: { grid: string[][]; clues: Clue[] }[] = [
  {
    grid: [
      ["C","O","D","E","#"],
      ["#","#","A","#","#"],
      ["R","U","S","T","#"],
      ["#","#","H","#","#"],
      ["#","J","A","V","A"],
    ],
    clues: [
      { num: 1, dir: "across", r: 0, c: 0, answer: "CODE", clue: "What programmers write" },
      { num: 3, dir: "across", r: 2, c: 0, answer: "RUST", clue: "Memory-safe language by Mozilla" },
      { num: 5, dir: "across", r: 4, c: 1, answer: "JAVA", clue: "Write once, run anywhere language" },
      { num: 1, dir: "down", r: 0, c: 2, answer: "DASH", clue: "Hyphen's longer cousin" },
      { num: 2, dir: "down", r: 2, c: 1, answer: "UJA", clue: "___ board (fortune telling)" },
    ],
  },
  {
    grid: [
      ["B","Y","T","E","#"],
      ["#","#","Y","#","#"],
      ["N","O","P","E","#"],
      ["#","#","E","#","#"],
      ["#","L","S","E","T"],
    ],
    clues: [
      { num: 1, dir: "across", r: 0, c: 0, answer: "BYTE", clue: "8 bits" },
      { num: 3, dir: "across", r: 2, c: 0, answer: "NOPE", clue: "Negative response" },
      { num: 5, dir: "across", r: 4, c: 1, answer: "LSET", clue: "Left set (abbr)" },
      { num: 1, dir: "down", r: 0, c: 2, answer: "TYPES", clue: "TypeScript enforces these" },
      { num: 2, dir: "down", r: 2, c: 3, answer: "E_ET", clue: "Nearly (with missing letters)" },
    ],
  },
]

export function CrosswordMiniGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [pidx, setPidx] = useState(0)
  const puzzle = PUZZLES[pidx % PUZZLES.length]
  const N = 5
  const [input, setInput] = useState<string[][]>(() => puzzle.grid.map(r => r.map(c => c === "#" ? "#" : "")))
  const [sel, setSel] = useState<{ r: number; c: number }>({ r: 0, c: 0 })
  const [dir, setDir] = useState<Dir>("across")
  const [won, setWon] = useState(false)
  const [, setHs] = useState(() => loadHS()["crossword-mini"] ?? 0)

  const reset = useCallback((next = false) => {
    const ni = next ? pidx + 1 : pidx
    setPidx(ni); const p = PUZZLES[ni % PUZZLES.length]
    setInput(p.grid.map(r => r.map(c => c === "#" ? "#" : ""))); setSel({ r: 0, c: 0 }); setDir("across"); setWon(false)
  }, [pidx])

  const checkWin = useCallback((inp: string[][]) => {
    const p = PUZZLES[pidx % PUZZLES.length]
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (p.grid[r][c] !== "#" && inp[r][c].toUpperCase() !== p.grid[r][c]) return false
    }
    return true
  }, [pidx])

  const handleKey = useCallback((r: number, c: number, key: string) => {
    if (won) return
    if (key.length === 1 && /[a-zA-Z]/.test(key)) {
      const ni = input.map(r => [...r]); ni[r][c] = key.toUpperCase(); setInput(ni)
      if (checkWin(ni)) {
        setWon(true); setHs(h => { const best = Math.max(h, 1); saveHS("crossword-mini", best); return best })
        return
      }
      // Advance cursor
      if (dir === "across") { for (let nc = c + 1; nc < N; nc++) if (puzzle.grid[r][nc] !== "#") { setSel({ r, c: nc }); return } }
      else { for (let nr = r + 1; nr < N; nr++) if (puzzle.grid[nr][c] !== "#") { setSel({ r: nr, c }); return } }
    } else if (key === "Backspace") {
      const ni = input.map(r => [...r]); ni[r][c] = ""; setInput(ni)
      if (dir === "across") { for (let nc = c - 1; nc >= 0; nc--) if (puzzle.grid[r][nc] !== "#") { setSel({ r, c: nc }); return } }
      else { for (let nr = r - 1; nr >= 0; nr--) if (puzzle.grid[nr][c] !== "#") { setSel({ r: nr, c }); return } }
    } else if (key === "Tab" || key === " ") { setDir(d => d === "across" ? "down" : "across") }
  }, [input, dir, won, puzzle, checkWin, pidx])

  // Get clue number for a cell
  const clueNums = useCallback(() => {
    const nums: Record<string, number> = {}
    let n = 1
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (puzzle.grid[r][c] === "#") continue
      const startAcross = (c === 0 || puzzle.grid[r][c - 1] === "#") && c + 1 < N && puzzle.grid[r][c + 1] !== "#"
      const startDown = (r === 0 || puzzle.grid[r - 1]?.[c] === "#") && r + 1 < N && puzzle.grid[r + 1]?.[c] !== "#"
      if (startAcross || startDown) { nums[`${r},${c}`] = n++ }
    }
    return nums
  }, [puzzle])

  const nums = clueNums()

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5" /> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-muted-foreground">{dir}</span>
          <button onClick={() => reset()} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="flex gap-6 flex-wrap justify-center">
        {/* Grid */}
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}>
          {puzzle.grid.map((row, r) => row.map((cell, c) => {
            const isBlack = cell === "#"
            const isSel = sel.r === r && sel.c === c
            const num = nums[`${r},${c}`]
            return (
              <div key={`${r}-${c}`} className="relative" style={{ width: 44, height: 44 }}>
                {isBlack ? <div className="w-full h-full bg-zinc-900 rounded-sm" /> : (
                  <input
                    maxLength={1} value={input[r][c]}
                    onFocus={() => setSel({ r, c })}
                    onKeyDown={e => { e.preventDefault(); handleKey(r, c, e.key) }}
                    onChange={() => {}}
                    className="w-full h-full text-center font-mono font-bold text-lg rounded-sm outline-none transition-colors uppercase"
                    style={{
                      background: isSel ? primary + "33" : won ? "#22c55e22" : "#1a1a1a",
                      border: `2px solid ${isSel ? primary : won ? "#22c55e" : "#333"}`,
                      color: won ? "#22c55e" : "#e4e4e7", caretColor: primary,
                    }}
                  />
                )}
                {num && <span className="absolute top-0.5 left-1 font-mono text-[9px] text-muted-foreground">{num}</span>}
              </div>
            )
          }))}
        </div>

        {/* Clues */}
        <div className="text-left space-y-3 min-w-[140px]">
          <div>
            <h3 className="font-mono text-xs font-bold" style={{ color: primary }}>Across</h3>
            {puzzle.clues.filter(c => c.dir === "across").map(c => (
              <p key={c.num + c.dir} className="font-mono text-[11px] text-muted-foreground">{c.num}. {c.clue}</p>
            ))}
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold" style={{ color: primary }}>Down</h3>
            {puzzle.clues.filter(c => c.dir === "down").map(c => (
              <p key={c.num + c.dir} className="font-mono text-[11px] text-muted-foreground">{c.num}. {c.clue}</p>
            ))}
          </div>
        </div>
      </div>

      {won && (
        <div className="text-center">
          <p className="font-mono font-bold text-lg" style={{ color: primary }}>🎉 Solved!</p>
          <button onClick={() => reset(true)} className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">next puzzle</button>
        </div>
      )}
      <p className="font-mono text-xs text-muted-foreground">type letters · space to toggle direction · tab to switch</p>
    </div>
  )
}

