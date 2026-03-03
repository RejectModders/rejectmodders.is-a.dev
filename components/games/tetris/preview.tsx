"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

export function TetrisPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const TC = 13, COLS = Math.floor(W / TC), ROWS = Math.floor(H / TC), STEP_MS = 75
    const PIECES = [
      { s: [[1,1,1,1]], color: "#06b6d4" }, { s: [[1,1],[1,1]], color: "#fbbf24" },
      { s: [[0,1,0],[1,1,1]], color: "#a855f7" }, { s: [[1,1,0],[0,1,1]], color: "#22c55e" },
      { s: [[0,1,1],[1,1,0]], color: "#ef4444" }, { s: [[1,0,0],[1,1,1]], color: "#f97316" },
      { s: [[0,0,1],[1,1,1]], color: "#3b82f6" },
    ]
    type TCell = string | 0; type Row = TCell[]; type Board = Row[]
    const mkB = (): Board => Array.from({ length: ROWS }, (): Row => Array<TCell>(COLS).fill(0))
    const fits = (b: Board, sh: number[][], x: number, y: number) => {
      for (let r = 0; r < sh.length; r++) for (let c = 0; c < sh[r].length; c++)
        if (sh[r][c]) {
          if (x+c<0||x+c>=COLS||y+r>=ROWS) return false
          if (y+r>=0&&b[y+r][x+c]) return false
        }
      return true
    }
    const pickX = (b: Board, sh: number[][]): number => {
      let best = 0, bestScore = -Infinity
      for (let tx = 0; tx <= COLS - sh[0].length; tx++) {
        if (!fits(b, sh, tx, 0)) continue
        let ty = 0; while (fits(b, sh, tx, ty+1)) ty++
        let bonus = 0
        sh.forEach((row, dr) => row.forEach(v => {
          if (!v) return; const br = b[ty+dr]; if (br) bonus += br.filter(Boolean).length
        }))
        const score = bonus - ty * 0.08
        if (score > bestScore) { bestScore = score; best = tx }
      }
      return best
    }
    let board = mkB()
    for (let r = ROWS-3; r < ROWS; r++) for (let c = 0; c < COLS; c++)
      if (Math.random() > 0.42) board[r][c] = PIECES[Math.floor(Math.random()*PIECES.length)].color
    let pi = 0
    const spawn = () => {
      const p = PIECES[pi++ % PIECES.length]
      return { sh: p.s.map(r => [...r]), color: p.color, x: Math.floor(COLS/2)-Math.floor(p.s[0].length/2), y: -1 }
    }
    let piece = spawn(), tx = pickX(board, piece.sh)
    const place = () => {
      piece.sh.forEach((row, r) => row.forEach((v, c) => { if (v&&piece.y+r>=0) board[piece.y+r][piece.x+c]=piece.color }))
      for (let r = ROWS-1; r >= 0; r--) {
        if (board[r].every(c => c!==0)) { board.splice(r,1); board.unshift(Array<TCell>(COLS).fill(0)); r++ }
      }
      piece=spawn(); tx=pickX(board, piece.sh)
      if (!fits(board, piece.sh, piece.x, piece.y)) {
        board=mkB()
        for (let r=ROWS-3;r<ROWS;r++) for (let c=0;c<COLS;c++)
          if (Math.random()>0.42) board[r][c]=PIECES[Math.floor(Math.random()*PIECES.length)].color
        piece=spawn(); tx=pickX(board, piece.sh)
      }
    }
    let lastStep = 0, raf = 0
    const draw = (now: number) => {
      if (now-lastStep >= STEP_MS) {
        lastStep = now
        if (piece.x < tx && fits(board, piece.sh, piece.x+1, piece.y)) piece.x++
        else if (piece.x > tx && fits(board, piece.sh, piece.x-1, piece.y)) piece.x--
        else { if (fits(board, piece.sh, piece.x, piece.y+1)) piece.y++; else place() }
      }
      ctx.fillStyle="#0a0a0a"; ctx.fillRect(0,0,W,H)
      ctx.strokeStyle="#ffffff07"; ctx.lineWidth=0.5
      for (let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*TC,0);ctx.lineTo(x*TC,H);ctx.stroke()}
      for (let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*TC);ctx.lineTo(W,y*TC);ctx.stroke()}
      board.forEach((row, r) => row.forEach((cell, c) => {
        if (!cell) return
        ctx.fillStyle=cell as string; ctx.fillRect(c*TC+1, r*TC+1, TC-2, TC-2)
        ctx.fillStyle="rgba(255,255,255,0.14)"; ctx.fillRect(c*TC+1, r*TC+1, TC-2, 3)
      }))
      let gy = piece.y; while (fits(board, piece.sh, piece.x, gy+1)) gy++
      piece.sh.forEach((row,r) => row.forEach((v,c) => {
        if (!v) return; ctx.fillStyle=piece.color+"28"
        ctx.fillRect((piece.x+c)*TC+1, (gy+r)*TC+1, TC-2, TC-2)
      }))
      piece.sh.forEach((row,r) => row.forEach((v,c) => {
        if (!v) return
        ctx.fillStyle=piece.color; ctx.fillRect((piece.x+c)*TC+1, (piece.y+r)*TC+1, TC-2, TC-2)
        ctx.fillStyle="rgba(255,255,255,0.2)"; ctx.fillRect((piece.x+c)*TC+1, (piece.y+r)*TC+1, TC-2, 3)
      }))
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw); return () => cancelAnimationFrame(raf)
  }, [primary])

  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}

