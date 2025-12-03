// Betting System for AI vs AI Mode
class BettingSystem {
    constructor() {
        this.MIN_BET = 10;
        this.MAX_BET = 500;
        this.COUNTDOWN_TIME = 15; // seconds
        
        this.currentBet = null;
        this.bettingActive = false;
        this.countdownTimer = null;
        this.countdownValue = 0;
        
        // Bet history
        this.HISTORY_KEY = 'tetrisBetHistory';
        this.betHistory = this.loadHistory();
        
        // Tournament mode
        this.tournamentActive = false;
        this.tournamentMatches = 0;
        this.tournamentMaxMatches = 5;
        this.jackpot = 0;
        this.JACKPOT_KEY = 'tetrisJackpot';
        this.jackpot = this.loadJackpot();
        
        // Statistics
        this.stats = {
            totalBets: 0,
            totalWon: 0,
            totalLost: 0,
            winStreak: 0,
            currentStreak: 0
        };
        this.loadStats();
    }

    // Load bet history
    loadHistory() {
        try {
            const stored = localStorage.getItem(this.HISTORY_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (err) {
            console.warn('Failed to load bet history:', err);
        }
        return [];
    }

    // Save bet history
    saveHistory() {
        try {
            // Keep only last 100 bets
            const history = this.betHistory.slice(-100);
            localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
        } catch (err) {
            console.warn('Failed to save bet history:', err);
        }
    }

    // Load jackpot
    loadJackpot() {
        try {
            const stored = localStorage.getItem(this.JACKPOT_KEY);
            if (stored) {
                const parsed = parseInt(stored, 10);
                if (!isNaN(parsed) && parsed >= 0) {
                    return parsed;
                }
            }
        } catch (err) {
            console.warn('Failed to load jackpot:', err);
        }
        return 0;
    }

    // Save jackpot
    saveJackpot() {
        try {
            localStorage.setItem(this.JACKPOT_KEY, this.jackpot.toString());
        } catch (err) {
            console.warn('Failed to save jackpot:', err);
        }
    }

    // Load statistics
    loadStats() {
        try {
            const stored = localStorage.getItem('tetrisBetStats');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.stats = { ...this.stats, ...parsed };
            }
        } catch (err) {
            console.warn('Failed to load stats:', err);
        }
    }

    // Save statistics
    saveStats() {
        try {
            localStorage.setItem('tetrisBetStats', JSON.stringify(this.stats));
        } catch (err) {
            console.warn('Failed to save stats:', err);
        }
    }

    // Start betting phase
    startBetting(onComplete, onCancel) {
        if (this.bettingActive) return false;
        
        this.bettingActive = true;
        this.currentBet = null;
        this.countdownValue = this.COUNTDOWN_TIME;
        
        // Show betting panel
        this.showBettingPanel();
        
        // Start countdown
        this.countdownTimer = setInterval(() => {
            this.countdownValue--;
            this.updateCountdownDisplay();
            
            if (this.countdownValue <= 0) {
                this.stopBetting();
                if (this.currentBet) {
                    onComplete(this.currentBet);
                } else {
                    onCancel();
                }
            }
        }, 1000);
        
        return true;
    }

    // Stop betting phase
    stopBetting() {
        this.bettingActive = false;
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
        this.hideBettingPanel();
    }

    // Place a bet
    placeBet(betType, target, amount) {
        if (!this.bettingActive) {
            return { success: false, message: 'Betting is not active' };
        }
        
        if (amount < this.MIN_BET || amount > this.MAX_BET) {
            return { success: false, message: `Bet must be between ${this.MIN_BET} and ${this.MAX_BET} TC` };
        }
        
        if (!window.tetriCoins.canAfford(amount)) {
            return { success: false, message: 'Insufficient balance' };
        }
        
        // Deduct bet amount
        if (!window.tetriCoins.deductCoins(amount)) {
            return { success: false, message: 'Failed to place bet' };
        }
        
        // Add to jackpot in tournament mode
        if (this.tournamentActive) {
            const jackpotContribution = Math.floor(amount * 0.1);
            this.jackpot += jackpotContribution;
            this.saveJackpot();
        }
        
        this.currentBet = {
            type: betType,
            target: target,
            amount: amount,
            odds: this.getOdds(betType, target),
            timestamp: Date.now()
        };
        
        this.updateBetDisplay();
        return { success: true, bet: this.currentBet };
    }

    // Get odds for bet type
    getOdds(betType, target) {
        const oddsTable = {
            'winner': 2.0,
            'first_tetris': 5.0,
            'score_race': 1.5
        };
        
        if (betType === 'score_range') {
            // Dynamic odds based on range width
            const ranges = {
                '0-1000': 10,
                '1001-2000': 5,
                '2001-3000': 3,
                '3001-5000': 3,
                '5001+': 8
            };
            return ranges[target] || 3;
        }
        
        return oddsTable[betType] || 2.0;
    }

    // Resolve bet after match
    resolveBet(matchResult) {
        if (!this.currentBet) return null;
        
        const bet = this.currentBet;
        let won = false;
        
        switch (bet.type) {
            case 'winner':
                won = matchResult.winner === bet.target;
                break;
            case 'first_tetris':
                won = matchResult.firstTetris === bet.target;
                break;
            case 'score_range':
                won = this.isInScoreRange(matchResult.winnerScore, bet.target);
                break;
            case 'score_race':
                won = matchResult.firstToReach === bet.target;
                break;
        }
        
        const payout = won ? Math.floor(bet.amount * bet.odds) : 0;
        
        if (won) {
            window.tetriCoins.addCoins(payout);
            this.stats.totalWon++;
            this.stats.currentStreak++;
            if (this.stats.currentStreak > this.stats.winStreak) {
                this.stats.winStreak = this.stats.currentStreak;
            }
        } else {
            this.stats.totalLost++;
            this.stats.currentStreak = 0;
        }
        
        this.stats.totalBets++;
        this.saveStats();
        
        // Add to history
        this.betHistory.push({
            ...bet,
            won: won,
            payout: payout,
            matchResult: matchResult
        });
        this.saveHistory();
        
        // Check achievements
        if (window.achievementSystem) {
            window.achievementSystem.checkBettingAchievements(this.stats, won);
        }
        
        this.currentBet = null;
        
        return {
            won: won,
            payout: payout,
            profit: payout - bet.amount
        };
    }

    // Check if score is in range
    isInScoreRange(score, range) {
        const ranges = {
            '0-1000': [0, 1000],
            '1001-2000': [1001, 2000],
            '2001-3000': [2001, 3000],
            '3001-5000': [3001, 5000],
            '5001+': [5001, Infinity]
        };
        
        const [min, max] = ranges[range] || [0, 0];
        return score >= min && score <= max;
    }

    // Start tournament
    startTournament() {
        this.tournamentActive = true;
        this.tournamentMatches = 0;
    }

    // End tournament
    endTournament() {
        this.tournamentActive = false;
        
        // Distribute jackpot if there were bets
        if (this.jackpot > 0 && this.betHistory.length > 0) {
            // Award to players who made at least one bet in tournament
            const reward = this.jackpot;
            window.tetriCoins.addCoins(reward);
            this.jackpot = 0;
            this.saveJackpot();
            return reward;
        }
        
        return 0;
    }

    // Increment tournament match
    nextTournamentMatch() {
        if (this.tournamentActive) {
            this.tournamentMatches++;
            return this.tournamentMatches >= this.tournamentMaxMatches;
        }
        return false;
    }

    // UI Methods
    showBettingPanel() {
        const panel = document.getElementById('betting-panel');
        if (panel) {
            panel.style.display = 'block';
            panel.classList.add('betting-active');
        }
    }

    hideBettingPanel() {
        const panel = document.getElementById('betting-panel');
        if (panel) {
            panel.style.display = 'none';
            panel.classList.remove('betting-active');
        }
    }

    updateCountdownDisplay() {
        const element = document.getElementById('betting-countdown');
        if (element) {
            element.textContent = this.countdownValue;
            if (this.countdownValue <= 5) {
                element.classList.add('urgent');
            }
        }
    }

    updateBetDisplay() {
        const element = document.getElementById('current-bet-display');
        if (element && this.currentBet) {
            element.innerHTML = `
                <div class="bet-summary">
                    <strong>Your Bet:</strong> ${this.currentBet.amount} TC on 
                    ${this.formatBetTarget(this.currentBet)} 
                    (${this.currentBet.odds}x odds)
                </div>
            `;
        }
    }

    formatBetTarget(bet) {
        if (bet.type === 'winner') {
            return `AI ${bet.target} to win`;
        } else if (bet.type === 'first_tetris') {
            return `AI ${bet.target} for first Tetris`;
        } else if (bet.type === 'score_range') {
            return `score range ${bet.target}`;
        } else if (bet.type === 'score_race') {
            return `first to ${bet.target} points`;
        }
        return bet.target;
    }

    // Get statistics
    getStats() {
        return { ...this.stats };
    }

    // Get win rate
    getWinRate() {
        if (this.stats.totalBets === 0) return 0;
        return ((this.stats.totalWon / this.stats.totalBets) * 100).toFixed(1);
    }
}

// Create global instance
window.bettingSystem = new BettingSystem();
