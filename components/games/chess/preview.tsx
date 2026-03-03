"use client"
import { useEffect, useRef } from "react"
import { usePrimary } from "../helpers"
export function ChessPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  const primary = usePrimary()
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height
    const N=6, CELL=Math.floor(Math.min(W,H)/N), OX=(W-N*CELL)/2, OY=(H-N*CELL)/2
    type P={t:string;w:boolean}
    const board:(P|null)[][]=[
      [{t:"♜",w:false},{t:"♞",w:false},{t:"♝",w:false},{t:"♛",w:false},{t:"♚",w:false},{t:"♝",w:false}],
      Array(N).fill(null).map(()=>({t:"♟",w:false})),
      Array(N).fill(null),Array(N).fill(null),
      Array(N).fill(null).map(()=>({t:"♙",w:true})),
      [{t:"♖",w:true},{t:"♘",w:true},{t:"♗",w:true},{t:"♕",w:true},{t:"♔",w:true},{t:"♗",w:true}],
    ]
    const moves=[[4,0,3,0],[1,3,2,3],[3,0,2,1],[4,2,3,3]]
    let mIdx=0,lastT=0,selR=-1,selC=-1,raf=0
    const draw=(now:number)=>{
      if(now-lastT>1000){
        lastT=now; const[fr,fc,tr,tc]=moves[mIdx%moves.length]
        board[tr][tc]=board[fr][fc]; board[fr][fc]=null; selR=tr;selC=tc; mIdx++
      }
      ctx.fillStyle="#0a0a0a"; ctx.fillRect(0,0,W,H)
      for(let r=0;r<N;r++) for(let c=0;c<N;c++){
        const light=(r+c)%2===0
        const isSel=r===selR&&c===selC
        ctx.fillStyle=isSel?primary+"66":light?"#f0d9b5":"#b58863"
        ctx.fillRect(OX+c*CELL,OY+r*CELL,CELL,CELL)
        const p=board[r][c]
        if(p){
          ctx.font=`${CELL*0.7}px serif`; ctx.textAlign="center"; ctx.textBaseline="middle"
          ctx.fillStyle=p.w?"#fff":"#111"
          if(p.w) ctx.shadowColor="#000", ctx.shadowBlur=2
          ctx.fillText(p.t,OX+c*CELL+CELL/2,OY+r*CELL+CELL/2+1)
          ctx.shadowBlur=0
        }
      }
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw); return()=>cancelAnimationFrame(raf)
  },[primary])
  return <canvas ref={ref} width={280} height={160} className="w-full h-full"/>
}

