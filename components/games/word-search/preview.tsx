"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function WordSearchPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const grid = ["REACTK","NWXTHP","OXTYML","DHTMLE","ECODED","TYPEJB"]
    const N = 6, CELL = 19
    const GW = N * CELL, GH = N * CELL
    const ox = (W - GW) / 2 - 20, oy = (H - GH) / 2
    const found: [number, number][][] = [
      [[0,0],[0,1],[0,2],[0,3],[0,4]], // REACT
      [[3,1],[3,2],[3,3],[3,4]], // HTML
    ]
    const toFind: [number, number][][] = [
      [[4,1],[4,2],[4,3],[4,4]], // CODE
      [[5,0],[5,1],[5,2],[5,3]], // TYPE
    ]
    let findIdx = 0, cellIdx = 0, current: [number, number][] = [], lastT = 0, raf = 0
    const allFound: Set<string> = new Set()
    found.flat().forEach(([r,c]) => allFound.add(`${r},${c}`))

    const draw = (now: number) => {
      if (now - lastT > 300) {
        lastT = now
        if (findIdx < toFind.length) {
          if (cellIdx < toFind[findIdx].length) {
            current.push(toFind[findIdx][cellIdx]); cellIdx++
          } else {
            current.forEach(([r,c]) => allFound.add(`${r},${c}`))
            current = []; cellIdx = 0; findIdx++
          }
        } else { allFound.clear(); found.flat().forEach(([r,c]) => allFound.add(`${r},${c}`)); findIdx = 0; current = [] }
      }
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const x = ox + c * CELL, y = oy + r * CELL
        const isCur = current.some(([cr,cc]) => cr === r && cc === c)
        const isFnd = allFound.has(`${r},${c}`)
        ctx.fillStyle = isCur ? primary + "44" : isFnd ? primary + "22" : "#1a1a1a"
        ctx.strokeStyle = isCur ? primary : isFnd ? primary + "55" : "#333"; ctx.lineWidth = 0.8
        ctx.beginPath(); ctx.roundRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1, 2); ctx.fill(); ctx.stroke()
        ctx.fillStyle = isFnd ? primary : isCur ? "#fff" : "#666"
        ctx.font = "bold 10px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle"
        ctx.fillText(grid[r][c], x + CELL / 2, y + CELL / 2)
      }
      // Word list
      const words = ["REACT","HTML","CODE","TYPE","NEXT","NODE"]
      const lx = ox + GW + 14
      ctx.font = "bold 8px monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top"
      words.forEach((w, i) => {
        const f = allFound.size > 0 && i < 2 + findIdx
        ctx.fillStyle = f ? primary : "#555"
        ctx.fillText(w, lx, oy + i * 14)
        if (f) { ctx.strokeStyle = primary + "44"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx, oy + i * 14 + 5); ctx.lineTo(lx + ctx.measureText(w).width, oy + i * 14 + 5); ctx.stroke() }
      })
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}

