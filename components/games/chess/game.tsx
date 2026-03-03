"use client"
import { useState, useCallback } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"

// Minimal chess — piece movement, check detection, simple AI (random legal move)
type PieceType="K"|"Q"|"R"|"B"|"N"|"P"
type Color="w"|"b"
type Piece={t:PieceType;c:Color}
type Board=(Piece|null)[][]

const INIT:Board=[
  [{t:"R",c:"b"},{t:"N",c:"b"},{t:"B",c:"b"},{t:"Q",c:"b"},{t:"K",c:"b"},{t:"B",c:"b"},{t:"N",c:"b"},{t:"R",c:"b"}],
  Array(8).fill(null).map(()=>({t:"P",c:"b"})),
  ...Array(4).fill(null).map(()=>Array(8).fill(null)),
  Array(8).fill(null).map(()=>({t:"P",c:"w"})),
  [{t:"R",c:"w"},{t:"N",c:"w"},{t:"B",c:"w"},{t:"Q",c:"w"},{t:"K",c:"w"},{t:"B",c:"w"},{t:"N",c:"w"},{t:"R",c:"w"}],
] as Board

function copyBoard(b:Board):Board{return b.map(r=>r.map(p=>p?{...p}:null))}

function pieceMoves(b:Board,r:number,c:number,ignoreCheck=false):[number,number][]{
  const p=b[r][c]; if(!p) return[]
  const moves:[number,number][]=[]
  const add=(nr:number,nc:number)=>{
    if(nr<0||nr>7||nc<0||nc>7) return false
    if(b[nr][nc]?.c===p.c) return false
    moves.push([nr,nc]); return !b[nr][nc]
  }
  const slide=(drs:number[],dcs:number[])=>{for(let i=0;i<drs.length;i++){let nr=r+drs[i],nc=c+dcs[i];while(add(nr,nc)){nr+=drs[i];nc+=dcs[i]}}}
  if(p.t==="P"){
    const d=p.c==="w"?-1:1
    if(!b[r+d]?.[c]){moves.push([r+d,c]);if((p.c==="w"&&r===6||p.c==="b"&&r===1)&&!b[r+2*d]?.[c])moves.push([r+2*d,c])}
    for(const dc of[-1,1])if(b[r+d]?.[c+dc]?.c&&b[r+d][c+dc]?.c!==p.c)moves.push([r+d,c+dc])
  }
  if(p.t==="N"){for(const[dr,dc] of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])add(r+dr,c+dc)}
  if(p.t==="R"||p.t==="Q"){slide([0,0,1,-1],[1,-1,0,0])}
  if(p.t==="B"||p.t==="Q"){slide([1,1,-1,-1],[1,-1,1,-1])}
  if(p.t==="K"){for(const[dr,dc] of[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]])add(r+dr,c+dc)}
  return moves
}

function inCheck(b:Board,color:Color):boolean{
  let kr=-1,kc=-1
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(b[r][c]?.t==="K"&&b[r][c]?.c===color){kr=r;kc=c}
  const opp=color==="w"?"b":"w"
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(b[r][c]?.c===opp) if(pieceMoves(b,r,c,true).some(([mr,mc])=>mr===kr&&mc===kc)) return true
  return false
}

function legalMoves(b:Board,r:number,c:number):[number,number][]{
  return pieceMoves(b,r,c).filter(([nr,nc])=>{
    const nb=copyBoard(b); nb[nr][nc]=b[r][c]; nb[r][c]=null
    return !inCheck(nb,b[r][c]!.c)
  })
}

const PIECE_VALUES:Record<PieceType,number>={K:0,Q:900,R:500,B:330,N:320,P:100}

function aiMove(b:Board,color:Color):Board|null{
  const all:[number,number,number,number][]=[]
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(b[r][c]?.c===color)
    for(const[nr,nc] of legalMoves(b,r,c)) all.push([r,c,nr,nc])
  if(!all.length) return null
  // Score each move: captures by piece value, checks, central control
  const scored = all.map(([fr,fc,tr,tc])=>{
    let score = 0
    const captured = b[tr][tc]
    if(captured) score += PIECE_VALUES[captured.t] * 10 // captures
    const nb=copyBoard(b); nb[tr][tc]=nb[fr][fc]; nb[fr][fc]=null
    if(nb[tr][tc]?.t==="P"&&(tr===0||tr===7)){nb[tr][tc]={t:"Q",c:color};score+=800}
    const opp=color==="w"?"b":"w"
    if(inCheck(nb,opp)) score += 500 // check bonus
    // central control bonus
    if(tr>=2&&tr<=5&&tc>=2&&tc<=5) score += 20
    if(tr>=3&&tr<=4&&tc>=3&&tc<=4) score += 15
    // avoid moving king early
    if(b[fr][fc]?.t==="K") score -= 30
    // develop pieces
    if(b[fr][fc]?.t==="N"||b[fr][fc]?.t==="B"){
      if(color==="b"&&fr<=1) score+=40
      if(color==="w"&&fr>=6) score+=40
    }
    // add some randomness so it's not fully deterministic
    score += Math.random() * 50
    return {move:[fr,fc,tr,tc] as [number,number,number,number], score}
  })
  scored.sort((a,b)=>b.score-a.score)
  const [fr,fc,tr2,tc]=scored[0].move
  const nb=copyBoard(b); nb[tr2][tc]=nb[fr][fc]; nb[fr][fc]=null
  if(nb[tr2][tc]?.t==="P"&&(tr2===0||tr2===7)) nb[tr2][tc]={t:"Q",c:color}
  return nb
}

