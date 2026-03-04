import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { GamePageClient } from "@/components/games/game-page-client"
import type { Metadata } from "next"

const GAME_META: Record<string, { title: string; desc: string }> = {
  snake:           { title: "Snake",          desc: "Classic snake — eat food, avoid walls and yourself." },
  tetris:          { title: "Tetris",          desc: "Stack blocks, clear lines, survive as long as you can." },
  pong:            { title: "Pong",            desc: "Beat the AI paddle. You're on the left." },
  "2048":          { title: "2048",            desc: "Merge tiles to reach 2048." },
  breakout:        { title: "Breakout",        desc: "Break all the bricks with your ball and paddle." },
  minesweeper:     { title: "Minesweeper",     desc: "Reveal all safe cells without hitting a mine." },
  wordle:          { title: "Wordle",          desc: "Guess the 5-letter word in 6 tries." },
  sudoku:          { title: "Sudoku",          desc: "Fill the 9×9 grid — each row, column and box uses 1–9 once." },
  "lights-out":    { title: "Lights Out",      desc: "Toggle cells to turn every light off." },
  nonogram:        { title: "Nonogram",        desc: "Fill cells using the row and column clues." },
  simon:           { title: "Simon Says",      desc: "Repeat the growing colour sequence." },
  asteroids:       { title: "Asteroids",       desc: "Shoot rocks, don't get hit." },
  "space-invaders":{ title: "Space Invaders",  desc: "Shoot the alien grid before they reach you." },
  pacman:          { title: "Pac-Man",          desc: "Eat all the dots, avoid ghosts." },
  dino:            { title: "Dino Run",        desc: "Jump over cacti in an endless desert run." },
  solitaire:       { title: "Solitaire",       desc: "Classic Klondike — move all cards to the foundation." },
  blackjack:       { title: "Blackjack",       desc: "Beat the dealer to 21 without busting." },
  yahtzee:         { title: "Yahtzee",         desc: "Roll 5 dice, fill your score card for maximum points." },
  typing:          { title: "Typing Speed",    desc: "How many words per minute can you type?" },
  hangman:         { title: "Hangman",         desc: "Guess the word before the figure is drawn." },
  chess:           { title: "Chess",           desc: "Play chess against a random-move AI opponent." },
  checkers:        { title: "Checkers",        desc: "Capture all enemy pieces to win." },
  battleship:      { title: "Battleship",      desc: "Sink all enemy ships before yours are sunk." },
  "connect-four":  { title: "Connect Four",    desc: "Drop discs to connect four in a row before the AI." },
  "tic-tac-toe":   { title: "Tic-Tac-Toe",    desc: "Classic X and O — try to beat the unbeatable AI." },
  "memory-match":  { title: "Memory Match",    desc: "Flip cards and match all pairs in fewest moves." },
  "crossword-mini":{ title: "Crossword Mini",  desc: "Solve a small crossword puzzle with coding clues." },
  "color-flood":   { title: "Color Flood",     desc: "Flood the board with one color in 22 moves or less." },
  "word-search":   { title: "Word Search",     desc: "Find all the hidden words in the letter grid." },
  "piano-tiles":   { title: "Piano Tiles",     desc: "Tap the black tiles as they scroll — don't miss!" },
  "brick-builder": { title: "Brick Builder",   desc: "Sokoban-style puzzle — push boxes onto targets." },
}

export async function generateStaticParams() {
  return Object.keys(GAME_META).map(game => ({ game }))
}

export async function generateMetadata({ params }: { params: Promise<{ game: string }> }): Promise<Metadata> {
  const { game } = await params
  const meta = GAME_META[game]
  if (!meta) return { title: "Game Not Found" }
  return { title: `${meta.title} | RejectModders`, description: meta.desc }
}

export default async function GamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params
  if (!GAME_META[game]) notFound()
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <GamePageClient game={game} />
      <FooterSection />
    </div>
  )
}
