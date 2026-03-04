"use client"
import { useEffect, useRef, useCallback, useState } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const W=400, H=500, COLS=11, ROWS=5

export function SpaceInvadersGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = useRef({
    aliens: [] as {x:number;y:number;alive:boolean;type:number}[],
    playerBullets: [] as {x:number;y:number}[],
    alienBullets:  [] as {x:number;y:number}[],
    ship: {x:W/2, y:H-45}, lives:3, score:0, hs:0,
    dir:1, moveAccum:0, shootAccum:0, started:false, over:false,
    keys:new Set<string>(), raf:0, level:1, alienFrame:0,
    shootCooldown:0, lastTime:0,
  })
  const [disp, setDisp] = useState({score:0,lives:3,hs:0,over:false,win:false})

  const mkAliens = useCallback((lvl:number) => {
    const s=state.current; s.aliens=[]
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++)
      s.aliens.push({x:50+c*28,y:55+r*28,alive:true,type:r<1?0:r<3?1:2})
  },[])

  const reset = useCallback(()=>{
    const s=state.current
    s.ship.x=W/2; s.playerBullets=[]; s.alienBullets=[]
    s.lives=3; s.score=0; s.dir=1; s.moveAccum=0; s.started=false; s.over=false; s.level=1; s.alienFrame=0; s.shootCooldown=0; s.shootAccum=0; s.lastTime=0
    s.hs=loadHS()["space-invaders"]??0
    mkAliens(1); setDisp({score:0,lives:3,hs:s.hs,over:false,win:false})
  },[mkAliens])

  useEffect(()=>{
    reset()
    const canvas=canvasRef.current!; const ctx=canvas.getContext("2d")!

    const loop=(now:number)=>{
      const s=state.current
      const dt = s.lastTime === 0 ? 0 : Math.min((now - s.lastTime) / 1000, 0.05)
      s.lastTime = now
      // speed scales with level and remaining aliens
      const alive=s.aliens.filter(a=>a.alive)
      const moveIntervalMs=Math.max(80, 500 - (s.level-1)*60 - (COLS*ROWS - alive.length)*3)

      if(s.started && !s.over && dt > 0){
        // ship movement - px/s based
        const shipSpd=220
        if(s.keys.has("ArrowLeft")||s.keys.has("a")) s.ship.x=Math.max(20, s.ship.x-shipSpd*dt)
        if(s.keys.has("ArrowRight")||s.keys.has("d")) s.ship.x=Math.min(W-20, s.ship.x+shipSpd*dt)

        // shoot cooldown (in seconds)
        if(s.shootCooldown>0) s.shootCooldown-=dt

        // move aliens (time-accumulated)
        s.moveAccum+=dt*1000
        if(s.moveAccum>=moveIntervalMs){
          s.moveAccum=0; s.alienFrame++
          const minX=Math.min(...alive.map(a=>a.x))
          const maxX=Math.max(...alive.map(a=>a.x))
          if((s.dir===1&&maxX>W-25)||(s.dir===-1&&minX<25)){
            s.dir*=-1
            s.aliens.forEach(a=>{if(a.alive)a.y+=12})
          } else {
            s.aliens.forEach(a=>{if(a.alive)a.x+=s.dir*12})
          }
        }

        // alien shoot — time-based
        s.shootAccum+=dt*1000
        const shootIntervalMs=Math.max(600, 1800-s.level*180)
        if(s.shootAccum>=shootIntervalMs){
          s.shootAccum=0
          // pick the bottom alien in a random column
          if(alive.length>0){
            const col=alive[Math.floor(Math.random()*alive.length)]
            const colAliens=alive.filter(a=>Math.abs(a.x-col.x)<15).sort((a,b)=>b.y-a.y)
            if(colAliens.length) s.alienBullets.push({x:colAliens[0].x,y:colAliens[0].y+8})
          }
        }

        // move bullets (px/s based)
        const playerBulletSpd=540
        const alienBulletSpd=240
        s.playerBullets=s.playerBullets.filter(b=>{b.y-=playerBulletSpd*dt;return b.y>0})
        s.alienBullets=s.alienBullets.filter(b=>{b.y+=alienBulletSpd*dt;return b.y<H})

        // player bullet hits alien
        for(const b of s.playerBullets){
          for(const a of s.aliens.filter(a=>a.alive)){
            if(Math.abs(b.x-a.x)<12&&Math.abs(b.y-a.y)<10){
              a.alive=false; b.y=-1
              s.score+=[30,20,10][a.type]
              setDisp(d=>({...d,score:s.score}))
            }
          }
        }
        s.playerBullets=s.playerBullets.filter(b=>b.y>0)

        // alien bullet hits ship
        for(const b of s.alienBullets){
          if(Math.abs(b.x-s.ship.x)<16&&Math.abs(b.y-s.ship.y)<12){
            b.y=H+1; s.lives--
            setDisp(d=>({...d,lives:s.lives}))
            if(s.lives<=0){
              s.over=true; saveHS("space-invaders",s.score); s.hs=Math.max(s.hs,s.score)
              setDisp({score:s.score,lives:0,hs:s.hs,over:true,win:false})
            }
          }
        }
        s.alienBullets=s.alienBullets.filter(b=>b.y<H)

        // aliens reach bottom
        if(alive.some(a=>a.y>H-80)&&!s.over){
          s.over=true; s.lives=0; saveHS("space-invaders",s.score); s.hs=Math.max(s.hs,s.score)
          setDisp({score:s.score,lives:0,hs:s.hs,over:true,win:false})
        }

        // cleared
        if(!alive.length&&!s.over){
          s.level++; mkAliens(s.level)
          setDisp(d=>({...d}))
        }
      }

      // ── draw ──
      ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H)
      for(let i=0;i<50;i++){ctx.fillStyle="#ffffff12";ctx.fillRect((i*53+7)%W,(i*71+13)%H,1,1)}

      // aliens
      const af=s.alienFrame%2
      for(const a of s.aliens.filter(a=>a.alive)){
        const colors=["#ef4444","#f97316",primary]
        ctx.fillStyle=colors[a.type]
        if(a.type===0){
          // top row: UFO-like
          ctx.beginPath();ctx.ellipse(a.x,a.y,9,5,0,0,Math.PI*2);ctx.fill()
          ctx.fillRect(a.x-5,a.y-9,10,6)
          ctx.fillStyle="#000"
          ctx.fillRect(a.x-6+af*2,a.y-1,3,3);ctx.fillRect(a.x+3-af*2,a.y-1,3,3)
        } else if(a.type===1){
          // mid rows: crab
          ctx.fillRect(a.x-7,a.y-5,14,10)
          ctx.fillRect(a.x-5+af*3,a.y+5,4,4);ctx.fillRect(a.x+1-af*3,a.y+5,4,4)
          ctx.fillRect(a.x-11+af*2,a.y-2,4,3);ctx.fillRect(a.x+7-af*2,a.y-2,4,3)
          ctx.fillStyle="#000";ctx.fillRect(a.x-4,a.y-3,3,3);ctx.fillRect(a.x+1,a.y-3,3,3)
        } else {
          // bottom rows: squid
          ctx.fillRect(a.x-5,a.y-7,10,10)
          ctx.fillRect(a.x-8+af,a.y,3,5);ctx.fillRect(a.x-3,a.y+2,3,4);ctx.fillRect(a.x+2,a.y+2,3,4);ctx.fillRect(a.x+5-af,a.y,3,5)
          ctx.fillStyle="#000";ctx.fillRect(a.x-3,a.y-5,3,3);ctx.fillRect(a.x,a.y-5,3,3)
        }
      }

      // bullets
      ctx.fillStyle=primary
      s.playerBullets.forEach(b=>{ctx.fillRect(b.x-1.5,b.y-8,3,10)})
      ctx.fillStyle="#f87171"
      s.alienBullets.forEach(b=>{
        ctx.fillRect(b.x-1.5,b.y,3,8)
        // draw arrow tip for alien bullets
        ctx.beginPath();ctx.moveTo(b.x-4,b.y);ctx.lineTo(b.x+4,b.y);ctx.lineTo(b.x,b.y+6);ctx.closePath();ctx.fill()
      })

      // ship
      if(!s.over||s.lives>0){
        ctx.fillStyle=primary
        ctx.beginPath();ctx.moveTo(s.ship.x,s.ship.y-16);ctx.lineTo(s.ship.x+16,s.ship.y+10);ctx.lineTo(s.ship.x-16,s.ship.y+10);ctx.closePath();ctx.fill()
        ctx.fillRect(s.ship.x-5,s.ship.y-22,10,8)
        // engine glow
        ctx.fillStyle=primary+"44"
        ctx.beginPath();ctx.moveTo(s.ship.x-8,s.ship.y+10);ctx.lineTo(s.ship.x+8,s.ship.y+10);ctx.lineTo(s.ship.x,s.ship.y+18);ctx.closePath();ctx.fill()
      }

      // HUD
      ctx.fillStyle=primary;ctx.font="bold 13px monospace";ctx.textAlign="left";ctx.textBaseline="top"
      ctx.fillText(`${s.score}`,8,8)
      ctx.textAlign="right";ctx.fillText("♥".repeat(Math.max(0,s.lives)),W-8,8)
      ctx.textAlign="center";ctx.fillText(`lv${s.level}`,W/2,8)

      // ground line
      ctx.strokeStyle=primary+"44";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,H-22);ctx.lineTo(W,H-22);ctx.stroke()

      if(!s.started){
        ctx.fillStyle="rgba(0,0,0,0.7)";ctx.fillRect(0,0,W,H)
        ctx.fillStyle=primary;ctx.font="bold 26px monospace";ctx.textAlign="center";ctx.textBaseline="middle"
        ctx.fillText("SPACE INVADERS",W/2,H/2-35)
        ctx.fillStyle="#aaa";ctx.font="13px monospace"
        ctx.fillText("← → move · space shoot",W/2,H/2+5)
        ctx.fillText("press any key to start",W/2,H/2+28)
        if(s.hs>0){ctx.fillStyle=primary+"aa";ctx.fillText(`best: ${s.hs}`,W/2,H/2+55)}
      }

      if(s.over){
        ctx.fillStyle="rgba(0,0,0,0.8)";ctx.fillRect(0,0,W,H)
        ctx.fillStyle="#ef4444";ctx.font="bold 32px monospace";ctx.textAlign="center";ctx.textBaseline="middle"
        ctx.fillText("GAME OVER",W/2,H/2-40)
        ctx.fillStyle=primary;ctx.font="bold 20px monospace"
        ctx.fillText(`Score: ${s.score}`,W/2,H/2+5)
        if(s.hs>0){ctx.fillStyle="#aaa";ctx.font="14px monospace";ctx.fillText(`Best: ${s.hs}`,W/2,H/2+35)}
        ctx.fillStyle="#888";ctx.font="13px monospace";ctx.fillText("press R to restart",W/2,H/2+62)
      }

      s.raf=requestAnimationFrame(loop)
    }
    state.current.raf=requestAnimationFrame(loop)
    return ()=>cancelAnimationFrame(state.current.raf)
  },[primary,reset,mkAliens])

  useEffect(()=>{
    const s=state.current
    const down=(e:KeyboardEvent)=>{
      s.keys.add(e.key)
      if(!s.started&&!s.over){s.started=true;setDisp(d=>({...d}))}
      if(e.key===" "){
        e.preventDefault()
        if(s.shootCooldown<=0&&s.started&&!s.over){
          s.playerBullets.push({x:s.ship.x,y:s.ship.y-18})
          s.shootCooldown=0.3
        }
      }
      if(e.key==="r"||e.key==="R") reset()
    }
    const up=(e:KeyboardEvent)=>s.keys.delete(e.key)
    window.addEventListener("keydown",down); window.addEventListener("keyup",up)
    return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up)}
  },[reset])

  return (
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
      <div className="flex gap-4 md:hidden">
        {[{l:"←",k:"ArrowLeft"},{l:"→",k:"ArrowRight"},{l:"fire",k:" "}].map(({l,k})=>(
          <button key={l}
            onTouchStart={e=>{e.preventDefault();state.current.keys.add(k);if(!state.current.started)state.current.started=true;if(k===" "&&state.current.shootCooldown<=0){state.current.playerBullets.push({x:state.current.ship.x,y:state.current.ship.y-18});state.current.shootCooldown=0.3}}}
            onTouchEnd={e=>{e.preventDefault();state.current.keys.delete(k)}}
            className="h-14 w-14 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold text-sm touch-none">{l}</button>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground hidden md:block">← → move · space shoot · R restart</p>
    </div>
  )
}
