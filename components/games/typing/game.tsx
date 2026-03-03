"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { saveHS, loadHS } from "../helpers"

const WORDS = ["programming","javascript","keyboard","developer","computer","interface","algorithm","function","variable","console","typescript","framework","component","database","network","browser","software","hardware","terminal","monitor","abstract","beautiful","challenge","creative","different","efficient","flexible","generate","highlight","important","language","mountain","notebook","optimise","platform","quickly","reliable","solution","template","ultimate","validate","workflow","exercise","fountain","graphics","hospital","industry","journey","kitchen","lateral","machine","natural","operate","picture","quarter","running","storage","transit","uniform","venture","western","zealous","archive","balance","capture","decimal","element","fixture","granite","harvest","impulse","justify"]

export function TypingGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [words, setWords] = useState<string[]>([])
  const [typed, setTyped] = useState("")
  const [wordIdx, setWordIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [hs, setHs] = useState(()=>loadHS()["typing"]??0)
  const inputRef = useRef<HTMLInputElement>(null)
  const wordsRef = useRef<HTMLDivElement>(null)
  const activeWordRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const correctRef = useRef(0)

  const genWords = useCallback(() => {
    const shuffled=[...WORDS].sort(()=>Math.random()-0.5)
    return Array.from({length:120},(_,i)=>shuffled[i%shuffled.length])
  },[])

  const reset = useCallback(()=>{
    if(timerRef.current) clearInterval(timerRef.current)
    const w = genWords()
    setWords(w); setTyped(""); setWordIdx(0); setCorrect(0); setWrong(0)
    setStarted(false); setFinished(false); setTimeLeft(60)
    correctRef.current = 0
    setHs(loadHS()["typing"]??0)
    setTimeout(()=>inputRef.current?.focus(),50)
  },[genWords])

  useEffect(()=>{reset()},[]) // eslint-disable-line

  // auto-scroll to keep current word visible
  useEffect(()=>{
    if(activeWordRef.current && wordsRef.current){
      const wordEl = activeWordRef.current
      const container = wordsRef.current
      const wordTop = wordEl.offsetTop
      const wordBottom = wordTop + wordEl.offsetHeight
      const containerHeight = container.clientHeight
      // scroll so active word is in the top third of the container
      if(wordTop > containerHeight * 0.55 || wordBottom > container.scrollTop + containerHeight){
        container.scrollTop = wordTop - containerHeight * 0.3
      }
    }
  },[wordIdx])

  const onType = useCallback((e: React.ChangeEvent<HTMLInputElement>)=>{
    const val=e.target.value
    if(finished) return
    if(!started){
      setStarted(true)
      timerRef.current=setInterval(()=>{
        setTimeLeft(t=>{
          if(t<=1){
            if(timerRef.current) clearInterval(timerRef.current)
            setFinished(true)
            const finalWpm = correctRef.current
            saveHS("typing", Math.max(loadHS()["typing"]??0, finalWpm))
            setHs(h=>Math.max(h, finalWpm))
            return 0
          }
          return t-1
        })
      },1000)
    }
    if(val.endsWith(" ")){
      const word=val.trim()
      if(word===words[wordIdx]){ setCorrect(c=>{correctRef.current=c+1;return c+1}) }
      else setWrong(w=>w+1)
      setWordIdx(i=>i+1); setTyped("")
    } else {
      setTyped(val)
    }
  },[started,finished,words,wordIdx])

  const onPaste = useCallback((e: React.ClipboardEvent)=>{ e.preventDefault() },[])

  const wpm = finished ? correctRef.current : Math.round(correct / Math.max(1,(60-timeLeft)/60))
  const acc = correct+wrong>0?Math.round(correct/(correct+wrong)*100):100

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"><ChevronLeft className="h-3.5 w-3.5"/> back</button>
        <div className="flex items-center gap-4 font-mono text-xs">
          <span style={{color:primary}} className="text-lg font-bold">{timeLeft}s</span>
          {started&&!finished&&<span className="text-muted-foreground">{wpm} wpm</span>}
          {hs>0&&<span className="text-muted-foreground">best:{hs} wpm</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary"><RotateCcw className="h-3.5 w-3.5"/></button>
        </div>
      </div>

      {/* Words display + result overlay wrapper */}
      <div className="relative w-full">
        <div
          ref={wordsRef}
          className="relative w-full rounded-xl bg-zinc-900 p-5 font-mono text-base leading-relaxed select-none"
          style={{height:130, overflowY: finished ? "hidden" : "hidden", overflowX:"hidden"}}
        >
          <div className="flex flex-wrap gap-x-2 gap-y-2">
            {words.slice(0, wordIdx + 30).map((w,i)=>{
              const isPast = i < wordIdx
              const isCurrent = i === wordIdx
              let color = "#555"
              if(isPast) color = "#22c55e"
              if(isCurrent){
                const match = typed === w.slice(0, typed.length)
                color = match ? "#e4e4e7" : "#ef4444"
              }
              return (
                <span
                  key={i}
                  ref={isCurrent ? activeWordRef : undefined}
                  className="transition-colors"
                  style={{
                    color,
                    textDecorationLine: isCurrent ? "underline" : "none",
                    textDecorationColor: isCurrent ? primary : "transparent",
                    textUnderlineOffset: "3px",
                    fontWeight: isCurrent ? "600" : "400",
                  }}
                >{w}</span>
              )
            })}
          </div>
        </div>
        {/* Result overlay - sits on top, not clipped */}
        {finished&&(
          <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-3 bg-zinc-900/95 border border-primary/30 z-10">
            <p className="font-mono font-bold text-3xl" style={{color:primary}}>{correctRef.current} WPM</p>
            <p className="font-mono text-sm text-muted-foreground">accuracy: {acc}% · words: {correct}/{correct+wrong}</p>
            {hs>0&&<p className="font-mono text-xs" style={{color:primary}}>best: {hs} wpm</p>}
            <button onClick={reset} className="mt-1 px-6 py-2.5 rounded-lg font-mono text-sm font-bold transition-colors hover:opacity-90"
              style={{background:primary,color:"#000"}}>try again</button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        value={typed}
        onChange={onType}
        onPaste={onPaste}
        disabled={finished}
        className="w-full rounded-xl border border-primary/30 bg-zinc-900 px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
        placeholder={started?"type the highlighted word…":"start typing to begin…"}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <p className="font-mono text-xs text-muted-foreground">type words · press space to advance · 60s test · no pasting allowed</p>
    </div>
  )
}

