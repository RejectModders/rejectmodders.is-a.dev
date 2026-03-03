"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function LightsOutPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W=canvas.width,H=canvas.height,N=5,CELL=24,GAP=4
    const OX=(W-N*(CELL+GAP))/2,OY=(H-N*(CELL+GAP))/2
    let grid=Array.from({length:N},(_,r)=>Array.from({length:N},(_,c)=>((r+c)%3===0)))
    let step=0,lastT=0,raf=0
    const SEQUENCE=[[1,1],[2,3],[0,4],[3,0],[4,2],[2,2],[1,3],[3,4],[0,1],[4,3]]
    const toggle=(gr:boolean[][],tr:number,tc:number)=>{
      const ng=gr.map(r=>[...r])
      for(const[dr,dc] of [[0,0],[-1,0],[1,0],[0,-1],[0,1]]){
        const nr=tr+dr,nc=tc+dc
        if(nr>=0&&nr<N&&nc>=0&&nc<N) ng[nr][nc]=!ng[nr][nc]
      }
      return ng
    }
    const draw=(now:number)=>{
      if(now-lastT>500){lastT=now;const[r,c]=SEQUENCE[step%SEQUENCE.length];grid=toggle(grid,r,c);step++}
      ctx.fillStyle="#0a0a0a";ctx.fillRect(0,0,W,H)
      for(let r=0;r<N;r++) for(let c=0;c<N;c++){
        const on=grid[r][c]
        ctx.fillStyle=on?primary:"#1a1a1a"
        ctx.shadowColor=on?primary:"transparent";ctx.shadowBlur=on?10:0
        ctx.beginPath();ctx.roundRect(OX+c*(CELL+GAP),OY+r*(CELL+GAP),CELL,CELL,4);ctx.fill()
      }
      ctx.shadowBlur=0
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw); return()=>cancelAnimationFrame(raf)
  },[primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full"/>
}

