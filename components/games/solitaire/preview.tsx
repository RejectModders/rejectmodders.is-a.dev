"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function SolitairePreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    // Static solitaire scene with some cards, animated card move
    const CARDS=[
      {x:10,y:10,v:"K",s:"♠",red:false},{x:10,y:26,v:"Q",s:"♥",red:true},{x:10,y:42,v:"J",s:"♠",red:false},
      {x:50,y:10,v:"9",s:"♦",red:true},{x:50,y:26,v:"8",s:"♠",red:false},
      {x:90,y:10,v:"7",s:"♣",red:false},{x:90,y:26,v:"6",s:"♦",red:true},
      {x:130,y:10,v:"5",s:"♠",red:false},
      {x:170,y:10,v:"A",s:"♥",red:true,found:true},
      {x:210,y:10,v:"A",s:"♠",red:false,found:true},
    ]
    let floatX=130, floatY=10, floatTX=170, floatTY=70, phase=0, lastT=0, raf=0
    const drawCard=(x:number,y:number,v:string,s:string,red:boolean,sel=false)=>{
      ctx.fillStyle=sel?primary+"22":"#fff"
      ctx.strokeStyle=sel?primary:"#ccc"; ctx.lineWidth=sel?1.5:0.8
      ctx.beginPath(); ctx.roundRect(x,y,32,44,3); ctx.fill(); ctx.stroke()
      ctx.fillStyle=red?"#ef4444":"#111"
      ctx.font="bold 9px monospace"; ctx.textAlign="left"; ctx.textBaseline="top"
      ctx.fillText(v+s,x+2,y+2)
    }
    const draw=(now:number)=>{
      if(now-lastT>1200){lastT=now;phase=(phase+1)%4}
      ctx.fillStyle="#0d4a1a"; ctx.fillRect(0,0,W,H)
      // foundation placeholders
      ctx.strokeStyle="#ffffff22"; ctx.lineWidth=1
      for(let i=0;i<4;i++){ctx.beginPath();ctx.roundRect(130+i*40,H-54,32,44,3);ctx.stroke()}
      // columns
      CARDS.forEach(c=>{ if(!(c as any).found) drawCard(c.x,c.y,c.v,c.s,c.red) })
      // found cards
      CARDS.filter(c=>(c as any).found).forEach((c,i)=>drawCard(130+i*40,H-54,c.v,c.s,c.red))
      // animated card (ace moving to foundation)
      const prog=Math.min(1,(phase%2)*0.5+0.25)
      const ax=floatX+(floatTX-floatX)*prog
      const ay=floatY+(H-54-floatY)*prog
      drawCard(ax,ay,"A","♣",false,true)
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw); return()=>cancelAnimationFrame(raf)
  },[primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full"/>
}

