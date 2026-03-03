"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function BlackjackPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const CARDS = [
      { d:[{v:"A",s:"♠"},{v:"K",s:"♥",h:true}], p:[{v:"7",s:"♠"},{v:"9",s:"♦"}], msg:"", chips:100 },
      { d:[{v:"A",s:"♠"},{v:"K",s:"♥"}], p:[{v:"7",s:"♠"},{v:"9",s:"♦"}], msg:"Blackjack! 🎉", chips:115 },
    ]
    let state=0, lastT=0, raf=0
    const drawCard=(x:number,y:number,val:string,suit:string,hidden=false)=>{
      ctx.fillStyle=hidden?"#1a3a8f":"#fff"
      ctx.strokeStyle=hidden?"#2a4abf":"#ccc"; ctx.lineWidth=1
      ctx.beginPath(); ctx.roundRect(x,y,38,54,4); ctx.fill(); ctx.stroke()
      if(!hidden){
        const red=suit==="♥"||suit==="♦"
        ctx.fillStyle=red?"#ef4444":"#111"
        ctx.font=`bold 11px monospace`; ctx.textAlign="left"; ctx.textBaseline="top"
        ctx.fillText(val+suit,x+3,y+3)
        ctx.font="18px serif"; ctx.textAlign="center"; ctx.textBaseline="middle"
        ctx.fillText(suit,x+19,y+30)
      } else {
        ctx.fillStyle="#3b82f6"; ctx.font="18px serif"; ctx.textAlign="center"
        ctx.textBaseline="middle"; ctx.fillText("?",x+19,y+27)
      }
    }
    const draw=(now:number)=>{
      if(now-lastT>1800){lastT=now;state=(state+1)%CARDS.length}
      const s=CARDS[state]
      ctx.fillStyle="#0d4a1a"; ctx.fillRect(0,0,W,H)
      ctx.strokeStyle="#0a3a14"; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(W/2,H/2,W/2-10,H/2-8,0,0,Math.PI*2); ctx.stroke()
      // dealer label
      ctx.fillStyle="#ffffff44"; ctx.font="10px monospace"; ctx.textAlign="left"; ctx.textBaseline="top"
      ctx.fillText("dealer",12,8)
      ctx.fillText("you",12,H/2+4)
      // dealer cards
      s.d.forEach((c,i)=>drawCard(60+i*44,16,c.v,c.s,(c as any).h))
      // player cards
      s.p.forEach((c,i)=>drawCard(60+i*44,H/2+14,c.v,c.s))
      // total
      ctx.fillStyle=primary; ctx.font="bold 12px monospace"; ctx.textAlign="left"
      ctx.fillText("16",110,H/2+4)
      // chips
      ctx.fillStyle="#fbbf24"; ctx.font="bold 13px monospace"; ctx.textAlign="right"
      ctx.fillText(`💰 ${s.chips}`,W-10,H-16)
      if(s.msg){
        ctx.fillStyle="#fbbf24"; ctx.font="bold 14px monospace"; ctx.textAlign="center"
        ctx.fillText(s.msg,W/2,H-30)
      }
      // buttons
      if(!s.msg){
        ctx.fillStyle=primary; ctx.beginPath(); ctx.roundRect(W-90,H/2+18,38,22,4); ctx.fill()
        ctx.fillStyle="#1a1a1a"; ctx.beginPath(); ctx.roundRect(W-46,H/2+18,38,22,4); ctx.fill()
        ctx.strokeStyle=primary+"88"; ctx.lineWidth=1; ctx.stroke()
        ctx.fillStyle="#000"; ctx.font="bold 10px monospace"; ctx.textAlign="center"
        ctx.fillText("Hit",W-71,H/2+29+2)
        ctx.fillStyle=primary; ctx.fillText("Stand",W-27,H/2+29+2)
      }
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw); return()=>cancelAnimationFrame(raf)
  },[primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full"/>
}

