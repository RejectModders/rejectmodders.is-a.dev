"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

export function PacmanPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const TAU = Math.PI * 2

    // Scaled-down version of the actual game map (0=path, 1=wall, 2=dot, 3=power)
    const MAP = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
      [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
      [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
      [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
      [0,0,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,0],
      [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
      [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ]
    const ROWS = MAP.length, COLS = MAP[0].length
    const CW = Math.min(Math.floor(W / COLS), Math.floor(H / ROWS))
    const OX = Math.floor((W - COLS * CW) / 2), OY = Math.floor((H - ROWS * CW) / 2)

    // Pac-Man auto-pilot state
    const pac = { r: 3, c: 1, tr: 3, tc: 1, x: 0, y: 0, angle: 0, mouth: 0, open: true }
    pac.x = OX + pac.c * CW + CW / 2; pac.y = OY + pac.r * CW + CW / 2
    const dotMap = MAP.map(r => [...r])
    let score = 0

    // Ghosts
    const ghosts = [
      { x: OX + 9 * CW + CW / 2, y: OY + 6 * CW + CW / 2, color: "#ef4444", dr: 0, dc: 1, scared: 0 },
      { x: OX + 9 * CW + CW / 2, y: OY + 8 * CW + CW / 2, color: "#f9a8d4", dr: 0, dc: -1, scared: 0 },
    ]

    // Path-finding: pick next direction toward a dot
    const walkable = (r: number, c: number) => r >= 0 && r < ROWS && c >= 0 && c < COLS && MAP[r][c] !== 1
    const pickTarget = () => {
      // Find nearest dot using BFS
      const visited = new Set<string>()
      const queue: [number, number, number, number][] = [[pac.r, pac.c, -1, -1]] // r, c, first_dr, first_dc
      visited.add(`${pac.r},${pac.c}`)
      while (queue.length) {
        const [r, c, fdr, fdc] = queue.shift()!
        for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          const nr = r + dr, nc = c + dc
          if (!walkable(nr, nc) || visited.has(`${nr},${nc}`)) continue
          visited.add(`${nr},${nc}`)
          const firstDr = fdr === -1 ? dr : fdr, firstDc = fdc === -1 ? dc : fdc
          if (dotMap[nr][nc] === 2 || dotMap[nr][nc] === 3) {
            // Found a dot! Head in that first direction
            return { tr: pac.r + firstDr, tc: pac.c + firstDc }
          }
          queue.push([nr, nc, firstDr, firstDc])
        }
      }
      // No dots left, reset
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) dotMap[r][c] = MAP[r][c]
      score = 0
      return { tr: pac.r, tc: pac.c + 1 }
    }

    let lastStep = 0, raf = 0
    const STEP_MS = 110

    const draw = (now: number) => {
      // Step pac-man
      if (now - lastStep >= STEP_MS) {
        lastStep = now
        // Arrive at target cell
        pac.r = pac.tr; pac.c = pac.tc
        // Eat dot
        if (dotMap[pac.r]?.[pac.c] === 2) { dotMap[pac.r][pac.c] = 0; score += 10 }
        if (dotMap[pac.r]?.[pac.c] === 3) { dotMap[pac.r][pac.c] = 0; score += 50; ghosts.forEach(g => g.scared = 30) }
        // Pick next
        const t = pickTarget()
        pac.tr = t.tr; pac.tc = t.tc
        const dx = pac.tc - pac.c, dy = pac.tr - pac.r
        if (dx !== 0 || dy !== 0) pac.angle = Math.atan2(dy, dx)
        // Move ghosts
        for (const g of ghosts) {
          if (g.scared > 0) g.scared--
          const gr = Math.round((g.y - OY) / CW - 0.5), gc = Math.round((g.x - OX) / CW - 0.5)
          const opts = [[0, 1], [0, -1], [1, 0], [-1, 0]].filter(([dr, dc]) => {
            const nr = gr + dr, nc = gc + dc
            return walkable(nr, nc) && !(dr === -g.dr && dc === -g.dc)
          })
          if (opts.length) {
            const d = opts[Math.floor(Math.random() * opts.length)]
            g.dr = d[0]; g.dc = d[1]
          }
          g.x += g.dc * CW; g.y += g.dr * CW
          g.x = Math.max(OX + CW / 2, Math.min(OX + (COLS - 1) * CW + CW / 2, g.x))
          g.y = Math.max(OY + CW / 2, Math.min(OY + (ROWS - 1) * CW + CW / 2, g.y))
        }
      }

      // Interpolate pac position
      const progress = Math.min(1, (now - lastStep) / STEP_MS)
      const px = OX + (pac.c + (pac.tc - pac.c) * progress) * CW + CW / 2
      const py = OY + (pac.r + (pac.tr - pac.r) * progress) * CW + CW / 2
      pac.mouth += pac.open ? 5 : -5; if (pac.mouth >= 40 || pac.mouth <= 0) pac.open = !pac.open

      // Draw
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H)
      // Map
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const x = OX + c * CW, y = OY + r * CW, v = MAP[r][c]
        if (v === 1) {
          ctx.fillStyle = "#1a3a8f"; ctx.fillRect(x, y, CW, CW)
          ctx.strokeStyle = "#2a5abf"; ctx.lineWidth = 0.5; ctx.strokeRect(x + 0.5, y + 0.5, CW - 1, CW - 1)
        }
        const dv = dotMap[r][c]
        if (dv === 2) { ctx.fillStyle = "#fff8"; ctx.beginPath(); ctx.arc(x + CW / 2, y + CW / 2, 1.5, 0, TAU); ctx.fill() }
        if (dv === 3) { ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(x + CW / 2, y + CW / 2, 3, 0, TAU); ctx.fill() }
      }
      // Pac
      const ang = (pac.mouth / 40) * 0.4
      ctx.fillStyle = primary; ctx.beginPath(); ctx.moveTo(px, py)
      ctx.arc(px, py, CW * 0.42, pac.angle + ang, pac.angle + TAU - ang); ctx.closePath(); ctx.fill()
      // Ghosts
      for (const g of ghosts) {
        ctx.fillStyle = g.scared > 0 ? "#3b82f6" : g.color
        const gx = g.x, gy = g.y, gr = CW * 0.4
        ctx.beginPath(); ctx.arc(gx, gy - 1, gr, Math.PI, 0)
        ctx.lineTo(gx + gr, gy + gr * 0.8)
        const w = gr * 2 / 3
        for (let i = 0; i < 3; i++) ctx.lineTo(gx - gr + w * (i + 1), gy + (i % 2 === 0 ? gr * 0.8 : gr * 0.4))
        ctx.lineTo(gx - gr, gy + gr * 0.8); ctx.closePath(); ctx.fill()
        ctx.fillStyle = "#fff"; ctx.beginPath()
        ctx.arc(gx - 3, gy - 2, 2, 0, TAU); ctx.arc(gx + 3, gy - 2, 2, 0, TAU); ctx.fill()
      }
      // Score
      ctx.fillStyle = primary; ctx.font = "bold 9px monospace"; ctx.textAlign = "right"; ctx.textBaseline = "top"
      ctx.fillText(String(score), W - 4, 3)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
