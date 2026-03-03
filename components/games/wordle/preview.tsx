"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

// Shows a scripted Wordle game: types letters, reveals rows with colors
export function WordlePreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height

    const GREEN="#22c55e", YELLOW="#fbbf24", GREY="#3f3f46", DARK="#27272a"
    const ANSWER = "CRANE"
    // Scripted guesses + their color results
    const SCRIPT: { word: string; colors: string[] }[] = [
      { word:"SLATE", colors:[GREY,GREY,YELLOW,GREY,YELLOW] },
      { word:"STARE", colors:[GREY,GREY,GREEN,YELLOW,GREEN] },
      { word:"CRANE", colors:[GREEN,GREEN,GREEN,GREEN,GREEN] },
    ]
    // typing sequence — types each letter then submits
    type Phase = { type:"typing"; row:number; col:number } | { type:"reveal"; row:number }
    const PHASES: Phase[] = []
    SCRIPT.forEach((_,i) => {
      for (let c = 0; c < 5; c++) PHASES.push({ type:"typing", row:i, col:c })
      PHASES.push({ type:"reveal", row:i })
    })

    const revealed: { word:string; colors:string[] }[] = []
    let currentTyped = ""
    let phaseIdx = 0
    let lastAction = 0
    const TYPING_MS = 140, REVEAL_MS = 500

    const CELL = Math.min(Math.floor(W / 6.5), Math.floor(H / 4.5))
    const GAP = 4
    const totalW = 5*CELL + 4*GAP, totalH = 3*CELL + 2*GAP
    const ox = Math.floor((W - totalW) / 2), oy = Math.floor((H - totalH) / 2)

    let raf = 0
    const draw = (now: number) => {
      const phase = PHASES[phaseIdx]
      const delay = phase?.type === "typing" ? TYPING_MS : REVEAL_MS
      if (phase && now - lastAction > delay) {
        lastAction = now
        if (phase.type === "typing") {
          currentTyped += SCRIPT[phase.row].word[phase.col]
        } else {
          revealed.push(SCRIPT[phase.row])
          currentTyped = ""
        }
        phaseIdx++
        // loop after all done
        if (phaseIdx >= PHASES.length) {
          setTimeout(() => { revealed.length=0; currentTyped=""; phaseIdx=0; lastAction=performance.now() }, 1200)
        }
      }

      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)

      const drawRow = (ri: number, word: string, colors: string[] | null, typing: boolean) => {
        const y = oy + ri * (CELL + GAP)
        for (let ci = 0; ci < 5; ci++) {
          const x = ox + ci * (CELL + GAP)
          const letter = word[ci] ?? ""
          const bg = colors ? colors[ci] : typing && letter ? DARK : DARK
          const border = colors ? colors[ci] : (typing && letter ? primary : GREY)
          ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x,y,CELL,CELL,3); ctx.fill()
          ctx.strokeStyle = border; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(x+0.75,y+0.75,CELL-1.5,CELL-1.5,3); ctx.stroke()
          if (letter) {
            ctx.fillStyle = colors ? "#fff" : "#e4e4e7"
            ctx.font = `bold ${Math.floor(CELL*0.44)}px monospace`
            ctx.textAlign = "center"; ctx.textBaseline = "middle"
            ctx.fillText(letter, x+CELL/2, y+CELL/2)
          }
        }
      }

      const currentRow = revealed.length
      revealed.forEach((r, i) => drawRow(i, r.word, r.colors, false))
      if (currentRow < 3) drawRow(currentRow, currentTyped, null, true)
      for (let i = currentRow + 1; i < 3; i++) drawRow(i, "", null, false)

      ctx.textBaseline = "alphabetic"
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [primary])

  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
