"use client"
import { useState, useCallback, useEffect } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const WORDS = ["javascript","typescript","component","function","variable","interface","algorithm","database","keyboard","terminal","framework","software","network","browser","template","elephant","dolphin","python","galaxy","oxygen","jungle","wizard","castle","mirror","pillow","fabric","guitar","planet","bridge","frozen","spring","winter","summer","autumn","forest","desert","ocean","river","mountain","thunder","lightning"]
const MAX = 6

function HangmanSVG({ wrong }: { wrong: number }) {
  return (
    <svg width={120} height={130} className="stroke-foreground" strokeWidth={2.5} strokeLinecap="round" fill="none">
      {/* gallows */}
      <line x1={10} y1={125} x2={110} y2={125}/>
      <line x1={30} y1={125} x2={30} y2={10}/>
      <line x1={30} y1={10} x2={75} y2={10}/>
      <line x1={75} y1={10} x2={75} y2={25}/>
      {/* head */}{wrong>0&&<circle cx={75} cy={35} r={10}/>}
      {/* body */}{wrong>1&&<line x1={75} y1={45} x2={75} y2={85}/>}
      {/* left arm */}{wrong>2&&<line x1={75} y1={55} x2={55} y2={70}/>}
      {/* right arm */}{wrong>3&&<line x1={75} y1={55} x2={95} y2={70}/>}
      {/* left leg */}{wrong>4&&<line x1={75} y1={85} x2={55} y2={105}/>}
      {/* right leg */}{wrong>5&&<line x1={75} y1={85} x2={95} y2={105}/>}
    </svg>
  )
}

export function HangmanGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [word, setWord] = useState("")
  const [guessed, setGuessed] = useState(new Set<string>())
  const [won, setWon] = useState(false)
  const [lost, setLost] = useState(false)
  const [hs, setHs] = useState(()=>loadHS()["hangman"]??0)

  const newGame = useCallback(()=>{
    setWord(WORDS[Math.floor(Math.random()*WORDS.length)].toUpperCase())
    setGuessed(new Set()); setWon(false); setLost(false)
  },[])

  useEffect(()=>newGame(),[])// eslint-disable-line

  const wrong = [...guessed].filter(c=>!word.includes(c)).length
  const revealed = word.split("").every(c=>guessed.has(c))

  const guess = useCallback((c: string)=>{
    if(won||lost||guessed.has(c)) return
    const ng=new Set(guessed); ng.add(c); setGuessed(ng)
    const newWrong=[...ng].filter(ch=>!word.includes(ch)).length
    if(newWrong>=MAX){ setLost(true); saveHS("hangman",0) }
    else if(word.split("").every(ch=>ng.has(ch))){
      setWon(true)
      const score=MAX-newWrong
      setHs(h=>{ const best=Math.max(h,score); saveHS("hangman",best); return best })
    }
  },[won,lost,guessed,word])

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{if(/^[a-zA-Z]$/.test(e.key))guess(e.key.toUpperCase())}
    window.addEventListener("keydown",onKey); return()=>window.removeEventListener("keydown",onKey)
  },[guess])

  const ALPHA="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5"/> back</button>
        <div className="flex items-center gap-3 font-mono text-xs">
          {hs>0&&<span className="text-muted-foreground">best:{hs}/6</span>}
          <button onClick={newGame} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5"/></button>
        </div>
      </div>

      <HangmanSVG wrong={wrong}/>

      {/* word display */}
      <div className="flex gap-2 flex-wrap justify-center">
        {word.split("").map((c,i)=>(
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="font-mono font-bold text-xl" style={{color:guessed.has(c)?primary:"transparent",minWidth:20,textAlign:"center"}}>
              {guessed.has(c)||lost?c:"_"}
            </span>
            <div className="h-0.5 w-5 rounded" style={{background:"#555"}}/>
          </div>
        ))}
      </div>

      <p className="font-mono text-sm text-muted-foreground">{MAX-wrong} guesses left</p>

      {/* keyboard */}
      <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
        {ALPHA.map(c=>{
          const isWrong=guessed.has(c)&&!word.includes(c)
          const isCorrect=guessed.has(c)&&word.includes(c)
          return (
            <button key={c} onClick={()=>guess(c)} disabled={guessed.has(c)||won||lost}
              className="w-9 h-9 rounded-lg font-mono font-bold text-sm transition-colors"
              style={{background:isCorrect?primary:isWrong?"#3f3f46":"#27272a",color:isCorrect?"#000":isWrong?"#555":"#e4e4e7"}}>
              {c}
            </button>
          )
        })}
      </div>

      {(won||lost)&&(
        <div className="text-center">
          {won?<p className="font-mono font-bold text-green-400">🎉 Correct!</p>:<p className="font-mono font-bold text-red-400">💀 The word was: <span style={{color:primary}}>{word}</span></p>}
          <button onClick={newGame} className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm">new word</button>
        </div>
      )}
    </div>
  )
}

