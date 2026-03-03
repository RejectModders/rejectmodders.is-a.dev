"use client"
import { useEffect, useRef, useCallback, useState } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const W=500,H=200,GY=H-40,DINO_W=28,DINO_H=36

export function DinoGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const s = useRef({ y:GY-DINO_H, vy:0, score:0, hs:0, speed:4, alive:true, started:false, raf:0,
    obstacles:[] as {x:number;w:number;h:number}[], frame:0, legPhase:0, dist:0, lastTime:0,
    spawnAccum:0 })
  const [disp, setDisp] = useState({score:0,hs:0,over:false})

  const jump = useCallback(()=>{
    const g=s.current
    if(!g.started){g.started=true}
    if(g.y>=GY-DINO_H-2&&g.alive) g.vy=-9
  },[])

  const reset = useCallback(()=>{
    const g=s.current
    Object.assign(g,{y:GY-DINO_H,vy:0,score:0,speed:4,alive:true,started:false,obstacles:[],frame:0,dist:0,lastTime:0,spawnAccum:0})
    g.hs=loadHS()["dino"]??0
    setDisp({score:0,hs:g.hs,over:false})
  },[])

  useEffect(()=>{
    reset()
    const canvas=canvasRef.current!; const ctx=canvas.getContext("2d")!

    const loop=(ts:number)=>{
      const g=s.current
      const dt = g.lastTime === 0 ? 0 : Math.min((ts - g.lastTime) / 16.67, 3)
      g.lastTime = ts
      g.frame++
      if(g.started&&g.alive&&dt>0){
        g.vy+=0.55*dt; g.y=Math.min(GY-DINO_H,g.y+g.vy*dt)
        g.score+=Math.round(dt); g.dist+=dt; g.speed=4+g.score/400
        g.legPhase=Math.floor(g.score/10)%2
        // spawn obstacles using time accumulator
        const spawnInterval=Math.max(30, 80-g.score/60)
        g.spawnAccum+=dt
        if(g.spawnAccum>=spawnInterval){
          g.spawnAccum=0
          const lastX=g.obstacles.length?g.obstacles[g.obstacles.length-1].x:0
          const minGap=Math.max(70, 160-g.speed*8)
          if(lastX<W-minGap||!g.obstacles.length){
            const h=24+Math.random()*26; g.obstacles.push({x:W+10,w:16,h})
          }
        }
        g.obstacles=g.obstacles.filter(o=>{o.x-=g.speed*dt;return o.x>-30})
        // update score display every ~10 frames to avoid excessive re-renders
        if(g.frame%6===0) setDisp(d=>d.score!==g.score?{...d,score:g.score}:d)
        // collision
        for(const o of g.obstacles){
          if(o.x<40+DINO_W-4&&o.x+o.w>40+4&&GY-o.h<g.y+DINO_H-4&&GY>g.y+4){
            g.alive=false; saveHS("dino",g.score); g.hs=Math.max(g.hs,g.score)
            setDisp({score:g.score,hs:g.hs,over:true}); break
          }
        }
      }

      ctx.fillStyle="#0a0a0a"; ctx.fillRect(0,0,W,H)
      // ground
      ctx.strokeStyle="#333"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,GY); ctx.lineTo(W,GY); ctx.stroke()
      // score
      ctx.fillStyle=primary; ctx.font="bold 13px monospace"; ctx.textAlign="right"
      ctx.fillText(String(g.score),W-10,20)
      // obstacles (cacti)
      ctx.fillStyle="#22c55e"
      for(const o of g.obstacles){
        ctx.fillRect(o.x,GY-o.h,o.w,o.h)
        ctx.fillRect(o.x-8,GY-o.h*0.6,8,o.h*0.3)
        ctx.fillRect(o.x+o.w,GY-o.h*0.7,8,o.h*0.3)
      }
      // dino
      const dx=40,dy=g.y
      ctx.fillStyle=primary
      ctx.fillRect(dx+4,dy,DINO_W-8,DINO_H-8) // body
      ctx.fillRect(dx+DINO_W-12,dy-12,12,14) // head
      ctx.fillStyle="#000"; ctx.fillRect(dx+DINO_W-6,dy-10,4,4) // eye
      ctx.fillStyle=primary
      if(g.alive&&g.y>=GY-DINO_H-2){ // legs
        if(g.legPhase===0){ctx.fillRect(dx+6,dy+DINO_H-8,8,8);ctx.fillRect(dx+16,dy+DINO_H-16,8,8)}
        else{ctx.fillRect(dx+6,dy+DINO_H-16,8,8);ctx.fillRect(dx+16,dy+DINO_H-8,8,8)}
      } else {ctx.fillRect(dx+6,dy+DINO_H-8,8,8);ctx.fillRect(dx+16,dy+DINO_H-8,8,8)}

      if(!g.started){
        ctx.fillStyle="rgba(0,0,0,0.5)"; ctx.fillRect(0,0,W,H)
        ctx.fillStyle=primary; ctx.font="bold 20px monospace"; ctx.textAlign="center"
        ctx.fillText("DINO RUN",W/2,H/2-20)
        ctx.fillStyle="#aaa"; ctx.font="13px monospace"
        ctx.fillText("space / tap to jump",W/2,H/2+10)
        if(g.hs>0){ctx.fillStyle=primary+"aa";ctx.fillText(`best: ${g.hs}`,W/2,H/2+35)}
      }
      if(!g.alive){
        ctx.fillStyle="rgba(0,0,0,0.6)"; ctx.fillRect(0,0,W,H)
        ctx.fillStyle=primary; ctx.font="bold 22px monospace"; ctx.textAlign="center"
        ctx.fillText("GAME OVER",W/2,H/2-20)
        ctx.fillStyle="#aaa"; ctx.font="13px monospace"; ctx.fillText(`score: ${g.score}`,W/2,H/2+8)
        if(g.hs>0){ctx.fillStyle="#fbbf24";ctx.fillText(`best: ${g.hs}`,W/2,H/2+30)}
        ctx.fillStyle="#555"; ctx.fillText("space / tap to retry",W/2,H/2+55)
      }
      g.raf=requestAnimationFrame(loop)
    }
    s.current.raf=requestAnimationFrame(loop)
    return()=>cancelAnimationFrame(s.current.raf)
  },[primary,reset])

  useEffect(()=>{
    const down=(e:KeyboardEvent)=>{
      if(e.key===" "||e.key==="ArrowUp"||e.key==="w"){e.preventDefault();if(!s.current.alive)reset();else jump()}
      if(e.key==="r"||e.key==="R") reset()
    }
    window.addEventListener("keydown",down); return()=>window.removeEventListener("keydown",down)
  },[jump,reset])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full items-center justify-between" style={{maxWidth:W}}>
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5"/> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-primary">score: {disp.score}</span>
          {disp.hs>0&&<span className="text-muted-foreground">best: {disp.hs}</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3 w-3"/></button>
        </div>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-primary/20 touch-none cursor-pointer" style={{maxWidth:"100%",height:"auto"}}
        onClick={()=>{if(!s.current.alive)reset();else jump()}} />
      <p className="font-mono text-xs text-muted-foreground">space / tap to jump · avoid cacti</p>
    </div>
  )
}

