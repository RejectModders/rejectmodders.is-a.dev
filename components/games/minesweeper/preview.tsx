"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

// Scripted minesweeper demo — shows a partially revealed board with numbers and flags,
// then "clicks" safe cells one by one at intervals.
export function MinesweeperPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const COLS = 10, ROWS = 7
    const CW = Math.floor(W / COLS), CH = Math.floor(H / ROWS)
    const ADJ = ["","#3b82f6","#22c55e","#ef4444","#7c3aed","#b91c1c","#0891b2","#555","#888"]

    // Fixed scripted board: 0=hidden, -1=mine, -2=flag, 1-8=number, 9=revealed-empty
    const BOARD = [
      [9,9,9,1,-2,0,0,0,0,0],
      [9,9,2,2,2,1,0,0,0,0],
      [1,2,9,9,1,1,1,1,0,0],
      [-2,2,9,2,2,-2,1,1,1,0],
      [1,2,1,2,-2,2,1,9,1,0],
      [0,1,0,1,1,1,9,9,1,0],
      [0,0,0,0,0,0,1,1,1,0],
    ]
    // Cells to "click" over time (reveal hidden 0s → turn to 9)
    const CLICKS: [number,number][] = [[0,5],[0,6],[1,6],[2,6],[5,0],[5,2],[6,0],[6,1],[6,2],[6,3],[6,4],[6,5]]
    let clickIdx = 0, lastClick = 0
    const board = BOARD.map(r=>[...r])

    let raf = 0
    const draw = (now: number) => {
      if (now - lastClick > 420 && clickIdx < CLICKS.length) {
        lastClick = now
        const [r,c] = CLICKS[clickIdx++]
        board[r][c] = 9
      }

      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const v = board[r][c]
        const x = c*CW, y = r*CH
        // cell bg
        ctx.fillStyle = v === 9 ? "#18181b" : v === -1 ? "#7f1d1d" : "#27272a"
        ctx.fillRect(x+1, y+1, CW-2, CH-2)
        // border
        ctx.strokeStyle = "#3f3f46"; ctx.lineWidth = 0.5
        ctx.strokeRect(x+0.5, y+0.5, CW-1, CH-1)

        ctx.textAlign = "center"; ctx.textBaseline = "middle"
        const cx = x + CW/2, cy = y + CH/2
        if (v > 0 && v < 9) {
          ctx.fillStyle = ADJ[v]; ctx.font = `bold ${Math.floor(CH*0.55)}px monospace`
          ctx.fillText(String(v), cx, cy)
        } else if (v === -2) {
          // flag
          ctx.fillStyle = "#ef4444"; ctx.font = `${Math.floor(CH*0.6)}px sans-serif`
          ctx.fillText("🚩", cx, cy)
        } else if (v === -1) {
          ctx.fillStyle = "#fca5a5"; ctx.font = `${Math.floor(CH*0.6)}px sans-serif`
          ctx.fillText("💣", cx, cy)
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [primary])

  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
