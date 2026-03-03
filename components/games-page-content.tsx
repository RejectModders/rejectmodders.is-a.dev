"use client"

import { useState, useEffect, useRef, ComponentType } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Trophy, Play, ChevronDown } from "lucide-react"
import { loadHS } from "./games/helpers"

// Previews
const SnakePreview         = dynamic(() => import("./games/snake/preview").then(m => ({ default: m.SnakePreview })),         { ssr: false })
const TetrisPreview        = dynamic(() => import("./games/tetris/preview").then(m => ({ default: m.TetrisPreview })),        { ssr: false })
const PongPreview          = dynamic(() => import("./games/pong/preview").then(m => ({ default: m.PongPreview })),            { ssr: false })
const Game2048Preview      = dynamic(() => import("./games/2048/preview").then(m => ({ default: m.Game2048Preview })),        { ssr: false })
const BreakoutPreview      = dynamic(() => import("./games/breakout/preview").then(m => ({ default: m.BreakoutPreview })),    { ssr: false })
const MinesweeperPreview   = dynamic(() => import("./games/minesweeper/preview").then(m => ({ default: m.MinesweeperPreview })), { ssr: false })
const WordlePreview        = dynamic(() => import("./games/wordle/preview").then(m => ({ default: m.WordlePreview })),        { ssr: false })
const SudokuPreview        = dynamic(() => import("./games/sudoku/preview").then(m => ({ default: m.SudokuPreview })),        { ssr: false })
const LightsOutPreview     = dynamic(() => import("./games/lights-out/preview").then(m => ({ default: m.LightsOutPreview })), { ssr: false })
const NonogramPreview      = dynamic(() => import("./games/nonogram/preview").then(m => ({ default: m.NonogramPreview })),    { ssr: false })
const SimonPreview         = dynamic(() => import("./games/simon/preview").then(m => ({ default: m.SimonPreview })),          { ssr: false })
const AsteroidsPreview     = dynamic(() => import("./games/asteroids/preview").then(m => ({ default: m.AsteroidsPreview })),  { ssr: false })
const SpaceInvadersPreview = dynamic(() => import("./games/space-invaders/preview").then(m => ({ default: m.SpaceInvadersPreview })), { ssr: false })
const PacmanPreview        = dynamic(() => import("./games/pacman/preview").then(m => ({ default: m.PacmanPreview })),        { ssr: false })
const DinoPreview          = dynamic(() => import("./games/dino/preview").then(m => ({ default: m.DinoPreview })),            { ssr: false })
const SolitairePreview     = dynamic(() => import("./games/solitaire/preview").then(m => ({ default: m.SolitairePreview })),  { ssr: false })
const BlackjackPreview     = dynamic(() => import("./games/blackjack/preview").then(m => ({ default: m.BlackjackPreview })),  { ssr: false })
const YahtzeePreview       = dynamic(() => import("./games/yahtzee/preview").then(m => ({ default: m.YahtzeePreview })),      { ssr: false })
const TypingPreview        = dynamic(() => import("./games/typing/preview").then(m => ({ default: m.TypingPreview })),        { ssr: false })
const HangmanPreview       = dynamic(() => import("./games/hangman/preview").then(m => ({ default: m.HangmanPreview })),      { ssr: false })
const ChessPreview         = dynamic(() => import("./games/chess/preview").then(m => ({ default: m.ChessPreview })),          { ssr: false })
const CheckersPreview      = dynamic(() => import("./games/checkers/preview").then(m => ({ default: m.CheckersPreview })),    { ssr: false })
const BattleshipPreview    = dynamic(() => import("./games/battleship/preview").then(m => ({ default: m.BattleshipPreview })), { ssr: false })
const ConnectFourPreview   = dynamic(() => import("./games/connect-four/preview").then(m => ({ default: m.ConnectFourPreview })), { ssr: false })
const TicTacToePreview     = dynamic(() => import("./games/tic-tac-toe/preview").then(m => ({ default: m.TicTacToePreview })), { ssr: false })
const MemoryMatchPreview   = dynamic(() => import("./games/memory-match/preview").then(m => ({ default: m.MemoryMatchPreview })), { ssr: false })
const CrosswordMiniPreview = dynamic(() => import("./games/crossword-mini/preview").then(m => ({ default: m.CrosswordMiniPreview })), { ssr: false })
const ColorFloodPreview    = dynamic(() => import("./games/color-flood/preview").then(m => ({ default: m.ColorFloodPreview })), { ssr: false })
const WordSearchPreview    = dynamic(() => import("./games/word-search/preview").then(m => ({ default: m.WordSearchPreview })), { ssr: false })
const PianoTilesPreview    = dynamic(() => import("./games/piano-tiles/preview").then(m => ({ default: m.PianoTilesPreview })), { ssr: false })
const BrickBuilderPreview  = dynamic(() => import("./games/brick-builder/preview").then(m => ({ default: m.BrickBuilderPreview })), { ssr: false })

