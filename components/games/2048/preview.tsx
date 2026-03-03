"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w/2, h/2); ctx.beginPath(); ctx.moveTo(x+r,y)
  ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r)
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r)
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r)
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath()
}

export function Game2048Preview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const SIZE = 4, GAP = 4
    const CELL = Math.floor((Math.min(W,H) - GAP*(SIZE+1)) / SIZE)
    const BW = CELL*SIZE + GAP*(SIZE+1), BH = CELL*SIZE + GAP*(SIZE+1)
    const ox = Math.floor((W-BW)/2), oy = Math.floor((H-BH)/2)
    const BG: Record<number,string> = {0:"#1e1e1e",2:"#eee4da",4:"#ede0c8",8:"#f2b179",16:"#f59563",32:"#f67c5f",64:"#f65e3b",128:"#edcf72",256:"#edcc61",512:"#edc850",1024:"#edc53f",2048:"#edc22e"}
    const FG: Record<number,string> = {0:"#333",2:"#776e65",4:"#776e65",8:"#fff",16:"#fff",32:"#fff",64:"#fff",128:"#fff",256:"#fff",512:"#fff",1024:"#fff",2048:"#fff"}
    type G = number[][]
    const mk = (): G => Array.from({length:SIZE},()=>Array(SIZE).fill(0))
    const addTile = (g: G): G => {
      const empty: [number,number][] = []
      for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) if (!g[r][c]) empty.push([r,c])
      if (!empty.length) return g
      const [r,c] = empty[Math.floor(Math.random()*empty.length)]
      const n = g.map(r=>[...r]); n[r][c] = Math.random()<0.82?2:4; return n
    }
    const slideLeft = (g: G): G => g.map(row => {
      const n = row.filter(Boolean)
      for (let i=0;i<n.length-1;i++) if (n[i]===n[i+1]){n[i]*=2;n[i+1]=0}
      const m = n.filter(Boolean); while(m.length<SIZE) m.push(0); return m
    })
    const flip = (g:G):G => g.map(r=>[...r].reverse())
    const tp = (g:G):G => Array.from({length:SIZE},(_,r)=>Array.from({length:SIZE},(_,c)=>g[c][r]))
    const DIRS = [
      (g:G)=>tp(flip(slideLeft(flip(tp(g))))),
      (g:G)=>slideLeft(g),
      (g:G)=>tp(slideLeft(tp(g))),
      (g:G)=>flip(slideLeft(flip(g))),
    ]
    let grid = addTile(addTile(mk())), di=0, lastMove=0, raf=0
    const draw = (now: number) => {
      if (now-lastMove > 580) {
        lastMove=now; grid=addTile(DIRS[di%DIRS.length](grid)); di++
        if (!grid.flat().some(v=>!v)) grid=addTile(addTile(mk()))
      }
      ctx.fillStyle="#111"; ctx.fillRect(0,0,W,H)
      ctx.fillStyle="#0d0d0d"; rr(ctx,ox-2,oy-2,BW+4,BH+4,8); ctx.fill()
      for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) {
        const v=grid[r][c], x=ox+GAP+c*(CELL+GAP), y=oy+GAP+r*(CELL+GAP)
        ctx.fillStyle=BG[v]??BG[2048]; rr(ctx,x,y,CELL,CELL,4); ctx.fill()
        if (v) {
          ctx.fillStyle=FG[v]??FG[2048]
          ctx.font=`bold ${v>=1024?10:v>=128?12:14}px monospace`
          ctx.textAlign="center"; ctx.textBaseline="middle"
          ctx.fillText(String(v),x+CELL/2,y+CELL/2)
        }
      }
      ctx.textBaseline="alphabetic"
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw); return ()=>cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
