"use client"
import { useState, useCallback, useEffect, useRef } from "react"
import { ChevronLeft } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#fbbf24"]
const LABELS = ["Red", "Green", "Blue", "Yellow"]
const TAU = Math.PI * 2

export function SimonGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [seq, setSeq] = useState<number[]>([])
  const [input, setInput] = useState<number[]>([])
  const [lit, setLit] = useState<number | null>(null)
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "over">("idle")
  const [score, setScore] = useState(0)
  const [hs, setHs] = useState(() => loadHS()["simon"] ?? 0)
  const showingRef = useRef(false)
  const litRef = useRef<number | null>(null)
  const phaseRef = useRef<"idle" | "showing" | "input" | "over">("idle")
  const scoreRef = useRef(0)
  const hsRef = useRef(hs)

  // Keep refs in sync
  useEffect(() => { litRef.current = lit }, [lit])
  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { hsRef.current = hs }, [hs])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2 - 10
    const R = Math.min(W, H) * 0.38

    let raf = 0
    const draw = () => {
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)

      const currentLit = litRef.current
      const currentPhase = phaseRef.current

      // Draw 4 quadrant arcs
      for (let i = 0; i < 4; i++) {
        const startAngle = i * Math.PI / 2 - Math.PI / 2
        const endAngle = startAngle + Math.PI / 2
        const isLit = currentLit === i

        ctx.fillStyle = COLORS[i]
        ctx.globalAlpha = isLit ? 1 : currentPhase === "over" ? 0.15 : 0.35
        ctx.beginPath()
        ctx.arc(cx, cy, R, startAngle + 0.05, endAngle - 0.05)
        ctx.arc(cx, cy, R * 0.35, endAngle - 0.05, startAngle + 0.05, true)
        ctx.closePath()
        ctx.fill()

        if (isLit) {
          ctx.shadowColor = COLORS[i]; ctx.shadowBlur = 30
          ctx.fill()
          ctx.shadowBlur = 0
        }

        // Label
        const labelAngle = startAngle + Math.PI / 4
        const labelR = R * 0.67
        const lx = cx + Math.cos(labelAngle) * labelR
        const ly = cy + Math.sin(labelAngle) * labelR
        ctx.globalAlpha = isLit ? 1 : 0.5
        ctx.fillStyle = "#fff"
        ctx.font = `bold ${Math.floor(R * 0.1)}px monospace`
        ctx.textAlign = "center"; ctx.textBaseline = "middle"
        ctx.fillText(LABELS[i], lx, ly)
      }

      ctx.globalAlpha = 1

      // Center circle
      ctx.fillStyle = "#111"
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.30, 0, TAU); ctx.fill()
      ctx.strokeStyle = "#333"; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.30, 0, TAU); ctx.stroke()

      // Round number in center
      ctx.fillStyle = primary; ctx.font = `bold ${Math.floor(R * 0.22)}px monospace`
      ctx.textAlign = "center"; ctx.textBaseline = "middle"
      ctx.fillText(String(scoreRef.current), cx, cy - 2)
      ctx.fillStyle = "#888"; ctx.font = `${Math.floor(R * 0.09)}px monospace`
      ctx.fillText("ROUND", cx, cy + R * 0.14)

      // Best score
      if (hsRef.current > 0) {
        ctx.fillStyle = "#555"; ctx.font = `${Math.floor(R * 0.08)}px monospace`
        ctx.fillText(`best: ${hsRef.current}`, cx, cy + R * 0.26)
      }

      // Status text below circle
      const statusY = H - 30
      ctx.textAlign = "center"
      if (currentPhase === "idle") {
        ctx.fillStyle = primary; ctx.font = `bold ${Math.floor(R * 0.11)}px monospace`
        ctx.fillText("click to start", cx, statusY)
      } else if (currentPhase === "showing") {
        ctx.fillStyle = "#888"; ctx.font = `${Math.floor(R * 0.1)}px monospace`
        ctx.fillText("watch the sequence…", cx, statusY)
      } else if (currentPhase === "input") {
        ctx.fillStyle = primary; ctx.font = `${Math.floor(R * 0.1)}px monospace`
        ctx.fillText("your turn!", cx, statusY)
      } else if (currentPhase === "over") {
        ctx.fillStyle = "#ef4444"; ctx.font = `bold ${Math.floor(R * 0.12)}px monospace`
        ctx.fillText("WRONG! click to retry", cx, statusY)
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [primary])

  const showSeq = useCallback(async (s: number[], spd: number) => {
    showingRef.current = true
    setPhase("showing")
    await new Promise(r => setTimeout(r, 400))
    for (const c of s) {
      setLit(c); await new Promise(r => setTimeout(r, spd))
      setLit(null); await new Promise(r => setTimeout(r, spd * 0.3))
    }
    showingRef.current = false
    setPhase("input")
  }, [])

  const start = useCallback(() => {
    const first = Math.floor(Math.random() * 4)
    const spd = 600
    setSeq([first]); setInput([]); setScore(0); setPhase("showing")
    showSeq([first], spd)
  }, [showSeq])

  const press = useCallback((c: number) => {
    if (phaseRef.current !== "input") return
    const newInput = [...input, c]
    setLit(c); setTimeout(() => setLit(null), 150)
    const pos = newInput.length - 1
    if (newInput[pos] !== seq[pos]) {
      setPhase("over")
      setHs(h => { const best = Math.max(h, score); saveHS("simon", best); return best })
      return
    }
    if (newInput.length === seq.length) {
      const ns = score + 1
      setScore(ns); setInput([])
      const next = [...seq, Math.floor(Math.random() * 4)]
      const spd = Math.max(250, 600 - ns * 18)
      setSeq(next)
      setTimeout(() => showSeq(next, spd), 600)
    } else {
      setInput(newInput)
    }
  }, [input, seq, score, showSeq])

  // Click handler — detect which quadrant was clicked
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY
    const cx = canvas.width / 2, cy = canvas.height / 2 - 10
    const R = Math.min(canvas.width, canvas.height) * 0.38

    const dist = Math.hypot(mx - cx, my - cy)
    if (dist < R * 0.35 || dist > R) {
      // Clicked center or outside — start/restart
      if (phaseRef.current === "idle" || phaseRef.current === "over") start()
      return
    }

    // Determine quadrant
    const angle = Math.atan2(my - cy, mx - cx)
    let quadrant: number
    if (angle >= -Math.PI / 2 && angle < 0) quadrant = 0       // top-right (Red)
    else if (angle >= 0 && angle < Math.PI / 2) quadrant = 1   // bottom-right (Green)
    else if (angle >= Math.PI / 2) quadrant = 2                 // bottom-left (Blue)
    else quadrant = 3                                            // top-left (Yellow)

    press(quadrant)
  }, [press, start])

  // Touch handler for mobile
  const handleTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mx = (touch.clientX - rect.left) * scaleX
    const my = (touch.clientY - rect.top) * scaleY
    const cx = canvas.width / 2, cy = canvas.height / 2 - 10
    const R = Math.min(canvas.width, canvas.height) * 0.38

    const dist = Math.hypot(mx - cx, my - cy)
    if (dist < R * 0.35 || dist > R) {
      if (phaseRef.current === "idle" || phaseRef.current === "over") start()
      return
    }

    const angle = Math.atan2(my - cy, mx - cx)
    let quadrant: number
    if (angle >= -Math.PI / 2 && angle < 0) quadrant = 0
    else if (angle >= 0 && angle < Math.PI / 2) quadrant = 1
    else if (angle >= Math.PI / 2) quadrant = 2
    else quadrant = 3

    press(quadrant)
  }, [press, start])

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> back
        </button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-primary">round {score}</span>
          {hs > 0 && <span className="text-muted-foreground">best: {hs}</span>}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        onClick={handleClick}
        onTouchStart={handleTouch}
        className="rounded-2xl border border-primary/20 cursor-pointer touch-none select-none"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <p className="font-mono text-xs text-muted-foreground">click the colored arcs · repeat the sequence</p>
    </div>
  )
}