type Category = "all" | "arcade" | "puzzle" | "card" | "word" | "strategy"

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: "all",      label: "All",      emoji: "🎮" },
  { id: "arcade",   label: "Arcade",   emoji: "🕹️" },
  { id: "puzzle",   label: "Puzzle",   emoji: "🧩" },
  { id: "card",     label: "Card & Dice", emoji: "🃏" },
  { id: "word",     label: "Word & Brain", emoji: "📝" },
  { id: "strategy", label: "Strategy", emoji: "♟️" },
]

const GAMES = [
  // ── Arcade ──
  { id: "snake",         label: "Snake",          desc: "Eat food. Walls and yourself kill you.",       controls: "arrows / WASD / swipe",  cat: "arcade"   as Category, Preview: SnakePreview },
  { id: "tetris",        label: "Tetris",          desc: "Stack blocks, clear lines, survive.",          controls: "← → ↑ / space",          cat: "arcade"   as Category, Preview: TetrisPreview },
  { id: "breakout",      label: "Breakout",        desc: "Break all bricks without losing the ball.",    controls: "← → / drag",             cat: "arcade"   as Category, Preview: BreakoutPreview },
  { id: "pong",          label: "Pong",            desc: "Beat the AI paddle on the right.",             controls: "W / S or ↑ / ↓",         cat: "arcade"   as Category, Preview: PongPreview },
  { id: "asteroids",     label: "Asteroids",       desc: "Shoot rocks, don't get hit.",                  controls: "↑ thrust · ←→ rotate · space", cat: "arcade" as Category, Preview: AsteroidsPreview },
  { id: "space-invaders",label: "Space Invaders",  desc: "Shoot the alien grid before they reach you.",  controls: "← → move · space shoot", cat: "arcade"   as Category, Preview: SpaceInvadersPreview },
  { id: "pacman",        label: "Pac-Man Lite",    desc: "Eat all dots, avoid the ghosts.",              controls: "arrows / WASD",          cat: "arcade"   as Category, Preview: PacmanPreview },
  { id: "dino",          label: "Dino Run",        desc: "Jump over cacti in an endless desert run.",    controls: "space / tap",            cat: "arcade"   as Category, Preview: DinoPreview },
  { id: "piano-tiles",   label: "Piano Tiles",     desc: "Tap black tiles as they scroll down.",         controls: "click / tap",            cat: "arcade"   as Category, Preview: PianoTilesPreview },
  // ── Puzzle ──
  { id: "2048",          label: "2048",            desc: "Merge tiles to reach 2048.",                   controls: "arrows / swipe",         cat: "puzzle"   as Category, Preview: Game2048Preview },
  { id: "minesweeper",   label: "Minesweeper",     desc: "Reveal all safe cells, flag the mines.",       controls: "click / right-click / long press", cat: "puzzle"   as Category, Preview: MinesweeperPreview },
  { id: "sudoku",        label: "Sudoku",          desc: "Fill the 9×9 grid with 1–9.",                  controls: "click + type / arrows",  cat: "puzzle"   as Category, Preview: SudokuPreview },
  { id: "lights-out",    label: "Lights Out",      desc: "Toggle cells to turn every light off.",        controls: "click / tap",            cat: "puzzle"   as Category, Preview: LightsOutPreview },
  { id: "nonogram",      label: "Nonogram",        desc: "Fill cells using row and column clues.",       controls: "left fill · right X",    cat: "puzzle"   as Category, Preview: NonogramPreview },
  { id: "color-flood",   label: "Color Flood",     desc: "Flood the board with one color in 22 moves.", controls: "click colors",           cat: "puzzle"   as Category, Preview: ColorFloodPreview },
  { id: "brick-builder", label: "Brick Builder",   desc: "Push boxes onto targets. Sokoban-style.",     controls: "arrows / WASD",          cat: "puzzle"   as Category, Preview: BrickBuilderPreview },
  { id: "memory-match",  label: "Memory Match",    desc: "Flip cards and match all pairs.",             controls: "click / tap",            cat: "puzzle"   as Category, Preview: MemoryMatchPreview },
  // ── Card & Dice ──
  { id: "solitaire",     label: "Solitaire",       desc: "Classic Klondike — move all cards to foundation.", controls: "click to move",      cat: "card"     as Category, Preview: SolitairePreview },
  { id: "blackjack",     label: "Blackjack",       desc: "Beat the dealer to 21 without busting.",      controls: "click buttons",          cat: "card"     as Category, Preview: BlackjackPreview },
  { id: "yahtzee",       label: "Yahtzee",         desc: "Roll 5 dice, fill your score card.",           controls: "click dice to hold",     cat: "card"     as Category, Preview: YahtzeePreview },
  // ── Word & Brain ──
  { id: "wordle",        label: "Wordle",          desc: "Guess the 5-letter word in 6 tries.",          controls: "keyboard / tap",         cat: "word"     as Category, Preview: WordlePreview },
  { id: "typing",        label: "Typing Speed",    desc: "How many words per minute can you type?",      controls: "keyboard",               cat: "word"     as Category, Preview: TypingPreview },
  { id: "hangman",       label: "Hangman",         desc: "Guess the word before the figure is drawn.",   controls: "keyboard / tap",         cat: "word"     as Category, Preview: HangmanPreview },
  { id: "simon",         label: "Simon Says",      desc: "Repeat the growing colour sequence.",          controls: "click / tap",            cat: "word"     as Category, Preview: SimonPreview },
  { id: "crossword-mini",label: "Crossword Mini",  desc: "Solve a small crossword with coding clues.",  controls: "type letters · space toggle", cat: "word"  as Category, Preview: CrosswordMiniPreview },
  { id: "word-search",   label: "Word Search",     desc: "Find all hidden words in the letter grid.",   controls: "click letters in order", cat: "word"     as Category, Preview: WordSearchPreview },
  // ── Strategy ──
  { id: "chess",         label: "Chess",           desc: "Play against a simple AI opponent.",           controls: "click piece + click dest", cat: "strategy" as Category, Preview: ChessPreview },
  { id: "checkers",      label: "Checkers",        desc: "Capture all enemy pieces to win.",             controls: "click piece + click dest", cat: "strategy" as Category, Preview: CheckersPreview },
  { id: "battleship",    label: "Battleship",      desc: "Sink all enemy ships before yours sink.",      controls: "click to shoot",         cat: "strategy" as Category, Preview: BattleshipPreview },
  { id: "connect-four",  label: "Connect Four",    desc: "Drop discs to connect four in a row.",        controls: "click column to drop",   cat: "strategy" as Category, Preview: ConnectFourPreview },
  { id: "tic-tac-toe",   label: "Tic-Tac-Toe",    desc: "Classic X vs O — beat the unbeatable AI.",     controls: "click cell",             cat: "strategy" as Category, Preview: TicTacToePreview },
]

