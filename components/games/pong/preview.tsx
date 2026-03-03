"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w/2, h/2); ctx.beginPath(); ctx.moveTo(x+r,y)
  ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r)
  ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r)
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath()
}

export function PongPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const PH=28, PW=5, BR=4, BALL_SPD=105, P1_SPD=110, P2_SPD=62
    let lt=0, raf=0
    let ball = { x: W*0.35, y: H*0.42, vx: BALL_SPD, vy: 34 }
    let p1y = H/2-PH/2, p2y = H/2-PH/2
    let sc = { l: 0, r: 0 }
    let p2err = 0, nextErrTime = 0

    const draw = (ts: number) => {
      const dt = lt===0 ? 0 : Math.min((ts-lt)/1000, 0.05); lt = ts
      if (dt > 0) {
        if (ts > nextErrTime) { p2err=(Math.random()-0.5)*24; nextErrTime=ts+800+Math.random()*600 }
        const c1 = (cur: number, tgt: number) => { const d=tgt-PH/2-cur; return cur+Math.sign(d)*Math.min(P1_SPD*dt,Math.abs(d)) }
        const c2 = (cur: number, tgt: number) => { const d=(tgt+p2err)-PH/2-cur; return cur+Math.sign(d)*Math.min(P2_SPD*dt,Math.abs(d)) }
        p1y = Math.max(0, Math.min(H-PH, c1(p1y, ball.vx<0 ? ball.y : H/2)))
        p2y = Math.max(0, Math.min(H-PH, c2(p2y, ball.vx>0 ? ball.y : H/2)))
        ball.x += ball.vx*dt; ball.y += ball.vy*dt
        if (ball.y-BR<0) { ball.y=BR; ball.vy=Math.abs(ball.vy) }
        if (ball.y+BR>H) { ball.y=H-BR; ball.vy=-Math.abs(ball.vy) }
        const p1x=13+PW
        if (ball.x-BR<p1x&&ball.x+BR>13&&ball.y>p1y&&ball.y<p1y+PH&&ball.vx<0) {
          ball.x=p1x+BR; ball.vx=Math.abs(ball.vx)*1.04; ball.vy+=((ball.y-(p1y+PH/2))/(PH/2))*20
        }
        const p2x=W-13-PW
        if (ball.x+BR>p2x&&ball.x-BR<W-13&&ball.y>p2y&&ball.y<p2y+PH&&ball.vx>0) {
          ball.x=p2x-BR; ball.vx=-Math.abs(ball.vx)*1.04; ball.vy+=((ball.y-(p2y+PH/2))/(PH/2))*20
        }
        const spd=Math.hypot(ball.vx,ball.vy)
        if (spd>190) { ball.vx=ball.vx/spd*190; ball.vy=ball.vy/spd*190 }
        if (ball.x<0) { sc.r++; p2err=0; ball={x:W/2,y:H/2,vx:BALL_SPD,vy:(Math.random()-0.5)*50} }
        if (ball.x>W) { sc.l++; ball={x:W/2,y:H/2,vx:-BALL_SPD,vy:(Math.random()-0.5)*50} }
      }
      ctx.fillStyle="#0a0a0a"; ctx.fillRect(0,0,W,H)
      ctx.setLineDash([4,5]); ctx.strokeStyle="#ffffff0e"; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([])
      ctx.fillStyle=primary+"88"; ctx.font="bold 18px monospace"; ctx.textAlign="center"
      ctx.fillText(String(sc.l),W/4,24); ctx.fillStyle="#333"; ctx.fillText(String(sc.r),W*3/4,24)
      ctx.fillStyle=primary; rr(ctx,13,p1y,PW,PH,2); ctx.fill()
      ctx.fillStyle="#555"; rr(ctx,W-13-PW,p2y,PW,PH,2); ctx.fill()
      ctx.fillStyle=primary+"35"; ctx.beginPath(); ctx.arc(ball.x,ball.y,BR+3,0,Math.PI*2); ctx.fill()
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(ball.x,ball.y,BR,0,Math.PI*2); ctx.fill()
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw); return ()=>cancelAnimationFrame(raf)
  }, [primary])

  return <canvas ref={ref} width={280} height={160} className="w-full h-full" />
}
