"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

export function SpaceInvadersPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const COLS = 9, ROWS = 4

    type Alien = { x: number; y: number; alive: boolean; type: number }
    const aliens: Alien[] = []
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
      aliens.push({ x: 18 + c * 26, y: 20 + r * 20, alive: true, type: r < 1 ? 0 : r < 3 ? 1 : 2 })

    const ship = { x: W / 2 }
    type Bullet = { x: number; y: number; player: boolean }
    const bullets: Bullet[] = []

    let dir = 1, moveTimer = 0, shootTimer = 0, alienFrame = 0, raf = 0, t = 0
    let score = 0

    const loop = () => {
      t++
      // Auto-move ship left/right to spread fire
      const alive = aliens.filter(a => a.alive)
      if (alive.length) {
        const target = alive[t % alive.length]
        ship.x += (target.x - ship.x) * 0.02
        ship.x = Math.max(16, Math.min(W - 16, ship.x))
      }

      // Move aliens
      moveTimer++
      if (moveTimer > 32) {
        moveTimer = 0; alienFrame++
        const minX = Math.min(...alive.map(a => a.x))
        const maxX = Math.max(...alive.map(a => a.x))
        if ((dir === 1 && maxX > W - 14) || (dir === -1 && minX < 14)) {
          dir *= -1; aliens.forEach(a => { if (a.alive) a.y += 7 })
        } else {
          aliens.forEach(a => { if (a.alive) a.x += dir * 12 })
        }
      }

      // Alien shoot
      shootTimer++
      if (shootTimer > 28 && alive.length) {
        shootTimer = 0
        const col = alive[Math.floor(Math.random() * alive.length)]
        const colAliens = alive.filter(a => Math.abs(a.x - col.x) < 14).sort((a, b) => b.y - a.y)
        if (colAliens.length) bullets.push({ x: colAliens[0].x, y: colAliens[0].y + 8, player: false })
      }

      // Player auto-shoot at nearest alien
      if (t % 16 === 0 && alive.length) {
        const nearest = alive.reduce((acc, a) => Math.abs(a.x - ship.x) < Math.abs(acc.x - ship.x) ? a : acc)
        bullets.push({ x: ship.x, y: H - 28, player: true })
        // Nudge toward nearest
        ship.x += (nearest.x - ship.x) * 0.06
      }

      // Move bullets
      for (const b of bullets) { b.y += b.player ? -5 : 3.5 }

      // Hits
      for (const b of bullets.filter(b => b.player)) {
        for (const a of aliens.filter(a => a.alive)) {
          if (Math.abs(b.x - a.x) < 11 && Math.abs(b.y - a.y) < 9) {
            a.alive = false; b.y = -99; score += [30, 20, 10][a.type]
          }
        }
      }

      // Respawn all when too few
      if (alive.filter(a => a.alive).length < 5) {
        aliens.forEach((a, i) => {
          a.alive = true; a.x = 18 + (i % COLS) * 26; a.y = 20 + Math.floor(i / COLS) * 20
        })
        score = 0
      }

      bullets.splice(0, bullets.length, ...bullets.filter(b => b.y > 0 && b.y < H))

      // Draw
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H)
      for (let i = 0; i < 40; i++) { ctx.fillStyle = "#fff3"; ctx.fillRect((i * 53 + 7) % W, (i * 71 + 13) % H, 1, 1) }

      const af = alienFrame % 2
      const colors = ["#ef4444", "#f97316", primary]
      for (const a of aliens.filter(a => a.alive)) {
        ctx.fillStyle = colors[a.type]
        if (a.type === 0) {
          // UFO-like top row
          ctx.beginPath(); ctx.ellipse(a.x, a.y, 9, 5, 0, 0, Math.PI * 2); ctx.fill()
          ctx.fillRect(a.x - 5, a.y - 9, 10, 6)
          ctx.fillStyle = "#000"
          ctx.fillRect(a.x - 6 + af * 2, a.y - 1, 3, 3); ctx.fillRect(a.x + 3 - af * 2, a.y - 1, 3, 3)
        } else if (a.type === 1) {
          // Crab mid-rows
          ctx.fillRect(a.x - 7, a.y - 5, 14, 10)
          ctx.fillRect(a.x - 5 + af * 3, a.y + 5, 4, 4); ctx.fillRect(a.x + 1 - af * 3, a.y + 5, 4, 4)
          ctx.fillRect(a.x - 11 + af * 2, a.y - 2, 4, 3); ctx.fillRect(a.x + 7 - af * 2, a.y - 2, 4, 3)
          ctx.fillStyle = "#000"; ctx.fillRect(a.x - 4, a.y - 3, 3, 3); ctx.fillRect(a.x + 1, a.y - 3, 3, 3)
        } else {
          // Squid bottom rows
          ctx.fillRect(a.x - 5, a.y - 7, 10, 10)
          ctx.fillRect(a.x - 8 + af, a.y, 3, 5); ctx.fillRect(a.x - 3, a.y + 2, 3, 4); ctx.fillRect(a.x + 2, a.y + 2, 3, 4); ctx.fillRect(a.x + 5 - af, a.y, 3, 5)
          ctx.fillStyle = "#000"; ctx.fillRect(a.x - 3, a.y - 5, 3, 3); ctx.fillRect(a.x, a.y - 5, 3, 3)
        }
      }

      // Bullets
      ctx.fillStyle = primary
      bullets.filter(b => b.player).forEach(b => { ctx.fillRect(b.x - 1.5, b.y - 8, 3, 10) })
      ctx.fillStyle = "#f87171"
      bullets.filter(b => !b.player).forEach(b => { ctx.fillRect(b.x - 1.5, b.y, 3, 8) })

      // Ship (matches game exactly)
      ctx.fillStyle = primary
      ctx.beginPath(); ctx.moveTo(ship.x, H - 34); ctx.lineTo(ship.x + 14, H - 18); ctx.lineTo(ship.x - 14, H - 18); ctx.closePath(); ctx.fill()
      ctx.fillRect(ship.x - 4, H - 40, 8, 8)
      ctx.fillStyle = primary + "44"
      ctx.beginPath(); ctx.moveTo(ship.x - 7, H - 18); ctx.lineTo(ship.x + 7, H - 18); ctx.lineTo(ship.x, H - 11); ctx.closePath(); ctx.fill()

      // Ground line
      ctx.strokeStyle = primary + "44"; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, H - 12); ctx.lineTo(W, H - 12); ctx.stroke()

      // Score
      ctx.fillStyle = primary + "88"; ctx.font = "bold 9px monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top"
      ctx.fillText(String(score), 4, 4)

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
