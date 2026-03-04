"use client"
import { usePrimary } from "./helpers"
import { useRouter } from "next/navigation"
import { SnakeGame }          from "./snake/game"
import { TetrisGame }         from "./tetris/game"
import { PongGame }           from "./pong/game"
import { Game2048 }           from "./2048/game"
import { BreakoutGame }       from "./breakout/game"
import { MinesweeperGame }    from "./minesweeper/game"
import { WordleGame }         from "./wordle/game"
import { SudokuGame }         from "./sudoku/game"
import { LightsOutGame }      from "./lights-out/game"
import { NonogramGame }       from "./nonogram/game"
import { SimonGame }          from "./simon/game"
import { AsteroidsGame }      from "./asteroids/game"
import { SpaceInvadersGame }  from "./space-invaders/game"
import { PacmanGame }         from "./pacman/game"
import { DinoGame }           from "./dino/game"
import { SolitaireGame }      from "./solitaire/game"
import { BlackjackGame }      from "./blackjack/game"
import { YahtzeeGame }        from "./yahtzee/game"
import { TypingGame }         from "./typing/game"
import { HangmanGame }        from "./hangman/game"
import { ChessGame }          from "./chess/game"
import { CheckersGame }       from "./checkers/game"
import { BattleshipGame }     from "./battleship/game"
import { ConnectFourGame }    from "./connect-four/game"
import { TicTacToeGame }      from "./tic-tac-toe/game"
import { MemoryMatchGame }    from "./memory-match/game"
import { CrosswordMiniGame }  from "./crossword-mini/game"
import { ColorFloodGame }     from "./color-flood/game"
import { WordSearchGame }     from "./word-search/game"
import { PianoTilesGame }     from "./piano-tiles/game"
import { BrickBuilderGame }   from "./brick-builder/game"

export function GamePageClient({ game }: { game: string }) {
  const primary = usePrimary()
  const router = useRouter()
  const onBack = () => router.push("/games")

  return (
    <main className="min-h-screen pt-24 pb-16 flex flex-col items-center px-4">
      {game === "snake"          && <SnakeGame         primary={primary} onBack={onBack} />}
      {game === "tetris"         && <TetrisGame        primary={primary} onBack={onBack} />}
      {game === "pong"           && <PongGame          primary={primary} onBack={onBack} />}
      {game === "2048"           && <Game2048          primary={primary} onBack={onBack} />}
      {game === "breakout"       && <BreakoutGame      primary={primary} onBack={onBack} />}
      {game === "minesweeper"    && <MinesweeperGame   primary={primary} onBack={onBack} />}
      {game === "wordle"         && <WordleGame        primary={primary} onBack={onBack} />}
      {game === "sudoku"         && <SudokuGame        primary={primary} onBack={onBack} />}
      {game === "lights-out"     && <LightsOutGame     primary={primary} onBack={onBack} />}
      {game === "nonogram"       && <NonogramGame      primary={primary} onBack={onBack} />}
      {game === "simon"          && <SimonGame         primary={primary} onBack={onBack} />}
      {game === "asteroids"      && <AsteroidsGame     primary={primary} onBack={onBack} />}
      {game === "space-invaders" && <SpaceInvadersGame primary={primary} onBack={onBack} />}
      {game === "pacman"         && <PacmanGame        primary={primary} onBack={onBack} />}
      {game === "dino"           && <DinoGame          primary={primary} onBack={onBack} />}
      {game === "solitaire"      && <SolitaireGame     primary={primary} onBack={onBack} />}
      {game === "blackjack"      && <BlackjackGame     primary={primary} onBack={onBack} />}
      {game === "yahtzee"        && <YahtzeeGame       primary={primary} onBack={onBack} />}
      {game === "typing"         && <TypingGame        primary={primary} onBack={onBack} />}
      {game === "hangman"        && <HangmanGame       primary={primary} onBack={onBack} />}
      {game === "chess"          && <ChessGame         primary={primary} onBack={onBack} />}
      {game === "checkers"       && <CheckersGame      primary={primary} onBack={onBack} />}
      {game === "battleship"     && <BattleshipGame    primary={primary} onBack={onBack} />}
      {game === "connect-four"   && <ConnectFourGame   primary={primary} onBack={onBack} />}
      {game === "tic-tac-toe"    && <TicTacToeGame     primary={primary} onBack={onBack} />}
      {game === "memory-match"   && <MemoryMatchGame   primary={primary} onBack={onBack} />}
      {game === "crossword-mini" && <CrosswordMiniGame primary={primary} onBack={onBack} />}
      {game === "color-flood"    && <ColorFloodGame    primary={primary} onBack={onBack} />}
      {game === "word-search"    && <WordSearchGame    primary={primary} onBack={onBack} />}
      {game === "piano-tiles"    && <PianoTilesGame    primary={primary} onBack={onBack} />}
      {game === "brick-builder"  && <BrickBuilderGame  primary={primary} onBack={onBack} />}
    </main>
  )
}
