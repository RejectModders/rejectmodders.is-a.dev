"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

export function MinesweeperPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const COLS = 11, ROWS = 8
    const CW = Math.floor(W / COLS), CH = Math.floor(H / ROWS)
    const NUM_COLORS = ["","#3b82f6","#22c55e","#ef4444","#7c3aed","#b91c1c","#0891b2","#555","#888"]

    // -1=mine, -2=flag, 0=hidden, 9=revealed-empty, 1-8=number
    const BOARD: number[][] = [
      [9,9,9,1,0,0,0,0,0,0,0],
      [9,1,1,1,1,0,0,0,0,0,0],
      [1,1,0,0,1,1,1,0,0,0,0],
      [-2,1,0,0,0,-2,1,1,0,0,0],
      [1,1,1,1,1,1,9,9,1,0,0],
      [0,1,9,9,9,9,9,9,1,0,0],
      [0,0,1,1,1,1,9,9,1,0,0],
      [0,0,0,0,0,1,1,1,1,0,0],
    ]
    // Cells to "reveal" over time: sets them to 9 (empty) or the number
    const REVEAL_SCRIPT: [number,number,number][] = [
      [0,4,9],[0,5,1],[0,6,9],[0,7,9],[0,8,9],[0,9,9],[0,10,9],
      [1,5,1],[1,6,9],[1,7,9],[1,8,9],[1,9,9],[1,10,9],
      [2,2,9],[2,3,9],[2,8,9],[2,9,9],[2,10,9],
      [3,2,9],[3,3,9],[3,4,9],[3,9,9],[3,10,9],
      [4,9,9],[4,10,9],
      [5,0,1],[5,9,9],[5,10,9],
      [6,0,1],[6,9,9],[6,10,9],
      [7,0,1],[7,9,9],[7,10,9],
    ]
    const board = BOARD.map(r => [...r])
    let revIdx = 0, lastRev = 0, raf = 0

    const drawFlag = (cx: number, cy: number) => {
      // Flag pole
      ctx.strokeStyle = "#888"; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx, cy + CH * 0.4); ctx.lineTo(cx, cy - CH * 0.35); ctx.stroke()
      // Flag triangle
      ctx.fillStyle = "#ef4444"
      ctx.beginPath(); ctx.moveTo(cx, cy - CH * 0.35); ctx.lineTo(cx + CW * 0.4, cy - CH * 0.1); ctx.lineTo(cx, cy + CH * 0.1); ctx.closePath(); ctx.fill()
    }

    const drawMine = (cx: number, cy: number) => {
      ctx.fillStyle = "#333"
      ctx.beginPath(); ctx.arc(cx, cy, Math.min(CW, CH) * 0.3, 0, Math.PI * 2); ctx.fill()
      // Spikes
      ctx.strokeStyle = "#444"; ctx.lineWidth = 1.5
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2
        const r1 = Math.min(CW, CH) * 0.28, r2 = Math.min(CW, CH) * 0.42
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1)
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); ctx.stroke()
      }
      ctx.fillStyle = "#fff"
      ctx.beginPath(); ctx.arc(cx - 2, cy - 2, 2, 0, Math.PI * 2); ctx.fill()
    }

    const draw = (now: number) => {
      if (now - lastRev > 300 && revIdx < REVEAL_SCRIPT.length) {
        lastRev = now
        const [r, c, v] = REVEAL_SCRIPT[revIdx++]
        board[r][c] = v
      }

      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)

      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const v = board[r][c]
        const x = c * CW, y = r * CH

        // Cell background
        if (v === 9) ctx.fillStyle = "#18181b"
        else if (v === -1) ctx.fillStyle = "#7f1d1d"
        else ctx.fillStyle = "#27272a"
        ctx.fillRect(x + 1, y + 1, CW - 2, CH - 2)

        // Border
        ctx.strokeStyle = "#3f3f46"; ctx.lineWidth = 0.5
        ctx.strokeRect(x + 0.5, y + 0.5, CW - 1, CH - 1)

        const cx = x + CW / 2, cy = y + CH / 2

        if (v > 0 && v < 9) {
          // Number
          ctx.fillStyle = NUM_COLORS[v] ?? "#aaa"
          ctx.font = `bold ${Math.floor(CH * 0.58)}px monospace`
          ctx.textAlign = "center"; ctx.textBaseline = "middle"
          ctx.fillText(String(v), cx, cy)
        } else if (v === -2) {
          drawFlag(cx, cy)
        } else if (v === -1) {
          drawMine(cx, cy)
        } else if (v === 0) {
          // Hidden — subtle raised appearance
          ctx.strokeStyle = "#404040"; ctx.lineWidth = 0.5
          ctx.strokeRect(x + 2, y + 2, CW - 4, CH - 4)
        }
      }

      ctx.textBaseline = "alphabetic"
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [primary])

  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
