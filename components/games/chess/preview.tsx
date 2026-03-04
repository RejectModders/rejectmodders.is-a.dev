"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

export function ChessPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const N = 8
    const CELL = Math.floor(Math.min(W, H) / N)
    const OX = Math.floor((W - N * CELL) / 2)
    const OY = Math.floor((H - N * CELL) / 2)

    const SYMBOLS: Record<string, string> = {
      wK:"♔", wQ:"♕", wR:"♖", wB:"♗", wN:"♘", wP:"♙",
      bK:"♚", bQ:"♛", bR:"♜", bB:"♝", bN:"♞", bP:"♟",
    }

    type P = { t: string; c: "w" | "b" } | null
    // Full standard chess starting position
    const initBoard = (): P[][] => [
      [{t:"R",c:"b"},{t:"N",c:"b"},{t:"B",c:"b"},{t:"Q",c:"b"},{t:"K",c:"b"},{t:"B",c:"b"},{t:"N",c:"b"},{t:"R",c:"b"}],
      Array(8).fill(null).map(()=>({t:"P",c:"b" as const})),
      Array(8).fill(null), Array(8).fill(null), Array(8).fill(null), Array(8).fill(null),
      Array(8).fill(null).map(()=>({t:"P",c:"w" as const})),
      [{t:"R",c:"w"},{t:"N",c:"w"},{t:"B",c:"w"},{t:"Q",c:"w"},{t:"K",c:"w"},{t:"B",c:"w"},{t:"N",c:"w"},{t:"R",c:"w"}],
    ]

    // Scripted opening moves: [fromR, fromC, toR, toC]
    const MOVES: [number,number,number,number][] = [
      [6,4,4,4], // e4 (white pawn)
      [1,4,3,4], // e5 (black pawn)
      [7,6,5,5], // Nf3 (white knight)
      [0,1,2,2], // Nc6 (black knight)
      [7,5,4,2], // Bc4 (white bishop)
      [1,1,2,1], // b6 (black pawn)
      [5,5,3,4], // Ne5 (white knight captures)
    ]

    const board = initBoard()
    let mIdx = 0, lastT = 0, selR = -1, selC = -1, raf = 0
    let highlightFrom: [number,number] | null = null

    const draw = (now: number) => {
      if (now - lastT > 900 && mIdx < MOVES.length) {
        lastT = now
        const [fr, fc, tr, tc] = MOVES[mIdx++]
        highlightFrom = [fr, fc]
        board[tr][tc] = board[fr][fc]
        board[fr][fc] = null
        selR = tr; selC = tc
      }

      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H)

      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const light = (r + c) % 2 === 0
        const isSel = r === selR && c === selC
        const isFrom = highlightFrom && highlightFrom[0] === r && highlightFrom[1] === c

        let bg = light ? "#f0d9b5" : "#b58863"
        if (isSel) bg = primary + "99"
        else if (isFrom) bg = primary + "44"

        ctx.fillStyle = bg
        ctx.fillRect(OX + c * CELL, OY + r * CELL, CELL, CELL)

        const p = board[r][c] as P
        if (p) {
          const sym = SYMBOLS[`${p.c}${p.t}`]
          ctx.font = `${CELL * 0.72}px serif`
          ctx.textAlign = "center"; ctx.textBaseline = "middle"
          // White pieces: outline shadow
          if (p.c === "w") { ctx.fillStyle = "#000"; ctx.fillText(sym, OX + c * CELL + CELL / 2 + 0.5, OY + r * CELL + CELL / 2 + 1.5) }
          ctx.fillStyle = p.c === "w" ? "#fff" : "#1a1a1a"
          ctx.fillText(sym, OX + c * CELL + CELL / 2, OY + r * CELL + CELL / 2 + 1)
        }
      }

      // Board border
      ctx.strokeStyle = primary + "33"; ctx.lineWidth = 1
      ctx.strokeRect(OX, OY, N * CELL, N * CELL)

      ctx.textBaseline = "alphabetic"
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [primary])

  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
