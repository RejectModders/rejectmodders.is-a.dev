"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function HangmanPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const word = "HANGMAN"
    const guessSeq = ["H", "A", "N", "G", "M", "X", "Z", "E"]
    let guessed = new Set<string>(), step = 0, lastT = 0, raf = 0

    const draw = (now: number) => {
      if (now - lastT > 600) {
        lastT = now
        if (step < guessSeq.length) { guessed.add(guessSeq[step]); step++ }
        else { guessed = new Set(); step = 0 }
      }
      const wrong = [...guessed].filter(c => !word.includes(c)).length

      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)

      // Gallows (left side, compact)
      const gx = 50, gy = H - 16
      ctx.strokeStyle = "#555"; ctx.lineWidth = 2.5; ctx.lineCap = "round"
      ctx.beginPath(); ctx.moveTo(gx - 25, gy); ctx.lineTo(gx + 30, gy); ctx.stroke() // base
      ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, 18); ctx.stroke() // pole
      ctx.beginPath(); ctx.moveTo(gx, 18); ctx.lineTo(gx + 40, 18); ctx.stroke() // top
      ctx.beginPath(); ctx.moveTo(gx + 40, 18); ctx.lineTo(gx + 40, 30); ctx.stroke() // rope

      // Figure
      ctx.strokeStyle = primary; ctx.lineWidth = 2
      if (wrong > 0) { ctx.beginPath(); ctx.arc(gx + 40, 40, 9, 0, Math.PI * 2); ctx.stroke() } // head
      if (wrong > 1) { ctx.beginPath(); ctx.moveTo(gx + 40, 49); ctx.lineTo(gx + 40, 78); ctx.stroke() } // body
      if (wrong > 2) { ctx.beginPath(); ctx.moveTo(gx + 40, 56); ctx.lineTo(gx + 26, 68); ctx.stroke() } // left arm
      if (wrong > 3) { ctx.beginPath(); ctx.moveTo(gx + 40, 56); ctx.lineTo(gx + 54, 68); ctx.stroke() } // right arm
      if (wrong > 4) { ctx.beginPath(); ctx.moveTo(gx + 40, 78); ctx.lineTo(gx + 28, 94); ctx.stroke() } // left leg
      if (wrong > 5) { ctx.beginPath(); ctx.moveTo(gx + 40, 78); ctx.lineTo(gx + 52, 94); ctx.stroke() } // right leg

      // Face (if dead)
      if (wrong >= 6) {
        ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(gx + 36, 37); ctx.lineTo(gx + 39, 40); ctx.moveTo(gx + 39, 37); ctx.lineTo(gx + 36, 40); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(gx + 41, 37); ctx.lineTo(gx + 44, 40); ctx.moveTo(gx + 44, 37); ctx.lineTo(gx + 41, 40); ctx.stroke()
      }

      // Word blanks (right side)
      const letters = word.split("")
      const letterW = 16, startX = 115, wordY = H / 2 + 10
      ctx.textAlign = "center"; ctx.textBaseline = "middle"
      letters.forEach((l, i) => {
        const x = startX + i * (letterW + 3)
        // blank line
        ctx.strokeStyle = "#555"; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(x - 6, wordY + 14); ctx.lineTo(x + 6, wordY + 14); ctx.stroke()
        // letter
        if (guessed.has(l)) {
          ctx.fillStyle = primary; ctx.font = "bold 16px monospace"
          ctx.fillText(l, x, wordY + 2)
        }
      })

      // Wrong letters (top right)
      const wrongLetters = [...guessed].filter(c => !word.includes(c))
      if (wrongLetters.length) {
        ctx.fillStyle = "#ef4444"; ctx.font = "bold 11px monospace"; ctx.textAlign = "left"
        ctx.fillText(wrongLetters.join(" "), 115, 25)
        ctx.fillStyle = "#444"; ctx.font = "9px monospace"
        ctx.fillText("wrong", 115, 13)
      }

      // Guesses left
      ctx.fillStyle = "#888"; ctx.font = "10px monospace"; ctx.textAlign = "right"
      ctx.fillText(`${6 - wrong}/6`, W - 10, H - 10)

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
