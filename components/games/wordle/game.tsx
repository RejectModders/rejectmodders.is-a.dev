"use client"
import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, RotateCcw } from "lucide-react"
import { loadHS, saveHS } from "../helpers"

const WORDS = ["CRANE","SLATE","STARE","TRACE","CRATE","BLAZE","FROST","GRIND","PLUMB","SHIRE","TROVE","GLINT","FJORD","STOMP","BLAND","CRISP","FLOWN","GRIPE","CHUNK","DWARF","KNEEL","SHRUG","TRYST","WHIFF","VINYL","OXIDE","PIXIE","QUOTA","JAZZY","GLYPH","SPEAK","BIRTH","CLOTH","DRINK","FUNNY","GIANT","HAPPY","INPUT","JOUST","KNOWN","LOCAL","MOVER","NIGHT","OFTEN","PROXY","QUERY","ROCKY","SHELF","TREND","UNTIL","VIGOR","WITTY","XENON","YACHT","ZONAL","ABBEY","BLUNT","CHEST","DOVER","EMBER","FLAIR","GROAN","HOIST","INDEX","JUMPY","KNACK","LURCH","MIRTH","NAVAL","OCEAN","PLEAD","QUART","RIVET","SCALP","THROW","USHER","VENOM","WHELP","EXPEL","YEARN","ZILCH"]
// Extended list of accepted guesses (common 5-letter English words)
const EXTRA_VALID = ["ABOUT","ABOVE","ABUSE","ACTOR","ACUTE","ADMIT","ADOPT","ADULT","AFTER","AGAIN","AGENT","AGREE","AHEAD","ALARM","ALBUM","ALERT","ALIEN","ALIGN","ALIKE","ALIVE","ALLEY","ALLOW","ALONE","ALONG","ALTER","AMONG","ANGEL","ANGER","ANGLE","ANGRY","ANKLE","APART","APPLE","APPLY","ARENA","ARGUE","ARISE","ARROW","ASIDE","ASSET","AVOID","AWARD","AWARE","BADLY","BAKER","BASES","BASIC","BASIS","BEACH","BEGAN","BEGIN","BEGUN","BEING","BELOW","BENCH","BERRY","BIBLE","BLADE","BLAME","BLANK","BLAST","BLEED","BLEND","BLESS","BLIND","BLOCK","BLOOD","BLOWN","BOARD","BOOST","BOUND","BRAIN","BRAND","BRAVE","BREAD","BREAK","BREED","BRICK","BRIEF","BRING","BROAD","BROKE","BROOK","BROWN","BRUSH","BUILD","BUILT","BUNCH","BURST","BUYER","CABIN","CANDY","CARRY","CATCH","CAUSE","CHAIN","CHAIR","CHAOS","CHARM","CHART","CHASE","CHEAP","CHECK","CHEEK","CHEER","CHIEF","CHILD","CHINA","CHOIR","CHOSE","CIVIL","CLAIM","CLASS","CLEAN","CLEAR","CLIMB","CLING","CLOCK","CLONE","CLOSE","CLOUD","COACH","COAST","COLOR","COMET","COMIC","CORAL","COUCH","COUNT","COURT","COVER","CRACK","CRAFT","CRASH","CRAZY","CREAM","CRIME","CROSS","CROWD","CRUEL","CRUSH","CURVE","CYCLE","DAILY","DANCE","DEATH","DEBUT","DELAY","DENSE","DEPOT","DEPTH","DERBY","DEVIL","DIARY","DIRTY","DOING","DONOR","DOUBT","DOUGH","DRAFT","DRAIN","DRAKE","DRAMA","DRANK","DRAWN","DREAM","DRESS","DRIED","DRIFT","DRILL","DRIVE","DROIT","DRONE","DROWN","DYING","EAGER","EARLY","EARTH","EATEN","EIGHT","ELECT","ELITE","EMPTY","ENEMY","ENJOY","ENTER","ENTRY","EQUAL","ERROR","EVENT","EVERY","EXACT","EXERT","EXIST","EXTRA","FAITH","FALLS","FALSE","FANCY","FATAL","FAULT","FEAST","FENCE","FERRY","FEVER","FEWER","FIBER","FIELD","FIFTH","FIFTY","FIGHT","FINAL","FIRST","FIXED","FLAME","FLASH","FLEET","FLESH","FLIES","FLOAT","FLOOD","FLOOR","FLOUR","FLUID","FLUSH","FOCAL","FOCUS","FOLLY","FORCE","FORGE","FORTH","FORTY","FORUM","FOUND","FRAME","FRANK","FRAUD","FRESH","FRONT","FROZE","FRUIT","FULLY","GAMMA","GAUGE","GENRE","GHOST","GIVEN","GLAND","GLASS","GLOBE","GLOOM","GLORY","GLOVE","GOING","GRACE","GRADE","GRAIN","GRAND","GRANT","GRAPE","GRASP","GRASS","GRAVE","GREAT","GREEN","GREET","GRIEF","GROSS","GROUP","GROVE","GROWN","GUARD","GUESS","GUIDE","GUILT","HABIT","HARSH","HAVEN","HEART","HEAVY","HELLO","HENCE","HONEY","HONOR","HORSE","HOTEL","HOUSE","HUMAN","HUMOR","HURRY","IDEAL","IMAGE","IMPLY","INDIA","INDIE","INNER","ISSUE","IVORY","JAPAN","JENNY","JEWEL","JIMMY","JOINT","JONES","JUDGE","JUICE","JUICY","KARMA","KAYAK","LABEL","LABOR","LARGE","LASER","LATER","LAUGH","LAYER","LEARN","LEASE","LEAST","LEAVE","LEGAL","LEMON","LEVEL","LEVER","LIGHT","LIMIT","LINED","LINEN","LIVER","LOBBY","LOOSE","LOVER","LOWER","LOYAL","LUCKY","LUNCH","LYING","MAGIC","MAGIC","MAJOR","MAKER","MANGA","MANOR","MAPLE","MARCH","MARRY","MARSH","MASON","MATCH","MAYBE","MAYOR","MEANT","MEDIA","MELEE","MERCY","MERGE","MERIT","METAL","METER","MIDST","MIGHT","MINOR","MINUS","MIXED","MODEL","MONEY","MONTH","MORAL","MOTEL","MOTOR","MOUNT","MOUSE","MOUTH","MOVIE","MUDDY","MULTI","MUSIC","NAIVE","NERVE","NEVER","NEWLY","NOBLE","NOISE","NORTH","NOTED","NOVEL","NURSE","NYLON","OCCUR","OFFER","ORDER","ORGAN","OTHER","OUGHT","OUTER","OWNED","OWNER","OXIDE","OZONE","PAINT","PANEL","PANIC","PAPER","PARTY","PASTA","PATCH","PAUSE","PEACE","PEARL","PENNY","PERCH","PERIL","PHASE","PHONE","PHOTO","PIANO","PIECE","PILOT","PINCH","PITCH","PIVOT","PIXEL","PLACE","PLAIN","PLANE","PLANT","PLATE","PLAZA","PLEAD","PLEAT","PLUCK","PLUMB","PLUMP","POINT","POLAR","POSED","POUND","POWER","PRESS","PRICE","PRIDE","PRIME","PRINT","PRIOR","PRIZE","PROBE","PRONE","PROOF","PROUD","PROVE","PSALM","PULSE","PUNCH","PUPIL","PURSE","QUEST","QUEUE","QUICK","QUIET","QUITE","RABBI","RADAR","RADIO","RAISE","RALLY","RANCH","RANGE","RAPID","RATIO","REACH","REACT","READY","REALM","REBEL","REFER","REIGN","RELAX","REPLY","RIDER","RIDGE","RIFLE","RIGHT","RIGID","RINSE","RISKY","RIVAL","RIVER","ROAST","ROBOT","ROMAN","ROUGE","ROUGH","ROUND","ROUTE","ROYAL","RUGBY","RUINS","RULER","RURAL","SAINT","SALAD","SAUCE","SAVED","SCALE","SCARF","SCENE","SCENT","SCOPE","SCORE","SCOUT","SCREW","SEIZE","SENSE","SERVE","SETUP","SEVEN","SHADE","SHAFT","SHAKE","SHALL","SHAME","SHAPE","SHARE","SHARP","SHAVE","SHEEP","SHEER","SHEET","SHELL","SHIFT","SHINE","SHIRT","SHOCK","SHOOT","SHORE","SHORT","SHOUT","SIGHT","SIGMA","SILLY","SINCE","SIXTH","SIXTY","SIZED","SKILL","SKULL","SLASH","SLAVE","SLEEP","SLICE","SLIDE","SLOPE","SMART","SMELL","SMILE","SMOKE","SNAKE","SOLAR","SOLID","SOLVE","SORRY","SOUND","SOUTH","SPACE","SPARE","SPARK","SPAWN","SPEED","SPEND","SPENT","SPICE","SPILL","SPINE","SPITE","SPLIT","SPOKE","SPOON","SPRAY","SQUAD","STAFF","STAGE","STAIN","STAKE","STALL","STAMP","STAND","STARK","START","STATE","STEAK","STEAL","STEAM","STEEL","STEEP","STEER","STERN","STICK","STILL","STOCK","STOKE","STONE","STOOD","STORE","STORM","STORY","STOVE","STRAP","STRAW","STRAY","STRIP","STUCK","STUFF","STYLE","SUGAR","SUITE","SUNNY","SUPER","SURGE","SWAMP","SWEAR","SWEAT","SWEEP","SWEET","SWEPT","SWIFT","SWING","SWISS","SWORD","SWORN","SYRUP","TABLE","TAKEN","TASTE","TEACH","TEETH","THEFT","THEME","THERE","THICK","THIEF","THING","THINK","THIRD","THOSE","THREE","THUMB","TIGER","TIGHT","TIMER","TIRED","TITLE","TODAY","TOKEN","TOPIC","TOTAL","TOUCH","TOUGH","TOWER","TOXIC","TRACE","TRACK","TRADE","TRAIL","TRAIN","TRAIT","TRASH","TREAT","TRIAL","TRIBE","TRICK","TRIED","TROOP","TRUCK","TRULY","TRUMP","TRUNK","TRUST","TRUTH","TUMOR","TWICE","TWIST","ULTRA","UNCLE","UNDER","UNDUE","UNFIT","UNION","UNITE","UNITY","UPPER","UPSET","URBAN","USAGE","USUAL","UTTER","VAGUE","VALID","VALUE","VALVE","VAULT","VENUE","VERSE","VIDEO","VIGOR","VIRAL","VIRUS","VISIT","VITAL","VIVID","VOCAL","VOICE","VOTER","WAGES","WASTE","WATCH","WATER","WEARY","WEAVE","WEDGE","WEIGH","WEIRD","WHEAT","WHEEL","WHERE","WHICH","WHILE","WHITE","WHOLE","WHOSE","WIDER","WOMAN","WORLD","WORRY","WORSE","WORST","WORTH","WOULD","WOUND","WRATH","WRITE","WRONG","WROTE","YIELD","YOUNG","YOUTH","ZEBRA"]
const VALID = new Set([...WORDS, ...EXTRA_VALID])

