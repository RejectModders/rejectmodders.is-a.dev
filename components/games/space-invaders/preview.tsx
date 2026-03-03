"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

export function SpaceInvadersPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height

    const COLS=8, ROWS=3
    type Alien={x:number;y:number;alive:boolean;type:number}
    const aliens:Alien[]=[]
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++)
      aliens.push({x:22+c*28,y:22+r*22,alive:true,type:r})

    const ship={x:W/2,y:H-18}
    type Bullet={x:number;y:number;player:boolean}
    const bullets:Bullet[]=[]

    let dir=1,moveTimer=0,shootTimer=0,alienFrame=0,shipDir=1,raf=0,t=0

    const loop=()=>{
      t++
      // move ship (auto)
      ship.x+=shipDir*1.4
      if(ship.x>W-20||ship.x<20) shipDir*=-1

      // move aliens
      moveTimer++
      if(moveTimer>40){
        moveTimer=0;alienFrame++
        const alive=aliens.filter(a=>a.alive)
        const minX=Math.min(...alive.map(a=>a.x)),maxX=Math.max(...alive.map(a=>a.x))
        if((dir===1&&maxX>W-16)||(dir===-1&&minX<16)){dir*=-1;aliens.forEach(a=>{if(a.alive)a.y+=8})}
        else aliens.forEach(a=>{if(a.alive)a.x+=dir*14})
      }

      // alien shoot
      shootTimer++
      if(shootTimer>35){
        shootTimer=0
        const alive=aliens.filter(a=>a.alive)
        if(alive.length){const a=alive[Math.floor(Math.random()*alive.length)];bullets.push({x:a.x,y:a.y+8,player:false})}
      }

      // player auto-shoot toward nearest alive alien
      if(t%18===0){
        const alive=aliens.filter(a=>a.alive)
        if(alive.length){
          const target=alive.reduce((acc,a)=>Math.abs(a.x-ship.x)<Math.abs(acc.x-ship.x)?a:acc)
          bullets.push({x:ship.x,y:ship.y-10,player:true})
          ship.x+=(target.x-ship.x)*0.05
        }
      }

      // move bullets
      for(const b of bullets){b.y+=b.player?-6:3.5}
      // hits
      for(const b of bullets.filter(b=>b.player)){
        for(const a of aliens.filter(a=>a.alive)){
          if(Math.abs(b.x-a.x)<11&&Math.abs(b.y-a.y)<9){a.alive=false;b.y=-99}
        }
      }
      // respawn dead aliens offscreen after a while
      const alive=aliens.filter(a=>a.alive)
      if(alive.length<4) aliens.forEach(a=>{a.alive=true;a.x=22+((aliens.indexOf(a))%COLS)*28;a.y=22+Math.floor((aliens.indexOf(a))/COLS)*22})
      bullets.splice(0,bullets.length,...bullets.filter(b=>b.y>0&&b.y<H))

      // draw
      ctx.fillStyle="#000";ctx.fillRect(0,0,W,H)
      for(let i=0;i<40;i++){ctx.fillStyle="#fff2";ctx.fillRect((i*53+7)%W,(i*71+13)%H,1,1)}

      const af=alienFrame%2
      const colors=["#ef4444","#f97316",primary]
      for(const a of aliens.filter(a=>a.alive)){
        ctx.fillStyle=colors[a.type]
        if(a.type===0){
          ctx.beginPath();ctx.ellipse(a.x,a.y,8,4,0,0,Math.PI*2);ctx.fill()
          ctx.fillRect(a.x-4,a.y-7,8,5)
        } else if(a.type===1){
          ctx.fillRect(a.x-6,a.y-4,12,8)
          ctx.fillRect(a.x-4+af*3,a.y+4,3,3);ctx.fillRect(a.x+1-af*3,a.y+4,3,3)
          ctx.fillRect(a.x-9+af,a.y-2,3,2);ctx.fillRect(a.x+6-af,a.y-2,3,2)
        } else {
          ctx.fillRect(a.x-4,a.y-5,8,8)
          ctx.fillRect(a.x-7+af,a.y-1,3,4);ctx.fillRect(a.x+4-af,a.y-1,3,4)
        }
      }

      // bullets
      ctx.fillStyle=primary
      bullets.filter(b=>b.player).forEach(b=>{ctx.fillRect(b.x-1.5,b.y-6,3,8)})
      ctx.fillStyle="#f87171"
      bullets.filter(b=>!b.player).forEach(b=>{ctx.fillRect(b.x-1.5,b.y,3,7)})

      // ship
      ctx.fillStyle=primary
      ctx.beginPath();ctx.moveTo(ship.x,ship.y-14);ctx.lineTo(ship.x+14,ship.y+8);ctx.lineTo(ship.x-14,ship.y+8);ctx.closePath();ctx.fill()
      ctx.fillRect(ship.x-4,ship.y-18,8,6)

      // score display
      ctx.fillStyle=primary;ctx.font="bold 10px monospace";ctx.textAlign="left";ctx.textBaseline="top"
      ctx.fillText(`${(COLS*ROWS-aliens.filter(a=>a.alive).length)*10}`,4,4)

      raf=requestAnimationFrame(loop)
    }
    raf=requestAnimationFrame(loop); return()=>cancelAnimationFrame(raf)
  },[primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full"/>
}
