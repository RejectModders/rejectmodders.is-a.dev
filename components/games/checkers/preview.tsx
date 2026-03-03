"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function CheckersPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const N=6, CELL=22, OX=(W-N*CELL)/2, OY=(H-N*CELL)/2
    // simple board state that animates a piece moving
    let pieces=[
      {r:0,c:1,col:"#888"},{r:0,c:3,col:"#888"},{r:0,c:5,col:"#888"},
      {r:1,c:0,col:"#888"},{r:1,c:2,col:"#888"},{r:1,c:4,col:"#888"},
      {r:4,c:1,col:"#ef4444"},{r:4,c:3,col:"#ef4444"},{r:4,c:5,col:"#ef4444"},
      {r:5,c:0,col:"#ef4444"},{r:5,c:2,col:"#ef4444"},{r:5,c:4,col:"#ef4444"},
    ]
    const moves=[{from:[4,1],to:[3,0]},{from:[4,3],to:[3,2]},{from:[5,2],to:[4,1]},{from:[3,0],to:[2,1]}]
    let mIdx=0, lastT=0, selR=-1, selC=-1, targetR=-1, targetC=-1, raf=0, animT=0
    const draw=(now:number)=>{
      if(now-lastT>900){
        lastT=now
        const m=moves[mIdx%moves.length]
        const p=pieces.find(p=>p.r===m.from[0]&&p.c===m.from[1])
        if(p){p.r=m.to[0];p.c=m.to[1]}
        selR=m.to[0];selC=m.to[1]
        mIdx++
      }
      ctx.fillStyle="#0a0a0a"; ctx.fillRect(0,0,W,H)
      for(let r=0;r<N;r++) for(let c=0;c<N;c++){
        const dark=(r+c)%2===1
        const isSel=r===selR&&c===selC
        ctx.fillStyle=isSel?primary+"44":dark?"#1a1a1a":"#2a2a2a"
        ctx.fillRect(OX+c*CELL,OY+r*CELL,CELL,CELL)
      }
      pieces.forEach(p=>{
        const isSel=p.r===selR&&p.c===selC
        ctx.fillStyle=p.col
        ctx.shadowColor=isSel?primary:"transparent"; ctx.shadowBlur=isSel?8:0
        ctx.beginPath(); ctx.arc(OX+p.c*CELL+CELL/2,OY+p.r*CELL+CELL/2,8,0,Math.PI*2); ctx.fill()
        ctx.strokeStyle=p.col==="#ef4444"?"#b91c1c":"#555"; ctx.lineWidth=1.5; ctx.stroke()
      })
      ctx.shadowBlur=0
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw); return()=>cancelAnimationFrame(raf)
  },[primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full"/>
}

