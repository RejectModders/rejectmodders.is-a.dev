"use client"
import { useState, useCallback } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

type Piece = { color: "red"|"black"; king: boolean }
type Board = (Piece|null)[][]

function mkBoard(): Board {
  return Array.from({length:8},(_,r)=>Array.from({length:8},(_,c)=>{
    if((r+c)%2===1){
      if(r<3) return {color:"black",king:false}
      if(r>4) return {color:"red",king:false}
    }
    return null
  }))
}

function getMoves(board:Board,r:number,c:number,color:"red"|"black"): {r:number;c:number;cap?:[number,number]}[] {
  const piece=board[r][c]; if(!piece||piece.color!==color) return[]
  const dirs:number[]=[]
  if(color==="red"||piece.king) dirs.push(-1)
  if(color==="black"||piece.king) dirs.push(1)
  const moves:{r:number;c:number;cap?:[number,number]}[]=[]
  for(const dr of dirs) for(const dc of[-1,1]){
    const nr=r+dr,nc=c+dc
    if(nr<0||nr>7||nc<0||nc>7) continue
    if(!board[nr][nc]) moves.push({r:nr,c:nc})
    else if(board[nr][nc]?.color!==color){
      const jr=nr+dr,jc=nc+dc
      if(jr>=0&&jr<=7&&jc>=0&&jc<=7&&!board[jr][jc]) moves.push({r:jr,c:jc,cap:[nr,nc]})
    }
  }
  return moves
}


