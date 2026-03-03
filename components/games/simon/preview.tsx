"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function SimonPreview() {
  const ref=useRef<HTMLCanvasElement>(null);const primary=usePrimary()
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext("2d")!
    const W=canvas.width,H=canvas.height
    const TAU=Math.PI*2
    const COLORS=["#ef4444","#22c55e","#3b82f6","#fbbf24"]
    const seq=[0,2,1,3,0,1,3,2,0];let step=0,lit=-1,lastT=0,phase:"show"|"gap"="show",round=0,raf=0
    const draw=(now:number)=>{
      if(now-lastT>(phase==="show"?420:180)){
        lastT=now
        if(phase==="show"){lit=seq[step%seq.length];phase="gap"}
        else{lit=-1;step++;phase="show";if(step%seq.length===0)round++}
      }
      ctx.fillStyle="#0a0a0a";ctx.fillRect(0,0,W,H)
      const cx=W/2,cy=H/2,R=60
      for(let i=0;i<4;i++){
        const startAngle=i*Math.PI/2-Math.PI/2
        const endAngle=startAngle+Math.PI/2
        const isLit=lit===i
        ctx.fillStyle=COLORS[i]
        ctx.globalAlpha=isLit?1:0.3
        ctx.beginPath()
        ctx.arc(cx,cy,R,startAngle+0.06,endAngle-0.06)
        ctx.arc(cx,cy,R*0.38,endAngle-0.06,startAngle+0.06,true)
        ctx.closePath()
        ctx.fill()
        if(isLit){
          ctx.shadowColor=COLORS[i];ctx.shadowBlur=18
          ctx.fill()
          ctx.shadowBlur=0
        }
      }
      ctx.globalAlpha=1
      ctx.fillStyle="#111"
      ctx.beginPath();ctx.arc(cx,cy,R*0.32,0,TAU);ctx.fill()
      ctx.strokeStyle="#333";ctx.lineWidth=1.5
      ctx.beginPath();ctx.arc(cx,cy,R*0.32,0,TAU);ctx.stroke()
      ctx.fillStyle=primary;ctx.font="bold 13px monospace";ctx.textAlign="center";ctx.textBaseline="middle"
      ctx.fillText(String(round),cx,cy-1)
      ctx.fillStyle="#888";ctx.font="8px monospace"
      ctx.fillText("ROUND",cx,cy+10)
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf)
  },[primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full"/>
}
