'use strict';

/**
 * ScoringSystem - Handles score calculation and rewards
 * @module ScoringSystem
 */
export const ScoringSystem = (() => {
    const LINE_SCORES = [40, 100, 300, 1200];

    /**
     * Calculates score for lines cleared
     * @param {number} linesCleared - Number of lines cleared
     * @param {number} level - Current game level
     * @returns {number} Score to add
     */
    function calculateLineScore(linesCleared, level) {
        if (linesCleared === 0 || linesCleared > 4) return 0;
        return LINE_SCORES[linesCleared - 1] * level;
    }

    /**
     * Calculates new level based on lines cleared
     * @param {number} totalLines - Total lines cleared
     * @returns {number} New level
     */
    function calculateLevel(totalLines) {
        return Math.floor(totalLines / 10) + 1;
    }

    /**
     * Calculates drop interval based on level
     * @param {number} level - Current level
     * @returns {number} Drop interval in milliseconds
     */
    function calculateDropInterval(level) {
        return Math.max(1000 - (level - 1) * 100, 100);
    }

    /**
     * Handles line clearing and updates game state
     * @param {Object} config - Configuration with game state and callbacks
     * @returns {number} Number of lines cleared
     */
    function processLineClear(config) {
        const linesToClear = config.boardModule.findCompletedLines(config.board);
        let linesCleared = 0;

        if (linesToClear.length > 0) {
            // Remove completed lines
            linesCleared = config.boardModule.clearLines(config.board, linesToClear);

            config.lines += linesCleared;

            // Calculate score based on lines cleared
            config.score += calculateLineScore(linesCleared, config.level);

            // Update level every 10 lines
            config.level = calculateLevel(config.lines);

            // Adjust drop speed based on level
            config.dropInterval = calculateDropInterval(config.level);

            // Award TetriCoins if not in AI vs AI mode or if player is taking control
            if (!config.isAiVsAiMode() || config.isPlayerControl()) {
                const reward = config.tetriCoins.awardLinesCleared(linesCleared);
                if (reward > 0) {
                    config.updateBalanceDisplay();
                    config.showCoinReward(reward);
                }
                
                // Track Tetris streak for achievement
                if (linesCleared === 4) {
                    config.incrementTetrisStreak();
                    config.achievementSystem.checkTetrisStreak(config.getTetrisStreak());
                    
                    // Track first Tetris in AI vs AI match
                    if (config.isAiVsAiMode() && !config.matchStats.firstTetris) {
                        config.matchStats.firstTetris = config.getCurrentPlayer();
                    }
                } else {
                    if (config.wasLastClear4Lines()) {
                        config.resetTetrisStreak();
                        config.achievementSystem.resetTetrisStreak();
                    }
                }
                
                // Vibrate on line clear (if supported)
                if (navigator.vibrate) {
                    const vibrationPattern = linesCleared === 4 ? [50, 50, 50] : [30];
                    navigator.vibrate(vibrationPattern);
                }
            }
            
            // Track score race in AI vs AI mode
            if (config.isAiVsAiMode() && !config.matchStats.firstToReach1000 && config.score >= 1000) {
                config.matchStats.firstToReach1000 = config.getCurrentPlayer();
            }

            config.updateScore();
        }

        return linesCleared;
    }

    return { 
        calculateLineScore,
        calculateLevel,
        calculateDropInterval,
        processLineClear
    };
})();