/** Only renders children when the element scrolls into view (with 200px margin) */
function LazyPreview({ Preview }: { Preview: ComponentType }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { rootMargin: "200px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="w-full h-full">
      {visible ? <Preview /> : (
        <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}
    </div>
  )
}

export function GamesPageContent() {
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, number>>({})
  const [hovered, setHovered] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>("all")
  const [visibleCount, setVisibleCount] = useState(8)

  useEffect(() => { setScores(loadHS()) }, [])

  const filtered = activeCategory === "all" ? GAMES : GAMES.filter(g => g.cat === activeCategory)
  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  const categoryCount = (cat: Category) => cat === "all" ? GAMES.length : GAMES.filter(g => g.cat === cat).length

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="font-mono text-4xl font-bold tracking-tight text-primary mb-3">arcade</h1>
          <p className="text-muted-foreground font-mono text-sm">{GAMES.length} games · all built in the browser</p>
        </motion.div>

        {/* Category filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex flex-wrap gap-2 justify-center"
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setVisibleCount(8) }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold transition-all duration-200 border"
              style={{
                background: activeCategory === cat.id ? "hsl(var(--primary))" : "transparent",
                color: activeCategory === cat.id ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                borderColor: activeCategory === cat.id ? "hsl(var(--primary))" : "hsl(var(--border))",
                transform: activeCategory === cat.id ? "scale(1.05)" : "scale(1)",
              }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span className="ml-0.5 opacity-60">({categoryCount(cat.id)})</span>
            </button>
          ))}
        </motion.div>

        {/* Game cards grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeCategory}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {visible.map(({ id, label, desc, controls, Preview }, i) => {
              const hs = scores[id]
              const isHovered = hovered === id
              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  onMouseEnter={() => setHovered(id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => router.push(`/games/${id}`)}
                  className="group relative cursor-pointer rounded-2xl border border-primary/20 bg-card overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                >
                  {/* Preview canvas area — lazy loaded */}
                  <div className="relative w-full overflow-hidden bg-zinc-950" style={{ aspectRatio: "16/9" }}>
                    <LazyPreview Preview={Preview} />
                    {/* Hover play overlay */}
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                      <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-sm font-bold shadow-lg">
                        <Play className="h-4 w-4 fill-current" />
                        play
                      </div>
                    </div>
                  </div>

                  {/* Card info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h2 className="font-mono font-bold text-base text-foreground group-hover:text-primary transition-colors">{label}</h2>
                      {hs !== undefined && (
                        <span className="flex items-center gap-1 font-mono text-xs text-primary/70 shrink-0">
                          <Trophy className="h-3 w-3" />{hs}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground leading-relaxed mb-2">{desc}</p>
                    <p className="font-mono text-[10px] text-muted-foreground/50">{controls}</p>
                  </div>

                  {/* Category pill */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-primary/80 border border-primary/20">
                      {CATEGORIES.find(c => c.id === GAMES.find(g => g.id === id)?.cat)?.emoji}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* Load More button */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-10"
          >
            <button
              onClick={() => setVisibleCount(v => v + 8)}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-mono text-sm font-bold transition-all duration-200 border border-primary/30 hover:border-primary/60 hover:bg-primary/10 text-primary"
            >
              <ChevronDown className="h-4 w-4" />
              load more ({filtered.length - visibleCount} remaining)
            </button>
          </motion.div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20 font-mono text-muted-foreground">
            no games in this category yet
          </div>
        )}
      </div>
    </main>
  )
}
