"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function TicTacToePreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const CELL = 40, GAP = 6, GW = 3 * CELL + 2 * GAP
    const ox = (W - GW) / 2, oy = (H - GW) / 2
    const board: string[] = Array(9).fill("")
    const script: [number, string][] = [[4,"X"],[0,"O"],[2,"X"],[6,"O"],[8,"X"],[3,"O"],[5,"X"],[1,"O"],[7,"X"]]
    let step = 0, lastT = 0, raf = 0
    const draw = (now: number) => {
      if (now - lastT > 500) {
        lastT = now
        if (step < script.length) { const entry = script[step]; board[entry[0]] = entry[1]; step++ }
        else { for (let i = 0; i < 9; i++) board[i] = ""; step = 0 }
      }
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)
      // Grid lines
      ctx.strokeStyle = "#444"; ctx.lineWidth = 2
      for (let i = 1; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(ox + i * (CELL + GAP) - GAP / 2, oy); ctx.lineTo(ox + i * (CELL + GAP) - GAP / 2, oy + GW); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(ox, oy + i * (CELL + GAP) - GAP / 2); ctx.lineTo(ox + GW, oy + i * (CELL + GAP) - GAP / 2); ctx.stroke()
      }
      // Pieces
      for (let i = 0; i < 9; i++) {
        const r = Math.floor(i / 3), c = i % 3
        const cx = ox + c * (CELL + GAP) + CELL / 2, cy = oy + r * (CELL + GAP) + CELL / 2
        if (board[i] === "X") {
          ctx.strokeStyle = primary; ctx.lineWidth = 3; ctx.lineCap = "round"
          ctx.beginPath(); ctx.moveTo(cx - 12, cy - 12); ctx.lineTo(cx + 12, cy + 12); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(cx + 12, cy - 12); ctx.lineTo(cx - 12, cy + 12); ctx.stroke()
        } else if (board[i] === "O") {
          ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 3
          ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.stroke()
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}

