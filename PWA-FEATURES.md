# Tetris PWA - New Features Documentation

## 🎮 Overview
This Tetris game has been transformed into a Progressive Web App (PWA) with a complete virtual currency and betting system.

## ✨ Key Features

### 📱 Progressive Web App (PWA)
- **Offline Support**: Play the game even without internet connection
- **Installable**: Add to home screen on mobile devices
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Touch Controls**: 
  - Swipe left/right to move pieces
  - Tap to rotate
  - Swipe down for hard drop
- **Vibration Feedback**: Haptic feedback on line clears and game events

### 💰 TetriCoins Virtual Currency System
- **Initial Balance**: 1,000 TC for new players
- **Earning Coins**:
  - 1 line cleared = 10 TC
  - 2 lines cleared = 30 TC
  - 3 lines cleared = 100 TC
  - Tetris (4 lines) = 500 TC
- **Daily Bonus**: +100 TC every day
- **Persistent Storage**: Balance saved in localStorage

### 🎲 Betting System (AI vs AI Mode)
- **15-second Countdown**: Place your bet before the match starts
- **Bet Types**:
  1. **Winner** (2.0x odds): Bet on AI 1 or AI 2 to win
  2. **First Tetris** (5.0x odds): Who clears 4 lines first
  3. **Score Range** (3-10x odds): Predict final score range
  4. **Score Race** (1.5x odds): First to reach 1,000 points
- **Bet Limits**: 10 TC minimum, 500 TC maximum
- **Neon Casino Style UI**: Beautiful animated betting panel

### 🏆 Tournament Mode
- **5-Match Series**: Play through 5 AI vs AI matches
- **Jackpot System**: 10% of all bets go into the prize pool
- **Final Reward**: Win the accumulated jackpot

### 🎖️ Achievement System
- **🍀 Lucky**: Win 5 bets in a row (+200 TC)
- **🔮 Analyst**: Correctly predict 10 winners (+500 TC)
- **💎 Rich**: Accumulate 10,000 TC (badge only)
- **🎯 Sniper**: Guess exact score range 3 times (+300 TC)
- **🔥 On Fire**: Get 3 Tetris combos in your own game (+150 TC)

### 📊 Social Features
- **Local Leaderboard**: Top 10 players by balance
- **Share Results**: Share your score and balance on social media
- **Achievement Notifications**: Beautiful pop-ups when unlocking badges

### 🎨 UI/UX Improvements
- **Dark Theme**: Purple and blue neon aesthetics
- **Responsive Buttons**: Touch-friendly sizes on mobile
- **Animations**: Smooth transitions and effects
- **Confetti**: Celebration animation on winning bets
- **Mobile-First**: Optimized layout for small screens

## 📁 File Structure

```
├── manifest.json          # PWA manifest
├── sw.js                  # Service Worker for offline support
├── index.html             # Updated with new UI elements
├── tetris.js              # Core game with integrations
├── style.css              # Enhanced responsive styles
├── js/
│   ├── currency.js        # Virtual currency management
│   ├── betting.js         # Betting system logic
│   ├── achievements.js    # Achievement tracking
│   └── pwa.js             # PWA registration
├── css/
│   └── betting-panel.css  # Betting UI styles
└── icons/
    ├── icon-192x192.png   # PWA icon (192x192)
    └── icon-512x512.png   # PWA icon (512x512)
```

## 🚀 Installation

### As a Web App
1. Open the game in a modern browser (Chrome, Edge, Safari, Firefox)
2. Look for "Install App" button or browser's install prompt
3. Click to add to your home screen

### For Development
1. Clone the repository
2. Serve the files with any HTTP server (e.g., `python -m http.server`)
3. Open in browser at `http://localhost:8000`

## 🎯 How to Play

### Regular Mode
1. Click "Start Game" to begin
2. Use arrow keys (desktop) or swipe (mobile) to control pieces
3. Clear lines to earn TetriCoins
4. Build up your balance and unlock achievements

### AI vs AI Mode with Betting
1. Click "AI vs AI Mode"
2. Betting panel appears with 15-second countdown
3. Select bet type and target
4. Choose bet amount (10-500 TC)
5. Click "Place Bet" or "Skip"
6. Watch the AI battle and see if you win!

### Tournament Mode
1. Click "Tournament Mode"
2. Play through 5 AI vs AI matches
3. Place bets on each match
4. Accumulate jackpot from all bets
5. Win the final jackpot prize!

## 🔧 Technical Details

### Technologies Used
- **Vanilla JavaScript**: No frameworks, pure JS
- **Service Worker API**: For offline functionality
- **Web App Manifest**: For PWA capabilities
- **LocalStorage**: For persistent data
- **Vibration API**: For haptic feedback
- **Web Share API**: For social sharing
- **Canvas API**: For game rendering

### Browser Support
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Storage
All data is stored locally using localStorage:
- `tetrisCoinsBalance`: Current TC balance
- `tetrisLastDailyBonus`: Last bonus claim date
- `tetrisAchievements`: Unlocked achievements
- `tetrisBetHistory`: Betting history
- `tetrisBetStats`: Betting statistics
- `tetrisLeaderboard`: Top 10 players

## ⚠️ Important Notice

**🎮 This is a game using virtual currency. No real money is involved. For entertainment purposes only!**

## 📝 Credits

Created using GitHub Copilot with comprehensive PWA, virtual currency, and betting system implementations.
