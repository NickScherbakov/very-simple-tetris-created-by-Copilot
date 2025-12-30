'use strict';

/**
 * GameLoopManager - Manages game lifecycle and main loop
 * @module GameLoopManager
 */
export const GameLoopManager = (() => {
    let gameLoopHandle = null;
    let lastTime = 0;
    let dropCounter = 0;

    /**
     * Creates a game loop manager
     * @param {Object} config - Configuration with game state and callbacks
     * @returns {Object} Game loop manager interface
     */
    function create(config) {
        /**
         * Resets the game state
         */
        function reset() {
            config.resetState();
            lastTime = 0;
            dropCounter = 0;
        }

        /**
         * Main game update function
         * @param {number} time - Current timestamp
         */
        function update(time = 0) {
            if (config.isGameOver() || config.isPaused()) return;
            
            const deltaTime = lastTime === 0 ? 0 : time - lastTime;
            lastTime = time;
            
            // In AI vs AI mode, AI controls the pieces, so we don't auto-drop unless player takes control
            if (!config.isAiVsAiMode() || config.isPlayerControl()) {
                dropCounter += deltaTime;
                if (dropCounter > config.getDropInterval()) {
                    config.movePieceDown();
                    dropCounter = 0;
                }
            }
            
            config.draw();
            gameLoopHandle = requestAnimationFrame(update);
        }

        /**
         * Starts the game loop
         * @param {Function} onStart - Callback when game starts
         * @param {Function} onReset - Callback to reset game state
         */
        function start(onStart, onReset) {
            onReset();
            config.onGameStart();
            
            if (gameLoopHandle) {
                cancelAnimationFrame(gameLoopHandle);
            }

            lastTime = performance.now();
            dropCounter = 0;
            gameLoopHandle = requestAnimationFrame(update);
            onStart();
        }

        /**
         * Pauses or resumes the game
         * @param {boolean} shouldPause - Whether to pause
         */
        function pause(shouldPause) {
            if (shouldPause) {
                if (gameLoopHandle) {
                    cancelAnimationFrame(gameLoopHandle);
                }
                config.drawPauseOverlay();
            } else {
                lastTime = performance.now();
                dropCounter = 0;
                gameLoopHandle = requestAnimationFrame(update);
            }
        }

        /**
         * Stops the game loop
         */
        function stop() {
            if (gameLoopHandle) {
                cancelAnimationFrame(gameLoopHandle);
                gameLoopHandle = null;
            }
        }

        /**
         * Resets drop counter (used when player takes control)
         */
        function resetDropCounter() {
            dropCounter = 0;
            lastTime = performance.now();
        }

        return { 
            reset, 
            start, 
            pause, 
            stop,
            resetDropCounter
        };
    }

    return { create };
})();
