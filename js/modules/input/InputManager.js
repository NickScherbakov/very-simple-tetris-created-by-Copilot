'use strict';

/**
 * InputManager - Handles keyboard and touch input
 * @module InputManager
 */
export const InputManager = (() => {
    const minSwipeDistance = 30;
    let touchStartX = 0;
    let touchStartY = 0;

    /**
     * Handles keyboard input
     * @param {KeyboardEvent} e - The keyboard event
     * @param {Object} callbacks - Callback functions for different actions
     */
    function handleKeydown(e, callbacks) {
        // Allow starting the game with Enter or Space when game is over
        if (callbacks.isGameOver && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            callbacks.onStart();
            return;
        }
        
        // Block other controls when game is over
        if (callbacks.isGameOver) return;
        
        // Block movement controls when game is not active
        if (!callbacks.hasCurrentPiece && !callbacks.isGameOver && ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
            return;
        }
        
        // If game is paused, only allow unpause
        if (callbacks.isPaused && e.key !== 'p' && e.key !== 'P') {
            return;
        }
        
        switch (e.key) {
            case 'ArrowLeft':
                callbacks.onMoveLeft();
                break;
            case 'ArrowRight':
                callbacks.onMoveRight();
                break;
            case 'ArrowDown':
                callbacks.onMoveDown();
                break;
            case 'ArrowUp':
                callbacks.onRotate();
                break;
            case ' ':
                e.preventDefault();
                callbacks.onHardDrop();
                break;
            case 'p':
            case 'P':
                callbacks.onTogglePause();
                break;
            case 'g':
            case 'G':
                callbacks.onToggleGrid();
                break;
            case 't':
            case 'T':
                if (callbacks.isAiVsAiMode) {
                    callbacks.onTakeControl();
                }
                break;
            case 'Enter':
            case 's':
            case 'S':
                if (!callbacks.hasCurrentPiece && !callbacks.isGameOver) {
                    callbacks.onStart();
                }
                break;
        }
    }

    /**
     * Handles touch start event
     * @param {TouchEvent} e - The touch event
     * @param {boolean} isActive - Whether the game is active
     */
    function handleTouchStart(e, isActive) {
        if (!isActive) return;
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }

    /**
     * Handles touch move event
     * @param {TouchEvent} e - The touch event
     */
    function handleTouchMove(e) {
        e.preventDefault();
    }

    /**
     * Handles touch end event
     * @param {TouchEvent} e - The touch event
     * @param {boolean} isActive - Whether the game is active
     * @param {Object} callbacks - Callback functions for different actions
     */
    function handleTouchEnd(e, isActive, callbacks) {
        if (!isActive) return;
        e.preventDefault();
        
        const touch = e.changedTouches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // Swipe detection
        if (absDeltaX > minSwipeDistance || absDeltaY > minSwipeDistance) {
            if (absDeltaX > absDeltaY) {
                // Horizontal swipe
                if (deltaX > 0) {
                    callbacks.onMoveRight();
                } else {
                    callbacks.onMoveLeft();
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    callbacks.onHardDrop();
                }
            }
        } else {
            // Tap - rotate piece
            callbacks.onRotate();
        }
    }

    return { 
        handleKeydown, 
        handleTouchStart, 
        handleTouchMove, 
        handleTouchEnd 
    };
})();
