"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function BrickBuilderPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const CELL = 22
    // Level layout: 1=wall, 2=floor, 3=target, 4=box, 6=player
    const level = [
      [1,1,1,1,1,1],
      [1,2,2,2,2,1],
      [1,2,4,4,2,1],
      [1,6,2,2,2,1],
      [1,2,3,3,2,1],
      [1,1,1,1,1,1],
    ]
    const grid = level.map(r => [...r])
    const ROWS = grid.length, COLS = grid[0].length
    const ox = (W - COLS * CELL) / 2, oy = (H - ROWS * CELL) / 2
    // Scripted moves: [dr, dc]
    const moves: [number,number][] = [[1,0],[0,1],[0,1],[-1,0],[-1,0],[0,1],[1,0],[1,0]]
    let step = 0, lastT = 0, raf = 0
    const findPlayer = (): [number,number] => {
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c] === 6 || grid[r][c] === 7) return [r,c]
      return [3,1]
    }
    const doMove = (dr: number, dc: number) => {
      const [pr, pc] = findPlayer()
      const nr = pr+dr, nc = pc+dc
      if (nr<0||nr>=ROWS||nc<0||nc>=COLS||grid[nr][nc]===1) return
      if (grid[nr][nc]===4||grid[nr][nc]===5) {
        const br=nr+dr, bc=nc+dc
        if (br<0||br>=ROWS||bc<0||bc>=COLS||grid[br][bc]===1||grid[br][bc]===4||grid[br][bc]===5) return
        grid[br][bc] = grid[br][bc]===3?5:4
        grid[nr][nc] = grid[nr][nc]===5?3:2
      }
      const dest = grid[nr][nc]
      grid[nr][nc] = dest===3?7:6
      grid[pr][pc] = level[pr][pc]===3?3:2
    }
    const draw = (now: number) => {
      if (now - lastT > 500) {
        lastT = now
        if (step < moves.length) { doMove(moves[step][0], moves[step][1]); step++ }
        else {
          for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) grid[r][c]=level[r][c]
          step = 0
        }
      }
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const x = ox + c * CELL, y = oy + r * CELL, v = grid[r][c]
        if (v === 0) continue
        if (v === 1) { ctx.fillStyle = "#444"; ctx.fillRect(x, y, CELL, CELL) }
        else {
          ctx.fillStyle = "#1a1a1a"; ctx.fillRect(x+1, y+1, CELL-2, CELL-2)
          if (v===3||v===5||v===7) { ctx.strokeStyle = primary+"88"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(x+CELL/2,y+CELL/2,4,0,Math.PI*2); ctx.stroke() }
          if (v===4||v===5) { ctx.fillStyle="#b45309"; ctx.beginPath(); ctx.roundRect(x+3,y+3,CELL-6,CELL-6,3); ctx.fill(); ctx.strokeStyle="#92400e"; ctx.lineWidth=1; ctx.stroke() }
          if (v===6||v===7) { ctx.fillStyle=primary; ctx.beginPath(); ctx.arc(x+CELL/2,y+CELL/2,7,0,Math.PI*2); ctx.fill() }
        }
      }
      ctx.fillStyle = primary; ctx.font = "bold 9px monospace"; ctx.textAlign = "right"; ctx.textBaseline = "top"
      ctx.fillText(`lv.1`, W - 6, 4)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}

