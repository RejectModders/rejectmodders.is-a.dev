"use client"
import { useState } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

// 5x5 nonogram puzzles
const PUZZLES = [
  // Heart-ish shape
  { rows:[[2],[1,1],[3],[1,1],[2]], cols:[[3],[1,1],[1,1,1],[1,1],[]], solution:[[0,1,1,0,0],[1,0,0,1,0],[1,1,1,0,0],[1,0,0,1,0],[0,1,1,0,0]] },
  // Flag/F shape — col0=[5], col1=[1,1], col2=[1,1], col3=[1,1], col4=[1,1]
  { rows:[[5],[1,1],[5],[1],[1]], cols:[[5],[1,1],[1,1],[3],[1,1]], solution:[[1,1,1,1,1],[1,0,0,1,0],[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0]] },
  // H shape — col0=[5], col1=[], col2=[1], col3=[], col4=[5]
  { rows:[[1,1],[1,1],[5],[1,1],[1,1]], cols:[[5],[1],[1],[1],[5]], solution:[[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]] },
  // D shape — col0=[], col1=[5], col2=[1,1], col3=[3], col4=[1,1]
  { rows:[[3],[2,1],[1,2],[1,2],[3]], cols:[[],[5],[2,1],[1,3],[3]], solution:[[0,1,1,1,0],[0,1,1,0,1],[0,1,0,1,1],[0,1,0,1,1],[0,1,1,1,0]] },
  // X shape — col0=[1,1],[1,1,1],[1,1,1],[1,1,1],[1,1]
  { rows:[[1,3],[2,1],[3],[2,1],[1,3]], cols:[[2,2],[3],[1,1,1],[5],[1,1]], solution:[[1,0,1,1,1],[1,1,0,1,0],[0,1,1,1,0],[1,1,0,1,0],[1,0,1,1,1]] },
]

type State = (0|1|2)[][] // 0=empty, 1=filled, 2=X
export function NonogramGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [pidx,setPidx]=useState(0)
  const puzzle=PUZZLES[pidx]
  const [grid,setGrid]=useState<State>(()=>Array.from({length:5},()=>Array(5).fill(0) as (0|1|2)[]))
  const [won,setWon]=useState(false)
  const [hs,setHs]=useState(()=>loadHS()["nonogram"]??0)

  const reset=(p=pidx)=>{setGrid(Array.from({length:5},()=>Array(5).fill(0) as (0|1|2)[]));setWon(false)}

  const nextPuzzle=()=>{const np=(pidx+1)%PUZZLES.length;setPidx(np);reset(np)}

  const click=(r:number,c:number,right=false)=>{
    if(won) return
    setGrid(prev=>{
      const ng=prev.map(row=>[...row]) as State
      if(right) ng[r][c]=ng[r][c]===2?0:2
      else ng[r][c]=ng[r][c]===1?0:1
      // check win: every cell's filled state matches solution exactly
      const correct=puzzle.solution.every((row,ri)=>row.every((v,ci)=>(v===1)===(ng[ri][ci]===1)))
      if(correct){setWon(true);const s=pidx+1;setHs(h=>{const best=Math.max(h,s);saveHS("nonogram",best);return best})}
      return ng
    })
  }

  const clueOk=(clue:number[],cells:(0|1|2)[],isRow:boolean)=>{
    const runs:number[]=[];let cur=0
    for(const c of cells){if(c===1)cur++;else{if(cur>0)runs.push(cur);cur=0}}
    if(cur>0) runs.push(cur)
    return JSON.stringify(runs)===JSON.stringify(clue)
  }

  const CELL=44

  return(
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5"/> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-muted-foreground">puzzle {pidx+1}/{PUZZLES.length}</span>
          {hs>0&&<span className="text-muted-foreground">best:{hs}</span>}
          <button onClick={()=>reset()} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5"/></button>
        </div>
      </div>

      <div className="relative">
        {/* Column clues */}
        <div className="flex ml-12 mb-1">
          {puzzle.cols.map((clue,c)=>(
            <div key={c} className="flex flex-col items-center justify-end" style={{width:CELL,minHeight:36}}>
              {clue.map((n,i)=><span key={i} className="font-mono text-xs font-bold" style={{color:clueOk(clue,grid.map(row=>row[c]),false)?primary:"#e4e4e7",lineHeight:"1.2"}}>{n}</span>)}
            </div>
          ))}
        </div>
        {/* Grid with row clues */}
        {grid.map((row,r)=>(
          <div key={r} className="flex items-center">
            {/* Row clue */}
            <div className="flex justify-end items-center gap-0.5 mr-1" style={{width:40,minHeight:CELL}}>
              {puzzle.rows[r].map((n,i)=><span key={i} className="font-mono text-xs font-bold" style={{color:clueOk(puzzle.rows[r],row,true)?primary:"#e4e4e7"}}>{n}</span>)}
            </div>
            {row.map((cell,c)=>(
              <button key={c} onClick={()=>click(r,c)} onContextMenu={e=>{e.preventDefault();click(r,c,true)}}
                className="flex items-center justify-center transition-all border border-zinc-700 touch-manipulation"
                style={{width:CELL,height:CELL,background:cell===1?primary:cell===2?"#27272a":"#111"}}>
                {cell===2&&<span className="font-mono font-bold text-zinc-500">×</span>}
              </button>
            ))}
          </div>
        ))}
        {won&&(
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 rounded-xl">
            <p className="font-mono font-bold text-2xl text-yellow-400">🎉 Solved!</p>
            <button onClick={nextPuzzle} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">next puzzle</button>
          </div>
        )}
      </div>
      <p className="font-mono text-xs text-muted-foreground">left click fill · right click mark X</p>
    </div>
  )
}

