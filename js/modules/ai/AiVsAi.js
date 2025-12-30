'use strict';

/**
 * AiVsAi - AI vs AI game mode logic
 * @module AiVsAi
 */
export const AiVsAi = (() => {
    let boardModule = null;
    let colors = null;
    let cols = 0;
    let rows = 0;

    /**
     * Initializes the AI vs AI module
     * @param {Object} config - Configuration object
     */
    function initialize(config) {
        boardModule = config.boardModule;
        colors = config.colors;
        cols = config.cols;
        rows = config.rows;
    }

    /**
     * Evaluates board position for AI decision making
     * @param {Array<Array<number>>} testBoard - Board state to evaluate
     * @param {number} aiPlayerNum - AI player number (1 or 2)
     * @returns {number} Position evaluation score
     */
    function evaluatePosition(testBoard, aiPlayerNum) {
        const metrics = boardModule.computeMetrics(testBoard);
        
        // Different strategies for AI 1 (aggressive) vs AI 2 (defensive)
        if (aiPlayerNum === 1) {
            // AI 1: Aggressive - minimize height, clear lines
            return -metrics.aggregateHeight * 0.5 - metrics.totalHoles * 3 - metrics.bumpiness * 0.3;
        } else {
            // AI 2: Defensive - focus on stability
            return -metrics.maxHeight * 1.2 - metrics.totalHoles * 2 - metrics.bumpiness * 0.5;
        }
    }

    /**
     * Finds the best move for the current piece
     * @param {Object} piece - Current piece
     * @param {Array<Array<number>>} board - Current board state
     * @param {number} aiPlayerNum - AI player number (1 or 2)
     * @param {Function} checkCollision - Collision checking function
     * @returns {Object} Best move with x position and rotation
     */
    function findBestMove(piece, board, aiPlayerNum, checkCollision) {
        let bestScore = -Infinity;
        let bestMove = { x: piece.x, rotation: 0 };
        
        // Try all rotations (0, 1, 2, 3)
        for (let rotation = 0; rotation < 4; rotation++) {
            const testPiece = JSON.parse(JSON.stringify(piece));
            
            // Rotate piece
            for (let r = 0; r < rotation; r++) {
                const size = testPiece.shape.length;
                const rotated = Array.from({ length: size }, () => Array(size).fill(0));
                for (let y = 0; y < size; y++) {
                    for (let x = 0; x < size; x++) {
                        rotated[x][size - 1 - y] = testPiece.shape[y][x];
                    }
                }
                testPiece.shape = rotated;
            }
            
            // Try all horizontal positions
            for (let x = -2; x < cols + 2; x++) {
                testPiece.x = x;
                testPiece.y = piece.y;
                
                // Drop piece down
                while (!checkCollision(testPiece, 0, 1)) {
                    testPiece.y++;
                }
                
                // Check if this position is valid
                if (!checkCollision(testPiece)) {
                    // Simulate placing the piece
                    const testBoard = board.map(row => [...row]);
                    testPiece.shape.forEach((row, py) => {
                        row.forEach((value, px) => {
                            if (value) {
                                const boardY = testPiece.y + py;
                                const boardX = testPiece.x + px;
                                if (boardY >= 0 && boardY < rows && boardX >= 0 && boardX < cols) {
                                    testBoard[boardY][boardX] = colors.indexOf(testPiece.color) + 1;
                                }
                            }
                        });
                    });
                    
                    // Evaluate this position
                    const score = evaluatePosition(testBoard, aiPlayerNum);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { x, rotation };
                    }
                }
            }
        }
        
        return bestMove;
    }

    /**
     * Creates AI move executor
     * @param {Object} config - Configuration with callbacks and game state
     * @returns {Function} Execute AI move function
     */
    function createMoveExecutor(config) {
        return function executeAiMove() {
            if (!config.currentPiece || config.isGameOver() || !config.isAiVsAiMode() || config.isPlayerControl()) {
                return;
            }
            
            const currentPlayer = config.getCurrentPlayer();
            
            // Update AI thinking display
            config.updateThinking(currentPlayer, `AI ${currentPlayer} is analyzing...`, 'Calculating optimal position...');
            
            // Find best move
            const bestMove = findBestMove(
                config.currentPiece, 
                config.getBoard(), 
                currentPlayer,
                config.checkCollision
            );
            
            // Apply rotations
            for (let r = 0; r < bestMove.rotation; r++) {
                config.rotatePiece();
            }
            
            // Move to target X position
            const targetX = bestMove.x;
            const moveSteps = Math.abs(targetX - config.currentPiece.x);
            
            config.updateThinking(currentPlayer, null, `Moving to column ${targetX + 1}, ${bestMove.rotation} rotation(s)`);
            
            // Animate movement
            let movesMade = 0;
            const moveInterval = setInterval(() => {
                if (movesMade >= moveSteps || !config.currentPiece || config.isGameOver()) {
                    clearInterval(moveInterval);
                    // Drop the piece
                    setTimeout(() => {
                        if (config.currentPiece && !config.isGameOver()) {
                            config.hardDrop();
                            // Switch AI player
                            config.switchPlayer();
                        }
                    }, 100);
                    return;
                }
                
                if (config.currentPiece.x < targetX) {
                    config.movePieceRight();
                } else if (config.currentPiece.x > targetX) {
                    config.movePieceLeft();
                }
                movesMade++;
                config.draw();
            }, 50);
        };
    }

    return { 
        initialize,
        evaluatePosition, 
        findBestMove,
        createMoveExecutor
    };
})();
