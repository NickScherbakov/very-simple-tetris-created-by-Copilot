# Classic Tetris

A classic Tetris game implemented using HTML, CSS, JavaScript ... and little AI-trainer-mentor

## Screenshot

![Classic Tetris Gameplay](screenshot.jpg)

## Description

This implementation of the classic Tetris game includes all the main elements of the original—plus several modern enhancements:
- Seven standard tetrominos (I, J, L, O, S, T, Z)
- Increasing difficulty with each level
- Scoring system with soft/hard drop bonuses
- Display of the next piece
- Option to enable/disable the grid overlay
- Adaptive learning engine that analyzes player mistakes
- Optional touch controls for mobile and tablet devices
- Persistent high-score and grid preference storage

## Features

- Smooth animation and responsive keyboard controls
- Ability to pause/resume play at any time
- Real-time display of score, level, and cleared lines
- Preview of the next tetromino
- Customizable visual grid with shine effects for blocks
- Adaptive AI insight panel explaining strategy shifts
- On-screen touch controls for coarse-pointer (touch) devices
- High-score persistence across sessions via local storage

## Controls

- **← →** : Move left/right
- **↑** : Rotate piece
- **↓** : Soft drop (accelerated)
- **Space** : Hard drop (instant)
- **P** : Pause
- **G** : Toggle grid display
- **Touch panel** : Buttons for move/rotate/drop/pause on mobile devices

For mobile users, add the game to your home screen or open it in full-screen mode for the best touch experience.

## Scoring System

- 1 line: 40 × level
- 2 lines: 100 × level
- 3 lines: 300 × level
- 4 lines: 1200 × level
- Soft drop: +1 point per cell
- Hard drop: +2 points per cell

## Installation and Launch

1. Clone the repository or download the project files
2. Open `index.html` in any modern web browser
3. Click the "Start Game" button to begin playing

## Technologies

- HTML5
- CSS3
- JavaScript (using Canvas API for rendering)

## AI vs AI Game Mode

**New Feature!** Watch two AI players compete against each other in this exciting game mode that demonstrates advanced strategic thinking and adaptive learning.

### How It Works

1. **AI Competition**: Two independent AI engines play against each other, each learning and adapting to the board state
2. **Real-time Analysis**: Each AI shows its thinking process and strategic planning in real-time
3. **Player Learning**: Observe sophisticated AI decision-making to improve your own Tetris skills
4. **Player Intervention**: Take control at any time using the 'T' key or "Take Control" button

### AI vs AI Features

- **Dual AI System**: Two separate AI players with independent learning algorithms
- **Strategic Analysis**: Each AI analyzes the board and explains its reasoning
- **Visual Feedback**: Color-coded UI showing which AI is active (Red AI 1 vs Blue AI 2)
- **Educational Value**: Perfect for learning advanced Tetris strategies by observing AI gameplay
- **Seamless Integration**: Switch between normal gameplay and AI vs AI mode instantly

### Controls (AI vs AI Mode)

- **AI vs AI Mode Button**: Start AI vs AI gameplay
- **T Key**: Take control from the current AI player
- **Take Control Button**: Alternative way to intervene in AI gameplay
- **Exit AI Mode Button**: Return to normal gameplay

This mode is perfect for players who want to:
- Learn advanced Tetris strategies by watching AI gameplay
- Understand how different AI approaches handle various board situations
- Practice taking over from AI at critical moments
- Experience the educational value of AI vs AI competition

## Adaptive Learning AI

The built-in trainer observes each of your placements and increases the frequency of pieces that caused trouble—such as creating holes or raising tall columns—while reducing shapes that helped you recover. It never changes the fall speed, keeping gameplay fair. During the round the **AI Insight** panel calls out what it noticed most recently, and after a top-out it explains exactly how it capitalized on your mistakes so you can adjust your strategy next time.

## AI Prompt for Recreation

### Prompt for AI Assistant

Create a classic Tetris game implementation using HTML, CSS, and JavaScript with the following specifications:

1. **Game Structure**:
   - Create an HTML file with a main game canvas (300x600px) for the Tetris board
   - Add a secondary canvas (100x100px) to display the next piece
   - Set up a score display area showing score, level, and lines cleared
   - Include Start/Restart button and Grid Toggle button
   - Add a controls guide section

2. **Game Mechanics**:
   - Implement a 10x20 grid for the game board
   - Create the 7 standard tetromino shapes (I, J, L, O, S, T, Z) with distinct colors
   - Set up piece movement (left, right, down), rotation, and collision detection
   - Implement soft drop (faster descent) and hard drop (instant placement)
   - Add line clearing with appropriate scoring
   - Implement level progression (every 10 lines) with increasing speed
   - Include game over detection when pieces stack to the top
   - Add pause functionality

3. **Visual Elements**:
   - Style the game with a dark theme (black background for game area)
   - Add a shine effect to each tetromino block
   - Implement optional grid display that can be toggled on/off
   - Create a start screen, pause screen, and game over screen with appropriate messages
   - Ensure the next piece preview shows the upcoming tetromino centered in its canvas

4. **Controls**:
   - Arrow keys for movement (left, right, down) and rotation (up)
   - Space bar for hard drop
   - P key for pause/resume
   - G key for toggling grid visibility

5. **Scoring System**:
   - 40 × level points for 1 line
   - 100 × level points for 2 lines
   - 300 × level points for 3 lines
   - 1200 × level points for 4 lines
   - 1 bonus point for each cell in soft drop
   - 2 bonus points for each cell in hard drop

Implement the game using vanilla JavaScript with the Canvas API for rendering, ensuring smooth gameplay with appropriate animation timing. The implementation should be responsive and work in modern browsers without external libraries.

## Author

[GitHub Copilot] + [NinelGPT]

  - https://www.patreon.com/NinelGPT
  - https://opencollective.com/nick-scherbfkov

## License

This project is licensed under FREE
