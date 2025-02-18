import { useState, useCallback, useEffect } from 'react';
import { GameState, Position, Tetromino, TETROMINOES, BOARD_WIDTH, BOARD_HEIGHT } from '../types/tetris';

/**
 * Creates an empty game board with dimensions BOARD_HEIGHT x BOARD_WIDTH.
 * @returns {number[][]} A 2D array representing the empty board, filled with zeros.
 */
const createEmptyBoard = () => {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
};

/**
 * Randomly selects a tetromino piece from available types.
 * @returns {Tetromino} A randomly selected tetromino piece.
 */
const getRandomTetromino = (): Tetromino => {
  const tetrominoTypes = Object.keys(TETROMINOES) as Array<keyof typeof TETROMINOES>;
  const randomType = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
  return TETROMINOES[randomType];
};

/**
 * Checks if a piece can be placed at the specified position on the board.
 * @param {number[][]} board - The current game board.
 * @param {Tetromino} piece - The tetromino piece to check.
 * @param {Position} position - The position to check.
 * @returns {boolean} True if the move is valid, false otherwise.
 */
const isValidMove = (board: number[][], piece: Tetromino, position: Position): boolean => {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const newRow = position.row + row;
        const newCol = position.col + col;

        if (
          newRow < 0 ||
          newRow >= BOARD_HEIGHT ||
          newCol < 0 ||
          newCol >= BOARD_WIDTH ||
          board[newRow][newCol]
        ) {
          return false;
        }
      }
    }
  }
  return true;
};

/**
 * Rotates a tetromino piece 90 degrees clockwise.
 * @param {Tetromino} piece - The piece to rotate.
 * @returns {Tetromino} A new tetromino with rotated shape.
 */
const rotatePiece = (piece: Tetromino): Tetromino => {
  const newShape = piece.shape[0].map((_, index) =>
    piece.shape.map(row => row[index]).reverse()
  );
  return { ...piece, shape: newShape };
};

/**
 * Merges a tetromino piece with the game board at the specified position.
 * @param {number[][]} board - The current game board.
 * @param {Tetromino} piece - The piece to merge.
 * @param {Position} position - The position where to merge the piece.
 * @returns {number[][]} A new board with the piece merged.
 */
const mergePieceWithBoard = (board: number[][], piece: Tetromino, position: Position): number[][] => {
  const newBoard = board.map(row => [...row]);
  piece.shape.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell) {
        const newRow = position.row + rowIndex;
        const newCol = position.col + colIndex;
        if (newRow >= 0 && newRow < BOARD_HEIGHT && newCol >= 0 && newCol < BOARD_WIDTH) {
          newBoard[newRow][newCol] = 1;
        }
      }
    });
  });
  return newBoard;
};

/**
 * Clears completed lines from the board and returns the updated board state.
 * @param {number[][]} board - The current game board.
 * @returns {{ newBoard: number[][], linesCleared: number, clearedRows: number[] }} Object containing the new board state and clearing information.
 */
const clearLines = (board: number[][]): { newBoard: number[][], linesCleared: number, clearedRows: number[] } => {
  const clearedRows: number[] = [];
  board.forEach((row, index) => {
    if (row.every(cell => cell === 1)) {
      clearedRows.push(index);
    }
  });
  const newBoard = board.filter(row => !row.every(cell => cell === 1));
  const linesCleared = BOARD_HEIGHT - newBoard.length;
  const emptyLines = Array(linesCleared).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
  return {
    clearedRows,
    newBoard: [...emptyLines, ...newBoard],
    linesCleared
  };
};

/**
 * Custom hook that implements Tetris game logic.
 * @returns {Object} An object containing game state and control functions:
 * - gameState: Current state of the game (board, pieces, score, etc.)
 * - moveLeft: Function to move the current piece left
 * - moveRight: Function to move the current piece right
 * - moveDown: Function to move the current piece down
 * - rotate: Function to rotate the current piece
 * - hardDrop: Function to instantly drop the current piece
 * - resetGame: Function to reset the game state
 */
