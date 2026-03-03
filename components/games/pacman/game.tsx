"use client"
import { useEffect, useRef, useCallback, useState } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const CW=18,COLS=19,ROWS=21,W=COLS*CW,H=ROWS*CW
// 0=path, 1=wall, 2=dot, 3=power
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
    score:0,lives:3,hs:0,started:false,raf:0,keys:new Set<string>(),totalDots:0,lastTime:0,
  })
  const [disp,setDisp]=useState({score:0,lives:3,hs:0,over:false,win:false})

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
    g.totalDots=g.map.flat().filter(v=>v===2||v===3).length
    setDisp({score:0,lives:3,hs:g.hs,over:false,win:false})
  },[])

  useEffect(()=>{
    reset()
    const canvas=canvasRef.current!;const ctx=canvas.getContext("2d")!

    const canMove=(x:number,y:number,dx:number,dy:number,spd=1.2)=>{
      const hw=CW*0.38
      const nx=x+dx*spd,ny=y+dy*spd
      const corners=[[ny-hw,nx-hw],[ny-hw,nx+hw],[ny+hw,nx-hw],[ny+hw,nx+hw]]
      return corners.every(([cy,cx])=>{
        const r=Math.floor(cy/CW),c=Math.floor(cx/CW)
        return r>=0&&r<ROWS&&c>=0&&c<COLS&&s.current.map[r]?.[c]!==1
      })
    }

    let frame=0
    const loop=(ts:number)=>{
      const g=s.current; frame++
      const dt=g.lastTime===0?1:Math.min((ts-g.lastTime)/16.67,3)
      g.lastTime=ts
      if(g.started&&g.lives>0){
        const PAC_SPD=1.2*dt, GHOST_SPD=(g.ghosts[0]?.scared>0?0.7:0.9)*dt
        // pac movement
        const p=g.pac
        if((g.keys.has("ArrowLeft")||g.keys.has("a"))) p.nextDir={x:-1,y:0}
        if((g.keys.has("ArrowRight")||g.keys.has("d"))) p.nextDir={x:1,y:0}
        if((g.keys.has("ArrowUp")||g.keys.has("w"))) p.nextDir={x:0,y:-1}
        if((g.keys.has("ArrowDown")||g.keys.has("s"))) p.nextDir={x:0,y:1}
        if(canMove(p.x,p.y,p.nextDir.x,p.nextDir.y,PAC_SPD)) p.dir={...p.nextDir}
        if(canMove(p.x,p.y,p.dir.x,p.dir.y,PAC_SPD)){p.x+=p.dir.x*PAC_SPD;p.y+=p.dir.y*PAC_SPD}
        p.x=((p.x%(W))+W)%W; p.y=((p.y%(H))+H)%H
        p.mouth+=p.mouthOpen?4*dt:-4*dt; if(p.mouth>=40||p.mouth<=0) p.mouthOpen=!p.mouthOpen

        // eat dots
        const pr=Math.floor(p.y/CW),pc=Math.floor(p.x/CW)
        if(g.map[pr]?.[pc]===2){g.map[pr][pc]=0;g.score+=10;setDisp(d=>({...d,score:g.score}))}
        if(g.map[pr]?.[pc]===3){g.map[pr][pc]=0;g.score+=50;g.ghosts.forEach(gh=>gh.scared=300);setDisp(d=>({...d,score:g.score}))}
        if(!g.map.flat().some(v=>v===2||v===3)){setDisp(d=>({...d,win:true}));saveHS("pacman",g.score);g.hs=Math.max(g.hs,g.score);g.lives=0;return}

        // ghosts - only decide new direction at cell centers (grid-snapped intersections)
        for(const gh of g.ghosts){
          if(gh.scared>0) gh.scared-=dt
          const atCenter=(Math.abs(gh.x%(CW)-CW/2)<1.5)&&(Math.abs(gh.y%(CW)-CW/2)<1.5)
          if(atCenter||!canMove(gh.x,gh.y,gh.dir.x,gh.dir.y,GHOST_SPD)){
            const options=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]
            const valid=options.filter(d=>!(d.x===-gh.dir.x&&d.y===-gh.dir.y)).filter(d=>canMove(gh.x,gh.y,d.x,d.y,GHOST_SPD))
            const fallback=options.filter(d=>canMove(gh.x,gh.y,d.x,d.y,GHOST_SPD))
            const choices=valid.length?valid:fallback
            if(choices.length){
              if(gh.scared>0){
                gh.dir=choices[Math.floor(Math.random()*choices.length)]
              } else {
                // 75% chase, 25% random — to keep it beatable
                if(Math.random()<0.75){
                  gh.dir=choices.sort((a,b)=>Math.hypot(gh.x+a.x*CW-p.x,gh.y+a.y*CW-p.y)-Math.hypot(gh.x+b.x*CW-p.x,gh.y+b.y*CW-p.y))[0]
                } else {
                  gh.dir=choices[Math.floor(Math.random()*choices.length)]
                }
              }
            }
          }
          if(canMove(gh.x,gh.y,gh.dir.x,gh.dir.y,GHOST_SPD)){gh.x+=gh.dir.x*GHOST_SPD;gh.y+=gh.dir.y*GHOST_SPD}
          // pac collision
          if(Math.hypot(gh.x-p.x,gh.y-p.y)<CW*0.65){
            if(gh.scared>0){gh.scared=0;g.score+=200;gh.x=9*CW+CW/2;gh.y=9*CW+CW/2;setDisp(d=>({...d,score:g.score}))}
            else{g.lives--;setDisp(d=>({...d,lives:g.lives}));p.x=9*CW+CW/2;p.y=16*CW+CW/2;p.dir={x:0,y:0};if(g.lives<=0){saveHS("pacman",g.score);g.hs=Math.max(g.hs,g.score);setDisp(d=>({...d,over:true}));return}}
          }
        }
      }

      ctx.fillStyle="#000";ctx.fillRect(0,0,W,H)
      // map
      for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
        const v=g.map[r][c]
        if(v===1){ctx.fillStyle="#1a3a8f";ctx.fillRect(c*CW,r*CW,CW,CW);ctx.strokeStyle="#3a5abf";ctx.strokeRect(c*CW+0.5,r*CW+0.5,CW-1,CW-1)}
        else if(v===2){ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(c*CW+CW/2,r*CW+CW/2,2,0,Math.PI*2);ctx.fill()}
        else if(v===3){ctx.fillStyle="#fbbf24";ctx.beginPath();ctx.arc(c*CW+CW/2,r*CW+CW/2,5,0,Math.PI*2);ctx.fill()}
      }
      // pac
      const p=g.pac
      const ang=(p.mouth/40)*0.4
      const dir=Math.atan2(p.dir.y,p.dir.x)||0
      ctx.fillStyle=primary;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.arc(p.x,p.y,CW*0.42,dir+ang,dir+Math.PI*2-ang);ctx.closePath();ctx.fill()
      // ghosts
      for(const gh of g.ghosts){
        ctx.fillStyle=gh.scared>0?"#3b82f6":gh.color
        ctx.beginPath();ctx.arc(gh.x,gh.y-2,CW*0.4,Math.PI,0);ctx.lineTo(gh.x+CW*0.4,gh.y+CW*0.4)
        const w=CW*0.8/3
        for(let i=0;i<3;i++){ctx.lineTo(gh.x-CW*0.4+w*(i+1),gh.y+(i%2===0?CW*0.4:CW*0.2))}
        ctx.lineTo(gh.x-CW*0.4,gh.y+CW*0.4);ctx.closePath();ctx.fill()
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(gh.x-4,gh.y-3,3,0,Math.PI*2);ctx.arc(gh.x+4,gh.y-3,3,0,Math.PI*2);ctx.fill()
      }
      // HUD
      ctx.fillStyle=primary;ctx.font="bold 13px monospace";ctx.textAlign="left";ctx.fillText(String(g.score),6,14)
      ctx.textAlign="right";ctx.fillText("♥".repeat(g.lives),W-6,14)

      if(!g.started){
        ctx.fillStyle="rgba(0,0,0,0.6)";ctx.fillRect(0,0,W,H)
        ctx.fillStyle=primary;ctx.font="bold 22px monospace";ctx.textAlign="center"
        ctx.fillText("PAC-MAN",W/2,H/2-20);ctx.fillStyle="#aaa";ctx.font="13px monospace"
        ctx.fillText("arrow keys to start",W/2,H/2+10)
      }

      g.raf=requestAnimationFrame(loop)
    }
    s.current.raf=requestAnimationFrame(loop)
    return()=>cancelAnimationFrame(s.current.raf)
  },[primary,reset])

  useEffect(()=>{
    const g=s.current
    const down=(e:KeyboardEvent)=>{
      g.keys.add(e.key)
      if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){e.preventDefault();if(!g.started)g.started=true}
      if(e.key==="r"||e.key==="R") reset()
    }
    const up=(e:KeyboardEvent)=>g.keys.delete(e.key)
    window.addEventListener("keydown",down);window.addEventListener("keyup",up)
    return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up)}
  },[reset])

  return(
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full items-center justify-between" style={{maxWidth:W}}>
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5"/> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-primary">{"♥".repeat(disp.lives)}</span>
          <span className="text-muted-foreground">{disp.score}</span>
          {disp.hs>0&&<span className="text-muted-foreground">best:{disp.hs}</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3 w-3"/></button>
        </div>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-primary/20" style={{maxWidth:"100%",height:"auto"}}/>
      <div className="grid grid-cols-3 gap-2 md:hidden">
        <div/><button onTouchStart={e=>{e.preventDefault();s.current.keys.add("ArrowUp");s.current.started=true}} onTouchEnd={e=>{e.preventDefault();s.current.keys.delete("ArrowUp")}} className="h-12 w-12 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold touch-none">↑</button><div/>
        <button onTouchStart={e=>{e.preventDefault();s.current.keys.add("ArrowLeft");s.current.started=true}} onTouchEnd={e=>{e.preventDefault();s.current.keys.delete("ArrowLeft")}} className="h-12 w-12 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold touch-none">←</button>
        <button onTouchStart={e=>{e.preventDefault();s.current.keys.add("ArrowDown");s.current.started=true}} onTouchEnd={e=>{e.preventDefault();s.current.keys.delete("ArrowDown")}} className="h-12 w-12 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold touch-none">↓</button>
        <button onTouchStart={e=>{e.preventDefault();s.current.keys.add("ArrowRight");s.current.started=true}} onTouchEnd={e=>{e.preventDefault();s.current.keys.delete("ArrowRight")}} className="h-12 w-12 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold touch-none">→</button>
      </div>
      {(disp.over||disp.win)&&<div className="text-center"><p className="font-mono font-bold text-2xl" style={{color:disp.win?"#fbbf24":"#ef4444"}}>{disp.win?"🎉 You Win!":"Game Over"}</p><button onClick={reset} className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">play again</button></div>}
      <p className="font-mono text-xs text-muted-foreground hidden md:block">arrow keys / WASD · eat all dots</p>
    </div>
  )
}

