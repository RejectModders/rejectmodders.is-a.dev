"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r=Math.min(r,w/2,h/2); ctx.beginPath(); ctx.moveTo(x+r,y)
  ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r)
  ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r)
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath()
}

export function BreakoutPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const PW=42,PH=7,BR=4,BCOLS=8,BROWS=4
    const BW=(W-14)/BCOLS,BH=10,BGAP=2
    const BALL_SPD=130,PAD_SPD=180
    const PAD_Y=H-22-PH
    const BCOLORS=["#ef4444","#f97316","#fbbf24","#22c55e"]
    type Brick={x:number;y:number;alive:boolean;color:string}
    const mkBricks=():Brick[]=>Array.from({length:BROWS*BCOLS},(_,i)=>{
      const r=Math.floor(i/BCOLS),c=i%BCOLS
      return {x:7+c*BW,y:18+r*(BH+BGAP),alive:true,color:BCOLORS[r%BCOLORS.length]}
    })
    const mkBall=(fromLeft:boolean)=>({
      x:fromLeft?W*0.3:W*0.7, y:PAD_Y-10,
      vx:(fromLeft?1:-1)*BALL_SPD*0.72, vy:-BALL_SPD*0.70,
    })
    let bricks=mkBricks(), ball=mkBall(true), padX=W/2-PW/2
    let lt=0, raf=0, ballDir=true
    const draw=(ts:number)=>{
      const dt=lt===0?0:Math.min((ts-lt)/1000,0.04); lt=ts
      if (dt>0) {
        const tgt=Math.max(0,Math.min(W-PW,ball.x-PW/2))
        const d=tgt-padX; padX+=Math.sign(d)*Math.min(PAD_SPD*dt,Math.abs(d))
        ball.x+=ball.vx*dt; ball.y+=ball.vy*dt
        if(ball.x-BR<0){ball.x=BR;ball.vx=Math.abs(ball.vx)}
        if(ball.x+BR>W){ball.x=W-BR;ball.vx=-Math.abs(ball.vx)}
        if(ball.y-BR<0){ball.y=BR;ball.vy=Math.abs(ball.vy)}
        if(ball.vy>0&&ball.y+BR>=PAD_Y&&ball.y+BR<=PAD_Y+PH+6&&ball.x>=padX-2&&ball.x<=padX+PW+2){
          ball.y=PAD_Y-BR
          const rel=Math.max(-0.85,Math.min(0.85,(ball.x-(padX+PW/2))/(PW/2)))
          const clamped=rel<0?Math.min(-0.3,rel):Math.max(0.3,rel)
          const ang=clamped*(Math.PI/3.2)
          ball.vx=BALL_SPD*Math.sin(ang); ball.vy=-BALL_SPD*Math.cos(ang)
        }
        if(ball.y-BR>H){ballDir=!ballDir;bricks=mkBricks();padX=W/2-PW/2;ball=mkBall(ballDir)}
        for (const b of bricks) {
          if (!b.alive) continue
          if(ball.x+BR>b.x&&ball.x-BR<b.x+BW-BGAP&&ball.y+BR>b.y&&ball.y-BR<b.y+BH){
            b.alive=false
            const oL=ball.x+BR-b.x,oR=b.x+BW-BGAP-(ball.x-BR)
            const oT=ball.y+BR-b.y,oB=b.y+BH-(ball.y-BR)
            if(Math.min(oL,oR)<Math.min(oT,oB))ball.vx*=-1;else ball.vy*=-1
            break
          }
        }
        if(bricks.every(b=>!b.alive)){ballDir=!ballDir;bricks=mkBricks();ball=mkBall(ballDir)}
      }
      ctx.fillStyle="#0a0a0a"; ctx.fillRect(0,0,W,H)
      bricks.forEach(b=>{
        if (!b.alive) return
        ctx.fillStyle=b.color; rr(ctx,b.x,b.y,BW-BGAP,BH,2); ctx.fill()
        ctx.fillStyle="rgba(255,255,255,0.18)"; ctx.fillRect(b.x+2,b.y+1,BW-BGAP-4,2)
      })
      ctx.fillStyle=primary+"22"; rr(ctx,padX-3,PAD_Y-2,PW+6,PH+4,5); ctx.fill()
      ctx.fillStyle=primary; rr(ctx,padX,PAD_Y,PW,PH,3); ctx.fill()
      ctx.fillStyle=primary+"38"; ctx.beginPath(); ctx.arc(ball.x,ball.y,BR+3,0,Math.PI*2); ctx.fill()
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(ball.x,ball.y,BR,0,Math.PI*2); ctx.fill()
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw); return ()=>cancelAnimationFrame(raf)
  }, [primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
