import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useKV } from '@github/spark/hooks';

type Player = 'X' | 'O';
type CellValue = Player | null;
type Board = CellValue[];

interface GameStats {
  xWins: number;
  oWins: number;
  draws: number;
}

function App() {
  // Game state
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [gameStats, setGameStats] = useKV<GameStats>('tictacglow-stats', {
    xWins: 0,
    oWins: 0,
    draws: 0
  });

  // Win combinations for tic-tac-toe
  const winCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  // Check if there's a winner
  const checkWinner = (board: Board): Player | 'draw' | null => {
    // Check for winning combinations
    for (const combo of winCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as Player;
      }
    }
    
    // Check for draw (board full, no winner)
    if (board.every(cell => cell !== null)) {
      return 'draw';
    }
    
    return null;
  };

  // Handle cell click
  const handleCellClick = (index: number) => {
    // Ignore clicks if game is over or cell is occupied
    if (winner || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    // Check for winner
    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
      // Update stats
      setGameStats(stats => ({
        xWins: stats.xWins + (gameResult === 'X' ? 1 : 0),
        oWins: stats.oWins + (gameResult === 'O' ? 1 : 0),
        draws: stats.draws + (gameResult === 'draw' ? 1 : 0)
      }));
    } else {
      // Switch player
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
  };

  // Reset stats
  const resetStats = () => {
    setGameStats({ xWins: 0, oWins: 0, draws: 0 });
  };

  // Get status message
  const getStatusMessage = () => {
    if (winner === 'draw') {
      return "It's a Draw!";
    } else if (winner) {
      return `Player ${winner} Wins!`;
    } else {
      return `Player ${currentPlayer}'s Turn`;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      {/* Game Title */}
      <div className="text-center mb-8">
        <h1 className="retro-title text-4xl md:text-6xl mb-2">
          <span className="text-primary neon-glow">Tic</span>
          <span className="text-secondary neon-glow">Tac</span>
          <span className="text-accent neon-glow">Glow</span>
        </h1>
        <p className="text-muted-foreground text-sm">Retro Arcade Tic-Tac-Toe</p>
      </div>

      {/* Score Display */}
      <Card className="mb-6 p-4 bg-card border-primary/30">
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2 text-accent">Score</h3>
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-primary">
              X: <span className="font-bold">{gameStats.xWins}</span>
            </div>
            <div className="text-muted-foreground">
              Draws: <span className="font-bold">{gameStats.draws}</span>
            </div>
            <div className="text-secondary">
              O: <span className="font-bold">{gameStats.oWins}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Game Status */}
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold ${
          winner === 'X' ? 'text-primary neon-glow' : 
          winner === 'O' ? 'text-secondary neon-glow' :
          winner === 'draw' ? 'text-accent neon-glow' :
          currentPlayer === 'X' ? 'text-primary' : 'text-secondary'
        }`}>
          {getStatusMessage()}
        </h2>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-2 w-72 h-72 mb-6">
        {board.map((cell, index) => (
          <button
            key={index}
            className={`grid-cell ${winner ? 'disabled' : ''}`}
            onClick={() => handleCellClick(index)}
            disabled={!!winner || !!cell}
          >
            {cell && (
              <span className={cell === 'X' ? 'player-x' : 'player-o'}>
                {cell}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Game Controls */}
      <div className="flex gap-4">
        <Button
          onClick={resetGame}
          variant="outline"
          className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          New Game
        </Button>
        <Button
          onClick={resetStats}
          variant="outline"
          size="sm"
          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          Reset Score
        </Button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-muted-foreground text-xs">
        <p>Click any cell to place your mark • First to get 3 in a row wins!</p>
      </div>
    </div>
  );
}

export default App;