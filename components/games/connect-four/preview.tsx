"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

export function ConnectFourPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const ROWS = 6, COLS = 7, CELL = 18, GAP = 3
    const BW = COLS * (CELL + GAP) + GAP, BH = ROWS * (CELL + GAP) + GAP
    const ox = (W - BW) / 2, oy = (H - BH) / 2 + 4
    const board: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
    const moves: [number, number][] = [[3,1],[3,2],[2,1],[4,2],[1,1],[5,2],[4,1],[2,2],[5,1],[1,2],[3,1],[4,2]]
    let step = 0, lastT = 0, raf = 0

    const dropPiece = (col: number, player: number) => {
      for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) { board[r][col] = player; return }
      }
    }

    const draw = (now: number) => {
      if (now - lastT > 600) {
        lastT = now
        if (step < moves.length) {
          const [col, player] = moves[step]
          dropPiece(col, player)
          step++
        } else {
          for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) board[r][c] = 0
          step = 0
        }
      }
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)
      // Board background
      ctx.fillStyle = "#1e3a8f"
      ctx.beginPath(); ctx.roundRect(ox, oy, BW, BH, 6); ctx.fill()
      // Cells
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const x = ox + GAP + c * (CELL + GAP) + CELL / 2
        const y = oy + GAP + r * (CELL + GAP) + CELL / 2
        const v = board[r][c]
        ctx.fillStyle = v === 1 ? "#ef4444" : v === 2 ? "#fbbf24" : "#0a1628"
        ctx.beginPath(); ctx.arc(x, y, CELL / 2 - 1, 0, Math.PI * 2); ctx.fill()
        if (v) {
          ctx.shadowColor = v === 1 ? "#ef4444" : "#fbbf24"; ctx.shadowBlur = 4
          ctx.beginPath(); ctx.arc(x, y, CELL / 2 - 1, 0, Math.PI * 2); ctx.fill()
          ctx.shadowBlur = 0
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}

