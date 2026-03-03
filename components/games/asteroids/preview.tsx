"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

export function AsteroidsPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const TAU = Math.PI * 2

    // ship
    const ship = { x: W/2, y: H/2, angle: -Math.PI/2, vx: 0, vy: 0 }
    // asteroids
    type Rock = {x:number;y:number;vx:number;vy:number;r:number;pts:number[]}
    const mkRock=(x:number,y:number,r:number):Rock=>{
      const pts:number[]=[]
      for(let i=0;i<10;i++){const a=i/10*TAU;const rr=r+(Math.random()-0.5)*r*0.5;pts.push(Math.cos(a)*rr,Math.sin(a)*rr)}
      return{x,y,vx:(Math.random()-0.5)*0.8,vy:(Math.random()-0.5)*0.8,r,pts}
    }
    const rocks:Rock[]=[
      mkRock(60,50,22),mkRock(W-70,60,18),mkRock(80,H-60,20),mkRock(W-60,H-70,16),
      mkRock(W/2+80,H/2-60,12),mkRock(W/2-80,H/2+50,10),
    ]
    type Bullet={x:number;y:number;vx:number;vy:number;life:number}
    const bullets:Bullet[]=[]

    let t=0, lastShot=0, raf=0
    // AI: fly toward nearest rock, shoot at it
    const loop=()=>{
      t++
      // find nearest rock
      let nearest=rocks[0]
      let nearestD=Infinity
      for(const r of rocks){const d=Math.hypot(r.x-ship.x,r.y-ship.y);if(d<nearestD){nearestD=d;nearest=r}}
      // steer toward nearest
      const targetAngle=Math.atan2(nearest.y-ship.y,nearest.x-ship.x)
      let da=targetAngle-ship.angle
      while(da>Math.PI)da-=TAU; while(da<-Math.PI)da+=TAU
      ship.angle+=da*0.04
      // thrust if far
      if(nearestD>60){ship.vx+=Math.cos(ship.angle)*0.12;ship.vy+=Math.sin(ship.angle)*0.12}
      ship.vx*=0.97;ship.vy*=0.97
      ship.x=(ship.x+ship.vx+W)%W;ship.y=(ship.y+ship.vy+H)%H
      // shoot
      if(t-lastShot>25){lastShot=t;bullets.push({x:ship.x+Math.cos(ship.angle)*14,y:ship.y+Math.sin(ship.angle)*14,vx:Math.cos(ship.angle)*5,vy:Math.sin(ship.angle)*5,life:40})}
      // move bullets
      for(const b of bullets){b.x=(b.x+b.vx+W)%W;b.y=(b.y+b.vy+H)%H;b.life--}
      // move rocks
      for(const r of rocks){r.x=(r.x+r.vx+W)%W;r.y=(r.y+r.vy+H)%H}
      // hit check
      for(const b of bullets){
        for(const r of rocks){
          if(Math.hypot(b.x-r.x,b.y-r.y)<r.r){
            b.life=0
            r.x=20+Math.random()*(W-40);r.y=20+Math.random()*(H-40)
            r.vx=(Math.random()-0.5)*0.8;r.vy=(Math.random()-0.5)*0.8
          }
        }
      }
      bullets.splice(0,bullets.length,...bullets.filter(b=>b.life>0))

      // draw
      ctx.fillStyle="#000";ctx.fillRect(0,0,W,H)
      for(let i=0;i<30;i++){ctx.fillStyle="#fff3";ctx.fillRect((i*79+3)%W,(i*113+7)%H,1,1)}
      // rocks
      ctx.strokeStyle="#888";ctx.lineWidth=1.5
      for(const r of rocks){
        ctx.save();ctx.translate(r.x,r.y);ctx.beginPath()
        for(let i=0;i<r.pts.length;i+=2) i===0?ctx.moveTo(r.pts[i],r.pts[i+1]):ctx.lineTo(r.pts[i],r.pts[i+1])
        ctx.closePath();ctx.stroke();ctx.restore()
      }
      // bullets
      ctx.fillStyle=primary
      for(const b of bullets){ctx.beginPath();ctx.arc(b.x,b.y,2,0,TAU);ctx.fill()}
      // ship
      ctx.save();ctx.translate(ship.x,ship.y);ctx.rotate(ship.angle)
      ctx.strokeStyle=primary;ctx.lineWidth=2;ctx.beginPath()
      ctx.moveTo(13,0);ctx.lineTo(-8,7);ctx.lineTo(-5,0);ctx.lineTo(-8,-7);ctx.closePath();ctx.stroke()
      // thrust flame
      ctx.strokeStyle="#f97316";ctx.lineWidth=1.5;ctx.beginPath()
      ctx.moveTo(-5,0);ctx.lineTo(-13,0);ctx.stroke()
      ctx.restore()
      raf=requestAnimationFrame(loop)
    }
    raf=requestAnimationFrame(loop); return()=>cancelAnimationFrame(raf)
  },[primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full"/>
}
