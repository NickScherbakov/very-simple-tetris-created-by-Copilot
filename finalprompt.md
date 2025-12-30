# 🎯 Task: Complete Modular Refactoring of Tetris Game

## 📋 Current State

The project is a PWA Tetris game with the following structure:
- **Main file**: `tetris.js` (1724 lines) - contains internal modules using IIFE pattern
- **Existing separate modules**: `js/achievements.js`, `js/betting.js`, `js/currency.js`, `js/i18n.js`, `js/language-selector.js`, `js/pwa.js`
- **Internal modules in tetris.js** (already logically separated but NOT in separate files):
  1. `BoardModule` - board logic (createEmpty, isValidPosition, mergePieceInto, findCompletedLines, clearLines, computeMetrics)
  2. `PieceModule` - tetromino management (create, getAdaptive, rotate)
  3. `InputManager` - keyboard and touch input handling
  4. `Renderer` - drawing/rendering (drawBlock, drawPiece, drawNextPiece, drawBoard, drawGrid, clear)
  5. `GameLoopManager` - game lifecycle (reset, start, pause, stop)

Other functional blocks still embedded: `AdaptiveEngine`, `AiVsAi`, scoring logic, UI controllers.

## 🎯 Your Mission

**Extract ALL internal modules from `tetris.js` into separate ES6 module files** following clean architecture principles and modern JavaScript standards.

## 📁 Required File Structure

Create the following directory structure:

```
js/
├── modules/
│   ├── core/
│   │   ├── BoardModule.js          # Board logic
│   │   ├── PieceModule.js          # Tetromino shapes and rotation
│   │   └── GameLoopManager.js      # Game lifecycle
│   ├── rendering/
│   │   └── Renderer.js             # Canvas rendering
│   ├── input/
│   │   └── InputManager.js         # Keyboard and touch controls
│   ├── ai/
│   │   ├── AdaptiveEngine.js       # Adaptive difficulty
│   │   └── AiVsAi.js               # AI vs AI mode
│   └── game/
│       ├── ScoringSystem.js        # Score calculation
│       └── UIController.js         # UI state management
├── achievements.js      # (existing - keep as is)
├── betting.js           # (existing - keep as is)
├── currency.js          # (existing - keep as is)
├── i18n.js              # (existing - keep as is)
├── language-selector.js # (existing - keep as is)
└── pwa.js               # (existing - keep as is)

tetris.js                # Main orchestrator (~200-300 lines)
```

## ✅ Technical Requirements

### 1. ES6 Module Standards
- Use **ES6 `export`/`import`** syntax
- Each module exports a **single default object** or **named exports**
- No global variables - everything through module imports
- Use `'use strict';` in each module

### 2. Module Design Pattern
```javascript
// Example structure for BoardModule.js
export const BoardModule = (() => {
    // Private variables
    const BOARD_WIDTH = 10;
    const BOARD_HEIGHT = 20;
    
    // Private functions
    function privateHelper() { ... }
    
    // Public API
    return {
        createEmpty() { ... },
        isValidPosition(piece, board, x, y) { ... },
        // ... other methods
    };
})();
```

### 3. Main tetris.js File
After refactoring, `tetris.js` should:
- Import all modules
- Initialize the game
- Wire up event listeners
- Contain ONLY orchestration logic (~200-300 lines)
- NO business logic - delegate to modules

### 4. Update index.html
- Add `type="module"` to tetris.js script tag
- Ensure all modules load correctly
- Verify no console errors

### 5. Backward Compatibility
- ✅ Game must work EXACTLY as before
- ✅ All features preserved: betting, achievements, AI modes, adaptive difficulty
- ✅ Same keyboard shortcuts and touch controls
- ✅ Same visual appearance and behavior
- ✅ PWA functionality maintained

### 6. Code Quality Standards
- **DRY principle**: No code duplication
- **Single Responsibility**: Each module does ONE thing well
- **Pure functions** where possible
- **Clear naming**: descriptive function and variable names
- **Comments**: JSDoc for public APIs
- **Error handling**: Validate inputs, handle edge cases
- **Constants**: Extract magic numbers to named constants

### 7. Testing Requirements
Before completion, verify:
1. ✅ Run syntax check: `node -c tetris.js` and each module file
2. ✅ Open `index.html` in browser - no console errors
3. ✅ Test basic gameplay: move, rotate, clear lines
4. ✅ Test pause/resume
5. ✅ Test game over and restart
6. ✅ Test keyboard and touch controls
7. ✅ Test AI vs AI mode
8. ✅ Test betting system
9. ✅ Test achievements
10. ✅ Test PWA installation

## 📊 Success Criteria

- ✅ `tetris.js` reduced from 1724 lines to ~200-300 lines
- ✅ 8+ separate module files created
- ✅ Zero functionality loss
- ✅ Zero console errors or warnings
- ✅ Clean git diff showing proper refactoring
- ✅ Code passes all manual tests listed above

## 🚀 Execution Steps

1. **Analyze** current `tetris.js` - understand dependencies between modules
2. **Create** directory structure `js/modules/` with subdirectories
3. **Extract** BoardModule → `js/modules/core/BoardModule.js`
4. **Extract** PieceModule → `js/modules/core/PieceModule.js`
5. **Extract** Renderer → `js/modules/rendering/Renderer.js`
6. **Extract** InputManager → `js/modules/input/InputManager.js`
7. **Extract** GameLoopManager → `js/modules/core/GameLoopManager.js`
8. **Extract** AdaptiveEngine → `js/modules/ai/AdaptiveEngine.js`
9. **Extract** AiVsAi → `js/modules/ai/AiVsAi.js`
10. **Extract** remaining logic → ScoringSystem, UIController
11. **Refactor** main `tetris.js` to import and use all modules
12. **Update** `index.html` with `type="module"`
13. **Test** thoroughly - all features must work
14. **Create** `REFACTORING_COMPLETE.md` with final report

## 📝 Final Deliverable

Create a file `REFACTORING_COMPLETE.md` with:
- List of all created module files with line counts
- Dependency graph showing module relationships
- Before/after comparison (1724 lines → X modules totaling Y lines)
- Testing checklist with ✅ marks
- Any breaking changes or notes for future work

## ⚠️ Critical Rules

- **DO NOT** change game logic or behavior
- **DO NOT** skip testing
- **DO NOT** leave debug code or console.logs
- **DO NOT** break PWA functionality
- **DO** preserve all comments and documentation
- **DO** maintain code style consistency
- **DO** test after EACH module extraction

## 🎓 Architecture Philosophy

Follow these principles:
- **Separation of Concerns**: Rendering ≠ Logic ≠ Input ≠ AI
- **Dependency Injection**: Pass dependencies explicitly
- **Interface Segregation**: Modules expose only what's needed
- **Testability**: Each module can be tested independently
- **Maintainability**: Future developers can understand code quickly

---

**Priority**: High  
**Estimated Time**: 2-4 hours for careful, tested refactoring  
**Risk Level**: Medium (backward compatibility critical)  
**Review Required**: Yes - full QA testing before completion

Good luck! 🚀
