"use client"
import { useEffect, useRef, useCallback, useState } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const W = 480, H = 480
const TAU = Math.PI * 2

interface Vec { x: number; y: number }
interface Asteroid { x:number;y:number;vx:number;vy:number;r:number;pts:number[] }
interface Bullet  { x:number;y:number;vx:number;vy:number;life:number }

function mkAsteroid(x:number,y:number,size:number): Asteroid {
  const angle=Math.random()*TAU, spd=(4-size)*0.8+0.4
  const nPts=8+Math.floor(Math.random()*5)
  const pts=Array.from({length:nPts},(_,i)=>{
    const a=i/nPts*TAU,r2=size*14+(Math.random()-0.5)*size*7
    return [Math.cos(a)*r2, Math.sin(a)*r2]
  }).flat()
  return {x,y,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd,r:size*14,pts}
}

export function AsteroidsGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = useRef({
    ship:{x:W/2,y:H/2,angle:-Math.PI/2,vx:0,vy:0,alive:true},
    asteroids:[] as Asteroid[], bullets:[] as Bullet[],
    score:0, lives:3, level:1, hs:0, started:false,
    keys:new Set<string>(), lastT:0, raf:0, invincible:0,
  })
  const [display, setDisplay] = useState({score:0,lives:3,hs:0,over:false,started:false})

  const spawn = useCallback((lvl:number) => {
    const s = state.current
    s.asteroids = Array.from({length:3+lvl},(_,i)=>{
      let x,y; do{x=Math.random()*W;y=Math.random()*H}while(Math.hypot(x-W/2,y-H/2)<100)
      return mkAsteroid(x,y,3)
    })
  },[])

  const reset = useCallback(() => {
    const s = state.current
    s.ship={x:W/2,y:H/2,angle:-Math.PI/2,vx:0,vy:0,alive:true}
    s.bullets=[]; s.score=0; s.lives=3; s.level=1; s.invincible=120; s.started=false
    s.hs=loadHS()["asteroids"]??0
    spawn(1)
    setDisplay({score:0,lives:3,hs:s.hs,over:false,started:false})
  },[spawn])

  useEffect(()=>{
    reset()
    const canvas=canvasRef.current!; const ctx=canvas.getContext("2d")!

    const loop=(t:number)=>{
      const dt=Math.min((t-state.current.lastT)/16.67,3); state.current.lastT=t
      const s=state.current; const keys=s.keys

      if(s.started && s.ship.alive){
        if(keys.has("ArrowLeft")||keys.has("a")||keys.has("A")) s.ship.angle-=0.045*dt
        if(keys.has("ArrowRight")||keys.has("d")||keys.has("D")) s.ship.angle+=0.045*dt
        if(keys.has("ArrowUp")||keys.has("w")||keys.has("W")){
          s.ship.vx+=Math.cos(s.ship.angle)*0.18*dt
          s.ship.vy+=Math.sin(s.ship.angle)*0.18*dt
        }
        const maxSpd=5; const spd=Math.hypot(s.ship.vx,s.ship.vy)
        if(spd>maxSpd){s.ship.vx=s.ship.vx/spd*maxSpd;s.ship.vy=s.ship.vy/spd*maxSpd}
        s.ship.vx*=0.992; s.ship.vy*=0.992
        s.ship.x=(s.ship.x+s.ship.vx*dt+W)%W; s.ship.y=(s.ship.y+s.ship.vy*dt+H)%H
        if(s.invincible>0) s.invincible-=dt
      }

      s.bullets=s.bullets.filter(b=>b.life>0).map(b=>({...b,x:(b.x+b.vx*dt+W)%W,y:(b.y+b.vy*dt+H)%H,life:b.life-dt}))

      for(const a of s.asteroids){
        a.x=(a.x+a.vx*dt+W)%W; a.y=(a.y+a.vy*dt+H)%H
      }

      // bullet-asteroid collisions
      const toRemove=new Set<Asteroid>(); const toRemoveBullet=new Set<Bullet>()
      for(const b of s.bullets) for(const a of s.asteroids){
        if(Math.hypot(b.x-a.x,b.y-a.y)<a.r && !toRemove.has(a)){
          toRemove.add(a); toRemoveBullet.add(b)
          const pts=a.r>20?250:a.r>10?100:50
          s.score+=pts
          if(a.r>10){
            s.asteroids.push(mkAsteroid(a.x,a.y,Math.round(a.r/14)-1))
            s.asteroids.push(mkAsteroid(a.x,a.y,Math.round(a.r/14)-1))
          }
        }
      }
      s.asteroids=s.asteroids.filter(a=>!toRemove.has(a))
      s.bullets=s.bullets.filter(b=>!toRemoveBullet.has(b))

      // ship-asteroid collision
      if(s.ship.alive&&s.invincible<=0){
        for(const a of s.asteroids){
          if(Math.hypot(s.ship.x-a.x,s.ship.y-a.y)<a.r+8){
            s.lives--; s.invincible=150
            if(s.lives<=0){
              s.ship.alive=false; saveHS("asteroids",s.score)
              s.hs=Math.max(s.hs,s.score)
              setDisplay({score:s.score,lives:0,hs:s.hs,over:true,started:true})
            } else {
              s.ship={x:W/2,y:H/2,angle:-Math.PI/2,vx:0,vy:0,alive:true}
              setDisplay(d=>({...d,lives:s.lives}))
            }
            break
          }
        }
      }

      if(s.asteroids.length===0 && s.started){
        s.level++; s.invincible=120; spawn(s.level)
      }

      // draw
      ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H)
      // stars
      ctx.fillStyle="#ffffff22"
      for(let i=0;i<40;i++){const sx=(i*73+137)%W,sy=(i*91+17)%H;ctx.fillRect(sx,sy,1,1)}

      // asteroids
      ctx.strokeStyle="#aaa"; ctx.lineWidth=1.5
      for(const a of s.asteroids){
        ctx.save(); ctx.translate(a.x,a.y); ctx.beginPath()
        for(let i=0;i<a.pts.length;i+=2){
          i===0?ctx.moveTo(a.pts[i],a.pts[i+1]):ctx.lineTo(a.pts[i],a.pts[i+1])
        }
        ctx.closePath(); ctx.stroke(); ctx.restore()
      }

      // bullets
      ctx.fillStyle=primary
      for(const b of s.bullets){ctx.beginPath();ctx.arc(b.x,b.y,2,0,TAU);ctx.fill()}

      // ship
      if(s.ship.alive&&(s.invincible<=0||Math.floor(s.invincible/8)%2===0)){
        ctx.save(); ctx.translate(s.ship.x,s.ship.y); ctx.rotate(s.ship.angle)
        ctx.strokeStyle=primary; ctx.lineWidth=2; ctx.beginPath()
        ctx.moveTo(14,0); ctx.lineTo(-8,8); ctx.lineTo(-5,0); ctx.lineTo(-8,-8); ctx.closePath()
        ctx.stroke()
        if(s.keys.has("ArrowUp")||s.keys.has("w")||s.keys.has("W")){
          ctx.strokeStyle="#f97316"; ctx.beginPath(); ctx.moveTo(-5,0); ctx.lineTo(-14+Math.random()*4,0); ctx.stroke()
        }
        ctx.restore()
      }

      // HUD
      ctx.fillStyle=primary; ctx.font="bold 14px monospace"; ctx.textAlign="left"
      ctx.fillText(`${s.score}`,10,22)
      ctx.textAlign="right"; ctx.fillText(`lvl ${s.level}`,W-10,22)
      for(let i=0;i<s.lives;i++){
        ctx.save(); ctx.translate(10+i*20,H-14); ctx.rotate(-Math.PI/2)
        ctx.strokeStyle=primary; ctx.lineWidth=1.5; ctx.beginPath()
        ctx.moveTo(7,0); ctx.lineTo(-4,4); ctx.lineTo(-3,0); ctx.lineTo(-4,-4); ctx.closePath(); ctx.stroke()
        ctx.restore()
      }

      if(!s.started){
        ctx.fillStyle="rgba(0,0,0,0.6)"; ctx.fillRect(0,0,W,H)
        ctx.fillStyle=primary; ctx.font="bold 28px monospace"; ctx.textAlign="center"
        ctx.fillText("ASTEROIDS",W/2,H/2-30)
        ctx.fillStyle="#aaa"; ctx.font="14px monospace"
        ctx.fillText("↑ thrust  ← → rotate  space shoot",W/2,H/2+10)
        ctx.fillText("press any key to start",W/2,H/2+40)
        if(s.hs>0){ctx.fillStyle=primary+"aa";ctx.fillText(`best: ${s.hs}`,W/2,H/2+70)}
      }

      if(s.started && !s.ship.alive){
        ctx.fillStyle="rgba(0,0,0,0.75)"; ctx.fillRect(0,0,W,H)
        ctx.fillStyle="#ef4444"; ctx.font="bold 32px monospace"; ctx.textAlign="center"
        ctx.fillText("GAME OVER",W/2,H/2-30)
        ctx.fillStyle=primary; ctx.font="bold 18px monospace"
        ctx.fillText(`Score: ${s.score}`,W/2,H/2+10)
        if(s.hs>0){ctx.fillStyle="#aaa";ctx.font="14px monospace";ctx.fillText(`Best: ${s.hs}`,W/2,H/2+38)}
        ctx.fillStyle="#888";ctx.font="13px monospace"
        ctx.fillText("press R to restart",W/2,H/2+66)
      }

      setDisplay(d=>d.score!==s.score?{...d,score:s.score}:d)
      s.raf=requestAnimationFrame(loop)
    }
    state.current.raf=requestAnimationFrame(loop)
    return ()=>cancelAnimationFrame(state.current.raf)
  },[primary,reset,spawn])

  useEffect(()=>{
    const s=state.current
    let shootCooldown=0
    const onDown=(e:KeyboardEvent)=>{
      s.keys.add(e.key)
      if(!s.started && s.ship.alive){s.started=true;setDisplay(d=>({...d,started:true}))}
      if(e.key===" "){
        e.preventDefault()
        if(shootCooldown<=0&&s.ship.alive){
          s.bullets.push({x:s.ship.x+Math.cos(s.ship.angle)*16,y:s.ship.y+Math.sin(s.ship.angle)*16,vx:Math.cos(s.ship.angle)*8,vy:Math.sin(s.ship.angle)*8,life:60})
          shootCooldown=12
        }
      }
      if(e.key==="r"||e.key==="R") reset()
    }
    const onUp=(e:KeyboardEvent)=>s.keys.delete(e.key)
    const interval=setInterval(()=>{if(shootCooldown>0)shootCooldown--},16)
    window.addEventListener("keydown",onDown); window.addEventListener("keyup",onUp)
    return ()=>{window.removeEventListener("keydown",onDown);window.removeEventListener("keyup",onUp);clearInterval(interval)}
  },[reset])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full items-center justify-between" style={{maxWidth:W}}>
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5"/> back
        </button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-primary">{"★".repeat(display.lives)}</span>
          <span className="text-muted-foreground">{display.score}</span>
          {display.hs>0&&<span className="text-muted-foreground">best:{display.hs}</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3 w-3"/></button>
        </div>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-primary/20 touch-none" style={{maxWidth:"100%",height:"auto"}}/>
      {/* Mobile controls */}
      <div className="flex items-center gap-4 md:hidden">
        {[
          {label:"←",key:"ArrowLeft"},{label:"↑",key:"ArrowUp"},{label:"→",key:"ArrowRight"},
          {label:"fire",key:" "},
        ].map(({label,key})=>(
          <button key={label}
            onTouchStart={e=>{e.preventDefault();state.current.keys.add(key);if(!state.current.started){state.current.started=true;setDisplay(d=>({...d,started:true}))}}}
            onTouchEnd={e=>{e.preventDefault();state.current.keys.delete(key)}}
            className="h-14 w-14 rounded-xl border border-primary/30 bg-primary/10 font-bold text-primary text-sm touch-none select-none">
            {label}
          </button>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground hidden md:block">↑ thrust · ← → rotate · space shoot · R reset</p>
    </div>
  )
}

