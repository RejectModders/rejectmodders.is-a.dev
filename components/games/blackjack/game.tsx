"use client"
import { useState, useCallback } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const SUITS=["♠","♥","♦","♣"], VALS=["A","2","3","4","5","6","7","8","9","10","J","Q","K"]
type Card={suit:string;val:string;hidden:boolean}

function cardValue(c:Card,total=0){
  if(["J","Q","K"].includes(c.val)) return 10
  if(c.val==="A") return total+11>21?1:11
  return parseInt(c.val)
}
function handTotal(hand:Card[]){
  let t=0,aces=0
  for(const c of hand){if(c.val==="A")aces++;else t+=cardValue(c)}
  for(let i=0;i<aces;i++) t+=t+11>21?1:11
  return t
}
function freshDeck():Card[]{
  const d:Card[]=[]
  for(const s of SUITS) for(const v of VALS) d.push({suit:s,val:v,hidden:false})
  for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}
  return d
}

export function BlackjackGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [deck,setDeck]=useState(freshDeck)
  const [player,setPlayer]=useState<Card[]>([])
  const [dealer,setDealer]=useState<Card[]>([])
  const [chips,setChips]=useState(100)
  const [bet,setBet]=useState(10)
  const [phase,setPhase]=useState<"bet"|"play"|"over">("bet")
  const [msg,setMsg]=useState("")
  const [hs,setHs]=useState(()=>loadHS()["blackjack"]??100)

  const deal=useCallback(()=>{
    if(bet>chips) return
    const d=freshDeck()
    const p=[d.pop()!,d.pop()!]
    const dl=[d.pop()!,{...d.pop()!,hidden:true as boolean}]
    setDeck(d);setPlayer(p);setDealer(dl);setPhase("play");setMsg("")
    // Check for natural blackjack
    if(handTotal(p)===21){
      // Reveal dealer card and resolve immediately
      const dlFull=dl.map(c=>({...c,hidden:false}))
      let newDl=[...dlFull]
      let dd=[...d]
      while(handTotal(newDl)<17){const c2=dd.pop()!;newDl=[...newDl,c2]}
      const dTotal=handTotal(newDl)
      setDealer(newDl); setDeck(dd)
      let result="", gain=0
      if(dTotal===21){result="Push — both Blackjack.";gain=0}
      else{result="Blackjack! 🎉";gain=Math.floor(bet*1.5)}
      const newChips=chips+gain
      setChips(newChips);setMsg(result);setPhase("over")
      setHs(h=>{const best=Math.max(h,newChips);saveHS("blackjack",best);return best})
    }
  },[bet,chips])

  const resolve=useCallback((p:Card[],dl:Card[],d:Card[],natural=false,overrideBet?:number)=>{
    const actualBet=overrideBet??bet
    const pTotal=handTotal(p)
    const dlFull=dl.map(c=>({...c,hidden:false}))
    let newDl=[...dlFull]
    let dd=[...d]
    while(handTotal(newDl)<17){const c=dd.pop()!;newDl=[...newDl,c]}
    const dTotal=handTotal(newDl)
    setDealer(newDl)
    let result=""
    let gain=0
    if(pTotal>21){result="Bust! You lose.";gain=-actualBet}
    else if(dTotal>21){result="Dealer busts! You win!";gain=natural?Math.floor(actualBet*1.5):actualBet}
    else if(natural&&pTotal===21){result="Blackjack! 🎉";gain=Math.floor(actualBet*1.5)}
    else if(pTotal>dTotal){result="You win!";gain=actualBet}
    else if(pTotal===dTotal){result="Push.";gain=0}
    else{result="Dealer wins.";gain=-actualBet}
    const newChips=chips+gain
    setChips(newChips);setMsg(result);setPhase("over")
    setHs(h=>{const best=Math.max(h,newChips);saveHS("blackjack",best);return best})
  },[bet,chips])

  const hit=useCallback(()=>{
    const d=[...deck],c=d.pop()!
    const np=[...player,c]
    setDeck(d);setPlayer(np)
    if(handTotal(np)>=21) resolve(np,dealer,d)
  },[deck,player,dealer,resolve])

  const stand=useCallback(()=>resolve(player,dealer,deck),[player,dealer,deck,resolve])

  const double=useCallback(()=>{
    if(bet*2>chips) return
    const doubleBet=bet*2
    setBet(doubleBet)
    const d=[...deck],c=d.pop()!
    const np=[...player,c]
    setDeck(d);setPlayer(np)
    resolve(np,dealer,d,false,doubleBet)
  },[deck,player,dealer,resolve,bet,chips])

  const reset=useCallback(()=>{
    if(chips<=0) setChips(100)
    setPhase("bet");setMsg("");setPlayer([]);setDealer([])
  },[chips])

  const CardEl=({c}:{c:Card})=>{
    const red=c.suit==="♥"||c.suit==="♦"
    return(
      <div className="flex flex-col items-center justify-between rounded-lg border font-mono font-bold select-none"
        style={{width:52,height:76,background:c.hidden?"#1a1a1a":"#fff",borderColor:c.hidden?"#333":"#ddd",padding:"4px 6px",color:red?"#ef4444":"#111",fontSize:16}}>
        {c.hidden?<span style={{color:"#555",fontSize:24}}>?</span>:<><span className="self-start text-xs">{c.val}{c.suit}</span><span className="text-2xl">{c.suit}</span><span className="self-end text-xs rotate-180">{c.val}{c.suit}</span></>}
      </div>
    )
  }

  return(
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5"/> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span style={{color:primary}}>💰 {chips}</span>
          {hs>100&&<span className="text-muted-foreground">best:{hs}</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5"/></button>
        </div>
      </div>

      {/* Dealer */}
      {dealer.length>0&&(
        <div className="w-full">
          <p className="font-mono text-xs text-muted-foreground mb-2">dealer {phase==="over"?handTotal(dealer):""}</p>
          <div className="flex gap-2 flex-wrap">{dealer.map((c,i)=><CardEl key={i} c={c}/>)}</div>
        </div>
      )}

      {/* Player */}
      {player.length>0&&(
        <div className="w-full">
          <p className="font-mono text-xs text-muted-foreground mb-2">you — {handTotal(player)}</p>
          <div className="flex gap-2 flex-wrap">{player.map((c,i)=><CardEl key={i} c={c}/>)}</div>
        </div>
      )}

      {msg&&<p className="font-mono font-bold text-lg" style={{color:msg.includes("win")||msg.includes("Blackjack")?"#22c55e":msg.includes("Push")?"#fbbf24":"#ef4444"}}>{msg}</p>}

      {phase==="bet"&&(
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="font-mono text-sm text-muted-foreground">Place your bet</p>
          <div className="flex gap-2">
            {[5,10,25,50].map(b=>(
              <button key={b} onClick={()=>setBet(b)} disabled={b>chips}
                className="px-3 py-2 rounded-lg font-mono text-sm transition-colors"
                style={{background:bet===b?primary:"#27272a",color:bet===b?"#000":"#e4e4e7"}}>
                ${b}
              </button>
            ))}
          </div>
          <button onClick={deal} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-mono font-bold text-sm">
            Deal (bet ${bet})
          </button>
          {chips<=0&&<p className="font-mono text-xs text-red-400">Out of chips! Resetting…</p>}
        </div>
      )}

      {phase==="play"&&(
        <div className="flex gap-3">
          <button onClick={hit} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono font-bold text-sm">Hit</button>
          <button onClick={stand} className="px-5 py-2.5 rounded-xl border border-primary/40 text-primary font-mono font-bold text-sm">Stand</button>
          {player.length===2&&bet*2<=chips&&<button onClick={double} className="px-5 py-2.5 rounded-xl border border-primary/40 text-primary font-mono text-sm">Double</button>}
        </div>
      )}

      {phase==="over"&&(
        <button onClick={reset} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono font-bold text-sm">Next Hand</button>
      )}
    </div>
  )
}

