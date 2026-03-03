"use client"
import { useState, useCallback } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const CATEGORIES = [
  {id:"ones",label:"Ones",desc:"Sum of 1s"},{id:"twos",label:"Twos",desc:"Sum of 2s"},{id:"threes",label:"Threes",desc:"Sum of 3s"},
  {id:"fours",label:"Fours",desc:"Sum of 4s"},{id:"fives",label:"Fives",desc:"Sum of 5s"},{id:"sixes",label:"Sixes",desc:"Sum of 6s"},
  {id:"three_oak",label:"3 of a Kind",desc:"Sum of all"},{id:"four_oak",label:"4 of a Kind",desc:"Sum of all"},
  {id:"full_house",label:"Full House",desc:"25 pts"},{id:"sm_straight",label:"Sm. Straight",desc:"30 pts"},
  {id:"lg_straight",label:"Lg. Straight",desc:"40 pts"},{id:"yahtzee",label:"Yahtzee",desc:"50 pts"},
  {id:"chance",label:"Chance",desc:"Sum of all"},
]

function score(cat:string,dice:number[]): number {
  const counts=Array(7).fill(0); dice.forEach(d=>counts[d]++)
  const sorted=[...dice].sort()
  const sum=dice.reduce((a,b)=>a+b,0)
  if(cat==="ones") return counts[1]
  if(cat==="twos") return counts[2]*2
  if(cat==="threes") return counts[3]*3
  if(cat==="fours") return counts[4]*4
  if(cat==="fives") return counts[5]*5
  if(cat==="sixes") return counts[6]*6
  if(cat==="three_oak") return counts.some(c=>c>=3)?sum:0
  if(cat==="four_oak") return counts.some(c=>c>=4)?sum:0
  if(cat==="full_house"){ const vals=counts.filter(c=>c>0); return vals.length===2&&(vals[0]===2||vals[0]===3)?25:0 }
  if(cat==="sm_straight"){
    const u=new Set(dice)
    const straights=[[1,2,3,4],[2,3,4,5],[3,4,5,6]]
    return straights.some(s=>s.every(v=>u.has(v)))?30:0
  }
  if(cat==="lg_straight") return(sorted.join("")==="12345"||sorted.join("")==="23456")?40:0
  if(cat==="yahtzee") return counts.some(c=>c===5)?50:0
  if(cat==="chance") return sum
  return 0
}

export function YahtzeeGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [dice,setDice]=useState([1,1,1,1,1])
  const [held,setHeld]=useState([false,false,false,false,false])
  const [rolls,setRolls]=useState(0)
  const [scores,setScores]=useState<Record<string,number|null>>({})
  const [hs,setHs]=useState(()=>loadHS()["yahtzee"]??0)

  const roll=useCallback(()=>{
    if(rolls>=3) return
    setDice(d=>d.map((v,i)=>held[i]?v:Math.floor(Math.random()*6)+1))
    setRolls(r=>r+1)
  },[rolls,held])

  const toggleHold=useCallback((i:number)=>{ if(rolls===0) return; setHeld(h=>{const nh=[...h];nh[i]=!nh[i];return nh}) },[rolls])

  const pickCat=useCallback((cat:string)=>{
    if(scores[cat]!==undefined||rolls===0) return
    const s=score(cat,dice)
    const ns={...scores,[cat]:s}
    setScores(ns)
    setDice([1,1,1,1,1]); setHeld([false,false,false,false,false]); setRolls(0)
    if(Object.keys(ns).length===CATEGORIES.length){
      let total=Object.values(ns).reduce((a:number,b)=>a+(b??0),0) as number
      const upper=["ones","twos","threes","fours","fives","sixes"].reduce((a,k)=>a+(ns[k]??0),0)
      if(upper>=63) total+=35
      setHs(h=>{const best=Math.max(h,total);saveHS("yahtzee",best);return best})
    }
  },[scores,rolls,dice])

  const reset=useCallback(()=>{setDice([1,1,1,1,1]);setHeld([false,false,false,false,false]);setRolls(0);setScores({})},[])

  const PIPS: Record<number,[number,number][]> = {
    1:[[50,50]],2:[[25,25],[75,75]],3:[[25,25],[50,50],[75,75]],
    4:[[25,25],[75,25],[25,75],[75,75]],5:[[25,25],[75,25],[50,50],[25,75],[75,75]],
    6:[[25,20],[75,20],[25,50],[75,50],[25,80],[75,80]]
  }

  const done=Object.keys(scores).length===CATEGORIES.length
  const total=Object.values(scores).reduce((a:number,b)=>a+(b??0),0) as number
  const upper=["ones","twos","threes","fours","fives","sixes"].reduce((a,k)=>a+(scores[k]??0),0)

  return(
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5"/> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          {hs>0&&<span className="text-muted-foreground">best:{hs}</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5"/></button>
        </div>
      </div>

      {/* Dice */}
      <div className="flex gap-3">
        {dice.map((d,i)=>(
          <button key={i} onClick={()=>toggleHold(i)}
            className="relative rounded-xl transition-all"
            style={{width:60,height:60,background:held[i]?primary+"33":"#1a1a1a",border:`2px solid ${held[i]?primary:"#333"}`}}>
            <svg width={60} height={60}>
              {(PIPS[d]||[]).map(([px,py],pi)=>(
                <circle key={pi} cx={px*0.6} cy={py*0.6} r={5} fill={held[i]?primary:"#e4e4e7"}/>
              ))}
            </svg>
            {held[i]&&<span className="absolute -top-1 -right-1 text-xs" style={{color:primary}}>●</span>}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={roll} disabled={rolls>=3||done}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono font-bold text-sm disabled:opacity-40">
          Roll ({3-rolls} left)
        </button>
        <span className="font-mono text-xs text-muted-foreground">total: {total}{upper>=63?" +35 bonus":""}</span>
      </div>

      {/* Score card */}
      <div className="w-full grid grid-cols-2 gap-1.5">
        {CATEGORIES.map(({id,label,desc})=>{
          const val=scores[id]
          const preview=rolls>0&&val===undefined?score(id,dice):null
          return(
            <button key={id} onClick={()=>pickCat(id)} disabled={val!==undefined||rolls===0}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors"
              style={{background:val!==undefined?"#1a1a1a":"#27272a",border:`1px solid ${val!==undefined?"#333":preview!==null&&preview>0?primary+"44":"#3f3f46"}`}}>
              <div>
                <p className="font-mono text-xs font-bold" style={{color:val!==undefined?"#555":primary}}>{label}</p>
                <p className="font-mono text-[10px] text-zinc-600">{desc}</p>
              </div>
              <span className="font-mono font-bold text-sm" style={{color:val!==undefined?"#888":preview!==null?"#fbbf24":primary}}>
                {val??preview??"-"}
              </span>
            </button>
          )
        })}
      </div>

      {done&&(
        <div className="text-center">
          <p className="font-mono font-bold text-2xl" style={{color:primary}}>Final: {total+(upper>=63?35:0)}</p>
          {upper>=63&&<p className="font-mono text-xs text-green-400">+35 upper bonus!</p>}
          <button onClick={reset} className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">new game</button>
        </div>
      )}
    </div>
  )
}

