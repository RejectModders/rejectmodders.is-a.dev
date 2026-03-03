"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function YahtzeePreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const PIPS: Record<number,[number,number][]> = {
      1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],
      4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],
      6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]
    }
    let dice=[5,5,5,5,5], held=[false,false,false,false,false], phase=0, lastT=0, raf=0
    const phases=[
      ()=>{ dice=[3,5,2,5,1]; held=[false,false,false,false,false] },
      ()=>{ dice=[5,5,5,5,5]; held=[true,true,true,true,true] },
    ]
    const drawDie=(x:number,y:number,val:number,isHeld:boolean)=>{
      const S=28
      ctx.fillStyle=isHeld?primary+"22":"#1a1a1a"
      ctx.strokeStyle=isHeld?primary:"#444"; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.roundRect(x,y,S,S,4); ctx.fill(); ctx.stroke()
      ctx.fillStyle=isHeld?primary:"#e4e4e7"
      ;(PIPS[val]||[]).forEach(([px,py])=>{
        ctx.beginPath(); ctx.arc(x+S/2+px*8,y+S/2+py*8,3,0,Math.PI*2); ctx.fill()
      })
    }
    const draw=(now:number)=>{
      if(now-lastT>1400){lastT=now;phases[phase%phases.length]();phase++}
      ctx.fillStyle="#0a0a0a"; ctx.fillRect(0,0,W,H)
      const startX=(W-5*34)/2
      dice.forEach((d,i)=>drawDie(startX+i*34,H/2-14,d,held[i]))
      ctx.fillStyle=primary; ctx.font="bold 12px monospace"; ctx.textAlign="center"
      ctx.fillText(held.every(Boolean)?"Yahtzee! 🎲":"rolling…",W/2,H/2-28)
      // score hint
      if(held.every(Boolean)){
        ctx.fillStyle="#fbbf24"; ctx.font="bold 16px monospace"
        ctx.fillText("50 pts",W/2,H/2+30)
      }
      // roll button
      ctx.fillStyle=primary; ctx.beginPath(); ctx.roundRect(W/2-30,H-34,60,22,5); ctx.fill()
      ctx.fillStyle="#000"; ctx.font="bold 10px monospace"; ctx.textAlign="center"; ctx.textBaseline="middle"
      ctx.fillText("Roll",W/2,H-23)
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw); return()=>cancelAnimationFrame(raf)
  },[primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full"/>
}

