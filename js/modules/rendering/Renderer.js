'use strict';

/**
 * Renderer - Handles all canvas drawing operations
 * @module Renderer
 */
export const Renderer = (() => {
    let mainCtx = null;
    let mainCanvas = null;
    let nextPieceCtx = null;
    let nextPieceCanvas = null;
    let blockSize = 30;
    let colors = [];

    /**
     * Initializes the renderer with canvas contexts and settings
     * @param {Object} config - Configuration object
     */
    function initialize(config) {
        mainCtx = config.ctx;
        mainCanvas = config.canvas;
        nextPieceCtx = config.nextPieceCtx;
        nextPieceCanvas = config.nextPieceCanvas;
        blockSize = config.blockSize;
        colors = config.colors;
    }

    /**
     * Draws a single block on the canvas
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Block color
     * @param {CanvasRenderingContext2D} context - Optional context (defaults to main)
     */
    function drawBlock(x, y, color, context = null) {
        const ctx_to_use = context || mainCtx;
        ctx_to_use.fillStyle = color;
        ctx_to_use.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        ctx_to_use.strokeStyle = '#000';
        ctx_to_use.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }

    /**
     * Draws a tetromino piece
     * @param {Object} piece - The piece to draw
     * @param {CanvasRenderingContext2D} context - Optional context (defaults to main)
     */
    function drawPiece(piece, context = null) {
        const ctx_to_use = context || mainCtx;
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(piece.x + x, piece.y + y, piece.color, ctx_to_use);
                }
            });
        });
    }

    /**
     * Draws the next piece preview
     * @param {Object} piece - The next piece to preview
     */
    function drawNextPiece(piece) {
        nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
        
        // Center the piece in the preview canvas
        const offsetX = (nextPieceCanvas.width / blockSize - piece.shape[0].length) / 2;
        const offsetY = (nextPieceCanvas.height / blockSize - piece.shape.length) / 2;
        
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(offsetX + x, offsetY + y, piece.color, nextPieceCtx);
                }
            });
        });
    }

    /**
     * Draws the game board
     * @param {Array<Array<number>>} boardState - Current board state
     */
    function drawBoard(boardState) {
        boardState.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(x, y, colors[value - 1]);
                }
            });
        });
    }

    /**
     * Draws the grid overlay
     * @param {boolean} enableGrid - Whether to draw the grid
     * @param {number} cols - Number of columns
     * @param {number} rows - Number of rows
     */
    function drawGrid(enableGrid, cols, rows) {
        if (!enableGrid) return;
        
        mainCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        mainCtx.lineWidth = 0.5;
        
        // Vertical lines
        for (let i = 0; i <= cols; i++) {
            mainCtx.beginPath();
            mainCtx.moveTo(i * blockSize, 0);
            mainCtx.lineTo(i * blockSize, mainCanvas.height);
            mainCtx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= rows; i++) {
            mainCtx.beginPath();
            mainCtx.moveTo(0, i * blockSize);
            mainCtx.lineTo(mainCanvas.width, i * blockSize);
            mainCtx.stroke();
        }
    }

    /**
     * Clears the main canvas
     */
    function clear() {
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    }

    /**
     * Draws pause overlay
     */
    function drawPauseOverlay() {
        mainCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.fillStyle = 'white';
        mainCtx.font = '30px Arial';
        mainCtx.textAlign = 'center';
        mainCtx.fillText('PAUSED', mainCanvas.width / 2, mainCanvas.height / 2);
        mainCtx.font = '20px Arial';
        mainCtx.fillText('Press P to Resume', mainCanvas.width / 2, mainCanvas.height / 2 + 40);
    }

    /**
     * Draws start screen overlay
     */
    function drawStartScreen() {
        mainCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.fillStyle = 'white';
        mainCtx.font = '30px Arial';
        mainCtx.textAlign = 'center';
        mainCtx.fillText('TETRIS', mainCanvas.width / 2, mainCanvas.height / 2 - 30);
        mainCtx.font = '20px Arial';
        mainCtx.fillText('Press Start or Enter to Play', mainCanvas.width / 2, mainCanvas.height / 2 + 20);
    }

    return { 
        initialize,
        drawBlock, 
        drawPiece, 
        drawNextPiece, 
        drawBoard, 
        drawGrid, 
        clear,
        drawPauseOverlay,
        drawStartScreen
    };
})();
