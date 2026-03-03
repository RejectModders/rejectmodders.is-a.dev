"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function MemoryMatchPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const COLS = 4, ROWS = 3, CELL = 32, GAP = 6
    const GW = COLS * (CELL + GAP) - GAP, GH = ROWS * (CELL + GAP) - GAP
    const ox = (W - GW) / 2, oy = (H - GH) / 2
    const emojis = ["🎮","🎲","🎯","🎪","🎭","🎨"]
    const cards = [...emojis, ...emojis]
    const revealed = new Set<number>()
    const matched = new Set<number>()
    const flipSeq = [[0,6],[1,7],[3,2],[9,3],[8,2],[5,11]]
    let step = 0, phase: "flip1"|"flip2"|"pause" = "flip1", lastT = 0, flip1 = -1, flip2 = -1, raf = 0
    const draw = (now: number) => {
      if (now - lastT > 500) {
        lastT = now
        if (phase === "flip1") { flip1 = flipSeq[step % flipSeq.length][0]; revealed.add(flip1); phase = "flip2" }
        else if (phase === "flip2") { flip2 = flipSeq[step % flipSeq.length][1]; revealed.add(flip2); phase = "pause" }
        else {
          if (cards[flip1] === cards[flip2]) { matched.add(flip1); matched.add(flip2) }
          revealed.delete(flip1); revealed.delete(flip2); flip1 = -1; flip2 = -1
          step++; phase = "flip1"
          if (step >= flipSeq.length) { matched.clear(); step = 0 }
        }
      }
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)
      for (let i = 0; i < cards.length; i++) {
        const r = Math.floor(i / COLS), c = i % COLS
        const x = ox + c * (CELL + GAP), y = oy + r * (CELL + GAP)
        const show = revealed.has(i) || matched.has(i)
        ctx.fillStyle = matched.has(i) ? primary + "22" : show ? "#27272a" : "#1a1a1a"
        ctx.strokeStyle = matched.has(i) ? primary + "66" : show ? primary : "#333"
        ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.roundRect(x, y, CELL, CELL, 4); ctx.fill(); ctx.stroke()
        if (show) {
          ctx.font = "16px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"
          ctx.fillText(cards[i], x + CELL / 2, y + CELL / 2 + 1)
        } else {
          ctx.fillStyle = primary + "33"; ctx.font = "bold 14px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle"
          ctx.fillText("?", x + CELL / 2, y + CELL / 2)
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}

