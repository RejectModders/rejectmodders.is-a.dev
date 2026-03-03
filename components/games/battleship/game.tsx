"use client"
import { useState, useCallback, useEffect } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const GRID=10
const SHIPS=[{name:"Carrier",size:5},{name:"Battleship",size:4},{name:"Cruiser",size:3},{name:"Submarine",size:3},{name:"Destroyer",size:2}]

type Cell="empty"|"ship"|"hit"|"miss"
type Board=Cell[][]

function mkBoard():Board{return Array.from({length:GRID},()=>Array(GRID).fill("empty") as Cell[])}

function placeShips(board:Board):Board{
  const b=board.map(r=>[...r]) as Board
  for(const ship of SHIPS){
    let placed=false
    while(!placed){
      const horiz=Math.random()>0.5
      const r=Math.floor(Math.random()*(GRID-(horiz?0:ship.size-1)))
      const c=Math.floor(Math.random()*(GRID-(horiz?ship.size-1:0)))
      const cells:number[][]=[]
      for(let i=0;i<ship.size;i++) cells.push([r+(horiz?0:i),c+(horiz?i:0)])
      if(cells.every(([r2,c2])=>b[r2][c2]==="empty")){
        cells.forEach(([r2,c2])=>b[r2][c2]="ship"); placed=true
      }
    }
  }
  return b
}

function aiShoot(board:Board,attacked:Set<string>):[number,number]{
  // priority: extend existing hits
  const hits:number[][]=[]
  for(let r=0;r<GRID;r++) for(let c=0;c<GRID;c++) if(board[r][c]==="hit") hits.push([r,c])
  for(const [hr,hc] of hits){
    const neighbors:Array<[number,number]>=[[hr-1,hc],[hr+1,hc],[hr,hc-1],[hr,hc+1]]
    for(const [nr,nc] of neighbors){
      if(nr>=0&&nr<GRID&&nc>=0&&nc<GRID&&!attacked.has(`${nr},${nc}`)) return[nr,nc]
    }
  }
  // checkerboard pattern for efficiency
  const opts:number[][]=[]
  for(let r=0;r<GRID;r++) for(let c=0;c<GRID;c++) if(!attacked.has(`${r},${c}`)&&(r+c)%2===0) opts.push([r,c])
  if(!opts.length){
    for(let r=0;r<GRID;r++) for(let c=0;c<GRID;c++) if(!attacked.has(`${r},${c}`)) opts.push([r,c])
  }
  const [r,c]=opts[Math.floor(Math.random()*opts.length)]
  return[r,c]
}

