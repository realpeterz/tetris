import { useEffect, useState } from 'react';
import { useTetris } from './hooks/useTetris';
import { CELL_SIZE } from './types/tetris';
import './App.css';

/**
 * Main game component that handles the Tetris game board rendering and interactions.
 * @module App
 */

function App() {
  const {
    isPaused,
    board,
    currentPiece,
    currentPosition,
    nextPiece,
    score,
    isGameOver,
    moveDown,
    resetGame
  } = useTetris();

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (!isGameOver && !isPaused) {
        moveDown();
      }
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [isGameOver, isPaused, moveDown]);

  const [clearingRows, setClearingRows] = useState<number[]>([]);

  /**
   * Effect hook to detect and animate clearing rows.
   * Updates the clearingRows state when complete lines are detected.
   */
  useEffect(() => {
    if (board.some((row, index) => row.every(cell => cell === 1))) {
      const rowsToAnimate = board.reduce((acc, row, index) => {
        if (row.every(cell => cell === 1)) acc.push(index);
        return acc;
      }, [] as number[]);
      setClearingRows(rowsToAnimate);
    } else {
      setClearingRows([]);
    }
  }, [board]);

  /**
   * Renders a single cell on the game board.
   * @param {number} cell - The cell value (0 for empty, 1 for filled)
   * @param {number} row - The row index of the cell
   * @param {number} col - The column index of the cell
   * @returns {JSX.Element} The rendered cell component
   */
  const renderCell = (cell: number, row: number, col: number) => {
    const isClearing = clearingRows.includes(row);

    const isCurrent = currentPiece.shape.some((shapeRow, rowIndex) => {
      return shapeRow.some((isSet, colIndex) => {
        return (
          isSet &&
          row === currentPosition.row + rowIndex &&
          col === currentPosition.col + colIndex
        );
      });
    });

    /**
     * Determines the visual style of the cell based on its state.
     * @returns {React.CSSProperties} The style object for the cell
     */
    const getCellStyle = () => {
      if (isCurrent) {
        return {
          backgroundColor: currentPiece.color,
          backgroundImage: `linear-gradient(135deg, ${currentPiece.color}dd 0%, ${currentPiece.color}99 100%)`,
        };
      }
      if (cell) {
        return {
          backgroundColor: '#666',
          backgroundImage: 'linear-gradient(135deg, #777 0%, #555 100%)',
        };
      }
      return {
        backgroundColor: 'transparent',
      };
    };

    return (
      <div
        key={`${row}-${col}`}
        className={`cell ${cell ? 'filled' : ''} ${isCurrent ? 'current' : ''} ${isClearing ? 'clearing' : ''}`}
        style={getCellStyle()}
      />
    );
  };

  /**
   * Renders the preview of the next piece that will appear in the game.
   * @returns {JSX.Element} The rendered next piece preview component
   */
  const renderNextPiece = () => {
    return (
      <div className="next-piece-preview">
        {nextPiece.shape.map((row, rowIndex) => (
          <div key={rowIndex} className="preview-row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`preview-cell ${cell ? 'filled' : ''}`}
                style={
                  cell
                    ? {
                      backgroundColor: nextPiece.color,
                      backgroundImage: `linear-gradient(135deg, ${nextPiece.color}dd 0%, ${nextPiece.color}99 100%)`,
                    }
                    : {}
                }
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app">
      <div className="game-container">
        {isPaused && (
          <div className="paused">
            <h2>Game Paused</h2>
            <p>Press Enter to resume</p>
          </div>
        )}
        <div
          className="board"
          style={{
            width: CELL_SIZE * 10,
            height: CELL_SIZE * 20
          }}
        >
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
            </div>
          ))}
        </div>
        <div className="game-info">
          <div className="next-piece">
            <h3>Next Piece</h3>
            {renderNextPiece()}
          </div>
          <div className="score">
            <h3>Score</h3>
            <p>{score}</p>
          </div>
          {isGameOver && (
            <div className="game-over">
              <h2>Game Over!</h2>
              <button onClick={resetGame}>Play Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
