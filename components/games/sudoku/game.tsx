"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { ChevronLeft, RotateCcw, Lightbulb, Clock } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

// ── Puzzle generation ──────────────────────────────────────────────────────
const BASE = [
  [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9],
]
const SOLUTION = [
  [5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9],
]

type Difficulty = "easy"|"medium"|"hard"
const REMOVE: Record<Difficulty,number> = { easy:30, medium:45, hard:55 }

function generatePuzzle(diff: Difficulty): { board: number[][]; given: boolean[][]; solution: number[][] } {
  // Shuffle solution by swapping rows within bands + cols within bands + digit remap
  const sol = SOLUTION.map(r=>[...r])
  // digit remap
  const digits = [1,2,3,4,5,6,7,8,9]
  for (let i=digits.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[digits[i],digits[j]]=[digits[j],digits[i]]}
  const remap: Record<number,number> = {}
  digits.forEach((d,i)=>remap[i+1]=d)
  const remapped = sol.map(r=>r.map(v=>remap[v]))
  // row swaps within bands
  for (let band=0;band<3;band++){
    const rows=[band*3,band*3+1,band*3+2]
    for(let i=2;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]]}
    const tmp=[remapped[band*3],remapped[band*3+1],remapped[band*3+2]]
    remapped[band*3]=tmp[rows[0]-band*3];remapped[band*3+1]=tmp[rows[1]-band*3];remapped[band*3+2]=tmp[rows[2]-band*3]
  }
  const solution = remapped.map(r=>[...r])
  const board = remapped.map(r=>[...r])
  const given = Array.from({length:9},()=>Array(9).fill(true))
  let removed=0; const target=REMOVE[diff]
  const cells=Array.from({length:81},(_,i)=>[Math.floor(i/9),i%9])
  for(let i=cells.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]]}
  for(const [r,c] of cells){if(removed>=target)break;board[r][c]=0;given[r][c]=false;removed++}
  return { board, given, solution }
}

function isValid(board: number[][], r: number, c: number, v: number): boolean {
  for(let i=0;i<9;i++) if(board[r][i]===v||board[i][c]===v) return false
  const br=Math.floor(r/3)*3, bc=Math.floor(c/3)*3
  for(let dr=0;dr<3;dr++) for(let dc=0;dc<3;dc++) if(board[br+dr][bc+dc]===v) return false
  return true
}

