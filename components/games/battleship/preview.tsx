"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

export function BattleshipPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const N = 7, CELL = 16, PAD = 8
    const OX1 = PAD, OX2 = W / 2 + PAD, OY = (H - N * CELL) / 2 + 8

    // Enemy grid — ships are hidden, only hits/misses shown
    const enemyShips = new Set(["0,1", "0,2", "0,3", "2,4", "2,5", "3,1", "4,1", "5,1", "5,3", "5,4", "5,5"])
    const enemyHits: string[] = ["0,1", "0,2"] // scripted starting hits
    const enemyMisses = new Set(["1,0", "3,3", "4,4"])

    // Your grid — ships visible
    const yourShips = new Set(["1,1", "1,2", "1,3", "3,0", "4,0", "5,0", "3,5", "3,6", "5,2", "5,3"])
    const yourHits = new Set(["3,0", "5,3"])
    const yourMisses = new Set(["0,2", "2,4", "4,5"])

    // Scripted attack sequence on enemy
    const attackSeq: [number, number][] = [[0, 3], [1, 4], [2, 4], [4, 2], [3, 1], [6, 0], [2, 5], [5, 3]]
    let attackIdx = 0, lastT = 0, raf = 0

    const drawGrid = (ox: number, label: string, ships: Set<string>, hits: string[] | Set<string>, misses: Set<string>, showShips: boolean) => {
      ctx.fillStyle = "#ffffff33"; ctx.font = "bold 8px monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top"
      ctx.fillText(label, ox, OY - 12)

      // Column headers
      ctx.fillStyle = "#ffffff22"; ctx.font = "7px monospace"; ctx.textAlign = "center"
      for (let c = 0; c < N; c++) ctx.fillText(String.fromCharCode(65 + c), ox + c * CELL + CELL / 2, OY - 5)

      for (let r = 0; r < N; r++) {
        // Row number
        ctx.fillStyle = "#ffffff22"; ctx.font = "7px monospace"; ctx.textAlign = "right"
        ctx.fillText(String(r + 1), ox - 2, OY + r * CELL + 4)

        for (let c = 0; c < N; c++) {
          const key = `${r},${c}`
          const isShip = ships.has(key)
          const isHit = hits instanceof Set ? hits.has(key) : hits.includes(key)
          const isMiss = misses.has(key)

          // Cell background
          ctx.fillStyle = isHit ? "#7f1d1d" : isMiss ? "#0c2340" : (showShips && isShip) ? primary + "22" : "#0a1628"
          ctx.fillRect(ox + c * CELL, OY + r * CELL, CELL, CELL)

          // Border
          ctx.strokeStyle = "#1e3a5f"; ctx.lineWidth = 0.5
          ctx.strokeRect(ox + c * CELL + 0.5, OY + r * CELL + 0.5, CELL - 1, CELL - 1)

          // Ship outline on your grid
          if (showShips && isShip && !isHit) {
            ctx.strokeStyle = primary + "66"; ctx.lineWidth = 1
            ctx.strokeRect(ox + c * CELL + 1, OY + r * CELL + 1, CELL - 2, CELL - 2)
          }

          // Hit marker
          if (isHit) {
            ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2; ctx.lineCap = "round"
            const cx2 = ox + c * CELL + CELL / 2, cy = OY + r * CELL + CELL / 2
            ctx.beginPath(); ctx.moveTo(cx2 - 4, cy - 4); ctx.lineTo(cx2 + 4, cy + 4); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(cx2 + 4, cy - 4); ctx.lineTo(cx2 - 4, cy + 4); ctx.stroke()
          }

          // Miss marker
          if (isMiss) {
            ctx.fillStyle = "#60a5fa"; ctx.beginPath()
            ctx.arc(ox + c * CELL + CELL / 2, OY + r * CELL + CELL / 2, 2, 0, Math.PI * 2); ctx.fill()
          }
        }
      }
    }

    const draw = (now: number) => {
      // Fire a shot every 800ms
      if (now - lastT > 800) {
        lastT = now
        if (attackIdx < attackSeq.length) {
          const [r, c] = attackSeq[attackIdx]
          const key = `${r},${c}`
          if (enemyShips.has(key)) enemyHits.push(key)
          else enemyMisses.add(key)
          attackIdx++
        }
        if (attackIdx >= attackSeq.length) {
          // Reset after cycle
          attackIdx = 0; enemyHits.length = 2
          enemyMisses.clear(); enemyMisses.add("1,0"); enemyMisses.add("3,3"); enemyMisses.add("4,4")
        }
      }

      ctx.fillStyle = "#000c1a"; ctx.fillRect(0, 0, W, H)
      drawGrid(OX1, "ENEMY", enemyShips, enemyHits, enemyMisses, false)
      drawGrid(OX2, "YOUR FLEET", yourShips, yourHits, yourMisses, true)

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
