"use client"
import { useState, useCallback } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const PUZZLES = [
  {
    words: ["REACT", "NEXT", "NODE", "HTML", "CODE", "TYPE"],
    grid: [
      "REACTK","NWXTHP","OXTYML","DHTMLE","ECODED","TYPEJB",
    ],
    positions: {
      REACT: [[0,0],[0,1],[0,2],[0,3],[0,4]],
      NEXT: [[1,0],[1,1],[1,2],[1,3]],
      NODE: [[2,0],[3,0],[4,0],[4,1]],
      HTML: [[3,1],[3,2],[3,3],[3,4]],
      CODE: [[4,1],[4,2],[4,3],[4,4]],
      TYPE: [[5,0],[5,1],[5,2],[5,3]],
    } as Record<string, [number, number][]>,
  },
  {
    words: ["RUST", "JAVA", "RUBY", "PYTHON", "GO"],
    grid: [
      "RUSTGP","JAVAXO","XRUBYN","TPGOQT","HILSVH","NKJMWO",
    ],
    positions: {
      RUST: [[0,0],[0,1],[0,2],[0,3]],
      JAVA: [[1,0],[1,1],[1,2],[1,3]],
      RUBY: [[2,1],[2,2],[2,3],[2,4]],
      GO: [[3,2],[3,3]],
      PYTHON: [[0,5],[1,5],[2,5],[3,5],[4,5],[5,5]],
    } as Record<string, [number, number][]>,
  },
]

export function WordSearchGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [pidx, setPidx] = useState(0)
  const puzzle = PUZZLES[pidx % PUZZLES.length]
  const N = 6
  const [found, setFound] = useState<Set<string>>(new Set())
  const [selecting, setSelecting] = useState<[number, number][]>([])
  const [won, setWon] = useState(false)
  const [, setHs] = useState(() => loadHS()["word-search"] ?? 0)

  const reset = useCallback((next = false) => {
    if (next) setPidx(p => p + 1)
    setFound(new Set()); setSelecting([]); setWon(false)
  }, [])

  const isFound = (r: number, c: number) => {
    for (const w of found) {
      const pos = puzzle.positions[w]
      if (pos?.some(([pr, pc]) => pr === r && pc === c)) return true
    }
    return false
  }

  const isSelecting = (r: number, c: number) => selecting.some(([sr, sc]) => sr === r && sc === c)

  const handleClick = useCallback((r: number, c: number) => {
    if (won) return
    const ns = [...selecting, [r, c] as [number, number]]
    setSelecting(ns)
    // Check if current selection matches any word
    for (const word of puzzle.words) {
      if (found.has(word)) continue
      const pos = puzzle.positions[word]
      if (pos.length === ns.length && pos.every(([pr, pc], i) => pr === ns[i][0] && pc === ns[i][1])) {
        const nf = new Set(found); nf.add(word); setFound(nf); setSelecting([])
        if (nf.size === puzzle.words.length) {
          setWon(true); setHs(h => { const best = Math.max(h, 1); saveHS("word-search", best); return best })
        }
        return
      }
    }
    // If too long or clearly wrong, reset selection
    if (ns.length >= 7) setSelecting([])
  }, [selecting, found, puzzle, won])

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5" /> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-primary">{found.size}/{puzzle.words.length} found</span>
          <button onClick={() => reset()} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Word list */}
      <div className="flex flex-wrap gap-2 justify-center">
        {puzzle.words.map(w => (
          <span key={w} className="px-2 py-1 rounded font-mono text-xs font-bold"
            style={{ background: found.has(w) ? primary + "22" : "#1a1a1a", color: found.has(w) ? primary : "#888",
              textDecoration: found.has(w) ? "line-through" : "none", border: `1px solid ${found.has(w) ? primary + "44" : "#333"}` }}>
            {w}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}>
        {puzzle.grid.map((row, r) =>
          row.split("").map((letter: string, c: number) => (
            <button key={`${r}-${c}`} onClick={() => handleClick(r, c)}
              className="flex items-center justify-center rounded-lg font-mono font-bold text-lg transition-all"
              style={{
                width: 44, height: 44,
                background: isFound(r, c) ? primary + "22" : isSelecting(r, c) ? primary + "33" : "#1a1a1a",
                border: `2px solid ${isFound(r, c) ? primary + "66" : isSelecting(r, c) ? primary : "#333"}`,
                color: isFound(r, c) ? primary : isSelecting(r, c) ? "#fff" : "#888",
              }}>
              {letter}
            </button>
          ))
        )}
      </div>

      {selecting.length > 0 && (
        <button onClick={() => setSelecting([])} className="px-4 py-1 rounded-lg border border-red-500/30 text-red-400 font-mono text-xs hover:bg-red-500/10">
          clear selection
        </button>
      )}

      {won && (
        <div className="text-center">
          <p className="font-mono font-bold text-lg" style={{ color: primary }}>🎉 All words found!</p>
          <button onClick={() => reset(true)} className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">next puzzle</button>
        </div>
      )}
      <p className="font-mono text-xs text-muted-foreground">click letters in order to find words</p>
    </div>
  )
}

