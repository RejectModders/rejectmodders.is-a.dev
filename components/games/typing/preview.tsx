"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

export function TypingPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const words = ["the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog", "and", "runs", "fast"]
    let wordIdx = 0, charIdx = 0, typed = "", correctWords = 0, totalChars = 0, startTime = 0
    let lastT = 0, raf = 0

    const draw = (now: number) => {
      if (startTime === 0) startTime = now
      if (now - lastT > 90) {
        lastT = now
        const w = words[wordIdx % words.length]
        if (charIdx < w.length) {
          typed += w[charIdx]; charIdx++; totalChars++
        } else {
          typed = ""; charIdx = 0; wordIdx++; correctWords++
        }
      }
      // Calculate WPM
      const elapsed = Math.max(1, (now - startTime) / 1000)
      const wpm = Math.round(correctWords / (elapsed / 60))

      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)

      // Timer bar at top
      const timeLeft = Math.max(0, 60 - elapsed % 60)
      ctx.fillStyle = "#1a1a1a"; ctx.fillRect(12, 8, W - 24, 4)
      ctx.fillStyle = primary + "88"
      ctx.fillRect(12, 8, (W - 24) * (timeLeft / 60), 4)

      // Words display area
      const rowY = 28, lineH = 22
      ctx.font = "13px monospace"; ctx.textBaseline = "top"
      let x = 14, y = rowY, row = 0
      const currentWordIdx = wordIdx % words.length

      for (let i = 0; i < words.length && row < 3; i++) {
        const w = words[i]
        const ww = ctx.measureText(w).width
        if (x + ww > W - 14) { x = 14; y += lineH; row++ }
        if (row >= 3) break

        const relIdx = i - currentWordIdx
        if (relIdx < -2) {
          // Past words — green
          ctx.fillStyle = "#22c55e88"; ctx.fillText(w, x, y)
        } else if (i === currentWordIdx) {
          // Current word — show typed part in white, rest in primary
          const typedPart = typed
          const remaining = w.slice(typed.length)
          // Typed chars
          ctx.fillStyle = "#fff"
          ctx.fillText(typedPart, x, y)
          // Remaining
          ctx.fillStyle = primary
          ctx.fillText(remaining, x + ctx.measureText(typedPart).width, y)
          // Cursor blink
          if (Math.floor(now / 500) % 2 === 0) {
            const cursorX = x + ctx.measureText(typedPart).width
            ctx.fillStyle = primary; ctx.fillRect(cursorX, y + 1, 2, 14)
          }
          // Underline
          ctx.strokeStyle = primary + "44"; ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(x, y + 17); ctx.lineTo(x + ww, y + 17); ctx.stroke()
        } else if (relIdx > 0) {
          // Future words
          ctx.fillStyle = "#555"; ctx.fillText(w, x, y)
        } else {
          ctx.fillStyle = "#22c55e88"; ctx.fillText(w, x, y)
        }
        x += ww + 8
      }

      // Stats bar at bottom
      const barY = H - 38
      ctx.fillStyle = "#1a1a1a"
      ctx.beginPath(); ctx.roundRect(12, barY, W - 24, 30, 6); ctx.fill()

      // WPM (big)
      ctx.fillStyle = primary; ctx.font = "bold 18px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle"
      ctx.fillText(`${wpm}`, W / 2 - 50, barY + 15)
      ctx.fillStyle = "#666"; ctx.font = "9px monospace"
      ctx.fillText("WPM", W / 2 - 50, barY + 27)

      // Words count
      ctx.fillStyle = "#22c55e"; ctx.font = "bold 14px monospace"
      ctx.fillText(`${correctWords}`, W / 2 + 20, barY + 15)
      ctx.fillStyle = "#666"; ctx.font = "9px monospace"
      ctx.fillText("WORDS", W / 2 + 20, barY + 27)

      // Timer
      ctx.fillStyle = "#fbbf24"; ctx.font = "bold 14px monospace"
      ctx.fillText(`${Math.ceil(timeLeft)}s`, W / 2 + 80, barY + 15)
      ctx.fillStyle = "#666"; ctx.font = "9px monospace"
      ctx.fillText("TIME", W / 2 + 80, barY + 27)

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
