/**
 * Represents a position on the game board with row and column coordinates.
 */
export type Position = {
  row: number;
  col: number;
};

/**
 * Valid Tetromino piece types following standard Tetris notation.
 * I: Long piece
 * O: Square piece
 * T: T-shaped piece
 * S: S-shaped piece
 * Z: Z-shaped piece
 * J: J-shaped piece
 * L: L-shaped piece
 */
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

/**
 * Represents a Tetris piece (Tetromino) with its shape, type, and color.
 */
export type Tetromino = {
  /** 2D array representing the piece's shape where 1 indicates a filled cell */
  shape: number[][];
  /** The type of the Tetromino */
  type: TetrominoType;
  /** CSS color string for rendering the piece */
  color: string;
};

/**
 * Represents the complete state of a Tetris game.
 */
export type GameState = {
  /** 2D array representing the game board where numbers indicate filled cells */
  board: number[][];
  /** The currently falling piece */
  currentPiece: Tetromino;
  /** Position of the current piece on the board */
  currentPosition: Position;
  /** The next piece that will appear */
  nextPiece: Tetromino;
  /** Current game score */
  score: number;
  /** Whether the game is over */
  isGameOver: boolean;
  /** Whether the game is paused */
  isPaused: boolean;
};

/** Width of the game board in cells */
export const BOARD_WIDTH = 10;

/** Height of the game board in cells */
export const BOARD_HEIGHT = 20;

/** Size of each cell in pixels */
export const CELL_SIZE = 30;

/**
 * Definition of all Tetromino pieces with their shapes and colors.
 * Shapes are represented as 2D arrays where:
 * - 0 represents an empty cell
 * - 1 represents a filled cell
 * Colors are in hexadecimal format.
 */
export const TETROMINOES: { [key in TetrominoType]: Tetromino } = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    type: 'I',
    color: '#00f0f0'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    type: 'O',
    color: '#f0f000'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    type: 'T',
    color: '#a000f0'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    type: 'S',
    color: '#00f000'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    type: 'Z',
    color: '#f00000'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    type: 'J',
    color: '#0000f0'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    type: 'L',
    color: '#f0a000'
  }
};
