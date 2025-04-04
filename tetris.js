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
    const levelElement = document.getElementById('level');
    const linesElement = document.getElementById('lines');
    const startBtn = document.getElementById('start-btn');
    const gridToggleBtn = document.getElementById('grid-toggle');
    
    // Game variables
    let board = createBoard();
    let currentPiece = null;
    let nextPiece = null;
    let score = 0;
    let lines = 0;
    let level = 1;
    let gameOver = false;
    let isPaused = false;
    let dropInterval = 1000;
    let dropCounter = 0;
    let lastTime = 0;
    let gameLoop = null;
    let showGrid = true;  // Новая переменная для отображения сетки
    
    // Create empty game board
    function createBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }
    
    // Generate a random tetromino
    function getRandomPiece() {
        const shapeIndex = Math.floor(Math.random() * SHAPES.length);
        return {
            shape: SHAPES[shapeIndex],
            color: COLORS[shapeIndex],
            x: Math.floor(COLS / 2) - Math.floor(SHAPES[shapeIndex][0].length / 2),
            y: 0
        };
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
    
    // Toggle grid visibility
    function toggleGrid() {
        showGrid = !showGrid;
        gridToggleBtn.textContent = showGrid ? 'Hide Grid' : 'Show Grid';
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
            mergePiece();
            clearLines();
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
        const len = originalShape.length;
        
        // Create a new matrix with the same dimensions as the original
        const rotated = Array.from({ length: len }, () => Array(len).fill(0));
        
        // Perform the rotation (90 degrees clockwise)
        for (let y = 0; y < len; y++) {
            for (let x = 0; x < len; x++) {
                rotated[x][len - 1 - y] = originalShape[y][x];
            }
        }
        
        const original = currentPiece.shape;
        currentPiece.shape = rotated;
        
        // If rotation causes collision, try to adjust position
        let offset = 1;
        const limit = Math.floor(len / 2) + 1;
        
        while (checkCollision(currentPiece)) {
            // Try to adjust left
            currentPiece.x -= offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            
            // If offset becomes too large, revert rotation
            if (Math.abs(offset) > limit) {
                currentPiece.shape = original;
                currentPiece.x = currentPiece.x + offset;
                break;
            }
        }
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
    }
    
    // Update score display
    function updateScore() {
        scoreElement.textContent = score;
        levelElement.textContent = level;
        linesElement.textContent = lines;
    }
    
    // Spawn a new piece
    function spawnPiece() {
        if (!nextPiece) {
            nextPiece = getRandomPiece();
        }
        currentPiece = nextPiece;
        nextPiece = getRandomPiece();
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
        
        updateScore();
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
    
    // Button event listeners
    startBtn.addEventListener('click', startGame);
    if (gridToggleBtn) {
        gridToggleBtn.addEventListener('click', toggleGrid);
    }
    
    // Initial render
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