export const useTetris = () => {
  const [gameState, setGameState] = useState<GameState>({
    isPaused: false,
    board: createEmptyBoard(),
    currentPiece: getRandomTetromino(),
    currentPosition: { row: 0, col: Math.floor(BOARD_WIDTH / 2) - 1 },
    nextPiece: getRandomTetromino(),
    score: 0,
    isGameOver: false
  });

  /**
   * Moves the current piece down one position.
   * If the piece can't move down, it's merged with the board and a new piece is generated.
   */
  const moveDown = useCallback(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

    const newPosition = { ...gameState.currentPosition, row: gameState.currentPosition.row + 1 };

    if (isValidMove(gameState.board, gameState.currentPiece, newPosition)) {
      setGameState(prev => ({ ...prev, currentPosition: newPosition }));
    } else {
      // Piece has landed
      const newBoard = mergePieceWithBoard(
        gameState.board,
        gameState.currentPiece,
        gameState.currentPosition
      );

      const { newBoard: clearedBoard, linesCleared, clearedRows } = clearLines(newBoard);
      
      if (clearedRows.length > 0) {
        // First update to show the filled line
        setGameState(prev => ({
          ...prev,
          board: newBoard
        }));

        // Then update after animation to show cleared lines
        setTimeout(() => {
          const newScore = gameState.score + (linesCleared * 100);
          const nextPiece = gameState.nextPiece;
          const nextPosition = { row: 0, col: Math.floor(BOARD_WIDTH / 2) - 1 };
          const isGameOver = !isValidMove(clearedBoard, nextPiece, nextPosition);

          setGameState(prev => ({
            ...prev,
            board: clearedBoard,
            currentPiece: nextPiece,
            currentPosition: nextPosition,
            nextPiece: getRandomTetromino(),
            score: newScore,
            isGameOver
          }));
        }, 800); // Match the animation duration
        return;
      }

      // No lines to clear, continue immediately
      const newScore = gameState.score + (linesCleared * 100);
      const nextPiece = gameState.nextPiece;
      const nextPosition = { row: 0, col: Math.floor(BOARD_WIDTH / 2) - 1 };
      const isGameOver = !isValidMove(clearedBoard, nextPiece, nextPosition);

      setGameState(prev => ({
        ...prev,
        board: clearedBoard,
        currentPiece: nextPiece,
        currentPosition: nextPosition,
        nextPiece: getRandomTetromino(),
        score: newScore,
        isGameOver
      }));
    }
  }, [gameState]);

  /**
   * Moves the current piece one position to the left if possible.
   */
  const moveLeft = useCallback(() => {
    if (gameState.isGameOver || gameState.isPaused) return;
    const newPosition = { ...gameState.currentPosition, col: gameState.currentPosition.col - 1 };
    if (isValidMove(gameState.board, gameState.currentPiece, newPosition)) {
      setGameState(prev => ({ ...prev, currentPosition: newPosition }));
    }
  }, [gameState]);

  /**
   * Moves the current piece one position to the right if possible.
   */
  const moveRight = useCallback(() => {
    if (gameState.isGameOver || gameState.isPaused) return;
    const newPosition = { ...gameState.currentPosition, col: gameState.currentPosition.col + 1 };
    if (isValidMove(gameState.board, gameState.currentPiece, newPosition)) {
      setGameState(prev => ({ ...prev, currentPosition: newPosition }));
    }
  }, [gameState]);

  /**
   * Rotates the current piece clockwise if possible.
   */
  const rotate = useCallback(() => {
    if (gameState.isGameOver || gameState.isPaused) return;
    const rotatedPiece = rotatePiece(gameState.currentPiece);
    if (isValidMove(gameState.board, rotatedPiece, gameState.currentPosition)) {
      setGameState(prev => ({ ...prev, currentPiece: rotatedPiece }));
    }
  }, [gameState]);

  /**
   * Instantly drops the current piece to the lowest possible position.
   */
  const hardDrop = useCallback(() => {
    if (gameState.isGameOver || gameState.isPaused) return;
    let newPosition = { ...gameState.currentPosition };
    while (isValidMove(gameState.board, gameState.currentPiece, { ...newPosition, row: newPosition.row + 1 })) {
      newPosition.row++;
    }
    setGameState(prev => ({ ...prev, currentPosition: newPosition }));
    moveDown();
  }, [gameState, moveDown]);

  /**
   * Resets the game state to initial values.
   */
  const resetGame = useCallback(() => {
    setGameState({
      board: createEmptyBoard(),
      currentPiece: getRandomTetromino(),
      currentPosition: { row: 0, col: Math.floor(BOARD_WIDTH / 2) - 1 },
      nextPiece: getRandomTetromino(),
      score: 0,
      isGameOver: false,
      isPaused: false
    });
  }, []);

  // Set up keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
        return;
      }

      if (gameState.isPaused) return;
      switch (event.key) {
        case 'ArrowLeft':
          moveLeft();
          break;
        case 'ArrowRight':
          moveRight();
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
          rotate();
          break;
        case ' ':
          hardDrop();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [moveLeft, moveRight, moveDown, rotate, hardDrop]);

  return {
    ...gameState,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
    resetGame
  };
};
