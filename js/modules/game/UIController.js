'use strict';

/**
 * UIController - Manages UI updates and user interactions
 * @module UIController
 */
export const UIController = (() => {
    
    /**
     * Creates a UI controller
     * @param {Object} elements - DOM elements
     * @returns {Object} UI controller interface
     */
    function create(elements) {
        /**
         * Updates score display
         * @param {number} score - Current score
         * @param {number} level - Current level
         * @param {number} lines - Lines cleared
         */
        function updateScoreDisplay(score, level, lines) {
            if (elements.scoreElement) elements.scoreElement.textContent = score;
            if (elements.levelElement) elements.levelElement.textContent = level;
            if (elements.linesElement) elements.linesElement.textContent = lines;
        }

        /**
         * Updates high score display
         * @param {number} highScore - High score
         */
        function updateHighScoreDisplay(highScore) {
            if (elements.highScoreElement) {
                elements.highScoreElement.textContent = highScore;
            }
        }

        /**
         * Updates balance display
         */
        function updateBalanceDisplay() {
            if (elements.balanceElement && window.tetriCoins) {
                elements.balanceElement.textContent = window.tetriCoins.getBalance();
            }
        }

        /**
         * Updates AI insight message
         * @param {string} message - Insight message
         */
        function updateAiInsight(message) {
            if (elements.aiSummaryElement) {
                elements.aiSummaryElement.textContent = message;
            }
        }

        /**
         * Shows coin reward animation
         * @param {number} amount - Amount of coins
         */
        function showCoinReward(amount) {
            const reward = document.createElement('div');
            reward.className = 'coin-reward';
            reward.textContent = `+${amount} TC`;
            reward.style.position = 'absolute';
            reward.style.left = '50%';
            reward.style.top = '50%';
            reward.style.transform = 'translate(-50%, -50%)';
            reward.style.color = '#ffd700';
            reward.style.fontSize = '24px';
            reward.style.fontWeight = 'bold';
            reward.style.animation = 'floatUp 1s ease-out';
            reward.style.pointerEvents = 'none';
            reward.style.zIndex = '1000';
            
            document.body.appendChild(reward);
            setTimeout(() => reward.remove(), 1000);
        }

        /**
         * Shows a message to the user
         * @param {string} message - Message to display
         */
        function showMessage(message) {
            const messageEl = document.createElement('div');
            messageEl.className = 'game-message';
            messageEl.textContent = message;
            messageEl.style.position = 'fixed';
            messageEl.style.top = '20px';
            messageEl.style.left = '50%';
            messageEl.style.transform = 'translateX(-50%)';
            messageEl.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            messageEl.style.color = 'white';
            messageEl.style.padding = '15px 30px';
            messageEl.style.borderRadius = '10px';
            messageEl.style.fontSize = '18px';
            messageEl.style.zIndex = '10000';
            messageEl.style.animation = 'fadeInOut 3s ease-in-out';
            
            document.body.appendChild(messageEl);
            setTimeout(() => messageEl.remove(), 3000);
        }

        /**
         * Updates AI thinking display
         * @param {number} aiPlayer - AI player number (1 or 2)
         * @param {string} thinkingText - Thinking text
         * @param {string} planText - Plan text
         */
        function updateAiThinking(aiPlayer, thinkingText, planText) {
            const thinkingEl = aiPlayer === 1 ? elements.ai1ThinkingElement : elements.ai2ThinkingElement;
            const planEl = aiPlayer === 1 ? elements.ai1PlanElement : elements.ai2PlanElement;
            
            if (thinkingText && thinkingEl) thinkingEl.textContent = thinkingText;
            if (planText && planEl) planEl.textContent = planText;
        }

        /**
         * Updates current turn display
         * @param {number} aiPlayer - Current AI player
         */
        function updateTurnDisplay(aiPlayer) {
            if (elements.currentTurnElement) {
                elements.currentTurnElement.textContent = `AI ${aiPlayer}'s Turn`;
            }
        }

        /**
         * Shows/hides AI vs AI panel
         * @param {boolean} show - Whether to show the panel
         */
        function toggleAiVsAiPanel(show) {
            if (elements.aiVsAiPanel) {
                elements.aiVsAiPanel.style.display = show ? 'block' : 'none';
            }
            if (elements.aiInsightContainer) {
                elements.aiInsightContainer.style.display = show ? 'none' : '';
            }
            if (elements.startBtn) {
                elements.startBtn.style.display = show ? 'none' : 'inline-block';
            }
            if (elements.aiVsAiBtn) {
                elements.aiVsAiBtn.style.display = show ? 'none' : 'inline-block';
            }
            if (elements.tournamentBtn) {
                elements.tournamentBtn.style.display = show ? 'none' : 'inline-block';
            }
        }

        /**
         * Updates take control button state
         * @param {boolean} playerInControl - Whether player is in control
         */
        function updateTakeControlButton(playerInControl) {
            if (elements.takeControlBtn) {
                if (playerInControl) {
                    elements.takeControlBtn.textContent = 'Release Control';
                    elements.takeControlBtn.classList.add('active');
                } else {
                    elements.takeControlBtn.textContent = 'Take Control';
                    elements.takeControlBtn.classList.remove('active');
                }
            }
        }

        /**
         * Updates grid toggle button text
         * @param {boolean} showGrid - Whether grid is shown
         */
        function updateGridButton(showGrid) {
            if (elements.gridToggleBtn) {
                const lang = window.currentLanguage || 'en';
                const key = showGrid ? 'hide_grid' : 'show_grid';
                if (window.getTranslation) {
                    elements.gridToggleBtn.textContent = window.getTranslation(key, lang);
                }
            }
        }

        return {
            updateScoreDisplay,
            updateHighScoreDisplay,
            updateBalanceDisplay,
            updateAiInsight,
            showCoinReward,
            showMessage,
            updateAiThinking,
            updateTurnDisplay,
            toggleAiVsAiPanel,
            updateTakeControlButton,
            updateGridButton
        };
    }

    return { create };
})();
