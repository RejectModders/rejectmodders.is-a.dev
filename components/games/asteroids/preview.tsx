"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

const TAU = Math.PI * 2

export function AsteroidsPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height

    // Ship state
    const ship = { x: W / 2, y: H / 2, angle: -Math.PI / 2, vx: 0, vy: 0, thrust: false }

    // Asteroids matching the real game's mkAsteroid logic
    type Rock = { x:number;y:number;vx:number;vy:number;r:number;pts:number[] }
    const mkRock = (x: number, y: number, size: number): Rock => {
      const angle = Math.random() * TAU, spd = (4 - size) * 0.7 + 0.3
      const nPts = 8 + Math.floor(Math.random() * 5)
      const pts = Array.from({ length: nPts }, (_, i) => {
        const a = i / nPts * TAU, r2 = size * 14 + (Math.random() - 0.5) * size * 7
        return [Math.cos(a) * r2, Math.sin(a) * r2]
      }).flat()
      return { x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, r: size * 14, pts }
    }

    const rocks: Rock[] = [
      mkRock(60, 40, 3), mkRock(W - 70, 55, 3), mkRock(80, H - 50, 2), mkRock(W - 60, H - 60, 2),
      mkRock(W / 2 + 85, 35, 2), mkRock(30, H / 2, 1), mkRock(W - 30, H / 2 + 20, 1),
    ]

    type Bullet = { x:number;y:number;vx:number;vy:number;life:number }
    const bullets: Bullet[] = []

    let t = 0, lastShot = 0, raf = 0, thrustFrame = 0
    // Stars (static)
    const stars = Array.from({ length: 35 }, () => ({ x: Math.random() * W, y: Math.random() * H }))

    const loop = () => {
      t++
      thrustFrame++

      // AI: steer toward nearest rock
      let nearest = rocks[0]
      let nearestD = Infinity
      for (const r of rocks) {
        const d = Math.hypot(r.x - ship.x, r.y - ship.y)
        if (d < nearestD) { nearestD = d; nearest = r }
      }

      const targetAngle = Math.atan2(nearest.y - ship.y, nearest.x - ship.x)
      let da = targetAngle - ship.angle
      while (da > Math.PI) da -= TAU
      while (da < -Math.PI) da += TAU
      ship.angle += da * 0.055

      // Thrust toward rock if far
      ship.thrust = nearestD > 55
      if (ship.thrust) {
        ship.vx += Math.cos(ship.angle) * 0.14
        ship.vy += Math.sin(ship.angle) * 0.14
      }
      const maxSpd = 4
      const spd = Math.hypot(ship.vx, ship.vy)
      if (spd > maxSpd) { ship.vx = ship.vx / spd * maxSpd; ship.vy = ship.vy / spd * maxSpd }
      ship.vx *= 0.978; ship.vy *= 0.978
      ship.x = (ship.x + ship.vx + W) % W
      ship.y = (ship.y + ship.vy + H) % H

      // Shoot at the nearest rock
      if (t - lastShot > 22) {
        lastShot = t
        bullets.push({
          x: ship.x + Math.cos(ship.angle) * 16, y: ship.y + Math.sin(ship.angle) * 16,
          vx: Math.cos(ship.angle) * 8, vy: Math.sin(ship.angle) * 8, life: 55
        })
      }

      // Update bullets
      for (const b of bullets) { b.x = (b.x + b.vx + W) % W; b.y = (b.y + b.vy + H) % H; b.life-- }

      // Update rocks
      for (const r of rocks) { r.x = (r.x + r.vx + W) % W; r.y = (r.y + r.vy + H) % H }

      // Bullet-rock hits — respawn rocks instead of splitting (to keep demo lively)
      for (const b of bullets) {
        for (const r of rocks) {
          if (Math.hypot(b.x - r.x, b.y - r.y) < r.r && b.life > 0) {
            b.life = 0
            r.x = (Math.random() > 0.5 ? 30 : W - 30) + (Math.random() - 0.5) * 40
            r.y = (Math.random() > 0.5 ? 30 : H - 30) + (Math.random() - 0.5) * 40
            r.vx = (Math.random() - 0.5) * 1.2; r.vy = (Math.random() - 0.5) * 1.2
          }
        }
      }
      bullets.splice(0, bullets.length, ...bullets.filter(b => b.life > 0))

      // Draw
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H)

      // Stars
      ctx.fillStyle = "#ffffff1a"
      for (const s of stars) { ctx.fillRect(s.x, s.y, 1, 1) }

      // Asteroids
      ctx.strokeStyle = "#999"; ctx.lineWidth = 1.5
      for (const r of rocks) {
        ctx.save(); ctx.translate(r.x, r.y); ctx.beginPath()
        for (let i = 0; i < r.pts.length; i += 2) {
          i === 0 ? ctx.moveTo(r.pts[i], r.pts[i+1]) : ctx.lineTo(r.pts[i], r.pts[i+1])
        }
        ctx.closePath(); ctx.stroke(); ctx.restore()
      }

      // Bullets
      ctx.fillStyle = primary
      for (const b of bullets) { ctx.beginPath(); ctx.arc(b.x, b.y, 2, 0, TAU); ctx.fill() }

      // Ship (matches game exactly)
      ctx.save(); ctx.translate(ship.x, ship.y); ctx.rotate(ship.angle)
      ctx.strokeStyle = primary; ctx.lineWidth = 2; ctx.beginPath()
      ctx.moveTo(14, 0); ctx.lineTo(-8, 8); ctx.lineTo(-5, 0); ctx.lineTo(-8, -8); ctx.closePath()
      ctx.stroke()
      // Thrust flame
      if (ship.thrust && thrustFrame % 6 < 4) {
        ctx.strokeStyle = "#f97316"; ctx.lineWidth = 1.5; ctx.beginPath()
        ctx.moveTo(-5, 0); ctx.lineTo(-12 - Math.random() * 5, 0); ctx.stroke()
      }
      ctx.restore()

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
