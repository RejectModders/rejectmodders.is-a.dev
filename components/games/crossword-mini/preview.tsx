"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function CrosswordMiniPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const N = 5, CELL = 22, GAP = 2
    const GW = N * (CELL + GAP), GH = N * (CELL + GAP)
    const ox = W / 2 - GW / 2 - 30, oy = (H - GH) / 2
    const grid = [
      ["C","O","D","E","#"],["#","#","A","#","#"],["R","U","S","T","#"],["#","#","H","#","#"],["#","J","A","V","A"],
    ]
    const filled: string[][] = grid.map(r => r.map(c => c === "#" ? "#" : ""))
    const order: [number, number][] = []
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (grid[r][c] !== "#") order.push([r, c])
    let step = 0, lastT = 0, raf = 0, selR = 0, selC = 0
    const draw = (now: number) => {
      if (now - lastT > 250) {
        lastT = now
        if (step < order.length) {
          const [r, c] = order[step]; filled[r][c] = grid[r][c]; selR = r; selC = c; step++
        } else { step = 0; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (grid[r][c] !== "#") filled[r][c] = "" }
      }
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const x = ox + c * (CELL + GAP), y = oy + r * (CELL + GAP)
        if (grid[r][c] === "#") { ctx.fillStyle = "#111"; ctx.fillRect(x, y, CELL, CELL); continue }
        const isSel = r === selR && c === selC
        ctx.fillStyle = isSel ? primary + "33" : "#1a1a1a"
        ctx.strokeStyle = isSel ? primary : "#333"; ctx.lineWidth = 1
        ctx.beginPath(); ctx.rect(x, y, CELL, CELL); ctx.fill(); ctx.stroke()
        if (filled[r][c]) {
          ctx.fillStyle = primary; ctx.font = "bold 12px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle"
          ctx.fillText(filled[r][c], x + CELL / 2, y + CELL / 2)
        }
      }
      // Clue hints
      const clueX = ox + GW + 16
      ctx.fillStyle = primary; ctx.font = "bold 9px monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top"
      ctx.fillText("ACROSS", clueX, oy)
      ctx.fillStyle = "#666"; ctx.font = "8px monospace"
      ctx.fillText("1. Programmers write", clueX, oy + 13)
      ctx.fillText("3. Mozilla's lang", clueX, oy + 24)
      ctx.fillStyle = primary; ctx.font = "bold 9px monospace"
      ctx.fillText("DOWN", clueX, oy + 42)
      ctx.fillStyle = "#666"; ctx.font = "8px monospace"
      ctx.fillText("1. Longer hyphen", clueX, oy + 55)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}

