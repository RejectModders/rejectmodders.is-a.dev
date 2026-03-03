"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

export function DinoPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const GY=H-24, DW=18, DH=22

    const dino={y:GY-DH,vy:0,leg:0}
    type Cactus={x:number;w:number;h:number}
    const cacti:Cactus[]=[{x:W+30,w:10,h:20},{x:W+140,w:8,h:26}]
    let score=0,speed=2.2,frame=0,raf=0,lastJump=0

    const loop=()=>{
      frame++
      speed=2.2+score/800
      score++
      dino.leg=Math.floor(score/8)%2
      // gravity
      dino.vy+=0.45; dino.y=Math.min(GY-DH,dino.y+dino.vy)
      // auto-jump when cactus is close
      const nearest=cacti.filter(c=>c.x>40).sort((a,b)=>a.x-b.x)[0]
      if(nearest&&nearest.x<95&&dino.y>=GY-DH-2&&frame-lastJump>30){dino.vy=-7.5;lastJump=frame}
      // move cacti
      for(const c of cacti){c.x-=speed}
      // reset cacti that go off screen
      cacti.forEach((c,i)=>{
        if(c.x<-20){
          const prev=cacti[(i+1)%2]
          c.x=Math.max(W+80,prev.x+100+Math.random()*60)
          c.h=18+Math.random()*20; c.w=8+Math.random()*6
        }
      })

      // draw
      ctx.fillStyle="#0a0a0a";ctx.fillRect(0,0,W,H)
      // clouds
      ctx.fillStyle="#ffffff08"
      for(let i=0;i<3;i++){
        const cx=((i*90+(frame*0.3))%W+W)%W,cy=20+i*12
        ctx.beginPath();ctx.ellipse(cx,cy,20,8,0,0,Math.PI*2);ctx.fill()
      }
      // ground
      ctx.strokeStyle="#333";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,GY);ctx.lineTo(W,GY);ctx.stroke()
      // pebbles
      for(let i=0;i<6;i++){ctx.fillStyle="#2a2a2a";ctx.fillRect(((i*47+frame*Math.floor(speed*2))%W+W)%W,GY+2,3+i%2,2)}
      // cacti
      ctx.fillStyle="#22c55e"
      for(const c of cacti){
        ctx.fillRect(c.x,GY-c.h,c.w,c.h)
        ctx.fillRect(c.x-c.w*0.8,GY-c.h*0.65,c.w*0.8,c.h*0.25)
        ctx.fillRect(c.x+c.w,GY-c.h*0.75,c.w*0.8,c.h*0.25)
      }
      // dino body
      const dx=38,dy=dino.y
      ctx.fillStyle=primary
      ctx.fillRect(dx+2,dy+2,DW-4,DH-6)      // body
      ctx.fillRect(dx+DW-10,dy-8,10,12)       // head
      ctx.fillStyle="#000"
      ctx.fillRect(dx+DW-5,dy-6,3,3)          // eye
      ctx.fillStyle=primary
      ctx.fillRect(dx+DW-4,dy+2,4,3)          // mouth area
      // tail
      ctx.fillRect(dx-3,dy+4,5,4)
      // legs
      if(dino.y>=GY-DH-2){
        if(dino.leg===0){ctx.fillRect(dx+3,dy+DH-6,5,6);ctx.fillRect(dx+10,dy+DH-10,5,6)}
        else{ctx.fillRect(dx+3,dy+DH-10,5,6);ctx.fillRect(dx+10,dy+DH-6,5,6)}
      } else {
        ctx.fillRect(dx+3,dy+DH-6,5,6);ctx.fillRect(dx+10,dy+DH-6,5,6)
      }
      // score
      ctx.fillStyle=primary;ctx.font="bold 11px monospace";ctx.textAlign="right";ctx.textBaseline="top"
      ctx.fillText(String(score),W-6,5)
      raf=requestAnimationFrame(loop)
    }
    raf=requestAnimationFrame(loop); return()=>cancelAnimationFrame(raf)
  },[primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full"/>
}
