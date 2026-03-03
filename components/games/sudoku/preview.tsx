"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function SudokuPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W=canvas.width,H=canvas.height,N=9,CELL=Math.floor(Math.min(W,H)/N)
    const OX=Math.floor((W-CELL*N)/2),OY=Math.floor((H-CELL*N)/2)
    const BOARD=[[5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],[8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],[0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]]
    // cells to fill in sequence
    const FILL=[[0,2,4],[0,3,6],[0,5,8],[1,1,7],[1,2,2],[2,0,1],[2,3,3],[2,4,4],[3,1,5],[3,2,9],[3,3,7]]
    let step=0,lastT=0,sel={r:0,c:2},raf=0
    const draw=(now:number)=>{
      if(now-lastT>700){lastT=now
        if(step<FILL.length){const[r,c,v]=FILL[step];BOARD[r][c]=v;sel={r,c};step++}
        else{step=0;FILL.forEach(([r,c])=>BOARD[r][c]=0)}
      }
      ctx.fillStyle="#0a0a0a";ctx.fillRect(0,0,W,H)
      for(let r=0;r<N;r++) for(let c=0;c<N;c++){
        const isSel=sel.r===r&&sel.c===c
        const isBox=(Math.floor(r/3)===Math.floor(sel.r/3)&&Math.floor(c/3)===Math.floor(sel.c/3))
        ctx.fillStyle=isSel?primary:isBox?"#1a1a1a":"#111"
        ctx.fillRect(OX+c*CELL+1,OY+r*CELL+1,CELL-2,CELL-2)
        if(BOARD[r][c]){
          ctx.fillStyle=isSel?"#000":FILL.some(([fr,fc])=>fr===r&&fc===c)?primary:"#888"
          ctx.font=`bold ${CELL*0.55}px monospace`;ctx.textAlign="center";ctx.textBaseline="middle"
          ctx.fillText(String(BOARD[r][c]),OX+c*CELL+CELL/2,OY+r*CELL+CELL/2)
        }
      }
      ctx.strokeStyle="#333";ctx.lineWidth=0.5
      for(let i=0;i<=N;i++){ctx.beginPath();ctx.moveTo(OX+i*CELL,OY);ctx.lineTo(OX+i*CELL,OY+N*CELL);ctx.stroke()}
      for(let i=0;i<=N;i++){ctx.beginPath();ctx.moveTo(OX,OY+i*CELL);ctx.lineTo(OX+N*CELL,OY+i*CELL);ctx.stroke()}
      ctx.strokeStyle="#555";ctx.lineWidth=1.5
      for(let i=0;i<=3;i++){ctx.beginPath();ctx.moveTo(OX+i*3*CELL,OY);ctx.lineTo(OX+i*3*CELL,OY+N*CELL);ctx.stroke()}
      for(let i=0;i<=3;i++){ctx.beginPath();ctx.moveTo(OX,OY+i*3*CELL);ctx.lineTo(OX+N*CELL,OY+i*3*CELL);ctx.stroke()}
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw); return()=>cancelAnimationFrame(raf)
  },[primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full"/>
}

