# Tutorial: Creating Tetris Game with Microsoft Copilot

## Introduction

This tutorial demonstrates how a beginner programmer, in collaboration with Microsoft Copilot, can create a classic Tetris game. This project serves as an excellent example of how artificial intelligence can assist in learning programming and developing functional applications.

## Contents

1. [Getting Started](#getting-started)
2. [Developing the Basic HTML Structure](#developing-the-basic-html-structure)
3. [Creating Game Logic in JavaScript](#creating-game-logic-in-javascript)
4. [Styling the Game with CSS](#styling-the-game-with-css)
5. [Testing and Debugging](#testing-and-debugging)
6. [Publishing the Project on GitHub](#publishing-the-project-on-github)
7. [Adding an Adaptive Learning AI](#adding-an-adaptive-learning-ai)
8. [Further Project Development](#further-project-development)

## Getting Started

### What we needed to get started:

1. **Basic knowledge of HTML, CSS, and JavaScript** — even a minimal understanding of these technologies enabled us to interact effectively with the AI assistant.
2. **Text editor** — in our case, we used an editor with Copilot support.
3. **Internet connection** — for interacting with AI and searching for additional information.
4. **Git and GitHub** — for versioning and publishing the project.

### First Steps

We began by discussing the general structure of the project. Microsoft Copilot helped plan the game architecture, define the main components, and suggested a step-by-step development plan. This gave us a clear vision of the future project right from the start.

## Developing the Basic HTML Structure

We created an `index.html` file with a basic structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Very Simple Tetris</title>
    <style>
        /* Game styles are placed here */
    </style>
</head>
<body>
    <div class="game-container">
        <canvas id="tetris" width="240" height="400"></canvas>
        <div class="game-info">
            <div class="score">Score: <span id="score">0</span></div>
            <div class="level">Level: <span id="level">1</span></div>
            <div class="lines">Lines: <span id="lines">0</span></div>
            <div class="next-piece">
                <p>Next:</p>
                <canvas id="next" width="80" height="80"></canvas>
            </div>
            <button id="start-button">Start / Pause</button>
        </div>
    </div>
    <script src="tetris.js"></script>
</body>
</html>
```

Copilot explained each page element and its purpose:
- Canvas for rendering the game field
- Information panel with score, level, and number of lines
- Preview of the next piece
- Start/pause button

## Creating Game Logic in JavaScript

The most challenging part of the project — the game logic — was implemented in the `tetris.js` file. Microsoft Copilot helped break this task into several subtasks:

1. **Creating basic constants and variables** — defining the game field dimensions, piece colors, etc.

2. **Defining Tetris pieces** — creating arrays describing all seven classic Tetris pieces with their possible rotation positions.

3. **Game initialization** — setting up the canvas, creating a game loop, processing key presses.

4. **Core game mechanics**:
   - Rendering the game field
   - Creating new pieces
   - Collision detection
   - Moving and rotating pieces
   - Clearing filled lines
   - Calculating score
   - Increasing difficulty level

Here's a code fragment illustrating the definition of pieces:

```javascript
const SHAPES = [
    // I-piece
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    // J-piece
    [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
    ],
    // ...other pieces
];
```

Copilot explained the logic of each code section, helped optimize algorithms, and suggested adding extra features like previewing the next piece and saving high scores.

## Styling the Game with CSS

After creating the functional part of the game, we improved its appearance using CSS:

```css
body {
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    background-color: #f0f0f0;
    margin-top: 20px;
}

.game-container {
    display: flex;
    gap: 20px;
}

canvas {
    border: 1px solid #000;
    background-color: #000;
}

.game-info {
    width: 150px;
    padding: 10px;
    background-color: #eee;
    border: 1px solid #ccc;
    border-radius: 5px;
}

/* ...additional styles... */
```

Microsoft Copilot offered several design options, helped adapt the interface for different screen sizes, and added animations to enhance the user experience.

## Testing and Debugging

After completing development, we tested the game and fixed errors. Copilot helped:

1. Identify problematic areas in the code
2. Suggest solutions for fixing bugs
3. Optimize game performance
4. Add handling for edge cases

For example, we encountered an issue where pieces sometimes could go beyond the boundaries of the field. Copilot helped implement a boundary checking function:

```javascript
function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (
                cellCol + col < 0 ||
                cellCol + col >= COLS ||
                cellRow + row >= ROWS ||
                board[cellRow + row][cellCol + col]
            )) {
                return false;
            }
        }
    }
    return true;
}
```

## Publishing the Project on GitHub

The final stage of our project was publishing the game on GitHub. Microsoft Copilot helped:

1. Create README files in multiple languages describing the project
2. Write the `upload_to_github.ps1` script to automate the publishing process
3. Configure Git for proper versioning of our code

The script performed all necessary actions: initializing the Git repository, creating the first commit, and pushing the code to GitHub.

## Adding an Adaptive Learning AI

With the baseline game complete, we extended it with a self-learning piece generator that studies the player's mistakes. Copilot guided us through the process in five steps:

1. **Expand the UI to surface insights** — in `index.html`, we inserted an `AI Insight` panel (a simple `<div>` with a `<p id="ai-summary">` placeholder) right under the score box. We also added responsive touch buttons and a high-score label so the game can run on tablets while showing what the AI is doing.

2. **Track DOM elements and storage keys** — at the top of `tetris.js`, we captured references to the new elements (`const aiSummaryElement = document.getElementById('ai-summary');`) and defined extra `STORAGE_KEYS` for the high score, grid visibility, and the AI state (`tetrisAiStateV1`). This allows the trainer to remember what worked across sessions.

3. **Measure the board after every placement** — we created a helper that inspects the grid and returns column heights, hole counts, and bumpiness:

```javascript
function computeBoardMetrics(boardState) {
    const heights = Array(COLS).fill(0);
    const holes = Array(COLS).fill(0);
    // walk each column from top to bottom, recording the first block and any gaps beneath it
    // ...compute totalHoles, maxHeight, aggregateHeight, bumpiness
    return { heights, holes, totalHoles, maxHeight, aggregateHeight, bumpiness };
}
```

4. **Build the adaptive engine** — Copilot helped us encapsulate the learning logic inside `createAdaptiveEngine()`. The object stores per-piece weights, remembers which shapes caused holes, and exposes five methods: `loadFromStorage`, `resetForNewGame`, `selectShapeIndex`, `registerPlacement`, and `getSummary`. Here is a condensed excerpt:

```javascript
const aiTrainer = createAdaptiveEngine();

function createAdaptiveEngine() {
    const weights = Array(SHAPES.length).fill(1);
    let sessionHolesByShape = Array(SHAPES.length).fill(0);

    function selectShapeIndex() {
        const total = weights.reduce((sum, w) => sum + w, 0);
        let threshold = Math.random() * total;
        for (let i = 0; i < weights.length; i++) {
            threshold -= weights[i];
            if (threshold <= 0) return i;
        }
        return weights.length - 1;
    }

    function registerPlacement(shapeIndex, beforeMetrics, afterMetrics, linesCleared) {
        const holesDelta = afterMetrics.totalHoles - beforeMetrics.totalHoles;
        if (holesDelta > 0) {
            weights[shapeIndex] = Math.min(8, weights[shapeIndex] + holesDelta * 0.6 + 0.4);
            sessionHolesByShape[shapeIndex] += holesDelta;
        }
        if (linesCleared > 0) {
            weights[shapeIndex] = Math.max(0.4, weights[shapeIndex] - (linesCleared > 1 ? 0.5 * linesCleared : 0.2));
        }
        // persist weights and craft human-readable reasons for the insight panel
    }

    return { loadFromStorage, resetForNewGame, selectShapeIndex, registerPlacement, getLiveHint, getSummary };
}
```

5. **Wire the engine into the game loop** — we replaced the uniform random picker with `getAdaptivePiece()`, which simply wraps `createPiece(aiTrainer.selectShapeIndex())`. Right before merging a piece we captured metrics for the current board, invoked `registerPlacement` after the merge, and updated the insight text: `updateAiInsight(aiTrainer.getLiveHint());`. On game start we call `aiTrainer.resetForNewGame(board)`; on game over we display `aiTrainer.getSummary(finalMetrics)` so players understand how the AI exploited their stack. Finally, we persisted the trainer state via `localStorage` so the AI keeps learning between sessions.

Thanks to Copilot's inline suggestions, we were able to integrate all of this without breaking the existing mechanics. The end result is a Tetris engine that adapts to the player and explains its strategy in natural language.

## Further Project Development

Our project is open for further improvements. Here are some ideas for future development:

1. **Adding mobile support** — implementing touch controls for playing the game on mobile devices
2. **Saving progress** — using localStorage to save best results
3. **Improving graphics** — adding themes and more advanced visual effects
4. **Sound effects** — adding music and sounds for a more complete gaming experience
5. **Multiplayer mode** — ability to compete with other players

## Conclusion

Our project demonstrates the effectiveness of collaboration between a beginner programmer and artificial intelligence. Microsoft Copilot acted as a mentor, explaining complex concepts, suggesting optimal solutions, and helping overcome technical difficulties.

This approach to learning programming has several advantages:
- Practical application of knowledge in a real project
- Immediate feedback and error correction
- Learning best practices and programming patterns
- Ability to implement a project that might otherwise seem too complex

This tutorial is just the beginning of your journey into game development and programming. With Microsoft Copilot as your assistant, you'll be able to implement many interesting projects and gradually develop your skills to a professional level.

Good luck with your future projects!