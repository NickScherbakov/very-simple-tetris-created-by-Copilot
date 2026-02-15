// Tetris Game - Modular Architecture
import { BoardModule } from './js/modules/core/BoardModule.js';
import { PieceModule } from './js/modules/core/PieceModule.js';
import { GameLoopManager } from './js/modules/core/GameLoopManager.js';
import { Renderer } from './js/modules/rendering/Renderer.js';
import { InputManager } from './js/modules/input/InputManager.js';
import { createAdaptiveEngine } from './js/modules/ai/AdaptiveEngine.js';
import { AiVsAi } from './js/modules/ai/AiVsAi.js';
import { ScoringSystem } from './js/modules/game/ScoringSystem.js';
import { UIController } from './js/modules/game/UIController.js';
import { soundEngine } from './js/modules/audio/SoundEngine.js';

document.addEventListener('DOMContentLoaded', () => {
    // Game constants
    const BLOCK_SIZE = 30;
    const STORAGE_KEYS = {
        highScore: 'tetrisHighScore',
        grid: 'tetrisShowGrid',
        aiState: 'tetrisAiStateV1'
    };
    
    // Get canvases and contexts
    const canvas = document.getElementById('tetris-canvas');
    const ctx = canvas.getContext('2d');
    const nextPieceCanvas = document.getElementById('next-piece-canvas');
    const nextPieceCtx = nextPieceCanvas.getContext('2d');
    
    // Get DOM elements
    const elements = {
        scoreElement: document.getElementById('score'),
        highScoreElement: document.getElementById('high-score'),
        levelElement: document.getElementById('level'),
        linesElement: document.getElementById('lines'),
        startBtn: document.getElementById('start-btn'),
        gridToggleBtn: document.getElementById('grid-toggle'),
        soundToggleBtn: document.getElementById('sound-toggle'),
        aiSummaryElement: document.getElementById('ai-summary'),
        aiInsightContainer: document.querySelector('.ai-insight'),
        aiVsAiBtn: document.getElementById('ai-vs-ai-btn'),
        aiVsAiPanel: document.getElementById('ai-vs-ai-panel'),
        ai1ThinkingElement: document.getElementById('ai1-thinking'),
        ai1PlanElement: document.getElementById('ai1-plan'),
        ai2ThinkingElement: document.getElementById('ai2-thinking'),
        ai2PlanElement: document.getElementById('ai2-plan'),
        takeControlBtn: document.getElementById('take-control-btn'),
        exitAiModeBtn: document.getElementById('exit-ai-mode-btn'),
        currentTurnElement: document.getElementById('current-turn'),
        balanceElement: document.getElementById('tetricoins-balance'),
        tournamentBtn: document.getElementById('tournament-btn'),
        achievementsBtn: document.getElementById('achievements-btn'),
        shareBtn: document.getElementById('share-btn'),
        achievementsModal: document.getElementById('achievements-modal'),
        closeAchievementsBtn: document.getElementById('close-achievements')
    };
    
    // Game state variables
    let board = null;
    let currentPiece = null;
    let nextPiece = null;
    let score = 0;
    let highScore = 0;
    let lines = 0;
    let level = 1;
    let gameOver = false;
    let isPaused = false;
    let dropInterval = 1000;
    let showGrid = true;
    let showGhost = true;
    let consecutiveTetris = 0;
    let lastLinesClearedWas4 = false;
    
    // AI vs AI mode variables
    let aiVsAiMode = false;
    let currentAiPlayer = 1;
    let playerTakingControl = false;
    let matchStats = {
        ai1Score: 0,
        ai2Score: 0,
        firstTetris: null,
        firstToReach1000: null
    };
    
    // Betting and tournament variables
    let bettingEnabled = false;
    let currentBet = null;
    let tournamentMode = false;
    let tournamentMatchCount = 0;

    // Initialize modules
    Renderer.initialize({
        ctx,
        canvas,
        nextPieceCtx,
        nextPieceCanvas,
        blockSize: BLOCK_SIZE,
        colors: PieceModule.COLORS
    });

    AiVsAi.initialize({
        boardModule: BoardModule,
        colors: PieceModule.COLORS,
        cols: BoardModule.COLS,
        rows: BoardModule.ROWS
    });

    const aiTrainer = createAdaptiveEngine(
        BoardModule,
        PieceModule.SHAPE_NAMES,
        STORAGE_KEYS.aiState
    );

    const uiController = UIController.create(elements);

    // Create game board
    function createBoard() {
        return BoardModule.createEmpty();
    }

    // Create piece functions
    function createPiece(shapeIndex) {
        return PieceModule.create(shapeIndex, BoardModule.COLS);
    }

    function getAdaptivePiece() {
        const shapeIndex = aiTrainer.selectShapeIndex();
        return createPiece(shapeIndex);
    }

    // Storage functions
    function persistHighScore() {
        try {
            localStorage.setItem(STORAGE_KEYS.highScore, highScore.toString());
        } catch (err) {
            // Ignore storage errors
        }
    }

    function persistGridPreference() {
        try {
            localStorage.setItem(STORAGE_KEYS.grid, showGrid ? '1' : '0');
        } catch (err) {
            // Ignore storage errors
        }
    }

    function loadPreferences() {
        try {
            const storedHighScore = localStorage.getItem(STORAGE_KEYS.highScore);
            if (storedHighScore) {
                highScore = parseInt(storedHighScore, 10);
                if (isNaN(highScore)) highScore = 0;
            }
            uiController.updateHighScoreDisplay(highScore);

            const storedGrid = localStorage.getItem(STORAGE_KEYS.grid);
            if (storedGrid !== null) {
                showGrid = storedGrid === '1';
            }
            uiController.updateGridButton(showGrid);
            
            const storedGhost = localStorage.getItem('tetrisShowGhost');
            if (storedGhost !== null) {
                showGhost = storedGhost === 'true';
            }

            aiTrainer.loadFromStorage();
        } catch (err) {
            // Ignore storage errors
        }
    }

    function checkDailyBonus() {
        if (window.tetriCoins) {
            const bonus = window.tetriCoins.checkDailyBonus();
            if (bonus > 0) {
                uiController.showMessage(`Daily bonus: +${bonus} TC!`);
                uiController.updateBalanceDisplay();
            }
        }
    }

    // Piece movement and collision
    function checkCollision(piece, offsetX = 0, offsetY = 0) {
        return !BoardModule.isValidPosition(piece, board, offsetX, offsetY);
    }

    function mergePiece() {
        BoardModule.mergePieceInto(board, currentPiece, PieceModule.COLORS);
    }
    
    function calculateGhostPosition(piece) {
        if (!piece) return null;
        
        // Create a copy of the piece
        const ghostPiece = {
            ...piece,
            shape: piece.shape,
            x: piece.x,
            y: piece.y
        };
        
        // Drop the ghost piece until it collides
        while (!checkCollision(ghostPiece, 0, 1)) {
            ghostPiece.y++;
        }
        
        // Only return ghost if it's not at the same position as current piece
        if (ghostPiece.y === piece.y) {
            return null;
        }
        
        return ghostPiece;
    }

    function movePieceDown() {
        if (!currentPiece) return false;
        
        if (!checkCollision(currentPiece, 0, 1)) {
            currentPiece.y++;
            soundEngine.drop();
            return true;
        } else {
            // Piece has landed
            const beforeMetrics = BoardModule.computeMetrics(board);
            mergePiece();
            const linesCleared = clearLines();
            const afterMetrics = BoardModule.computeMetrics(board);
            
            // Register placement with adaptive engine
            if (!aiVsAiMode || playerTakingControl) {
                aiTrainer.registerPlacement(
                    currentPiece.shapeIndex,
                    beforeMetrics,
                    afterMetrics,
                    linesCleared
                );
                uiController.updateAiInsight(aiTrainer.getLiveHint());
            }
            
            spawnPiece();
            return false;
        }
    }

    function movePieceLeft() {
        if (!currentPiece) return;
        if (!checkCollision(currentPiece, -1, 0)) {
            currentPiece.x--;
            soundEngine.move();
            draw();
        }
    }

    function movePieceRight() {
        if (!currentPiece) return;
        if (!checkCollision(currentPiece, 1, 0)) {
            currentPiece.x++;
            soundEngine.move();
            draw();
        }
    }

    function rotatePiece() {
        if (!currentPiece) return;
        
        const rotated = PieceModule.rotate(currentPiece);
        const originalShape = currentPiece.shape;
        currentPiece.shape = rotated;
        
        // Check if rotation is valid
        if (checkCollision(currentPiece)) {
            // Try wall kicks
            const offsets = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 2, y: 0 },
                { x: -2, y: 0 },
                { x: 0, y: -1 }
            ];
            
            let validRotation = false;
            for (const offset of offsets) {
                if (!checkCollision(currentPiece, offset.x, offset.y)) {
                    currentPiece.x += offset.x;
                    currentPiece.y += offset.y;
                    validRotation = true;
                    break;
                }
            }
            
            if (!validRotation) {
                currentPiece.shape = originalShape;
            } else {
                soundEngine.rotate();
            }
        } else {
            soundEngine.rotate();
        }
        draw();
    }

    function hardDrop() {
        if (!currentPiece) return;
        
        while (!checkCollision(currentPiece, 0, 1)) {
            currentPiece.y++;
        }
        
        soundEngine.hardDrop();
        
        const beforeMetrics = BoardModule.computeMetrics(board);
        mergePiece();
        const linesCleared = clearLines();
        const afterMetrics = BoardModule.computeMetrics(board);
        
        // Register placement with adaptive engine
        if (!aiVsAiMode || playerTakingControl) {
            aiTrainer.registerPlacement(
                currentPiece.shapeIndex,
                beforeMetrics,
                afterMetrics,
                linesCleared
            );
            uiController.updateAiInsight(aiTrainer.getLiveHint());
        }
        
        draw();
        spawnPiece();
    }

    function clearLines() {
        const linesToClear = BoardModule.findCompletedLines(board);
        let linesCleared = 0;

        if (linesToClear.length > 0) {
            // Remove completed lines
            linesCleared = BoardModule.clearLines(board, linesToClear);

            lines += linesCleared;
            const prevLevel = level;

            // Calculate score based on lines cleared
            score += ScoringSystem.calculateLineScore(linesCleared, level);

            // Update level every 10 lines
            level = ScoringSystem.calculateLevel(lines);
            
            // Check for level up
            if (level > prevLevel) {
                soundEngine.levelUp();
            }

            // Adjust drop speed based on level
            dropInterval = ScoringSystem.calculateDropInterval(level);

            // Award TetriCoins if not in AI vs AI mode or if player is taking control
            if (!aiVsAiMode || playerTakingControl) {
                const reward = window.tetriCoins.awardLinesCleared(linesCleared);
                if (reward > 0) {
                    uiController.updateBalanceDisplay();
                    uiController.showCoinReward(reward);
                    soundEngine.coinEarned();
                }
                
                // Track Tetris streak for achievement
                if (linesCleared === 4) {
                    consecutiveTetris++;
                    lastLinesClearedWas4 = true;
                    window.achievementSystem.checkTetrisStreak(consecutiveTetris);
                    soundEngine.tetris();
                    
                    // Track first Tetris in AI vs AI match
                    if (aiVsAiMode && !matchStats.firstTetris) {
                        matchStats.firstTetris = currentAiPlayer;
                    }
                } else {
                    soundEngine.lineClear(linesCleared);
                    if (lastLinesClearedWas4) {
                        consecutiveTetris = 0;
                        window.achievementSystem.resetTetrisStreak();
                    }
                    lastLinesClearedWas4 = false;
                }
                
                // Vibrate on line clear (if supported)
                if (navigator.vibrate) {
                    const vibrationPattern = linesCleared === 4 ? [50, 50, 50] : [30];
                    navigator.vibrate(vibrationPattern);
                }
            }
            
            // Track score race in AI vs AI mode
            if (aiVsAiMode && !matchStats.firstToReach1000 && score >= 1000) {
                matchStats.firstToReach1000 = currentAiPlayer;
            }

            // Update score display
            uiController.updateScoreDisplay(score, level, lines);
            if (score > highScore) {
                highScore = score;
                uiController.updateHighScoreDisplay(highScore);
                persistHighScore();
            }
        }

        return linesCleared;
    }

    function spawnPiece() {
        if (!nextPiece) {
            nextPiece = getAdaptivePiece();
        }
        
        currentPiece = nextPiece;
        nextPiece = getAdaptivePiece();
        
        Renderer.drawNextPiece(nextPiece);
        
        if (checkCollision(currentPiece)) {
            gameOver = true;
            soundEngine.gameOver();
            
            // Check achievements
            if (window.achievementSystem) {
                window.achievementSystem.checkScoreAchievement(score);
                window.achievementSystem.checkLinesAchievement(lines);
            }
            
            // Handle bet result if in AI vs AI mode
            if (aiVsAiMode && currentBet && window.bettingSystem) {
                const result = window.bettingSystem.processBetResult({
                    winner: currentAiPlayer === 1 ? 2 : 1,
                    finalScore: score,
                    firstTetris: matchStats.firstTetris,
                    firstToReach1000: matchStats.firstToReach1000
                });
                
                if (result) {
                    showBetResult(result);
                }
            }
            
            // Show game over message
            const finalMetrics = BoardModule.computeMetrics(board);
            uiController.updateAiInsight(aiTrainer.getSummary(finalMetrics));
            
            gameLoopManager.stop();
            
            // In AI vs AI mode, handle tournament continuation
            if (aiVsAiMode && tournamentMode) {
                tournamentMatchCount++;
                if (tournamentMatchCount < 5) {
                    setTimeout(() => {
                        startAiVsAiMode();
                    }, 2000);
                } else {
                    const jackpot = window.bettingSystem.finishTournament();
                    if (jackpot > 0) {
                        uiController.showMessage(`Tournament complete! Jackpot: ${jackpot} TC`);
                    }
                    exitAiVsAiMode();
                }
            }
            
            // Auto-execute AI move in AI vs AI mode
            if (aiVsAiMode && !gameOver && !playerTakingControl) {
                setTimeout(() => executeAiMove(), 500);
            }
        }
    }

    function draw() {
        Renderer.clear();
        Renderer.drawGrid(showGrid, BoardModule.COLS, BoardModule.ROWS);
        Renderer.drawBoard(board);
        if (currentPiece && showGhost) {
            const ghostPiece = calculateGhostPosition(currentPiece);
            if (ghostPiece) {
                Renderer.drawGhostPiece(ghostPiece);
            }
        }
        if (currentPiece) {
            Renderer.drawPiece(currentPiece);
        }
    }

    function toggleGrid() {
        showGrid = !showGrid;
        uiController.updateGridButton(showGrid);
        persistGridPreference();
        draw();
    }
    
    function toggleGhost() {
        showGhost = !showGhost;
        localStorage.setItem('tetrisShowGhost', showGhost.toString());
        draw();
    }
    
    function toggleSound() {
        const enabled = soundEngine.toggleSound();
        updateSoundButton(enabled);
    }
    
    function updateSoundButton(enabled) {
        if (elements.soundToggleBtn) {
            const key = enabled ? 'sound_on' : 'sound_off';
            const icon = enabled ? '🔊' : '🔇';
            elements.soundToggleBtn.setAttribute('data-i18n', key);
            elements.soundToggleBtn.textContent = `${icon} ${window.i18n ? window.i18n.t(key) : (enabled ? 'Sound' : 'Muted')}`;
        }
    }

    // Game loop manager
    const gameLoopManager = GameLoopManager.create({
        resetState: () => {
            board = createBoard();
            score = 0;
            lines = 0;
            level = 1;
            dropInterval = 1000;
            gameOver = false;
            isPaused = false;
            currentPiece = null;
            nextPiece = null;
            consecutiveTetris = 0;
            lastLinesClearedWas4 = false;
        },
        isGameOver: () => gameOver,
        isPaused: () => isPaused,
        isAiVsAiMode: () => aiVsAiMode,
        isPlayerControl: () => playerTakingControl,
        getDropInterval: () => dropInterval,
        movePieceDown: () => movePieceDown(),
        draw: () => draw(),
        onGameStart: () => {
            aiTrainer.resetForNewGame(board);
            uiController.updateScoreDisplay(score, level, lines);
            uiController.updateAiInsight(aiTrainer.getLiveHint());
            spawnPiece();
            draw();
        },
        drawPauseOverlay: () => Renderer.drawPauseOverlay()
    });

    // AI vs AI execution function
    function executeAiMove() {
        if (!currentPiece || gameOver || !aiVsAiMode || playerTakingControl) return;
        
        // Update AI thinking display
        uiController.updateAiThinking(currentAiPlayer, `AI ${currentAiPlayer} is analyzing...`, 'Calculating optimal position...');
        
        // Find best move
        const bestMove = AiVsAi.findBestMove(
            currentPiece, 
            board, 
            currentAiPlayer,
            checkCollision
        );
        
        // Apply rotations
        for (let r = 0; r < bestMove.rotation; r++) {
            rotatePiece();
        }
        
        // Move to target X position
        const targetX = bestMove.x;
        const moveSteps = Math.abs(targetX - currentPiece.x);
        
        uiController.updateAiThinking(currentAiPlayer, null, `Moving to column ${targetX + 1}, ${bestMove.rotation} rotation(s)`);
        
        // Animate movement
        let movesMade = 0;
        const moveInterval = setInterval(() => {
            if (movesMade >= moveSteps || !currentPiece || gameOver) {
                clearInterval(moveInterval);
                // Drop the piece
                setTimeout(() => {
                    if (currentPiece && !gameOver) {
                        hardDrop();
                        // Switch AI player
                        currentAiPlayer = currentAiPlayer === 1 ? 2 : 1;
                        uiController.updateTurnDisplay(currentAiPlayer);
                    }
                }, 100);
                return;
            }
            
            if (currentPiece.x < targetX) {
                movePieceRight();
            } else if (currentPiece.x > targetX) {
                movePieceLeft();
            }
            movesMade++;
            draw();
        }, 50);
    }

    // Game control functions
    function startGame() {
        gameLoopManager.start(
            () => {
                elements.startBtn.textContent = 'Restart';
                checkDailyBonus();
            },
            () => {
                gameLoopManager.reset();
                score = 0;
                lines = 0;
                level = 1;
                dropInterval = 1000;
                uiController.updateScoreDisplay(score, level, lines);
            }
        );
    }

    function togglePause() {
        if (gameOver || !currentPiece) return;
        isPaused = !isPaused;
        gameLoopManager.pause(isPaused);
    }

    function startAiVsAiMode() {
        // Reset match stats
        matchStats = {
            ai1Score: 0,
            ai2Score: 0,
            firstTetris: null,
            firstToReach1000: null
        };
        
        // Start betting phase
        bettingEnabled = true;
        window.bettingSystem.startBetting(
            (bet) => {
                currentBet = bet;
                bettingEnabled = false;
                startAiMatch();
            },
            () => {
                currentBet = null;
                bettingEnabled = false;
                startAiMatch();
            }
        );
    }

    function startAiMatch() {
        aiVsAiMode = true;
        currentAiPlayer = 1;
        playerTakingControl = false;
        
        uiController.toggleAiVsAiPanel(true);
        startGame();
        uiController.updateTurnDisplay(currentAiPlayer);
        
        // Start AI moves
        setTimeout(() => {
            if (aiVsAiMode) {
                executeAiMove();
            }
        }, 1000);
    }

    function exitAiVsAiMode() {
        aiVsAiMode = false;
        playerTakingControl = false;
        
        uiController.toggleAiVsAiPanel(false);
        gameLoopManager.stop();
        gameOver = true;
        
        // Show start screen
        draw();
        Renderer.drawStartScreen();
    }

    function takeControl() {
        playerTakingControl = !playerTakingControl;
        uiController.updateTakeControlButton(playerTakingControl);
        
        if (playerTakingControl) {
            gameLoopManager.resetDropCounter();
            uiController.updateAiThinking(1, 'Player in control!', null);
            uiController.updateAiThinking(2, 'Waiting...', null);
        } else {
            if (currentPiece && !gameOver) {
                executeAiMove();
            }
        }
    }

    function showBetResult(result) {
        const overlay = document.createElement('div');
        overlay.className = 'bet-result-overlay';
        
        const content = document.createElement('div');
        content.className = `bet-result-content ${result.won ? 'win' : 'lose'}`;
        
        const icon = document.createElement('div');
        icon.className = 'result-icon';
        icon.textContent = result.won ? '🎉' : '😢';
        
        const message = document.createElement('div');
        message.className = 'result-message';
        message.innerHTML = `
            <h2>${result.won ? 'You Won!' : 'You Lost'}</h2>
            <p>${result.message}</p>
            ${result.won ? `<p class="winnings">+${result.payout} TC</p>` : ''}
        `;
        
        content.appendChild(icon);
        content.appendChild(message);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        if (result.won) {
            createConfetti();
        }
        
        setTimeout(() => overlay.remove(), 5000);
    }

    function createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = ['#ff0', '#f0f', '#0ff', '#f00', '#0f0'][Math.floor(Math.random() * 5)];
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }
    }

    function startTournament() {
        tournamentMode = true;
        tournamentMatchCount = 0;
        window.bettingSystem.startTournament();
        
        const tournamentProgress = document.getElementById('tournament-progress');
        if (tournamentProgress) {
            tournamentProgress.style.display = 'block';
        }
        
        startAiVsAiMode();
    }

    function showAchievementsModal() {
        if (!elements.achievementsModal) return;
        
        elements.achievementsModal.style.display = 'flex';
        
        const progressElement = document.getElementById('achievements-progress');
        if (progressElement) {
            progressElement.textContent = window.achievementSystem.getProgress();
        }
        
        const listElement = document.getElementById('achievements-list');
        if (listElement) {
            listElement.innerHTML = '';
            const achievements = window.achievementSystem.getAllAchievements();
            achievements.forEach(achievement => {
                const item = document.createElement('div');
                item.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
                item.innerHTML = `
                    <div class="achievement-icon-large">${achievement.name.split(' ')[0]}</div>
                    <div class="achievement-info">
                        <h3>${achievement.name}</h3>
                        <p>${achievement.description}</p>
                        ${achievement.progress !== undefined && !achievement.unlocked ? 
                            `<p>Progress: ${achievement.progress}/${achievement.target}</p>` : ''}
                    </div>
                    ${achievement.reward > 0 ? `<div class="achievement-reward">+${achievement.reward} TC</div>` : ''}
                `;
                listElement.appendChild(item);
            });
        }
        
        const leaderboardElement = document.getElementById('leaderboard');
        if (leaderboardElement) {
            leaderboardElement.innerHTML = '';
            const leaderboard = window.achievementSystem.getLeaderboard();
            if (leaderboard.length === 0) {
                leaderboardElement.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5);">No entries</p>';
            } else {
                leaderboard.forEach((entry, index) => {
                    const item = document.createElement('div');
                    item.className = 'leaderboard-item';
                    item.innerHTML = `
                        <div class="leaderboard-rank">#${index + 1}</div>
                        <div class="leaderboard-name">${entry.name || 'Player'}</div>
                        <div class="leaderboard-balance">${window.tetriCoins.formatCoins(entry.balance)} TC</div>
                    `;
                    leaderboardElement.appendChild(item);
                });
            }
        }
    }

    function initBettingUI() {
        // Betting UI initialization (keep existing logic)
        let selectedBetType = null;
        let selectedTarget = null;
        let selectedAmount = null;

        const betTypeCards = document.querySelectorAll('.bet-type-card');
        betTypeCards.forEach(card => {
            const betType = card.dataset.betType;
            const buttons = card.querySelectorAll('.bet-option-btn');
            
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.bet-option-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedBetType = betType;
                    selectedTarget = btn.dataset.target;
                    updatePlaceBetButton();
                });
            });
        });

        const quickBetButtons = document.querySelectorAll('.quick-bet-btn');
        quickBetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                quickBetButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedAmount = parseInt(btn.dataset.amount);
                const customBetInput = document.getElementById('custom-bet-amount');
                if (customBetInput) customBetInput.value = '';
                updatePlaceBetButton();
            });
        });

        const customBetInput = document.getElementById('custom-bet-amount');
        if (customBetInput) {
            customBetInput.addEventListener('input', () => {
                quickBetButtons.forEach(b => b.classList.remove('selected'));
                const value = parseInt(customBetInput.value);
                selectedAmount = isNaN(value) ? null : value;
                updatePlaceBetButton();
            });
        }

        const placeBetBtn = document.getElementById('place-bet-btn');
        if (placeBetBtn) {
            placeBetBtn.addEventListener('click', () => {
                if (!selectedBetType || !selectedTarget || !selectedAmount) return;
                
                const result = window.bettingSystem.placeBet(selectedBetType, selectedTarget, selectedAmount);
                if (result.success) {
                    uiController.showMessage(`Bet placed: ${selectedAmount} TC`);
                    placeBetBtn.disabled = true;
                    uiController.updateBalanceDisplay();
                } else {
                    uiController.showMessage(`Error: ${result.message}`);
                }
            });
        }

        const cancelBetBtn = document.getElementById('cancel-bet-btn');
        if (cancelBetBtn) {
            cancelBetBtn.addEventListener('click', () => {
                window.bettingSystem.stopBetting();
            });
        }

        function updatePlaceBetButton() {
            if (placeBetBtn) {
                placeBetBtn.disabled = !(selectedBetType && selectedTarget && selectedAmount);
            }
        }
    }

    // Input handlers
    document.addEventListener('keydown', (e) => {
        InputManager.handleKeydown(e, {
            isGameOver: gameOver,
            hasCurrentPiece: !!currentPiece,
            isPaused: isPaused,
            isAiVsAiMode: aiVsAiMode,
            onStart: () => startGame(),
            onMoveLeft: () => movePieceLeft(),
            onMoveRight: () => movePieceRight(),
            onMoveDown: () => movePieceDown(),
            onRotate: () => rotatePiece(),
            onHardDrop: () => hardDrop(),
            onTogglePause: () => togglePause(),
            onToggleGrid: () => toggleGrid(),
            onToggleGhost: () => toggleGhost(),
            onTakeControl: () => takeControl()
        });
    });

    canvas.addEventListener('touchstart', (e) => {
        InputManager.handleTouchStart(e, !!currentPiece && !gameOver);
    });

    canvas.addEventListener('touchmove', (e) => {
        InputManager.handleTouchMove(e);
    });

    canvas.addEventListener('touchend', (e) => {
        InputManager.handleTouchEnd(e, !!currentPiece && !gameOver, {
            onMoveLeft: () => movePieceLeft(),
            onMoveRight: () => movePieceRight(),
            onRotate: () => rotatePiece(),
            onHardDrop: () => hardDrop()
        });
    });

    // Button event listeners
    elements.startBtn.addEventListener('click', () => {
        soundEngine.init();
        startGame();
    });
    if (elements.gridToggleBtn) {
        elements.gridToggleBtn.addEventListener('click', toggleGrid);
    }
    if (elements.soundToggleBtn) {
        elements.soundToggleBtn.addEventListener('click', toggleSound);
    }
    if (elements.aiVsAiBtn) {
        elements.aiVsAiBtn.addEventListener('click', startAiVsAiMode);
    }
    if (elements.exitAiModeBtn) {
        elements.exitAiModeBtn.addEventListener('click', exitAiVsAiMode);
    }
    if (elements.takeControlBtn) {
        elements.takeControlBtn.addEventListener('click', takeControl);
    }
    if (elements.tournamentBtn) {
        elements.tournamentBtn.addEventListener('click', startTournament);
    }
    if (elements.achievementsBtn) {
        elements.achievementsBtn.addEventListener('click', showAchievementsModal);
    }
    if (elements.closeAchievementsBtn) {
        elements.closeAchievementsBtn.addEventListener('click', () => {
            elements.achievementsModal.style.display = 'none';
        });
    }
    if (elements.shareBtn) {
        elements.shareBtn.addEventListener('click', () => {
            window.achievementSystem.shareResult(score, window.tetriCoins.getBalance());
        });
    }

    // Initialize
    initBettingUI();
    window.tetriCoins.addListener(() => uiController.updateBalanceDisplay());
    board = createBoard();
    loadPreferences();
    updateSoundButton(soundEngine.enabled);
    draw();
    Renderer.drawStartScreen();

    // Listen for language changes
    window.addEventListener('languageChanged', (e) => {
        if (elements.gridToggleBtn) {
            uiController.updateGridButton(showGrid);
        }
        updateSoundButton(soundEngine.enabled);
    });
});