export function SudokuGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [diff, setDiff] = useState<Difficulty>("medium")
  const [board, setBoard] = useState<number[][]>([])
  const [given, setGiven] = useState<boolean[][]>([])
  const [solution, setSolution] = useState<number[][]>([])
  const [selected, setSelected] = useState<[number,number]|null>(null)
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const [won, setWon] = useState(false)
  const [time, setTime] = useState(0)
  const [hs, setHs] = useState(()=>loadHS()["sudoku"]??0)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const startRef = useRef(0)

  const startNew = useCallback((d: Difficulty) => {
    const { board: b, given: g, solution: s } = generatePuzzle(d)
    setBoard(b); setGiven(g); setSolution(s); setSelected(null); setErrors(new Set()); setWon(false); setTime(0)
    if(timerRef.current) clearInterval(timerRef.current)
    startRef.current = Date.now()
    timerRef.current = setInterval(()=>setTime(Math.floor((Date.now()-startRef.current)/1000)),1000)
  },[])

  useEffect(()=>{ startNew("medium"); return ()=>{ if(timerRef.current) clearInterval(timerRef.current) } },[])// eslint-disable-line

  const input = useCallback((v: number) => {
    if (!selected || won) return
    const [r,c] = selected
    if (given[r]?.[c]) return
    setBoard(prev => {
      const nb = prev.map(row=>[...row])
      nb[r][c] = v
      // check errors
      const errs = new Set<string>()
      for(let rr=0;rr<9;rr++) for(let cc=0;cc<9;cc++){
        if(!nb[rr][cc]) continue
        if(!isValid(nb.map((row,ri)=>row.map((val,ci)=>ri===rr&&ci===cc?0:val)),rr,cc,nb[rr][cc]))
          errs.add(`${rr},${cc}`)
      }
      setErrors(errs)
      // check win
      const complete = nb.every((row,rr)=>row.every((val,cc)=>val!==0&&isValid(nb.map((row2,ri)=>row2.map((v2,ci)=>ri===rr&&ci===cc?0:v2)),rr,cc,val)))
      if(complete){
        setWon(true); if(timerRef.current) clearInterval(timerRef.current)
        const t=Math.floor((Date.now()-startRef.current)/1000)
        setHs(h=>{ const best=h===0?t:Math.min(h,t); saveHS("sudoku",best); return best })
      }
      return nb
    })
  },[selected,given,won])

  const hint = useCallback(()=>{
    if(!selected||won||!solution.length) return
    const [r,c]=selected; if(given[r]?.[c]) return
    const correctVal = solution[r][c]
    if(correctVal) input(correctVal)
  },[selected,given,won,solution,input])

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if(won) return
      if(!selected) return
      const [r,c]=selected
      const move=(dr:number,dc:number)=>setSelected([Math.max(0,Math.min(8,r+dr)),Math.max(0,Math.min(8,c+dc))])
      if(e.key==="ArrowUp") move(-1,0)
      else if(e.key==="ArrowDown") move(1,0)
      else if(e.key==="ArrowLeft") move(0,-1)
      else if(e.key==="ArrowRight") move(0,1)
      else if(e.key==="Backspace"||e.key==="Delete"||e.key==="0") input(0)
      else if(/^[1-9]$/.test(e.key)) input(parseInt(e.key))
    }
    window.addEventListener("keydown",onKey)
    return ()=>window.removeEventListener("keydown",onKey)
  },[selected,input,won])

  const fmt=(s:number)=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`
  const [sr,sc]=selected??[-1,-1]

  if(!board.length) return null
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5"/> back
        </button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <Clock className="h-3 w-3 text-muted-foreground"/><span className="text-muted-foreground">{fmt(time)}</span>
          {hs>0&&<span className="text-muted-foreground">best:{fmt(hs)}</span>}
          <button onClick={hint} className="text-muted-foreground hover:text-primary"><Lightbulb className="h-3.5 w-3.5"/></button>
          <button onClick={()=>startNew(diff)} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5"/></button>
        </div>
      </div>

      {/* Difficulty */}
      <div className="flex gap-2">
        {(["easy","medium","hard"] as Difficulty[]).map(d=>(
          <button key={d} onClick={()=>{setDiff(d);startNew(d)}}
            className="px-3 py-1 rounded-lg font-mono text-xs transition-colors"
            style={{background:diff===d?primary:"#27272a",color:diff===d?"#000":"#888"}}>
            {d}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="relative w-full" style={{maxWidth:360}}>
        <div className="grid" style={{gridTemplateColumns:"repeat(9,1fr)",gap:1,background:"#333",border:"2px solid #555",borderRadius:8,overflow:"hidden"}}>
          {board.map((row,r)=>row.map((val,c)=>{
            const isSelected=sr===r&&sc===c
            const isSameNum=val>0&&val===board[sr]?.[sc]
            const isHighlight=(sr===r||sc===c||(Math.floor(sr/3)===Math.floor(r/3)&&Math.floor(sc/3)===Math.floor(c/3)))&&!isSelected
            const isErr=errors.has(`${r},${c}`)
            const rightBorder=c===2||c===5
            const bottomBorder=r===2||r===5
            return (
              <button key={`${r}-${c}`}
                onClick={()=>setSelected([r,c])}
                className="flex items-center justify-center aspect-square font-mono font-bold transition-colors"
                style={{
                  fontSize:"clamp(10px,3vw,18px)",
                  background:isSelected?primary:isSameNum?primary+"33":isHighlight?"#1f1f1f":"#111",
                  color:isErr?"#ef4444":isSelected?"#000":given[r]?.[c]?"#e4e4e7":"#60a5fa",
                  borderRight:rightBorder?"2px solid #555":"none",
                  borderBottom:bottomBorder?"2px solid #555":"none",
                  fontWeight: given[r]?.[c] ? "700" : "400",
                }}>
                {val||""}
              </button>
            )
          }))}
        </div>
        {won&&(
          <div className="absolute inset-0 rounded-lg flex flex-col items-center justify-center gap-2 bg-black/75">
            <p className="font-bold text-2xl text-yellow-400">🎉 Solved!</p>
            <p className="font-mono text-sm text-muted-foreground">{fmt(time)}</p>
            {hs>0&&<p className="font-mono text-xs" style={{color:primary}}>best:{fmt(hs)}</p>}
            <button onClick={()=>startNew(diff)} className="mt-1 px-5 py-2 rounded-lg font-mono text-sm bg-primary text-primary-foreground">new game</button>
          </div>
        )}
      </div>

      {/* Number pad */}
      <div className="flex gap-2">
        {[1,2,3,4,5,6,7,8,9].map(n=>(
          <button key={n} onClick={()=>input(n)}
            className="w-9 h-9 rounded-lg font-mono font-bold text-sm transition-colors"
            style={{background:"#27272a",color:"#e4e4e7"}}>
            {n}
          </button>
        ))}
        <button onClick={()=>input(0)} className="w-9 h-9 rounded-lg font-mono text-xs" style={{background:"#27272a",color:"#888"}}>✕</button>
      </div>
      <p className="font-mono text-xs text-muted-foreground">click cell then type · arrows to move</p>
    </div>
  )
}

