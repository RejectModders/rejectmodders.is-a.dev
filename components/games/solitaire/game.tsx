"use client"
import { useState, useCallback } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const SUITS=["♠","♥","♦","♣"] as const
const RANKS=["A","2","3","4","5","6","7","8","9","10","J","Q","K"] as const
type Suit=typeof SUITS[number]; type Rank=typeof RANKS[number]
type Card={suit:Suit;rank:Rank;up:boolean}
const RED=new Set(["♥","♦"])
const rankVal=(r:Rank)=>RANKS.indexOf(r)
const isRed=(s:Suit)=>RED.has(s)

function freshDeck():Card[]{
  const d:Card[]=[]
  for(const suit of SUITS) for(const rank of RANKS) d.push({suit,rank,up:false})
  for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}
  return d
}

function deal(deck:Card[]):{tableau:Card[][];stock:Card[];waste:Card[];found:Card[][]}{
  const d=[...deck]; const tableau:Card[][]=[]
  for(let i=0;i<7;i++){
    const col:Card[]=[]; for(let j=0;j<=i;j++) col.push({...d.pop()!,up:j===i})
    tableau.push(col)
  }
  return{tableau,stock:d.reverse().map(c=>({...c,up:false})),waste:[],found:[[],[],[],[]]}
}

export function SolitaireGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [state,setState]=useState(()=>deal(freshDeck()))
  const [sel,setSel]=useState<{from:string;idx:number}|null>(null)
  const [moves,setMoves]=useState(0)
  const [won,setWon]=useState(false)
  const [hs,setHs]=useState(()=>loadHS()["solitaire"]??0)

  const reset=useCallback(()=>{setState(deal(freshDeck()));setSel(null);setMoves(0);setWon(false)},[])

  const canStack=(top:Card,bottom:Card|undefined)=>{
    if(!bottom) return top.rank==="K"
    return isRed(top.suit)!==isRed(bottom.suit)&&rankVal(top.rank)===rankVal(bottom.rank)-1
  }
  const canFoundation=(card:Card,pile:Card[])=>{
    if(!pile.length) return card.rank==="A"
    return card.suit===pile[pile.length-1].suit&&rankVal(card.rank)===rankVal(pile[pile.length-1].rank)+1
  }

  const getCards=(st:typeof state,from:string,idx:number):Card[]=>{
    if(from==="waste") return[st.waste[st.waste.length-1]]
    if(from.startsWith("f")) return[st.found[parseInt(from[1])][st.found[parseInt(from[1])].length-1]]
    const col=parseInt(from.slice(1)); return st.tableau[col].slice(idx)
  }

  const tryAutoFoundation=(st:typeof state):typeof state=>{
    let changed=true; let s={...st,tableau:st.tableau.map(c=>[...c]),found:st.found.map(c=>[...c]),waste:[...st.waste]}
    // Only auto-move cards that are "safe" — Aces, 2s, and cards where both opposite-color
    // foundation piles have at least rank-1 already (so the card can't be useful for stacking)
    const isSafe=(card:Card,found:Card[][])=>{
      if(card.rank==="A"||card.rank==="2") return true
      const val=rankVal(card.rank)
      const cardIsRed=isRed(card.suit)
      // Check that both opposite-colored foundation piles have at least val-1
      const oppSuits=SUITS.filter(s=>isRed(s)!==cardIsRed)
      return oppSuits.every(os=>{
        const fi=SUITS.indexOf(os)
        return found[fi].length>=val-1
      })
    }
    while(changed){changed=false
      for(let col=0;col<7;col++){
        const col2=s.tableau[col]; if(!col2.length||!col2[col2.length-1].up) continue
        const card=col2[col2.length-1]
        const fi=SUITS.indexOf(card.suit)
        if(canFoundation(card,s.found[fi])&&isSafe(card,s.found)){
          s.found[fi]=[...s.found[fi],{...card}]; s.tableau[col]=col2.slice(0,-1)
          if(s.tableau[col].length) s.tableau[col][s.tableau[col].length-1].up=true
          changed=true
        }
      }
      if(s.waste.length){
        const card=s.waste[s.waste.length-1]; const fi=SUITS.indexOf(card.suit)
        if(canFoundation(card,s.found[fi])&&isSafe(card,s.found)){
          s.found[fi]=[...s.found[fi],{...card}]; s.waste=s.waste.slice(0,-1); changed=true
        }
      }
    }
    return s
  }

  const click=(from:string,idx:number)=>{
    setState(prev=>{
      const s={...prev,tableau:prev.tableau.map(c=>[...c]),found:prev.found.map(c=>[...c]),waste:[...prev.waste],stock:[...prev.stock]}

      // click stock
      if(from==="stock"){
        if(s.stock.length){s.waste=[...s.waste,{...s.stock.pop()!,up:true}]}
        else{s.stock=s.waste.reverse().map(c=>({...c,up:false}));s.waste=[]}
        setSel(null); return s
      }

      const cards=getCards(s,from,idx)
      if(!cards.length||!cards[0].up){setSel(null);return s}

      // try to place on foundation (single card only)
      if(cards.length===1){
        for(let fi=0;fi<4;fi++){
          if(canFoundation(cards[0],s.found[fi])){
            s.found[fi]=[...s.found[fi],{...cards[0]}]
            if(from==="waste") s.waste=s.waste.slice(0,-1)
            else if(from.startsWith("t")){const col=parseInt(from[1]);s.tableau[col]=s.tableau[col].slice(0,-1);if(s.tableau[col].length)s.tableau[col][s.tableau[col].length-1].up=true}
            setSel(null); setMoves(m=>m+1)
            const ns=tryAutoFoundation(s)
            const w=ns.found.every(p=>p.length===13); if(w){setWon(true);saveHS("solitaire",1);setHs(1)}
            return ns
          }
        }
      }

      // if we have a selection, try to place
      if(sel&&sel.from!==from){
        const selCards=getCards(s,sel.from,sel.idx)
        if(from.startsWith("t")){
          const col=parseInt(from[1]); const dest=s.tableau[col]
          if(canStack(selCards[0],dest[dest.length-1])){
            s.tableau[col]=[...dest,...selCards]
            if(sel.from.startsWith("t")){const sc=parseInt(sel.from[1]);s.tableau[sc]=s.tableau[sc].slice(0,sel.idx);if(s.tableau[sc].length)s.tableau[sc][s.tableau[sc].length-1].up=true}
            else if(sel.from==="waste") s.waste=s.waste.slice(0,-1)
            setSel(null); setMoves(m=>m+1); return tryAutoFoundation(s)
          }
        }
        setSel(null); return s
      }

      setSel({from,idx}); return s
    })
  }

  const CardEl=({card,small=false,selected=false,onClick}:{card:Card;small?:boolean;selected?:boolean;onClick:()=>void})=>{
    if(!card.up) return<div className="rounded border border-zinc-700 select-none" style={{width:small?40:52,height:small?28:72,background:"#1a3a8f",cursor:"default"}}/>
    return(
      <button onClick={onClick} className="rounded border font-mono font-bold select-none transition-all active:scale-95" style={{width:small?40:52,height:small?28:72,background:selected?"#fbbf2422":"#fff",borderColor:selected?primary:"#ddd",padding:"2px 4px",display:"flex",flexDirection:"column",justifyContent:"space-between",color:isRed(card.suit)?"#ef4444":"#111",fontSize:small?10:12,boxShadow:selected?`0 0 8px ${primary}`:"none"}}>
        <span>{card.rank}{card.suit}</span>
        {!small&&<span className="self-end rotate-180">{card.rank}{card.suit}</span>}
      </button>
    )
  }

  const isSelected=(from:string,idx:number)=>sel?.from===from&&sel?.idx<=idx

  return(
    <div className="flex flex-col items-center gap-3 w-full max-w-2xl mx-auto overflow-x-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5"/> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-muted-foreground">moves: {moves}</span>
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5"/></button>
        </div>
      </div>

      {/* Top row: stock, waste, foundations */}
      <div className="flex gap-2 w-full overflow-x-auto pb-1">
        {/* Stock */}
        <button onClick={()=>click("stock",0)} className="rounded border border-zinc-700 flex items-center justify-center font-mono text-xs text-zinc-500 shrink-0" style={{width:52,height:72,background:"#1a3a8f"}}>
          {state.stock.length?state.stock.length:"↺"}
        </button>
        {/* Waste */}
        <div className="shrink-0" style={{width:52,height:72}}>
          {state.waste.length?<CardEl card={state.waste[state.waste.length-1]} selected={sel?.from==="waste"} onClick={()=>click("waste",0)}/>:<div className="rounded border border-dashed border-zinc-700" style={{width:52,height:72}}/>}
        </div>
        <div className="flex-1"/>
        {/* Foundations */}
        {SUITS.map((suit,fi)=>(
          <div key={fi} className="shrink-0" style={{width:52,height:72}}>
            {state.found[fi].length
              ?<CardEl card={state.found[fi][state.found[fi].length-1]} onClick={()=>{}} selected={false}/>
              :<div className="rounded border border-dashed border-zinc-700 flex items-center justify-center font-mono text-zinc-600" style={{width:52,height:72}}>{suit}</div>}
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className="flex gap-2 w-full overflow-x-auto pb-2">
        {state.tableau.map((col,ci)=>(
          <div key={ci} className="relative shrink-0" style={{width:52,minHeight:72}}>
            {col.length===0&&<button onClick={()=>click(`t${ci}`,0)} className="rounded border border-dashed border-zinc-700 absolute" style={{width:52,height:72}}/>}
            {col.map((card,idx)=>(
              <div key={idx} className="absolute" style={{top:idx*18,zIndex:idx}}>
                <CardEl card={card} selected={isSelected(`t${ci}`,idx)} onClick={()=>click(`t${ci}`,idx)}/>
              </div>
            ))}
            {/* Invisible area to drop on empty */}
            {col.length>0&&<div style={{height:col.length*18+72}}/>}
          </div>
        ))}
      </div>

      {won&&<div className="text-center"><p className="font-mono font-bold text-2xl text-yellow-400">🎉 You Win!</p><button onClick={reset} className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">new game</button></div>}
      <p className="font-mono text-xs text-muted-foreground">click a card to select, click destination to move · click stock to draw</p>
    </div>
  )
}