const SYMBOLS:Record<PieceType,Record<Color,string>>={
  K:{w:"♔",b:"♚"},Q:{w:"♕",b:"♛"},R:{w:"♖",b:"♜"},B:{w:"♗",b:"♝"},N:{w:"♘",b:"♞"},P:{w:"♙",b:"♟"}
}

export function ChessGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [board,setBoard]=useState<Board>(()=>INIT.map(r=>r.map(p=>p?{...p}:null)))
  const [sel,setSel]=useState<[number,number]|null>(null)
  const [moves,setMoves]=useState<[number,number][]>([])
  const [turn,setTurn]=useState<Color>("w")
  const [status,setStatus]=useState<"play"|"won"|"lost"|"draw">("play")
  const [msg,setMsg]=useState("")

  const reset=useCallback(()=>{
    setBoard(INIT.map(r=>r.map(p=>p?{...p}:null))); setSel(null); setMoves([]); setTurn("w"); setStatus("play"); setMsg("")
  },[])

  const doAI=useCallback((b:Board)=>{
    setTimeout(()=>{
      const nb=aiMove(b,"b")
      if(!nb){
        // No legal moves for black
        if(inCheck(b,"b")){setStatus("won");setMsg("Checkmate! You win 🎉")}
        else{setStatus("draw");setMsg("Stalemate — it's a draw")}
        return
      }
      setBoard(nb)
      // Check if white has any legal moves
      let whiteMoves=false
      for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(nb[r][c]?.c==="w"&&legalMoves(nb,r,c).length>0) whiteMoves=true
      if(!whiteMoves){
        if(inCheck(nb,"w")){setStatus("lost");setMsg("Checkmate. AI wins.")}
        else{setStatus("draw");setMsg("Stalemate — it's a draw")}
        return
      }
      setTurn("w"); setMsg(inCheck(nb,"w")?"Check!":"Your turn (white)")
    },400)
  },[])

  const click=useCallback((r:number,c:number)=>{
    if(status!=="play"||turn!=="w") return
    const p=board[r][c]
    if(sel){
      const mv=moves.find(([mr,mc])=>mr===r&&mc===c)
      if(mv){
        const nb=copyBoard(board); nb[r][c]=nb[sel[0]][sel[1]]; nb[sel[0]][sel[1]]=null
        if(nb[r][c]?.t==="P"&&r===0) nb[r][c]={t:"Q",c:"w"}
        setSel(null); setMoves([]); setBoard(nb)
        // Check if black has any legal moves
        let blackMoves=false
        for(let br=0;br<8;br++) for(let bc=0;bc<8;bc++) if(nb[br][bc]?.c==="b"&&legalMoves(nb,br,bc).length>0) blackMoves=true
        if(!blackMoves){
          if(inCheck(nb,"b")){setStatus("won");setMsg("Checkmate! You win 🎉")}
          else{setStatus("draw");setMsg("Stalemate — it's a draw")}
          return
        }
        setTurn("b"); setMsg("AI thinking…"); doAI(nb)
      } else if(p?.c==="w"){
        const ms=legalMoves(board,r,c); setSel([r,c]); setMoves(ms)
      } else {setSel(null);setMoves([])}
    } else if(p?.c==="w"){
      const ms=legalMoves(board,r,c); setSel([r,c]); setMoves(ms)
    }
  },[board,sel,moves,turn,status,doAI])

  return(
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5"/> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-muted-foreground">{msg||"Your turn (white)"}</span>
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5"/></button>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden border-2" style={{borderColor:primary+"44"}}>
        {board.map((row,r)=>(
          <div key={r} className="flex">
            {row.map((piece,c)=>{
              const light=(r+c)%2===0
              const isSel=sel?.[0]===r&&sel?.[1]===c
              const isMove=moves.some(([mr,mc])=>mr===r&&mc===c)
              return(
                <button key={c} onClick={()=>click(r,c)}
                  className="flex items-center justify-center text-2xl transition-all"
                  style={{width:44,height:44,background:isSel?primary+"88":isMove?"#22c55e44":light?"#f0d9b5":"#b58863",position:"relative"}}>
                  {piece&&<span style={{userSelect:"none",filter:piece.c==="w"?"drop-shadow(0 1px 1px #000)":"none"}}>{SYMBOLS[piece.t][piece.c]}</span>}
                  {isMove&&!piece&&<div className="w-4 h-4 rounded-full bg-green-400 opacity-60"/>}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      {(status==="won"||status==="lost"||status==="draw")&&(
        <button onClick={reset} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">play again</button>
      )}
      <p className="font-mono text-xs text-muted-foreground">you are white · click piece then destination</p>
    </div>
  )
}

