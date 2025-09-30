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
    const canvas = document.getElementById('tetris');
    const ctx = canvas.getContext('2d');
    const nextPieceCanvas = document.getElementById('next-piece');
    const nextPieceCtx = nextPieceCanvas.getContext('2d');
    
    // Get DOM elements
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const levelElement = document.getElementById('level');
    const linesElement = document.getElementById('lines');
    const startBtn = document.getElementById('start-btn');
    const gridToggleBtn = document.getElementById('grid-toggle');
    const touchControlButtons = document.querySelectorAll('#touch-controls [data-action]');
    const aiSummaryElement = document.getElementById('ai-summary');

    const STORAGE_KEYS = {
        highScore: 'tetrisHighScore',
        grid: 'tetrisShowGrid',
        aiState: 'tetrisAiStateV1'
    };
    
    // Game variables
    let board = createBoard();
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
        ctx_to_use.strokeStyle = '#222';
        ctx_to_use.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        
        // Add shine effect
        ctx_to_use.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx_to_use.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE / 3, BLOCK_SIZE / 3);
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
        if (!showGrid) return; // Не рисуем сетку, если она выключена
        
        ctx.strokeStyle = '#4488aa'; // Более яркий, контрастный цвет для сетки
        ctx.lineWidth = 1; // Увеличенная толщина линии
        
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
            gridToggleBtn.textContent = showGrid ? 'Hide Grid' : 'Show Grid';
        }
        updateAiInsight(aiTrainer.getLiveHint());
    }
    
    // Toggle grid visibility
    function toggleGrid() {
        showGrid = !showGrid;
        gridToggleBtn.textContent = showGrid ? 'Hide Grid' : 'Show Grid';
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
        
        outer: for (let y = ROWS - 1; y >= 0; y--) {
            for (let x = 0; x < COLS; x++) {
                if (!board[y][x]) {
                    continue outer;
                }
            }
            
            // Clear the line and move everything down
            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            y++; // Check the same row again
            linesCleared++;
        }
        
        if (linesCleared > 0) {
            lines += linesCleared;
            
            // Calculate score based on lines cleared
            const lineScores = [40, 100, 300, 1200];
            score += lineScores[linesCleared - 1] * level;
            
            // Update level every 10 lines
            level = Math.floor(lines / 10) + 1;
            
            // Adjust drop speed based on level
            dropInterval = Math.max(1000 - (level - 1) * 100, 100);
            
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
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'red';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
            ctx.font = '20px Arial';
            ctx.fillText('Press Start to Play Again', canvas.width / 2, canvas.height / 2 + 40);
            startBtn.textContent = 'Play Again';
            const finalMetrics = computeBoardMetrics(board);
            updateAiInsight(aiTrainer.getSummary(finalMetrics));
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
        
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            movePieceDown();
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
        
        lastTime = performance.now();  // Устанавливаем начальное время от текущего момента
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
        if (gameOver) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                movePieceLeft();
                break;
            case 'ArrowRight':
                movePieceRight();
                break;
            case 'ArrowDown':
                movePieceDown();
                score++;
                updateScore();
                break;
            case 'ArrowUp':
                rotatePiece();
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
        }
    });

    if (touchControlButtons.length) {
        const repeatingActions = new Set(['left', 'right', 'down']);
        const activeRepeats = new Map();
        const repeatIntervalMs = 140;

        const stopRepeat = (action) => {
            const intervalId = activeRepeats.get(action);
            if (intervalId) {
                clearInterval(intervalId);
                activeRepeats.delete(action);
            }
        };

        const handleTouchAction = (action) => {
            if (action !== 'pause' && (gameOver || isPaused && action !== 'pause')) {
                return;
            }

            switch (action) {
                case 'left':
                    movePieceLeft();
                    draw();
                    break;
                case 'right':
                    movePieceRight();
                    draw();
                    break;
                case 'down':
                    movePieceDown();
                    score++;
                    updateScore();
                    draw();
                    break;
                case 'rotate':
                    rotatePiece();
                    draw();
                    break;
                case 'hard-drop':
                    hardDrop();
                    draw();
                    break;
                case 'pause':
                    togglePause();
                    break;
                default:
                    break;
            }
        };

        touchControlButtons.forEach((button) => {
            const action = button.dataset.action;
            if (!action) {
                return;
            }

            button.addEventListener('pointerdown', (event) => {
                event.preventDefault();
                handleTouchAction(action);
                if (repeatingActions.has(action) && !activeRepeats.has(action)) {
                    const intervalId = setInterval(() => handleTouchAction(action), repeatIntervalMs);
                    activeRepeats.set(action, intervalId);
                }
                if (button.setPointerCapture) {
                    try {
                        button.setPointerCapture(event.pointerId);
                    } catch (err) {
                        // Pointer capture may fail on some browsers; safe to ignore.
                    }
                }
            });

            const cancelRepeat = (event) => {
                if (event) {
                    event.preventDefault();
                }
                stopRepeat(action);
                if (button.releasePointerCapture && event && event.pointerId) {
                    try {
                        button.releasePointerCapture(event.pointerId);
                    } catch (err) {
                        // Ignore release failures; pointer capture might not be active.
                    }
                }
            };

            button.addEventListener('pointerup', cancelRepeat);
            button.addEventListener('pointerleave', cancelRepeat);
            button.addEventListener('pointercancel', cancelRepeat);
            button.addEventListener('contextmenu', (event) => event.preventDefault());
        });
    }
    
    // Button event listeners
    startBtn.addEventListener('click', startGame);
    if (gridToggleBtn) {
        gridToggleBtn.addEventListener('click', toggleGrid);
    }
    
    // Load stored settings and render initial board
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
    ctx.fillText('Press Start to Play', canvas.width / 2, canvas.height / 2 + 20);
});