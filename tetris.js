// Tetris Game
document.addEventListener('DOMContentLoaded', () => {
    // Game constants
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 30;
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
    
    // Get canvases and contexts
    const canvas = document.getElementById('tetris-canvas');
    const ctx = canvas.getContext('2d');
    const nextPieceCanvas = document.getElementById('next-piece-canvas');
    const nextPieceCtx = nextPieceCanvas.getContext('2d');
    
    // Get DOM elements
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const levelElement = document.getElementById('level');
    const linesElement = document.getElementById('lines');
    const startBtn = document.getElementById('start-btn');
    const gridToggleBtn = document.getElementById('grid-toggle');
    const aiSummaryElement = document.getElementById('ai-summary');
    const aiInsightContainer = document.querySelector('.ai-insight');
    const aiVsAiBtn = document.getElementById('ai-vs-ai-btn');
    const aiVsAiPanel = document.getElementById('ai-vs-ai-panel');
    const ai1ThinkingElement = document.getElementById('ai1-thinking');
    const ai1PlanElement = document.getElementById('ai1-plan');
    const ai2ThinkingElement = document.getElementById('ai2-thinking');
    const ai2PlanElement = document.getElementById('ai2-plan');
    const takeControlBtn = document.getElementById('take-control-btn');
    const exitAiModeBtn = document.getElementById('exit-ai-mode-btn');
    const currentTurnElement = document.getElementById('current-turn');
    
    // New UI elements for PWA features
    const balanceElement = document.getElementById('tetricoins-balance');
    const tournamentBtn = document.getElementById('tournament-btn');
    const achievementsBtn = document.getElementById('achievements-btn');
    const shareBtn = document.getElementById('share-btn');
    const achievementsModal = document.getElementById('achievements-modal');
    const closeAchievementsBtn = document.getElementById('close-achievements');

    const STORAGE_KEYS = {
        highScore: 'tetrisHighScore',
        grid: 'tetrisShowGrid',
        aiState: 'tetrisAiStateV1'
    };
    
    // Game variables
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
    let dropCounter = 0;
    let lastTime = 0;
    let gameLoop = null;
    let showGrid = true;  // Новая переменная для отображения сетки

    const aiTrainer = createAdaptiveEngine();
    
    // AI vs AI mode variables
    let aiVsAiMode = false;
    let currentAiPlayer = 1; // 1 or 2
    let aiPlayer1 = null;
    let aiPlayer2 = null;
    let playerTakingControl = false;
    
    // Betting and tournament variables
    let bettingEnabled = false;
    let currentBet = null;
    let tournamentMode = false;
    let tournamentMatchCount = 0;
    let matchStats = {
        ai1Score: 0,
        ai2Score: 0,
        firstTetris: null,
        firstToReach1000: null
    };
    
    // Achievement tracking
    let consecutiveTetris = 0;
    let lastLinesClearedWas4 = false;
    
    // Create empty game board
    function createBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }
    
    // Generate a random tetromino
    function createPiece(shapeIndex) {
        const template = SHAPES[shapeIndex];
        const shape = template.map((row) => row.slice());
        return {
            shape,
            color: COLORS[shapeIndex],
            shapeIndex,
            x: Math.floor(COLS / 2) - Math.floor(template[0].length / 2),
            y: 0
        };
    }

    function getAdaptivePiece() {
        const shapeIndex = aiTrainer.selectShapeIndex();
        return createPiece(shapeIndex);
    }
    
    // Draw a single square on the game board
    function drawBlock(x, y, color, context = null) {
        const ctx_to_use = context || ctx;
        ctx_to_use.fillStyle = color;
        ctx_to_use.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx_to_use.strokeStyle = '#000';
        ctx_to_use.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
    
    // Draw the current piece on the game board
    function drawPiece(piece, context = null) {
        const ctx_to_use = context || ctx;
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(piece.x + x, piece.y + y, piece.color, ctx_to_use);
                }
            });
        });
    }
    
    // Draw the next piece preview
    function drawNextPiece() {
        nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
        
        // Center the piece in the preview canvas
        const offsetX = (nextPieceCanvas.width / BLOCK_SIZE - nextPiece.shape[0].length) / 2;
        const offsetY = (nextPieceCanvas.height / BLOCK_SIZE - nextPiece.shape.length) / 2;
        
        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(offsetX + x, offsetY + y, nextPiece.color, nextPieceCtx);
                }
            });
        });
    }
    
    // Draw the game board
    function drawBoard() {
        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(x, y, COLORS[value - 1]);
                }
            });
        });
    }
    
    // Draw grid lines
    function drawGrid() {
        if (!showGrid) return;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let i = 0; i <= COLS; i++) {
            ctx.beginPath();
            ctx.moveTo(i * BLOCK_SIZE, 0);
            ctx.lineTo(i * BLOCK_SIZE, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= ROWS; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * BLOCK_SIZE);
            ctx.lineTo(canvas.width, i * BLOCK_SIZE);
            ctx.stroke();
        }
    }

    function computeBoardMetrics(boardState) {
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

    function createAdaptiveEngine() {
        const MIN_WEIGHT = 0.4;
        const MAX_WEIGHT = 8;
        const weights = Array(SHAPES.length).fill(1);
        const holesByShape = Array(SHAPES.length).fill(0);
    let sessionHolesByShape = Array(SHAPES.length).fill(0);
        let totalTrackedMistakes = 0;
        let recentHighlights = [];
        let lastMetrics = null;

        function loadFromStorage() {
            try {
                const raw = localStorage.getItem(STORAGE_KEYS.aiState);
                if (!raw) {
                    return;
                }
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed.weights) && parsed.weights.length === SHAPES.length) {
                    parsed.weights.forEach((value, index) => {
                        const numeric = Number(value);
                        if (Number.isFinite(numeric) && numeric > 0) {
                            weights[index] = Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, numeric));
                        }
                    });
                }
                if (Array.isArray(parsed.holesByShape) && parsed.holesByShape.length === SHAPES.length) {
                    parsed.holesByShape.forEach((value, index) => {
                        const numeric = Number(value);
                        holesByShape[index] = Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
                    });
                }
                if (typeof parsed.totalTrackedMistakes === 'number' && parsed.totalTrackedMistakes >= 0) {
                    totalTrackedMistakes = parsed.totalTrackedMistakes;
                }
            } catch (err) {
                // Ignore corrupted state and fall back to defaults.
            }
        }

        function persistState() {
            try {
                const payload = JSON.stringify({
                    weights,
                    holesByShape,
                    totalTrackedMistakes
                });
                localStorage.setItem(STORAGE_KEYS.aiState, payload);
            } catch (err) {
                // Persistence is optional; ignore storage errors.
            }
        }

        function resetForNewGame(boardState) {
            lastMetrics = computeBoardMetrics(boardState);
            recentHighlights = [];
            sessionHolesByShape = Array(SHAPES.length).fill(0);
        }

        function selectShapeIndex() {
            const totalWeight = weights.reduce((sum, value) => sum + value, 0);
            if (totalWeight <= 0) {
                return Math.floor(Math.random() * SHAPES.length);
            }
            let threshold = Math.random() * totalWeight;
            for (let i = 0; i < weights.length; i++) {
                threshold -= weights[i];
                if (threshold <= 0) {
                    return i;
                }
            }
            return weights.length - 1;
        }

        function registerPlacement(shapeIndex, beforeMetrics, afterMetrics, linesCleared) {
            if (!beforeMetrics || !afterMetrics) {
                return;
            }

            const insightReasons = [];
            let positiveObservation = false;
            const holesDelta = afterMetrics.totalHoles - beforeMetrics.totalHoles;
            if (holesDelta > 0) {
                const boost = holesDelta * 0.6 + 0.4;
                weights[shapeIndex] = Math.min(MAX_WEIGHT, weights[shapeIndex] + boost);
                holesByShape[shapeIndex] += holesDelta;
                sessionHolesByShape[shapeIndex] += holesDelta;
                totalTrackedMistakes += holesDelta;
                insightReasons.push(`created ${holesDelta} new hole${holesDelta === 1 ? '' : 's'}`);
                positiveObservation = true;
            }

            const maxHeightDelta = afterMetrics.maxHeight - beforeMetrics.maxHeight;
            if (maxHeightDelta >= 3) {
                const heightBoost = maxHeightDelta * 0.3;
                weights[shapeIndex] = Math.min(MAX_WEIGHT, weights[shapeIndex] + heightBoost);
                const tallestColumn = afterMetrics.heights.indexOf(afterMetrics.maxHeight);
                if (tallestColumn >= 0) {
                    insightReasons.push(`pushed column ${tallestColumn + 1} higher by ${maxHeightDelta}`);
                    positiveObservation = true;
                }
            }

            if (linesCleared > 0) {
                const penalty = linesCleared > 1 ? linesCleared * 0.5 : 0.2;
                weights[shapeIndex] = Math.max(MIN_WEIGHT, weights[shapeIndex] - penalty);
            }

            if (positiveObservation) {
                recentHighlights.push({
                    shapeIndex,
                    reasons: insightReasons,
                    afterMetrics: {
                        maxHeight: afterMetrics.maxHeight,
                        totalHoles: afterMetrics.totalHoles,
                        heights: afterMetrics.heights.slice()
                    }
                });
                if (recentHighlights.length > 6) {
                    recentHighlights.shift();
                }
            }

            lastMetrics = afterMetrics;
            persistState();
        }

        function getLiveHint() {
            const latest = recentHighlights[recentHighlights.length - 1];
            if (!latest) {
                return 'The adaptive engine is observing your moves.';
            }
            const reasonText = latest.reasons.join(' and ');
            return `Recent pressure: more ${SHAPE_NAMES[latest.shapeIndex]} pieces because you ${reasonText}.`;
        }

        function getSummary(finalMetrics) {
            const sessionMistakes = sessionHolesByShape.reduce((sum, value) => sum + value, 0);
            const sentences = [];
            if (sessionMistakes === 0) {
                if (finalMetrics) {
                    const columnIndex = finalMetrics.heights.indexOf(finalMetrics.maxHeight);
                    const columnLabel = columnIndex >= 0 ? columnIndex + 1 : 'one column';
                    sentences.push(`I could not exploit a repeating weakness, but your stack in column ${columnLabel} climbed to ${finalMetrics.maxHeight} blocks.`);
                    if (finalMetrics.totalHoles > 0) {
                        sentences.push(`Keeping ${finalMetrics.totalHoles} hidden hole${finalMetrics.totalHoles === 1 ? '' : 's'} made recovery harder.`);
                    }
                } else {
                    sentences.push('I did not gather enough data to exploit a weakness this round.');
                }
                return sentences.join(' ');
            }

            const rankedShapes = sessionHolesByShape
                .map((value, index) => ({ index, value }))
                .filter((entry) => entry.value > 0)
                .sort((a, b) => b.value - a.value);

            if (rankedShapes.length > 0) {
                const primary = rankedShapes[0];
                sentences.push(`I boosted ${SHAPE_NAMES[primary.index]} pieces after they trapped ${primary.value} extra hole${primary.value === 1 ? '' : 's'}.`);
                const secondary = rankedShapes[1];
                if (secondary) {
                    sentences.push(`I also leaned on ${SHAPE_NAMES[secondary.index]} pieces because they kept your board unstable.`);
                }
            }

            const highlight = recentHighlights[recentHighlights.length - 1];
            if (highlight) {
                const columnIndex = highlight.afterMetrics.heights.indexOf(highlight.afterMetrics.maxHeight);
                const columnLabel = columnIndex >= 0 ? columnIndex + 1 : 'a column';
                sentences.push(`Near the end, extra ${SHAPE_NAMES[highlight.shapeIndex]} pieces ${highlight.reasons.join(' and ')} while column ${columnLabel} reached ${highlight.afterMetrics.maxHeight} blocks.`);
            }

            if (finalMetrics) {
                const columnIndex = finalMetrics.heights.indexOf(finalMetrics.maxHeight);
                const columnLabel = columnIndex >= 0 ? columnIndex + 1 : 'one column';
                sentences.push(`You topped out with ${finalMetrics.totalHoles} hole${finalMetrics.totalHoles === 1 ? '' : 's'} and a skyline difference of ${finalMetrics.bumpiness}. Column ${columnLabel} was the first to break the ceiling.`);
            }

            return sentences.join(' ');
        }

        return {
            loadFromStorage,
            resetForNewGame,
            selectShapeIndex,
            registerPlacement,
            getLiveHint,
            getSummary
        };
    }

    function updateHighScoreDisplay() {
        if (highScoreElement) {
            highScoreElement.textContent = highScore;
        }
    }

    function updateAiInsight(message) {
        if (aiSummaryElement) {
            aiSummaryElement.textContent = message;
        }
    }

    function persistHighScore() {
        try {
            localStorage.setItem(STORAGE_KEYS.highScore, String(highScore));
        } catch (err) {
            // localStorage might be unavailable; ignore persist errors.
        }
    }

    function persistGridPreference() {
        try {
            localStorage.setItem(STORAGE_KEYS.grid, showGrid ? 'true' : 'false');
        } catch (err) {
            // Ignore storage errors; the preference simply will not persist.
        }
    }

    function loadPreferences() {
        aiTrainer.loadFromStorage();
        try {
            const storedHighScore = localStorage.getItem(STORAGE_KEYS.highScore);
            if (storedHighScore !== null) {
                const parsedScore = parseInt(storedHighScore, 10);
                if (!Number.isNaN(parsedScore)) {
                    highScore = parsedScore;
                }
            }
            const storedGrid = localStorage.getItem(STORAGE_KEYS.grid);
            if (storedGrid !== null) {
                showGrid = storedGrid === 'true';
            }
        } catch (err) {
            // Storage access failed; keep defaults in memory only.
        }

        updateHighScoreDisplay();
        if (gridToggleBtn) {
            const lang = getCurrentLanguage ? getCurrentLanguage() : 'en';
            gridToggleBtn.textContent = showGrid ? getTranslation('hide_grid', lang) : getTranslation('show_grid', lang);
        }
        updateAiInsight(aiTrainer.getLiveHint());
        
        // Initialize balance display and check daily bonus
        updateBalanceDisplay();
        checkDailyBonus();
        
        // Check balance achievement
        window.achievementSystem.checkBalanceAchievement(window.tetriCoins.getBalance());
    }
    
    // Update balance display
    function updateBalanceDisplay() {
        if (balanceElement) {
            balanceElement.textContent = window.tetriCoins.formatCoins();
        }
        // Check for rich achievement
        window.achievementSystem.checkBalanceAchievement(window.tetriCoins.getBalance());
    }
    
    // Check and award daily bonus
    function checkDailyBonus() {
        const gotBonus = window.tetriCoins.checkDailyBonus();
        if (gotBonus) {
            showMessage('🎁 Ежедневный бонус: +100 TC!');
            updateBalanceDisplay();
        }
    }
    
    // Show coin reward animation
    function showCoinReward(amount) {
        const msg = document.createElement('div');
        msg.className = 'temp-message';
        msg.textContent = `+${amount} TC`;
        msg.style.color = '#ffd700';
        msg.style.fontWeight = 'bold';
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            msg.classList.remove('show');
            setTimeout(() => msg.remove(), 300);
        }, 2000);
    }
    
    // Show temporary message
    function showMessage(message) {
        const msg = document.createElement('div');
        msg.className = 'temp-message';
        msg.textContent = message;
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            msg.classList.remove('show');
            setTimeout(() => msg.remove(), 300);
        }, 3000);
    }
    
    // Toggle grid visibility
    function toggleGrid() {
        showGrid = !showGrid;
        const lang = getCurrentLanguage ? getCurrentLanguage() : 'en';
        gridToggleBtn.textContent = showGrid ? getTranslation('hide_grid', lang) : getTranslation('show_grid', lang);
        persistGridPreference();
        draw();
    }
    
    // Check if the current piece collides with anything
    function checkCollision(piece, offsetX = 0, offsetY = 0) {
        return piece.shape.some((row, y) => {
            return row.some((value, x) => {
                if (!value) return false;
                const nextX = piece.x + x + offsetX;
                const nextY = piece.y + y + offsetY;
                
                return (
                    nextX < 0 ||
                    nextX >= COLS ||
                    nextY >= ROWS ||
                    (nextY >= 0 && board[nextY][nextX])
                );
            });
        });
    }
    
    // Merge the current piece with the board
    function mergePiece() {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardY = currentPiece.y + y;
                    const boardX = currentPiece.x + x;
                    if (boardY >= 0) {
                        board[boardY][boardX] = COLORS.indexOf(currentPiece.color) + 1;
                    }
                }
            });
        });
    }
    
    // Move the current piece down
    function movePieceDown() {
        currentPiece.y++;
        if (checkCollision(currentPiece)) {
            currentPiece.y--;
            const beforeMetrics = computeBoardMetrics(board);
            mergePiece();
            const linesCleared = clearLines();
            const afterMetrics = computeBoardMetrics(board);
            if (typeof currentPiece.shapeIndex === 'number') {
                aiTrainer.registerPlacement(currentPiece.shapeIndex, beforeMetrics, afterMetrics, linesCleared);
                updateAiInsight(aiTrainer.getLiveHint());
            }
            spawnPiece();
        }
        dropCounter = 0;
    }
    
    // Move the current piece left
    function movePieceLeft() {
        currentPiece.x--;
        if (checkCollision(currentPiece)) {
            currentPiece.x++;
        }
    }
    
    // Move the current piece right
    function movePieceRight() {
        currentPiece.x++;
        if (checkCollision(currentPiece)) {
            currentPiece.x--;
        }
    }
    
    // Rotate the current piece
    function rotatePiece() {
        const originalShape = currentPiece.shape;
        const size = originalShape.length;
        const rotated = Array.from({ length: size }, () => Array(size).fill(0));

        // Rotate 90 degrees clockwise
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                rotated[x][size - 1 - y] = originalShape[y][x];
            }
        }

        const originalX = currentPiece.x;
        currentPiece.shape = rotated;

        const offsets = [0];
        for (let i = 1; i <= size; i++) {
            offsets.push(i, -i);
        }

        for (const offset of offsets) {
            currentPiece.x = originalX + offset;
            if (!checkCollision(currentPiece)) {
                return;
            }
        }

        // Revert rotation and horizontal shift when no valid kick is found
        currentPiece.shape = originalShape;
        currentPiece.x = originalX;
    }
    
    // Hard drop the current piece
    function hardDrop() {
        while (!checkCollision(currentPiece, 0, 1)) {
            currentPiece.y++;
            score += 2;
        }
        movePieceDown();
        updateScore();
    }
    
    // Clear completed lines and update score
    function clearLines() {
        let linesCleared = 0;
        const linesToClear = [];

        outer: for (let y = ROWS - 1; y >= 0; y--) {
            for (let x = 0; x < COLS; x++) {
                if (!board[y][x]) {
                    continue outer;
                }
            }
            linesToClear.push(y);
            linesCleared++;
        }

        if (linesCleared > 0) {
            // Remove completed lines
            linesToClear.sort((a, b) => b - a).forEach(y => {
                board.splice(y, 1);
                board.unshift(Array(COLS).fill(0));
            });

            lines += linesCleared;

            // Calculate score based on lines cleared
            const lineScores = [40, 100, 300, 1200];
            score += lineScores[linesCleared - 1] * level;

            // Update level every 10 lines
            level = Math.floor(lines / 10) + 1;

            // Adjust drop speed based on level
            dropInterval = Math.max(1000 - (level - 1) * 100, 100);

            // Award TetriCoins if not in AI vs AI mode or if player is taking control
            if (!aiVsAiMode || playerTakingControl) {
                const reward = window.tetriCoins.awardLinesCleared(linesCleared);
                if (reward > 0) {
                    updateBalanceDisplay();
                    showCoinReward(reward);
                }
                
                // Track Tetris streak for achievement
                if (linesCleared === 4) {
                    consecutiveTetris++;
                    lastLinesClearedWas4 = true;
                    window.achievementSystem.checkTetrisStreak(consecutiveTetris);
                    
                    // Track first Tetris in AI vs AI match
                    if (aiVsAiMode && !matchStats.firstTetris) {
                        matchStats.firstTetris = currentAiPlayer;
                    }
                } else {
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

            updateScore();
        }

        return linesCleared;
    }
    
    // Update score display
    function updateScore() {
        scoreElement.textContent = score;
        levelElement.textContent = level;
        linesElement.textContent = lines;

        if (score > highScore) {
            highScore = score;
            updateHighScoreDisplay();
            persistHighScore();
        }
    }
    
    // Spawn a new piece
    function spawnPiece() {
        if (!nextPiece) {
            nextPiece = getAdaptivePiece();
        }
        currentPiece = nextPiece;
        nextPiece = getAdaptivePiece();
        drawNextPiece();
        
        // Check if game is over
        if (checkCollision(currentPiece)) {
            gameOver = true;
            cancelAnimationFrame(gameLoop);
            
            // Vibrate on game over
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200]);
            }
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'red';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
            ctx.font = '20px Arial';
            ctx.fillText('Press Start or Enter to Play Again', canvas.width / 2, canvas.height / 2 + 40);
            startBtn.textContent = 'Play Again';
            const finalMetrics = computeBoardMetrics(board);
            updateAiInsight(aiTrainer.getSummary(finalMetrics));
            
            // Handle AI vs AI mode game over
            if (aiVsAiMode) {
                const winner = currentAiPlayer === 1 ? 2 : 1;
                const winnerScore = score;
                
                // Store match stats
                if (currentAiPlayer === 1) {
                    matchStats.ai2Score = winnerScore;
                } else {
                    matchStats.ai1Score = winnerScore;
                }
                
                setTimeout(() => {
                    if (ai1ThinkingElement) ai1ThinkingElement.textContent = 'Game Over!';
                    if (ai2ThinkingElement) ai2ThinkingElement.textContent = 'Game Over!';
                    if (ai1PlanElement) ai1PlanElement.textContent = `AI ${winner} wins!`;
                    if (ai2PlanElement) ai2PlanElement.textContent = `Score: ${winnerScore}`;
                    
                    // Resolve bet if exists
                    if (currentBet) {
                        const matchResult = {
                            winner: winner,
                            loser: currentAiPlayer,
                            winnerScore: winnerScore,
                            firstTetris: matchStats.firstTetris,
                            firstToReach: matchStats.firstToReach1000
                        };
                        
                        const result = window.bettingSystem.resolveBet(matchResult);
                        if (result) {
                            setTimeout(() => {
                                showBetResult(result);
                            }, 1000);
                        }
                        
                        // Check sniper achievement
                        if (result.won && currentBet.type === 'score_range') {
                            window.achievementSystem.checkSniperAchievement(true, 'score_range');
                        }
                    }
                    
                    // Handle tournament mode
                    if (tournamentMode) {
                        const isLastMatch = window.bettingSystem.nextTournamentMatch();
                        if (isLastMatch) {
                            const jackpotWin = window.bettingSystem.endTournament();
                            if (jackpotWin > 0) {
                                setTimeout(() => {
                                    showMessage(`🎉 Турнир окончен! Вы выиграли джекпот: ${jackpotWin} TC!`);
                                    updateBalanceDisplay();
                                }, 2000);
                            }
                            tournamentMode = false;
                        }
                    }
                    
                    currentBet = null;
                }, 500);
            }
        } else if (aiVsAiMode && !playerTakingControl) {
            // AI makes move automatically
            setTimeout(() => {
                if (!gameOver && aiVsAiMode && !playerTakingControl) {
                    executeAiMove();
                }
            }, 500);
        }
    }
    
    // Draw everything
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        drawBoard();
        if (currentPiece) {
            drawPiece(currentPiece);
        }
    }
    
    // Game update function
    function update(time = 0) {
        if (gameOver || isPaused) return;
        
        const deltaTime = lastTime === 0 ? 0 : time - lastTime;
        lastTime = time;
        
        // In AI vs AI mode, AI controls the pieces, so we don't auto-drop unless player takes control
        if (!aiVsAiMode || playerTakingControl) {
            dropCounter += deltaTime;
            if (dropCounter > dropInterval) {
                movePieceDown();
            }
        }
        
        draw();
        gameLoop = requestAnimationFrame(update);
    }
    
    // Start the game
    function startGame() {
        board = createBoard();
        score = 0;
        lines = 0;
        level = 1;
        dropInterval = 1000;
        gameOver = false;
        isPaused = false;
        currentPiece = null;
        nextPiece = null;

        aiTrainer.resetForNewGame(board);
        updateScore();
        updateAiInsight(aiTrainer.getLiveHint());
        spawnPiece();
        draw();

        if (gameLoop) {
            cancelAnimationFrame(gameLoop);
        }

        lastTime = performance.now();
        dropCounter = 0;
        gameLoop = requestAnimationFrame(update);
        startBtn.textContent = 'Restart';
    }
    
    // Pause the game
    function togglePause() {
        if (gameOver) return;

        isPaused = !isPaused;
        if (isPaused) {
            cancelAnimationFrame(gameLoop);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
            ctx.font = '20px Arial';
            ctx.fillText('Press P to Resume', canvas.width / 2, canvas.height / 2 + 40);
        } else {
            lastTime = performance.now();
            gameLoop = requestAnimationFrame(update);
        }
    }
    
    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        // Allow starting the game with Enter or Space when game is over
        if (gameOver && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            startGame();
            return;
        }
        
        // Block other controls when game is over
        if (gameOver) return;
        
        // Block movement controls when game is not active (no current piece and not game over)
        if (!currentPiece && !gameOver && ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
            return;
        }
        
        // If game is paused, only allow unpause
        if (isPaused && e.key !== 'p' && e.key !== 'P') {
            return;
        }
        
        switch (e.key) {
            case 'ArrowLeft':
                movePieceLeft();
                draw();
                break;
            case 'ArrowRight':
                movePieceRight();
                draw();
                break;
            case 'ArrowDown':
                movePieceDown();
                score++;
                updateScore();
                draw();
                break;
            case 'ArrowUp':
                rotatePiece();
                draw();
                break;
            case ' ':
                e.preventDefault(); // Prevent page scrolling
                hardDrop();
                break;
            case 'p':
            case 'P':
                togglePause();
                break;
            case 'g':
            case 'G':
                toggleGrid();
                break;
            case 't':
            case 'T':
                if (aiVsAiMode) {
                    takeControl();
                }
                break;
            case 'Enter':
            case 's':
            case 'S':
                if (!currentPiece && !gameOver) {
                    startGame();
                }
                break;
        }
    });

    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const minSwipeDistance = 30;
    
    canvas.addEventListener('touchstart', (e) => {
        if (gameOver || isPaused || !currentPiece) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        if (gameOver || isPaused || !currentPiece) return;
        e.preventDefault();
        
        const touch = e.changedTouches[0];
        touchEndX = touch.clientX;
        touchEndY = touch.clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // Swipe detection
        if (absDeltaX > minSwipeDistance || absDeltaY > minSwipeDistance) {
            if (absDeltaX > absDeltaY) {
                // Horizontal swipe
                if (deltaX > 0) {
                    movePieceRight();
                } else {
                    movePieceLeft();
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    // Swipe down - hard drop
                    hardDrop();
                }
            }
        } else {
            // Tap - rotate piece
            rotatePiece();
        }
        
        draw();
    }, { passive: false });

    // AI vs AI Mode Functions
    
    // AI Strategy: Evaluate board position and return score
    function evaluatePosition(testBoard, aiPlayerNum) {
        const metrics = computeBoardMetrics(testBoard);
        
        // Different strategies for AI 1 (aggressive) vs AI 2 (defensive)
        if (aiPlayerNum === 1) {
            // AI 1: Aggressive - minimize height, clear lines
            return -metrics.aggregateHeight * 0.5 - metrics.totalHoles * 3 - metrics.bumpiness * 0.3;
        } else {
            // AI 2: Defensive - focus on stability
            return -metrics.maxHeight * 1.2 - metrics.totalHoles * 2 - metrics.bumpiness * 0.5;
        }
    }
    
    // Find best move for current piece
    function findBestMove(piece, aiPlayerNum) {
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
            for (let x = -2; x < COLS + 2; x++) {
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
                                if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                                    testBoard[boardY][boardX] = COLORS.indexOf(testPiece.color) + 1;
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
    
    // Execute AI move
    function executeAiMove() {
        if (!currentPiece || gameOver || !aiVsAiMode || playerTakingControl) return;
        
        // Update AI thinking display
        const thinkingEl = currentAiPlayer === 1 ? ai1ThinkingElement : ai2ThinkingElement;
        const planEl = currentAiPlayer === 1 ? ai1PlanElement : ai2PlanElement;
        
        if (thinkingEl) thinkingEl.textContent = `AI ${currentAiPlayer} is analyzing...`;
        if (planEl) planEl.textContent = 'Calculating optimal position...';
        
        // Find best move
        const bestMove = findBestMove(currentPiece, currentAiPlayer);
        
        // Apply rotations
        for (let r = 0; r < bestMove.rotation; r++) {
            rotatePiece();
        }
        
        // Move to target X position
        const targetX = bestMove.x;
        const moveSteps = Math.abs(targetX - currentPiece.x);
        
        if (planEl) {
            planEl.textContent = `Moving to column ${targetX + 1}, ${bestMove.rotation} rotation(s)`;
        }
        
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
                        if (currentTurnElement) {
                            currentTurnElement.textContent = `AI ${currentAiPlayer}'s Turn`;
                        }
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
                // Betting completed with a bet
                currentBet = bet;
                bettingEnabled = false;
                startAiMatch();
            },
            () => {
                // Betting completed without a bet
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
        
        // Show AI panel and hide regular buttons
        if (aiVsAiPanel) aiVsAiPanel.style.display = 'block';
        if (aiInsightContainer) aiInsightContainer.style.display = 'none';
        if (startBtn) startBtn.style.display = 'none';
        if (aiVsAiBtn) aiVsAiBtn.style.display = 'none';
        if (tournamentBtn) tournamentBtn.style.display = 'none';
        
        // Initialize game
        startGame();
        
        // Update turn display
        if (currentTurnElement) {
            currentTurnElement.textContent = `AI ${currentAiPlayer}'s Turn`;
        }
        
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
        
        // Hide AI panel and show regular buttons
    if (aiVsAiPanel) aiVsAiPanel.style.display = 'none';
    if (aiInsightContainer) aiInsightContainer.style.display = '';
        if (startBtn) startBtn.style.display = 'inline-block';
        if (aiVsAiBtn) aiVsAiBtn.style.display = 'inline-block';
        
        // Stop game
        if (gameLoop) {
            cancelAnimationFrame(gameLoop);
        }
        gameOver = true;
        
        // Show start screen
        draw();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TETRIS', canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = '20px Arial';
        ctx.fillText('Press Start or Enter to Play', canvas.width / 2, canvas.height / 2 + 20);
    }
    
    function takeControl() {
        playerTakingControl = !playerTakingControl;
        
        if (takeControlBtn) {
            if (playerTakingControl) {
                takeControlBtn.textContent = 'Release Control';
                takeControlBtn.classList.add('active');
                // Reset drop counter when player takes control
                dropCounter = 0;
                lastTime = performance.now();
                if (ai1ThinkingElement) ai1ThinkingElement.textContent = 'Player in control!';
                if (ai2ThinkingElement) ai2ThinkingElement.textContent = 'Waiting...';
            } else {
                takeControlBtn.textContent = 'Take Control';
                takeControlBtn.classList.remove('active');
                // AI takes back control
                if (currentPiece && !gameOver) {
                    executeAiMove();
                }
            }
        }
    }

    // Show bet result overlay
    function showBetResult(result) {
        const overlay = document.createElement('div');
        overlay.className = 'bet-result-overlay';
        
        const content = document.createElement('div');
        content.className = `bet-result-content ${result.won ? 'win' : 'lose'}`;
        
        const icon = document.createElement('div');
        icon.className = 'result-icon';
        icon.textContent = result.won ? '🎉' : '😔';
        
        const text = document.createElement('div');
        text.className = `result-text ${result.won ? 'win' : 'lose'}`;
        text.textContent = result.won ? 'ВЫИГРЫШ!' : 'Проигрыш';
        
        const amount = document.createElement('div');
        amount.className = 'result-amount';
        if (result.won) {
            amount.textContent = `+${result.payout} TC (${result.profit > 0 ? '+' : ''}${result.profit} TC прибыль)`;
        } else {
            amount.textContent = `Ставка не сыграла`;
        }
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'place-bet-btn';
        closeBtn.textContent = 'OK';
        closeBtn.onclick = () => {
            overlay.remove();
            updateBalanceDisplay();
        };
        
        content.appendChild(icon);
        content.appendChild(text);
        content.appendChild(amount);
        content.appendChild(closeBtn);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        // Confetti animation for wins
        if (result.won) {
            createConfetti();
        }
        
        // Vibrate
        if (navigator.vibrate) {
            if (result.won) {
                navigator.vibrate([100, 50, 100, 50, 200]);
            } else {
                navigator.vibrate(200);
            }
        }
    }
    
    // Create confetti animation
    function createConfetti() {
        const colors = ['#ffd700', '#ff6b6b', '#7b68ee', '#28a745', '#17a2b8'];
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 3000);
            }, i * 30);
        }
    }
    
    // Tournament mode functions
    function startTournament() {
        tournamentMode = true;
        tournamentMatchCount = 0;
        window.bettingSystem.startTournament();
        
        // Update UI
        const tournamentProgress = document.getElementById('tournament-progress');
        if (tournamentProgress) {
            tournamentProgress.style.display = 'block';
        }
        
        // Start first match
        startAiVsAiMode();
    }
    
    // Show achievements modal
    function showAchievementsModal() {
        if (!achievementsModal) return;
        
        achievementsModal.style.display = 'flex';
        
        // Update progress
        const progressElement = document.getElementById('achievements-progress');
        if (progressElement) {
            progressElement.textContent = window.achievementSystem.getProgress();
        }
        
        // Populate achievements list
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
                            `<p>Прогресс: ${achievement.progress}/${achievement.target}</p>` : ''}
                    </div>
                    ${achievement.reward > 0 ? `<div class="achievement-reward">+${achievement.reward} TC</div>` : ''}
                `;
                listElement.appendChild(item);
            });
        }
        
        // Populate leaderboard
        const leaderboardElement = document.getElementById('leaderboard');
        if (leaderboardElement) {
            leaderboardElement.innerHTML = '';
            const leaderboard = window.achievementSystem.getLeaderboard();
            if (leaderboard.length === 0) {
                leaderboardElement.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5);">Нет записей</p>';
            } else {
                leaderboard.forEach((entry, index) => {
                    const item = document.createElement('div');
                    item.className = 'leaderboard-item';
                    item.innerHTML = `
                        <div class="leaderboard-rank">#${index + 1}</div>
                        <div class="leaderboard-name">${entry.name || 'Игрок'}</div>
                        <div class="leaderboard-balance">${window.tetriCoins.formatCoins(entry.balance)} TC</div>
                    `;
                    leaderboardElement.appendChild(item);
                });
            }
        }
    }
    
    // Initialize betting UI
    function initBettingUI() {
        // Bet type selection
        const betTypeCards = document.querySelectorAll('.bet-type-card');
        let selectedBetType = null;
        let selectedTarget = null;
        let selectedAmount = null;
        
        betTypeCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('bet-option-btn')) return;
                
                betTypeCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedBetType = card.dataset.betType;
                updatePlaceBetButton();
            });
            
            // Bet option buttons
            const optionBtns = card.querySelectorAll('.bet-option-btn');
            optionBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    optionBtns.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    
                    betTypeCards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    
                    selectedBetType = card.dataset.betType;
                    selectedTarget = btn.dataset.target;
                    updatePlaceBetButton();
                });
            });
        });
        
        // Quick bet buttons
        const quickBetBtns = document.querySelectorAll('.quick-bet-btn');
        quickBetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                quickBetBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedAmount = parseInt(btn.dataset.amount);
                document.getElementById('custom-bet-amount').value = '';
                updatePlaceBetButton();
            });
        });
        
        // Custom bet amount
        const customBetInput = document.getElementById('custom-bet-amount');
        if (customBetInput) {
            customBetInput.addEventListener('input', () => {
                quickBetBtns.forEach(b => b.classList.remove('selected'));
                const value = parseInt(customBetInput.value);
                selectedAmount = isNaN(value) ? null : value;
                updatePlaceBetButton();
            });
        }
        
        // Place bet button
        const placeBetBtn = document.getElementById('place-bet-btn');
        if (placeBetBtn) {
            placeBetBtn.addEventListener('click', () => {
                if (!selectedBetType || !selectedTarget || !selectedAmount) return;
                
                const result = window.bettingSystem.placeBet(selectedBetType, selectedTarget, selectedAmount);
                if (result.success) {
                    showMessage(`Ставка принята: ${selectedAmount} TC`);
                    placeBetBtn.disabled = true;
                    updateBalanceDisplay();
                } else {
                    showMessage(`Ошибка: ${result.message}`);
                }
            });
        }
        
        // Cancel bet button
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

    // Touch controls removed to fix keyboard input issues
    
    // Button event listeners
    startBtn.addEventListener('click', startGame);
    if (gridToggleBtn) {
        gridToggleBtn.addEventListener('click', toggleGrid);
    }
    if (aiVsAiBtn) {
        aiVsAiBtn.addEventListener('click', startAiVsAiMode);
    }
    if (exitAiModeBtn) {
        exitAiModeBtn.addEventListener('click', exitAiVsAiMode);
    }
    if (takeControlBtn) {
        takeControlBtn.addEventListener('click', takeControl);
    }
    if (tournamentBtn) {
        tournamentBtn.addEventListener('click', startTournament);
    }
    if (achievementsBtn) {
        achievementsBtn.addEventListener('click', showAchievementsModal);
    }
    if (closeAchievementsBtn) {
        closeAchievementsBtn.addEventListener('click', () => {
            achievementsModal.style.display = 'none';
        });
    }
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            window.achievementSystem.shareResult(score, window.tetriCoins.getBalance());
        });
    }
    
    // Initialize betting UI
    initBettingUI();
    
    // Update balance listener
    window.tetriCoins.addListener(updateBalanceDisplay);
    
    // Load stored settings and render initial board
    board = createBoard();
    loadPreferences();
    draw();

    // Show start screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TETRIS', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = '20px Arial';
    ctx.fillText('Press Start or Enter to Play', canvas.width / 2, canvas.height / 2 + 20);
    
    // Listen for language changes to update grid button text
    window.addEventListener('languageChanged', (e) => {
        if (gridToggleBtn) {
            const lang = e.detail.language;
            gridToggleBtn.textContent = showGrid ? getTranslation('hide_grid', lang) : getTranslation('show_grid', lang);
        }
    });
});