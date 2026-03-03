"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function NonogramPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const N=5, CELL=20, OX=(W-N*CELL-40)/2+40, OY=(H-N*CELL-30)/2+30
    const solution=[[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]]
    const rowClues=[[1,1],[1,1],[5],[1,1],[1,1]]
    const colClues=[[5],[1,1],[1],[1,1],[5]]
    // fill in cells one by one
    let filled: number[][] = [], step=0, lastT=0, raf=0
    const order: number[][] = []
    for(let r=0;r<N;r++) for(let c=0;c<N;c++) if(solution[r][c]) order.push([r,c])
    const draw=(now:number)=>{
      if(now-lastT>300){lastT=now; if(step<order.length)filled=[...filled,order[step++]]; else{filled=[];step=0}}
      ctx.fillStyle="#0a0a0a"; ctx.fillRect(0,0,W,H)
      // col clues
      colClues.forEach((clue,c)=>{
        ctx.fillStyle="#888"; ctx.font="bold 9px monospace"; ctx.textAlign="center"; ctx.textBaseline="bottom"
        clue.forEach((n,i)=>ctx.fillText(String(n),OX+c*CELL+CELL/2,OY-2+(i-clue.length+1)*11))
      })
      // row clues
      rowClues.forEach((clue,r)=>{
        ctx.fillStyle="#888"; ctx.font="bold 9px monospace"; ctx.textAlign="right"; ctx.textBaseline="middle"
        ctx.fillText(clue.join(" "),OX-4,OY+r*CELL+CELL/2)
      })
      // grid
      for(let r=0;r<N;r++) for(let c=0;c<N;c++){
        const isFilled=filled.some(([fr,fc])=>fr===r&&fc===c)
        ctx.fillStyle=isFilled?primary:"#111"
        ctx.strokeStyle="#333"; ctx.lineWidth=0.5
        ctx.beginPath(); ctx.rect(OX+c*CELL,OY+r*CELL,CELL,CELL); ctx.fill(); ctx.stroke()
        if(isFilled){ctx.shadowColor=primary;ctx.shadowBlur=4;ctx.beginPath();ctx.rect(OX+c*CELL,OY+r*CELL,CELL,CELL);ctx.fill();ctx.shadowBlur=0}
      }
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw); return()=>cancelAnimationFrame(raf)
  },[primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full"/>
}