export function CheckersGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [board,setBoard]=useState<Board>(mkBoard)
  const [selected,setSelected]=useState<[number,number]|null>(null)
  const [validMoves,setValidMoves]=useState<{r:number;c:number;cap?:[number,number]}[]>([])
  const [turn,setTurn]=useState<"red"|"black">("red")
  const [status,setStatus]=useState<"play"|"won"|"lost">("play")
  const [hs,setHs]=useState(()=>loadHS()["checkers"]??0)
  const [msg,setMsg]=useState("Your turn (red)")
  const [mustJumpFrom,setMustJumpFrom]=useState<[number,number]|null>(null)

  const reset=useCallback(()=>{setBoard(mkBoard());setSelected(null);setValidMoves([]);setTurn("red");setStatus("play");setMsg("Your turn (red)");setMustJumpFrom(null)},[])

  const doAI=useCallback((b:Board)=>{
    setTimeout(()=>{
      // AI does full chain jumps
      let nb=b.map(row=>row.map(p=>p?{...p}:null)) as Board
      const pieces:number[][]=[]
      for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(nb[r][c]?.color==="black") pieces.push([r,c])
      // Collect all possible first moves, prefer captures
      const allFirst:{fr:number;fc:number;r:number;c:number;cap?:[number,number]}[]=[]
      for(const [r,c] of pieces){
        for(const m of getMoves(nb,r,c,"black")) allFirst.push({fr:r,fc:c,...m})
      }
      const caps=allFirst.filter(m=>m.cap)
      const moveList=caps.length?caps:allFirst
      if(!moveList.length){setStatus("won");setMsg("🎉 You win! Black has no moves.");saveHS("checkers",1);setHs(1);return}
      const mv=moveList[Math.floor(Math.random()*moveList.length)]
      nb[mv.r][mv.c]={...nb[mv.fr][mv.fc]!}
      if(mv.r===7) nb[mv.r][mv.c]!.king=true
      nb[mv.fr][mv.fc]=null
      if(mv.cap) nb[mv.cap[0]][mv.cap[1]]=null
      // Chain jumps for AI
      if(mv.cap){
        let chainR=mv.r, chainC=mv.c
        let keepJumping=true
        while(keepJumping){
          keepJumping=false
          const nextJumps=getMoves(nb,chainR,chainC,"black").filter(m2=>m2.cap)
          if(nextJumps.length){
            const j=nextJumps[Math.floor(Math.random()*nextJumps.length)]
            nb[j.r][j.c]={...nb[chainR][chainC]!}
            if(j.r===7) nb[j.r][j.c]!.king=true
            nb[chainR][chainC]=null
            if(j.cap) nb[j.cap[0]][j.cap[1]]=null
            chainR=j.r; chainC=j.c
            keepJumping=true
          }
        }
      }
      setBoard(nb)
      if(!nb.some(r=>r.some(p=>p?.color==="red"))){setStatus("lost");setMsg("💀 You lose.");return}
      // Check if red has any moves
      let redHasMoves=false
      for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(nb[r][c]?.color==="red"&&getMoves(nb,r,c,"red").length>0) redHasMoves=true
      if(!redHasMoves){setStatus("lost");setMsg("💀 No moves left. You lose.");return}
      setTurn("red"); setMsg("Your turn (red)"); setMustJumpFrom(null)
    },500)
  },[])

  const click=useCallback((r:number,c:number)=>{
    if(status!=="play"||turn!=="red") return
    const piece=board[r][c]

    // If we must continue jumping from a specific piece
    if(mustJumpFrom){
      const [mjr,mjc]=mustJumpFrom
      if(r===mjr&&c===mjc) return // clicked the same piece
      const mv=validMoves.find(m=>m.r===r&&m.c===c)
      if(mv&&mv.cap){
        const nb=board.map(row=>row.map(p=>p?{...p}:null)) as Board
        nb[r][c]={...nb[mjr][mjc]!}
        if(r===0) nb[r][c]!.king=true
        nb[mjr][mjc]=null
        if(mv.cap) nb[mv.cap[0]][mv.cap[1]]=null
        setBoard(nb)
        // Check for more jumps from the new position
        const moreJumps=getMoves(nb,r,c,"red").filter(m2=>m2.cap)
        if(moreJumps.length){
          setMustJumpFrom([r,c]); setSelected([r,c]); setValidMoves(moreJumps)
          setMsg("Multi-jump! Keep going!")
          return
        }
        // Turn over
        setSelected(null); setValidMoves([]); setMustJumpFrom(null)
        if(!nb.some(row=>row.some(p=>p?.color==="black"))){setStatus("won");setMsg("🎉 You win!");saveHS("checkers",1);setHs(1);return}
        setTurn("black"); setMsg("AI thinking…"); doAI(nb)
      }
      return
    }

    if(piece?.color==="red"&&!selected){
      const moves=getMoves(board,r,c,"red")
      // If any piece has a capture, must capture (forced capture rule)
      let hasForcedCapture=false
      for(let rr=0;rr<8;rr++) for(let cc=0;cc<8;cc++) if(board[rr][cc]?.color==="red"&&getMoves(board,rr,cc,"red").some(m=>m.cap)) hasForcedCapture=true
      if(hasForcedCapture && !moves.some(m=>m.cap)){
        setMsg("Must capture!"); return
      }
      const filteredMoves=hasForcedCapture?moves.filter(m=>m.cap):moves
      setSelected([r,c]); setValidMoves(filteredMoves); return
    }
    if(selected){
      const mv=validMoves.find(m=>m.r===r&&m.c===c)
      if(mv){
        const nb=board.map(row=>row.map(p=>p?{...p}:null)) as Board
        nb[r][c]={...nb[selected[0]][selected[1]]!}
        if(r===0) nb[r][c]!.king=true
        nb[selected[0]][selected[1]]=null
        if(mv.cap) nb[mv.cap[0]][mv.cap[1]]=null
        setBoard(nb)
        // Check for chain jumps after a capture
        if(mv.cap){
          const moreJumps=getMoves(nb,r,c,"red").filter(m2=>m2.cap)
          if(moreJumps.length){
            setMustJumpFrom([r,c]); setSelected([r,c]); setValidMoves(moreJumps)
            setMsg("Multi-jump! Keep going!")
            return
          }
        }
        setSelected(null); setValidMoves([])
        if(!nb.some(row=>row.some(p=>p?.color==="black"))){setStatus("won");setMsg("🎉 You win!");saveHS("checkers",1);setHs(1);return}
        setTurn("black"); setMsg("AI thinking…"); doAI(nb)
      } else if(piece?.color==="red"){
        const moves=getMoves(board,r,c,"red")
        let hasForcedCapture=false
        for(let rr=0;rr<8;rr++) for(let cc=0;cc<8;cc++) if(board[rr][cc]?.color==="red"&&getMoves(board,rr,cc,"red").some(m=>m.cap)) hasForcedCapture=true
        if(hasForcedCapture && !moves.some(m=>m.cap)){
          setMsg("Must capture!"); return
        }
        const filteredMoves=hasForcedCapture?moves.filter(m=>m.cap):moves
        setSelected([r,c]); setValidMoves(filteredMoves)
      } else {
        setSelected(null); setValidMoves([])
      }
    }
  },[board,selected,validMoves,turn,status,doAI,mustJumpFrom])

  const isValid=(r:number,c:number)=>validMoves.some(m=>m.r===r&&m.c===c)

  return(
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5"/> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-muted-foreground">{msg}</span>
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5"/></button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border-2" style={{borderColor:primary+"44"}}>
        {board.map((row,r)=>(
          <div key={r} className="flex">
            {row.map((piece,c)=>{
              const dark=(r+c)%2===1
              const isSel=selected?.[0]===r&&selected?.[1]===c
              const isValidMove=isValid(r,c)
              return(
                <button key={c} onClick={()=>click(r,c)}
                  className="flex items-center justify-center transition-all"
                  style={{
                    width:44,height:44,
                    background:isSel?primary+"55":isValidMove?"#22c55e33":dark?"#1a1a1a":"#2a2a2a",
                  }}>
                  {piece&&(
                    <div className="rounded-full transition-all"
                      style={{
                        width:32,height:32,
                        background:piece.color==="red"?"#ef4444":"#888",
                        border:`3px solid ${piece.color==="red"?"#b91c1c":"#555"}`,
                        boxShadow:isSel?`0 0 10px ${primary}`:"none",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:16,
                      }}>
                      {piece.king&&"♛"}
                    </div>
                  )}
                  {isValidMove&&!piece&&<div className="w-3 h-3 rounded-full bg-green-400 opacity-70"/>}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {(status==="won"||status==="lost")&&(
        <button onClick={reset} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">play again</button>
      )}
      <p className="font-mono text-xs text-muted-foreground">click piece then click destination · you are red</p>
    </div>
  )
}