const GREEN = "#22c55e", YELLOW = "#fbbf24", GREY = "#3f3f46"

type LetterState = "correct"|"present"|"absent"|"empty"|"typing"

function checkGuess(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = Array(5).fill("absent")
  const ansArr = answer.split("")
  const used = Array(5).fill(false)
  // greens first
  for (let i = 0; i < 5; i++) if (guess[i] === answer[i]) { result[i] = "correct"; used[i] = true }
  // yellows
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue
    const idx = ansArr.findIndex((c, j) => c === guess[i] && !used[j])
    if (idx !== -1) { result[i] = "present"; used[idx] = true }
  }
  return result
}

export function WordleGame({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [gameKey, setGameKey] = useState(0)
  const [answer, setAnswer] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)])
  const [guesses, setGuesses] = useState<string[]>([])
  const [states, setStates] = useState<LetterState[][]>([])
  const [current, setCurrent] = useState("")
  const [status, setStatus] = useState<"playing"|"won"|"lost">("playing")
  const [shake, setShake] = useState(false)
  const [hs, setHs] = useState(() => loadHS()["wordle"] ?? 0)
  const [msg, setMsg] = useState("")

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 1800) }

  const submit = useCallback(() => {
    if (current.length !== 5) { setShake(true); setTimeout(()=>setShake(false),400); showMsg("Need 5 letters"); return }
    if (!VALID.has(current)) { setShake(true); setTimeout(()=>setShake(false),400); showMsg("Not in word list"); return }
    const result = checkGuess(current, answer)
    const ng = [...guesses, current]
    const ns = [...states, result]
    setGuesses(ng); setStates(ns); setCurrent("")
    if (current === answer) {
      setStatus("won")
      const score = 7 - ng.length
      saveHS("wordle", score); setHs(h => Math.max(h, score))
      showMsg(["Genius!","Magnificent!","Impressive!","Splendid!","Great!","Phew!"][ng.length-1] ?? "Nice!")
    } else if (ng.length >= 6) {
      setStatus("lost"); showMsg(answer)
    }
  }, [current, guesses, states, answer])

  const addLetter = useCallback((l: string) => {
    if (status !== "playing") return
    setCurrent(c => c.length < 5 ? c + l : c)
  }, [status])

  const delLetter = useCallback(() => setCurrent(c => c.slice(0,-1)), [])

  const reset = useCallback(() => {
    setAnswer(WORDS[Math.floor(Math.random() * WORDS.length)])
    setGuesses([])
    setStates([])
    setCurrent("")
    setStatus("playing")
    setShake(false)
    setMsg("")
    setGameKey(k => k + 1)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (status !== "playing") return
      if (e.key === "Enter") { submit(); return }
      if (e.key === "Backspace") { delLetter(); return }
      if (/^[a-zA-Z]$/.test(e.key)) addLetter(e.key.toUpperCase())
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [submit, addLetter, delLetter, status])

  const ROWS_DISPLAY = 6
  const KEYBOARD_ROWS = [["Q","W","E","R","T","Y","U","I","O","P"],["A","S","D","F","G","H","J","K","L"],["ENTER","Z","X","C","V","B","N","M","⌫"]]

  const letterColors: Record<string, LetterState> = {}
  guesses.forEach((g, gi) => g.split("").forEach((l, li) => {
    const s = states[gi][li]
    const cur = letterColors[l]
    if (!cur || (s === "correct") || (s === "present" && cur === "absent")) letterColors[l] = s
  }))

  const tileColor = (s: LetterState) => s === "correct" ? GREEN : s === "present" ? YELLOW : s === "absent" ? GREY : "transparent"
  const keyColor = (l: string) => {
    const s = letterColors[l]
    return s === "correct" ? GREEN : s === "present" ? YELLOW : s === "absent" ? GREY : undefined
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <div className="flex w-full items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> back
        </button>
        <div className="flex items-center gap-3 font-mono text-xs">
          {hs > 0 && <span className="text-muted-foreground">best streak: {hs}</span>}
          <button onClick={reset} className="text-muted-foreground hover:text-primary transition-colors"><RotateCcw className="h-3 w-3" /></button>
        </div>
      </div>

      {msg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white text-black font-bold font-mono text-sm px-4 py-2 rounded-lg shadow-lg pointer-events-none">
          {msg}
        </div>
      )}

      {/* Grid */}
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: ROWS_DISPLAY }, (_, gi) => {
          const isCurrentRow = gi === guesses.length && status === "playing"
          const rowGuess = guesses[gi] ?? (isCurrentRow ? current : "")
          const rowState = states[gi]
          return (
            <div key={gi} className={`flex gap-1.5 ${isCurrentRow && shake ? "animate-bounce" : ""}`}>
              {Array.from({ length: 5 }, (_, li) => {
                const letter = rowGuess[li] ?? ""
                const state: LetterState = rowState ? rowState[li] : (isCurrentRow && letter ? "typing" : "empty")
                const bg = tileColor(state)
                const border = state === "typing" ? primary : state === "empty" ? "#3f3f46" : bg
                return (
                  <div key={li}
                    className="flex items-center justify-center font-bold font-mono text-xl select-none transition-all"
                    style={{ width: 52, height: 52, border: `2px solid ${border}`, background: bg, color: state === "empty" || state === "typing" ? undefined : "#fff", borderRadius: 4 }}
                  >
                    {letter}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Keyboard */}
      <div className="flex flex-col gap-1.5 mt-2 w-full">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.map(key => {
              const bg = keyColor(key)
              const wide = key === "ENTER" || key === "⌫"
              return (
                <button key={key}
                  onClick={() => key === "ENTER" ? submit() : key === "⌫" ? delLetter() : addLetter(key)}
                  className="flex items-center justify-center font-bold font-mono text-xs rounded select-none transition-colors active:scale-95"
                  style={{ height: 42, width: wide ? 56 : 34, background: bg ?? "#3f3f46", color: bg ? "#fff" : "#d4d4d8", fontSize: wide ? 10 : 13 }}
                >
                  {key}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
