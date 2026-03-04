"use client"
import { useEffect, useRef, useCallback, useState } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const CW=18,COLS=19,ROWS=21,W=COLS*CW,H=ROWS*CW
const MAP_TEMPLATE=[
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]
const GHOST_COLORS=["#ef4444","#f9a8d4","#22d3ee","#fb923c"]

export function PacmanGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const s=useRef({
    map:MAP_TEMPLATE.map(r=>[...r]),
    pac:{x:9*CW+CW/2,y:16*CW+CW/2,dir:{x:0,y:0},nextDir:{x:0,y:0},mouth:0,mouthOpen:true},
    ghosts:[
      {x:9*CW+CW/2,y:9*CW+CW/2,dir:{x:1,y:0},scared:0,color:GHOST_COLORS[0]},
      {x:9*CW+CW/2,y:10*CW+CW/2,dir:{x:-1,y:0},scared:0,color:GHOST_COLORS[1]},
      {x:8*CW+CW/2,y:9*CW+CW/2,dir:{x:0,y:1},scared:0,color:GHOST_COLORS[2]},
      {x:10*CW+CW/2,y:9*CW+CW/2,dir:{x:0,y:-1},scared:0,color:GHOST_COLORS[3]},
    ],
    score:0,lives:3,hs:0,started:false,raf:0,
    keys:new Set<string>(),lastTime:0,
    state:"idle" as "idle"|"playing"|"dead"|"win",
    deathTimer:0,
  })
  const [disp,setDisp]=useState({score:0,lives:3,hs:0,state:"idle" as "idle"|"playing"|"dead"|"win"})

  const reset=useCallback(()=>{
    const g=s.current
    g.map=MAP_TEMPLATE.map(r=>[...r])
    g.pac={x:9*CW+CW/2,y:16*CW+CW/2,dir:{x:0,y:0},nextDir:{x:0,y:0},mouth:0,mouthOpen:true}
    g.ghosts=[
      {x:9*CW+CW/2,y:9*CW+CW/2,dir:{x:1,y:0},scared:0,color:GHOST_COLORS[0]},
      {x:9*CW+CW/2,y:10*CW+CW/2,dir:{x:-1,y:0},scared:0,color:GHOST_COLORS[1]},
      {x:8*CW+CW/2,y:9*CW+CW/2,dir:{x:0,y:1},scared:0,color:GHOST_COLORS[2]},
      {x:10*CW+CW/2,y:9*CW+CW/2,dir:{x:0,y:-1},scared:0,color:GHOST_COLORS[3]},
    ]
    g.score=0;g.lives=3;g.started=false;g.hs=loadHS()["pacman"]??0;g.lastTime=0
    g.state="idle";g.deathTimer=0
    setDisp({score:0,lives:3,hs:g.hs,state:"idle"})
  },[])

  useEffect(()=>{
    reset()
    const canvas=canvasRef.current!;const ctx=canvas.getContext("2d")!

    const canMove=(x:number,y:number,dx:number,dy:number,spd=1.2)=>{
      const hw=CW*0.38
      const nx=x+dx*spd,ny=y+dy*spd
      return [[ny-hw,nx-hw],[ny-hw,nx+hw],[ny+hw,nx-hw],[ny+hw,nx+hw]].every(([cy,cx])=>{
        const r=Math.floor(cy/CW),c=Math.floor(cx/CW)
        return r>=0&&r<ROWS&&c>=0&&c<COLS&&s.current.map[r]?.[c]!==1
      })
    }

    let frame=0
    const loop=(ts:number)=>{
      const g=s.current; frame++
      const dt=g.lastTime===0?1:Math.min((ts-g.lastTime)/16.67,3)
      g.lastTime=ts

      if(g.state==="playing"){
        const PAC_SPD=1.2*dt
        const GHOST_SPD=(g.ghosts[0]?.scared>0?0.7:0.95)*dt
        const p=g.pac
        // Apply next dir if valid
        if(canMove(p.x,p.y,p.nextDir.x,p.nextDir.y,PAC_SPD)) p.dir={...p.nextDir}
        if(canMove(p.x,p.y,p.dir.x,p.dir.y,PAC_SPD)){p.x+=p.dir.x*PAC_SPD;p.y+=p.dir.y*PAC_SPD}
        p.x=((p.x%W)+W)%W; p.y=((p.y%H)+H)%H
        p.mouth+=p.mouthOpen?4*dt:-4*dt; if(p.mouth>=40||p.mouth<=0)p.mouthOpen=!p.mouthOpen

        // Eat dots
        const pr=Math.floor(p.y/CW),pc=Math.floor(p.x/CW)
        if(g.map[pr]?.[pc]===2){g.map[pr][pc]=0;g.score+=10;setDisp(d=>({...d,score:g.score}))}
        if(g.map[pr]?.[pc]===3){
          g.map[pr][pc]=0;g.score+=50
          g.ghosts.forEach(gh=>gh.scared=300)
          setDisp(d=>({...d,score:g.score}))
        }

        // Win check
        if(!g.map.flat().some(v=>v===2||v===3)){
          saveHS("pacman",g.score);g.hs=Math.max(g.hs,g.score)
          g.state="win"
          setDisp(d=>({...d,state:"win",score:g.score,hs:g.hs}))
        }

        // Ghost AI
        for(const gh of g.ghosts){
          if(gh.scared>0)gh.scared-=dt
          const atCenter=(Math.abs(gh.x%CW-CW/2)<1.5)&&(Math.abs(gh.y%CW-CW/2)<1.5)
          if(atCenter||!canMove(gh.x,gh.y,gh.dir.x,gh.dir.y,GHOST_SPD)){
            const opts=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]
            const valid=opts.filter(d=>!(d.x===-gh.dir.x&&d.y===-gh.dir.y)&&canMove(gh.x,gh.y,d.x,d.y,GHOST_SPD))
            const fallback=opts.filter(d=>canMove(gh.x,gh.y,d.x,d.y,GHOST_SPD))
            const choices=valid.length?valid:fallback
            if(choices.length){
              if(gh.scared>0){
                gh.dir=choices[Math.floor(Math.random()*choices.length)]
              } else {
                gh.dir=Math.random()<0.75
                  ? choices.sort((a,b)=>Math.hypot(gh.x+a.x*CW-p.x,gh.y+a.y*CW-p.y)-Math.hypot(gh.x+b.x*CW-p.x,gh.y+b.y*CW-p.y))[0]
                  : choices[Math.floor(Math.random()*choices.length)]
              }
            }
          }
          if(canMove(gh.x,gh.y,gh.dir.x,gh.dir.y,GHOST_SPD)){gh.x+=gh.dir.x*GHOST_SPD;gh.y+=gh.dir.y*GHOST_SPD}

          // Collision
          if(Math.hypot(gh.x-p.x,gh.y-p.y)<CW*0.62){
            if(gh.scared>0){
              gh.scared=0;g.score+=200
              gh.x=9*CW+CW/2;gh.y=9*CW+CW/2
              setDisp(d=>({...d,score:g.score}))
            } else {
              g.lives--
              if(g.lives<=0){
                saveHS("pacman",g.score);g.hs=Math.max(g.hs,g.score)
                g.state="dead"
                setDisp(d=>({...d,lives:0,state:"dead",score:g.score,hs:g.hs}))
              } else {
                p.x=9*CW+CW/2;p.y=16*CW+CW/2;p.dir={x:0,y:0};p.nextDir={x:0,y:0}
                setDisp(d=>({...d,lives:g.lives}))
              }
            }
          }
        }
      }

      // ── Draw ──
      ctx.fillStyle="#000";ctx.fillRect(0,0,W,H)

      // Map
      for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
        const x=c*CW,y=r*CW,v=g.map[r][c]
        if(v===1){
          ctx.fillStyle="#1a3a8f";ctx.fillRect(x,y,CW,CW)
          ctx.strokeStyle="#2a4fcf";ctx.lineWidth=0.5;ctx.strokeRect(x+0.5,y+0.5,CW-1,CW-1)
        } else if(v===2){
          ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x+CW/2,y+CW/2,2,0,Math.PI*2);ctx.fill()
        } else if(v===3){
          const pulse=0.85+0.15*Math.sin(ts/300)
          ctx.fillStyle="#fbbf24";ctx.beginPath();ctx.arc(x+CW/2,y+CW/2,5*pulse,0,Math.PI*2);ctx.fill()
        }
      }

      // Pac-Man
      const p=g.pac
      const ang=(p.mouth/40)*0.42
      const dir=Math.atan2(p.dir.y,p.dir.x)||0
      ctx.fillStyle=primary
      ctx.beginPath();ctx.moveTo(p.x,p.y)
      ctx.arc(p.x,p.y,CW*0.42,dir+ang,dir+Math.PI*2-ang);ctx.closePath();ctx.fill()
      // Eye
      const eyeX=p.x+Math.cos(dir-Math.PI/4)*CW*0.25
      const eyeY=p.y+Math.sin(dir-Math.PI/4)*CW*0.25
      ctx.fillStyle="#000";ctx.beginPath();ctx.arc(eyeX,eyeY,1.8,0,Math.PI*2);ctx.fill()

      // Ghosts
      for(const gh of g.ghosts){
        const isScared=gh.scared>0
        const isFlashing=gh.scared>0&&gh.scared<60
        const bodyColor=isScared?(isFlashing&&Math.floor(frame/10)%2===0?"#fff":"#3b82f6"):gh.color
        ctx.fillStyle=bodyColor
        ctx.beginPath();ctx.arc(gh.x,gh.y-2,CW*0.4,Math.PI,0)
        ctx.lineTo(gh.x+CW*0.4,gh.y+CW*0.4)
        const w=CW*0.8/3
        for(let i=0;i<3;i++)ctx.lineTo(gh.x-CW*0.4+w*(i+1),gh.y+(i%2===0?CW*0.4:CW*0.18))
        ctx.lineTo(gh.x-CW*0.4,gh.y+CW*0.4);ctx.closePath();ctx.fill()
        // Eyes
        if(!isScared){
          ctx.fillStyle="#fff"
          ctx.beginPath();ctx.arc(gh.x-4,gh.y-3,3,0,Math.PI*2);ctx.fill()
          ctx.beginPath();ctx.arc(gh.x+4,gh.y-3,3,0,Math.PI*2);ctx.fill()
          ctx.fillStyle="#1e40af"
          ctx.beginPath();ctx.arc(gh.x-3.5+gh.dir.x*1.5,gh.y-2.5+gh.dir.y*1.5,1.5,0,Math.PI*2);ctx.fill()
          ctx.beginPath();ctx.arc(gh.x+4.5+gh.dir.x*1.5,gh.y-2.5+gh.dir.y*1.5,1.5,0,Math.PI*2);ctx.fill()
        } else {
          // Scared face (wavy mouth)
          ctx.fillStyle="#fff2";ctx.beginPath();ctx.arc(gh.x-4,gh.y-3,2,0,Math.PI*2);ctx.fill()
          ctx.beginPath();ctx.arc(gh.x+4,gh.y-3,2,0,Math.PI*2);ctx.fill()
        }
      }

      // HUD
      ctx.fillStyle=primary;ctx.font="bold 13px monospace";ctx.textAlign="left";ctx.textBaseline="alphabetic"
      ctx.fillText(String(g.score),6,H-6)
      ctx.textAlign="right";ctx.fillText("♥".repeat(Math.max(0,g.lives)),W-6,H-6)

      // Overlays
      if(g.state==="idle"){
        ctx.fillStyle="rgba(0,0,0,0.62)";ctx.fillRect(0,0,W,H)
        ctx.textBaseline="middle"
        ctx.fillStyle=primary;ctx.font="bold 22px monospace";ctx.textAlign="center"
        ctx.fillText("PAC-MAN",W/2,H/2-18)
        ctx.fillStyle="#aaa";ctx.font="13px monospace"
        ctx.fillText("arrow keys / WASD to start",W/2,H/2+10)
        if(g.hs>0){ctx.fillStyle="#fbbf24";ctx.font="bold 11px monospace";ctx.fillText(`best: ${g.hs}`,W/2,H/2+34)}
      }
      if(g.state==="dead"){
        ctx.fillStyle="rgba(0,0,0,0.75)";ctx.fillRect(0,0,W,H)
        ctx.textBaseline="middle"
        ctx.fillStyle="#ef4444";ctx.font="bold 28px monospace";ctx.textAlign="center"
        ctx.fillText("GAME OVER",W/2,H/2-24)
        ctx.fillStyle="#fff";ctx.font="bold 18px monospace"
        ctx.fillText(`score: ${g.score}`,W/2,H/2+6)
        if(g.hs>0){ctx.fillStyle="#fbbf24";ctx.font="12px monospace";ctx.fillText(`best: ${g.hs}`,W/2,H/2+28)}
        ctx.fillStyle="#666";ctx.font="12px monospace";ctx.fillText("press R to restart",W/2,H/2+52)
      }
      if(g.state==="win"){
        ctx.fillStyle="rgba(0,0,0,0.75)";ctx.fillRect(0,0,W,H)
        ctx.textBaseline="middle"
        ctx.fillStyle="#fbbf24";ctx.font="bold 28px monospace";ctx.textAlign="center"
        ctx.fillText("YOU WIN!",W/2,H/2-24)
        ctx.fillStyle="#fff";ctx.font="bold 18px monospace"
        ctx.fillText(`score: ${g.score}`,W/2,H/2+6)
        if(g.hs>0){ctx.fillStyle="#fbbf24";ctx.font="12px monospace";ctx.fillText(`best: ${g.hs}`,W/2,H/2+28)}
        ctx.fillStyle="#666";ctx.font="12px monospace";ctx.fillText("press R to play again",W/2,H/2+52)
      }

      g.raf=requestAnimationFrame(loop)
    }
    s.current.raf=requestAnimationFrame(loop)
    return()=>cancelAnimationFrame(s.current.raf)
  },[primary,reset])

  useEffect(()=>{
    const g=s.current
    const down=(e:KeyboardEvent)=>{
      const dirs:Record<string,{x:number;y:number}>={
        ArrowLeft:{x:-1,y:0},a:{x:-1,y:0},A:{x:-1,y:0},
        ArrowRight:{x:1,y:0},d:{x:1,y:0},D:{x:1,y:0},
        ArrowUp:{x:0,y:-1},w:{x:0,y:-1},W:{x:0,y:-1},
        ArrowDown:{x:0,y:1},s:{x:0,y:1},S:{x:0,y:1},
      }
      g.keys.add(e.key)
      if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key))e.preventDefault()
      if(e.key==="r"||e.key==="R"){reset();return}
      if(dirs[e.key]){
        g.pac.nextDir=dirs[e.key]
        if(g.state==="idle"){g.state="playing";g.started=true;setDisp(d=>({...d,state:"playing"}))}
      }
    }
    const up=(e:KeyboardEvent)=>g.keys.delete(e.key)
    window.addEventListener("keydown",down);window.addEventListener("keyup",up)
    return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up)}
  },[reset])

  const setDir=(dir:{x:number;y:number})=>{
    const g=s.current
    g.pac.nextDir=dir
    if(g.state==="idle"){g.state="playing";g.started=true;setDisp(d=>({...d,state:"playing"}))}
  }

  return(
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full items-center justify-between" style={{maxWidth:W}}>
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5"/> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-primary">{"♥".repeat(Math.max(0,disp.lives))}</span>
          <span className="text-muted-foreground">{disp.score}</span>
          {disp.hs>0&&<span className="text-muted-foreground">best:{disp.hs}</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3 w-3"/></button>
        </div>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-primary/20" style={{maxWidth:"100%",height:"auto"}}/>
      <div className="grid grid-cols-3 gap-2 md:hidden w-40">
        <div/>
        <button onTouchStart={e=>{e.preventDefault();setDir({x:0,y:-1})}} onClick={()=>setDir({x:0,y:-1})} className="h-12 w-12 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold touch-none">↑</button>
        <div/>
        <button onTouchStart={e=>{e.preventDefault();setDir({x:-1,y:0})}} onClick={()=>setDir({x:-1,y:0})} className="h-12 w-12 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold touch-none">←</button>
        <button onTouchStart={e=>{e.preventDefault();setDir({x:0,y:1})}} onClick={()=>setDir({x:0,y:1})} className="h-12 w-12 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold touch-none">↓</button>
        <button onTouchStart={e=>{e.preventDefault();setDir({x:1,y:0})}} onClick={()=>setDir({x:1,y:0})} className="h-12 w-12 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold touch-none">→</button>
      </div>
      <p className="font-mono text-xs text-muted-foreground hidden md:block">arrow keys / WASD · eat all dots · R restart</p>
    </div>
  )
}
