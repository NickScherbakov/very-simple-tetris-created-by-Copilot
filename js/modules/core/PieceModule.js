'use strict';

/**
 * PieceModule - Handles tetromino piece creation and manipulation
 * @module PieceModule
 */
export const PieceModule = (() => {
    // Tetromino shapes (I, J, L, O, S, T, Z)
    const SHAPES = [
        [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
        [[1, 0, 0], [1, 1, 1], [0, 0, 0]],                         // J
        [[0, 0, 1], [1, 1, 1], [0, 0, 0]],                         // L
        [[1, 1], [1, 1]],                                          // O
        [[0, 1, 1], [1, 1, 0], [0, 0, 0]],                         // S
        [[0, 1, 0], [1, 1, 1], [0, 0, 0]],                         // T
        [[1, 1, 0], [0, 1, 1], [0, 0, 0]]                          // Z
    ];

    const COLORS = [
        'cyan',   // I
        'blue',   // J
        'orange', // L
        'yellow', // O
        'green',  // S
        'purple', // T
        'red'     // Z
    ];

    const SHAPE_NAMES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

    // Custom RNG function for deterministic replays
    let customRNG = null;

    /**
     * Creates a tetromino piece
     * @param {number} shapeIndex - Index of the shape to create
     * @param {number} boardCols - Number of columns on the board
     * @returns {Object} Piece object with shape, color, position
     */
    function create(shapeIndex, boardCols) {
        const template = SHAPES[shapeIndex];
        const shape = template.map((row) => row.slice());
        return {
            shape,
            color: COLORS[shapeIndex],
            shapeIndex,
            x: Math.floor(boardCols / 2) - Math.floor(template[0].length / 2),
            y: 0
        };
    }

    /**
     * Rotates a piece shape 90 degrees clockwise
     * @param {Object} piece - The piece to rotate
     * @returns {Array<Array<number>>} Rotated shape
     */
    function rotate(piece) {
        const originalShape = piece.shape;
        const size = originalShape.length;
        const rotated = Array.from({ length: size }, () => Array(size).fill(0));

        // Rotate 90 degrees clockwise
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                rotated[x][size - 1 - y] = originalShape[y][x];
            }
        }

        return rotated;
    }

    /**
     * Set a custom RNG function for deterministic piece generation
     * @param {function|null} rng - Custom RNG function or null to use Math.random
     */
    function setRNG(rng) {
        customRNG = rng;
    }

    /**
     * Get current RNG function
     * @returns {function} Current RNG function
     */
    function getRandom() {
        return customRNG ? customRNG() : Math.random();
    }

    return { 
        create, 
        rotate,
        setRNG,
        getRandom,
        SHAPES,
        COLORS,
        SHAPE_NAMES
    };
})();
