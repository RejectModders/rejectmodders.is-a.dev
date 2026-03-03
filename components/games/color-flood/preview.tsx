"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function ColorFloodPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#fbbf24", "#a855f7", "#f97316"]
    const N = 10, CELL = Math.floor(Math.min(W - 40, H - 30) / N)
    const ox = (W - N * CELL) / 2, oy = (H - N * CELL) / 2 + 6
    let grid = Array.from({ length: N }, () => Array.from({ length: N }, () => Math.floor(Math.random() * COLORS.length)))
    let moves = 0, colorIdx = 0, lastT = 0, raf = 0
    const flood = (g: number[][], nc: number) => {
      const ng = g.map(r => [...r]); const oc = ng[0][0]; if (oc === nc) return ng
      const stack: [number, number][] = [[0, 0]]; const vis = new Set<string>()
      while (stack.length) {
        const [r, c] = stack.pop()!; const k = `${r},${c}`; if (vis.has(k)) continue
        if (r < 0 || r >= N || c < 0 || c >= N || ng[r][c] !== oc) continue
        vis.add(k); ng[r][c] = nc; stack.push([r-1,c],[r+1,c],[r,c-1],[r,c+1])
      }
      return ng
    }
    const draw = (now: number) => {
      if (now - lastT > 400) {
        lastT = now; colorIdx = (colorIdx + 1) % COLORS.length
        if (grid[0][0] !== colorIdx) { grid = flood(grid, colorIdx); moves++ }
        if (grid.every(r => r.every(c => c === grid[0][0])) || moves > 30) {
          grid = Array.from({ length: N }, () => Array.from({ length: N }, () => Math.floor(Math.random() * COLORS.length)))
          moves = 0
        }
      }
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        ctx.fillStyle = COLORS[grid[r][c]]
        ctx.fillRect(ox + c * CELL, oy + r * CELL, CELL - 1, CELL - 1)
      }
      // Color palette at bottom
      const pw = 16, pg = 4, totalPW = COLORS.length * (pw + pg)
      const px = (W - totalPW) / 2
      COLORS.forEach((color, i) => {
        ctx.fillStyle = color; ctx.globalAlpha = grid[0][0] === i ? 0.4 : 1
        ctx.beginPath(); ctx.arc(px + i * (pw + pg) + pw / 2, oy - 10, 6, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      })
      ctx.fillStyle = primary; ctx.font = "bold 9px monospace"; ctx.textAlign = "right"; ctx.textBaseline = "top"
      ctx.fillText(`${moves}/22`, W - 6, 4)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}

