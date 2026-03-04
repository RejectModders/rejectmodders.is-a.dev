"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

// Exact same map template as the game
const MAP_TEMPLATE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]
const GHOST_COLORS = ["#ef4444","#f9a8d4","#22d3ee","#fb923c"]
const TAU = Math.PI * 2

export function PacmanPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const ROWS = MAP_TEMPLATE.length, COLS = MAP_TEMPLATE[0].length
    const CW = Math.min(Math.floor(W / COLS), Math.floor(H / ROWS))
    const OX = Math.floor((W - COLS * CW) / 2)
    const OY = Math.floor((H - ROWS * CW) / 2)

    const dotMap = MAP_TEMPLATE.map(r => [...r])
    let score = 0

    // BFS path-finder
    const walkable = (r: number, c: number) => r >= 0 && r < ROWS && c >= 0 && c < COLS && MAP_TEMPLATE[r][c] !== 1

    // Pac state (grid-based movement)
    const pac = { r: 16, c: 9, tr: 16, tc: 9, angle: 0, mouth: 0, mouthOpen: true }
    let pacTarget = { tr: 16, tc: 9 }

    const pickNextDir = (pr: number, pc: number) => {
      const visited = new Set<string>()
      const queue: [number, number, number, number][] = [[pr, pc, -1, -1]]
      visited.add(`${pr},${pc}`)
      while (queue.length) {
        const [r, c, fdr, fdc] = queue.shift()!
        for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
          const nr = r + dr, nc = c + dc
          if (!walkable(nr, nc) || visited.has(`${nr},${nc}`)) continue
          visited.add(`${nr},${nc}`)
          const fdr2 = fdr === -1 ? dr : fdr, fdc2 = fdc === -1 ? dc : fdc
          if (dotMap[nr]?.[nc] === 2 || dotMap[nr]?.[nc] === 3) return { tr: pr + fdr2, tc: pc + fdc2 }
          queue.push([nr, nc, fdr2, fdc2])
        }
      }
      // Reset dots
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) dotMap[r][c] = MAP_TEMPLATE[r][c]
      score = 0
      return { tr: pr, tc: pc + 1 }
    }

    // Ghosts
    const ghosts = GHOST_COLORS.slice(0, 2).map((color, i) => ({
      x: OX + (9 + i) * CW + CW / 2, y: OY + 9 * CW + CW / 2,
      color, scared: 0, dr: 0, dc: i === 0 ? 1 : -1
    }))

    let lastStep = 0, raf = 0
    const STEP_MS = 120

    const draw = (now: number) => {
      if (now - lastStep >= STEP_MS) {
        lastStep = now
        // Move pac
        pac.r = pac.tr; pac.c = pac.tc
        if (dotMap[pac.r]?.[pac.c] === 2) { dotMap[pac.r][pac.c] = 0; score += 10 }
        if (dotMap[pac.r]?.[pac.c] === 3) { dotMap[pac.r][pac.c] = 0; score += 50; ghosts.forEach(g => { g.scared = 20 }) }
        const next = pickNextDir(pac.r, pac.c)
        pacTarget = next; pac.tr = next.tr; pac.tc = next.tc
        const dx = pac.tc - pac.c, dy = pac.tr - pac.r
        if (dx !== 0 || dy !== 0) pac.angle = Math.atan2(dy, dx)

        // Move ghosts
        for (const g of ghosts) {
          if (g.scared > 0) g.scared--
          const gr = Math.round((g.y - OY - CW / 2) / CW), gc = Math.round((g.x - OX - CW / 2) / CW)
          const opts = [[0,1],[0,-1],[1,0],[-1,0]].filter(([dr,dc]) => {
            const nr = gr + dr, nc = gc + dc
            return walkable(nr, nc) && !(dr === -g.dr && dc === -g.dc)
          })
          if (opts.length) {
            const pick = opts[Math.floor(Math.random() * opts.length)]
            g.dr = pick[0]; g.dc = pick[1]
          }
          g.x = Math.max(OX + CW / 2, Math.min(OX + (COLS - 1) * CW + CW / 2, g.x + g.dc * CW))
          g.y = Math.max(OY + CW / 2, Math.min(OY + (ROWS - 1) * CW + CW / 2, g.y + g.dr * CW))
        }
      }

      // Interpolate pac position
      const progress = Math.min(1, (now - lastStep) / STEP_MS)
      const px = OX + (pac.c + (pac.tc - pac.c) * progress) * CW + CW / 2
      const py = OY + (pac.r + (pac.tr - pac.r) * progress) * CW + CW / 2
      pac.mouth += pac.mouthOpen ? 5 : -5
      if (pac.mouth >= 35 || pac.mouth <= 0) pac.mouthOpen = !pac.mouthOpen

      // Draw
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H)

      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const x = OX + c * CW, y = OY + r * CW, v = MAP_TEMPLATE[r][c]
        if (v === 1) {
          ctx.fillStyle = "#1a3a8f"; ctx.fillRect(x, y, CW, CW)
          ctx.strokeStyle = "#2a5abf44"; ctx.lineWidth = 0.5; ctx.strokeRect(x + 0.5, y + 0.5, CW - 1, CW - 1)
        }
        const dv = dotMap[r][c]
        if (dv === 2) {
          ctx.fillStyle = "#ffffffaa"
          ctx.beginPath(); ctx.arc(x + CW / 2, y + CW / 2, Math.max(1, CW * 0.15), 0, TAU); ctx.fill()
        }
        if (dv === 3) {
          ctx.fillStyle = "#fbbf24"
          ctx.beginPath(); ctx.arc(x + CW / 2, y + CW / 2, Math.max(2, CW * 0.38), 0, TAU); ctx.fill()
        }
      }

      // Pac-Man
      const ang = (pac.mouth / 35) * 0.38
      ctx.fillStyle = primary
      ctx.beginPath(); ctx.moveTo(px, py)
      ctx.arc(px, py, CW * 0.45, pac.angle + ang, pac.angle + TAU - ang); ctx.closePath(); ctx.fill()

      // Ghosts
      for (const g of ghosts) {
        ctx.fillStyle = g.scared > 0 ? "#3b82f6" : g.color
        const gr2 = CW * 0.42
        ctx.beginPath(); ctx.arc(g.x, g.y - 1, gr2, Math.PI, 0)
        ctx.lineTo(g.x + gr2, g.y + gr2 * 0.85)
        const w = (gr2 * 2) / 3
        for (let i = 0; i < 3; i++) ctx.lineTo(g.x - gr2 + w * (i + 1), g.y + (i % 2 === 0 ? gr2 * 0.85 : gr2 * 0.45))
        ctx.lineTo(g.x - gr2, g.y + gr2 * 0.85); ctx.closePath(); ctx.fill()
        ctx.fillStyle = "#fff"
        ctx.beginPath(); ctx.arc(g.x - 3, g.y - 2, 2, 0, TAU); ctx.fill()
        ctx.beginPath(); ctx.arc(g.x + 3, g.y - 2, 2, 0, TAU); ctx.fill()
      }

      ctx.fillStyle = primary + "99"; ctx.font = "bold 9px monospace"; ctx.textAlign = "right"; ctx.textBaseline = "top"
      ctx.fillText(String(score), W - 4, 4)

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [primary])

  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
