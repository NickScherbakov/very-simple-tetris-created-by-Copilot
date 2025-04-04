# Classic Tetris

A classic Tetris game implemented using HTML, CSS, and JavaScript.

![Tetris Game](https://via.placeholder.com/600x400?text=Tetris+Game)

## Description

This implementation of the classic Tetris game includes all the main elements of the original game:
- Seven standard tetrominos (I, J, L, O, S, T, Z)
- Increasing difficulty with each level
- Scoring system
- Display of the next piece
- Option to enable/disable grid

## Features

- Smooth animation and responsive controls
- Ability to pause the game
- Display of score, level, and lines
- Preview of the next figure
- Customizable visual grid
- Shine effects for tetrominos

## Controls

- **← →** : Move left/right
- **↑** : Rotate piece
- **↓** : Soft drop (accelerated)
- **Space** : Hard drop (instant)
- **P** : Pause
- **G** : Toggle grid display

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

[Your Name] - [link to profile or contacts]

## License

This project is licensed under [specify license, e.g., MIT License] - see the LICENSE file for details.

## Language

Russian version of this documentation is available in [README-RU.md](README-RU.md)