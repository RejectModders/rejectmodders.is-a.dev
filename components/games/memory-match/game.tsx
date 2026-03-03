"use client"
import { useState, useCallback } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const EMOJIS = ["🎮","🎲","🎯","🎪","🎭","🎨","🎵","🎹","🏆","🚀","⚡","🔥","💎","🌟","🎸","🎻"]

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

function mkCards(pairs: number): { id: number; emoji: string }[] {
  const chosen = shuffle(EMOJIS).slice(0, pairs)
  return shuffle([...chosen, ...chosen].map((emoji, i) => ({ id: i, emoji })))
}

export function MemoryMatchGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [pairs, setPairs] = useState(8)
  const [cards, setCards] = useState(() => mkCards(8))
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [hs, setHs] = useState(() => loadHS()["memory-match"] ?? 0)
  const [busy, setBusy] = useState(false)

  const reset = useCallback((p = pairs) => {
    setPairs(p); setCards(mkCards(p)); setFlipped([]); setMatched(new Set()); setMoves(0); setWon(false); setBusy(false)
  }, [pairs])

  const flip = useCallback((idx: number) => {
    if (busy || won || flipped.includes(idx) || matched.has(cards[idx].emoji)) return
    const nf = [...flipped, idx]
    setFlipped(nf)
    if (nf.length === 2) {
      setMoves(m => m + 1)
      if (cards[nf[0]].emoji === cards[nf[1]].emoji) {
        const nm = new Set(matched); nm.add(cards[nf[0]].emoji); setMatched(nm)
        setFlipped([])
        if (nm.size === pairs) {
          setWon(true)
          const score = moves + 1
          setHs(h => { const best = h === 0 ? score : Math.min(h, score); saveHS("memory-match", best); return best })
        }
      } else {
        setBusy(true)
        setTimeout(() => { setFlipped([]); setBusy(false) }, 800)
      }
    }
  }, [busy, won, flipped, matched, cards, pairs, moves])

  const cols = pairs <= 6 ? 3 : pairs <= 8 ? 4 : 5

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5" /> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-primary">moves: {moves}</span>
          {hs > 0 && <span className="text-muted-foreground">best: {hs}</span>}
          <button onClick={() => reset()} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="flex gap-2">
        {[6, 8, 10].map(p => (
          <button key={p} onClick={() => reset(p)} className="px-3 py-1 rounded-lg font-mono text-xs transition-colors"
            style={{ background: pairs === p ? primary : "#1a1a1a", color: pairs === p ? "#000" : "#888", border: `1px solid ${pairs === p ? primary : "#333"}` }}>
            {p} pairs
          </button>
        ))}
      </div>

      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i)
          const isMatched = matched.has(card.emoji)
          const show = isFlipped || isMatched
          return (
            <button key={card.id} onClick={() => flip(i)}
              className="rounded-xl flex items-center justify-center text-2xl transition-all duration-200"
              style={{
                width: 64, height: 64,
                background: isMatched ? primary + "22" : show ? "#27272a" : "#1a1a1a",
                border: `2px solid ${isMatched ? primary + "66" : show ? primary : "#333"}`,
                transform: show ? "rotateY(0deg)" : "rotateY(0deg)",
                opacity: isMatched ? 0.7 : 1,
              }}>
              {show ? card.emoji : <span style={{ color: primary + "33", fontSize: 18 }}>?</span>}
            </button>
          )
        })}
      </div>

      {won && (
        <div className="text-center">
          <p className="font-mono font-bold text-lg" style={{ color: primary }}>🎉 Solved in {moves} moves!</p>
          <button onClick={() => reset()} className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">play again</button>
        </div>
      )}
      <p className="font-mono text-xs text-muted-foreground">flip two cards · match all pairs</p>
    </div>
  )
}

