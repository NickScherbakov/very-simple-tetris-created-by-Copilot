'use strict';

/**
 * BoardModule - Handles game board logic and operations
 * @module BoardModule
 */
export const BoardModule = (() => {
    const COLS = 10;
    const ROWS = 20;

    /**
     * Creates an empty game board
     * @returns {Array<Array<number>>} Empty board matrix
     */
    function createEmpty() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    /**
     * Checks if a piece position is valid on the board
     * @param {Object} piece - The tetromino piece
     * @param {Array<Array<number>>} boardState - Current board state
     * @param {number} offsetX - X offset to check
     * @param {number} offsetY - Y offset to check
     * @returns {boolean} True if position is valid
     */
    function isValidPosition(piece, boardState, offsetX = 0, offsetY = 0) {
        return !piece.shape.some((row, y) => {
            return row.some((value, x) => {
                if (!value) return false;
                const nextX = piece.x + x + offsetX;
                const nextY = piece.y + y + offsetY;
                
                return (
                    nextX < 0 ||
                    nextX >= COLS ||
                    nextY >= ROWS ||
                    (nextY >= 0 && boardState[nextY][nextX])
                );
            });
        });
    }

    /**
     * Merges a piece into the board
     * @param {Array<Array<number>>} boardState - Current board state
     * @param {Object} piece - The tetromino piece
     * @param {Array<string>} colors - Color palette
     */
    function mergePieceInto(boardState, piece, colors) {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardY = piece.y + y;
                    const boardX = piece.x + x;
                    if (boardY >= 0) {
                        boardState[boardY][boardX] = colors.indexOf(piece.color) + 1;
                    }
                }
            });
        });
    }

    /**
     * Finds completed lines on the board
     * @param {Array<Array<number>>} boardState - Current board state
     * @returns {Array<number>} Array of completed line indices
     */
    function findCompletedLines(boardState) {
        const linesToClear = [];
        outer: for (let y = ROWS - 1; y >= 0; y--) {
            for (let x = 0; x < COLS; x++) {
                if (!boardState[y][x]) {
                    continue outer;
                }
            }
            linesToClear.push(y);
        }
        return linesToClear;
    }

    /**
     * Clears completed lines from the board
     * @param {Array<Array<number>>} boardState - Current board state
     * @param {Array<number>} linesToClear - Lines to clear
     * @returns {number} Number of lines cleared
     */
    function clearLines(boardState, linesToClear) {
        let linesCleared = 0;
        if (linesToClear.length > 0) {
            linesToClear.sort((a, b) => b - a).forEach(y => {
                boardState.splice(y, 1);
                boardState.unshift(Array(COLS).fill(0));
            });
            linesCleared = linesToClear.length;
        }
        return linesCleared;
    }

    /**
     * Computes board metrics for AI evaluation
     * @param {Array<Array<number>>} boardState - Current board state
     * @returns {Object} Board metrics (heights, holes, bumpiness, etc.)
     */
    function computeMetrics(boardState) {
        const heights = Array(COLS).fill(0);
        const holes = Array(COLS).fill(0);

        for (let x = 0; x < COLS; x++) {
            let seenBlock = false;
            let columnHeight = 0;
            for (let y = 0; y < ROWS; y++) {
                if (boardState[y][x]) {
                    if (!seenBlock) {
                        columnHeight = ROWS - y;
                        seenBlock = true;
                    }
                } else if (seenBlock) {
                    holes[x]++;
                }
            }
            heights[x] = columnHeight;
        }

        const totalHoles = holes.reduce((sum, value) => sum + value, 0);
        const maxHeight = heights.reduce((max, value) => Math.max(max, value), 0);
        const aggregateHeight = heights.reduce((sum, value) => sum + value, 0);
        let bumpiness = 0;
        for (let x = 0; x < COLS - 1; x++) {
            bumpiness += Math.abs(heights[x] - heights[x + 1]);
        }

        return {
            heights,
            holes,
            totalHoles,
            maxHeight,
            aggregateHeight,
            bumpiness
        };
    }

    return { 
        createEmpty, 
        isValidPosition, 
        mergePieceInto, 
        findCompletedLines, 
        clearLines, 
        computeMetrics,
        COLS,
        ROWS
    };
})();