export function BattleshipGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [playerBoard,setPlayerBoard]=useState<Board>(()=>placeShips(mkBoard()))
  const [aiBoard,setAiBoard]=useState<Board>(()=>placeShips(mkBoard()))
  const [playerAttacked,setPlayerAttacked]=useState(new Set<string>())
  const [aiAttacked,setAiAttacked]=useState(new Set<string>())
  const [phase,setPhase]=useState<"play"|"over">("play")
  const [winner,setWinner]=useState<"player"|"ai"|null>(null)
  const [hs,setHs]=useState(()=>loadHS()["battleship"]??0)
  const [msg,setMsg]=useState("")

  const countShips=(board:Board)=>board.flat().filter(c=>c==="ship").length

  const reset=useCallback(()=>{
    setPlayerBoard(placeShips(mkBoard())); setAiBoard(placeShips(mkBoard()))
    setPlayerAttacked(new Set()); setAiAttacked(new Set())
    setPhase("play"); setWinner(null); setMsg("")
  },[])

  const shoot=useCallback((r:number,c:number)=>{
    if(phase!=="play"||playerAttacked.has(`${r},${c}`)) return
    const key=`${r},${c}`

    // --- player shoots AI board ---
    const nb=aiBoard.map(row=>[...row]) as Board
    const hit=nb[r][c]==="ship"
    nb[r][c]=hit?"hit":"miss"
    const np=new Set(playerAttacked); np.add(key)
    setAiBoard(nb); setPlayerAttacked(np)
    setMsg(hit?"🎯 Hit!":"💧 Miss")

    const playerWon=!nb.flat().some(c=>c==="ship")
    if(playerWon){
      setPhase("over"); setWinner("player")
      const score=GRID*GRID-np.size
      setHs(h=>{const best=Math.max(h,score);saveHS("battleship",best);return best})
      return
    }

    // --- AI shoots player board (delayed) ---
    setTimeout(()=>{
      setPlayerBoard(pb=>{
        setAiAttacked(aa=>{
          const [ar,ac]=aiShoot(pb,aa)
          const ak=`${ar},${ac}`
          const naa=new Set(aa); naa.add(ak)
          const npb=pb.map(row=>[...row]) as Board
          const ahit=npb[ar][ac]==="ship"
          npb[ar][ac]=ahit?"hit":"miss"
          setMsg(ahit?`💥 AI hit your ship at ${String.fromCharCode(65+ar)}${ac+1}!`:`AI missed at ${String.fromCharCode(65+ar)}${ac+1}`)
          if(!npb.flat().some(c=>c==="ship")){setPhase("over");setWinner("ai")}
          // We need to update the player board with the result
          setPlayerBoard(npb)
          return naa
        })
        return pb // initial return, will be overridden by setPlayerBoard above
      })
    },700)
  },[phase,playerAttacked,aiBoard])

  const cellColor=(cell:Cell,isPlayer:boolean,isAi:boolean)=>{
    if(cell==="hit") return "#ef4444"
    if(cell==="miss") return "#1e3a5f"
    if(isPlayer&&cell==="ship") return primary+"77"
    return "#0a1628"
  }

  return(
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5"/> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          {hs>0&&<span className="text-muted-foreground">best:{hs}</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5"/></button>
        </div>
      </div>

      {msg&&<p className="font-mono text-sm font-bold" style={{color:msg.includes("Hit")||msg.includes("🎯")?primary:"#60a5fa"}}>{msg}</p>}

      <div className="flex gap-6 flex-wrap justify-center">
        {/* Enemy grid */}
        <div>
          <p className="font-mono text-xs text-muted-foreground mb-2 text-center">enemy waters · click to shoot</p>
          <div className="grid" style={{gridTemplateColumns:`repeat(${GRID},28px)`,gap:2}}>
            {aiBoard.map((row,r)=>row.map((cell,c)=>(
              <button key={`${r},${c}`} onClick={()=>shoot(r,c)}
                disabled={playerAttacked.has(`${r},${c}`)||phase!=="play"}
                className="rounded-sm transition-all hover:opacity-80"
                style={{width:28,height:28,background:cellColor(cell,false,true),border:`1px solid #1e3a5f`}}>
                {cell==="hit"&&<span className="text-xs">✕</span>}
                {cell==="miss"&&<span className="text-xs" style={{color:"#60a5fa"}}>·</span>}
              </button>
            )))}
          </div>
        </div>

        {/* Player grid */}
        <div>
          <p className="font-mono text-xs text-muted-foreground mb-2 text-center">your fleet</p>
          <div className="grid" style={{gridTemplateColumns:`repeat(${GRID},28px)`,gap:2}}>
            {playerBoard.map((row,r)=>row.map((cell,c)=>(
              <div key={`${r},${c}`} className="rounded-sm"
                style={{width:28,height:28,background:cellColor(cell,true,false),border:`1px solid #1e3a5f`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {cell==="hit"&&<span className="text-xs text-red-400">✕</span>}
                {cell==="miss"&&<span className="text-xs" style={{color:"#60a5fa"}}>·</span>}
              </div>
            )))}
          </div>
        </div>
      </div>

      {phase==="over"&&(
        <div className="text-center">
          <p className="font-mono font-bold text-2xl" style={{color:winner==="player"?"#fbbf24":"#ef4444"}}>
            {winner==="player"?"🏆 You Win!":"💀 You Lose"}
          </p>
          <button onClick={reset} className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">play again</button>
        </div>
      )}
    </div>
  )
}
