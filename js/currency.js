// Virtual Currency System - TetriCoins
class TetriCoins {
    constructor() {
        this.STORAGE_KEY = 'tetrisCoinsBalance';
        this.LAST_BONUS_KEY = 'tetrisLastDailyBonus';
        this.INITIAL_BALANCE = 1000;
        this.DAILY_BONUS = 100;
        this.balance = this.loadBalance();
        this.listeners = [];
    }

    // Load balance from localStorage
    loadBalance() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored !== null) {
                const parsed = parseInt(stored, 10);
                if (!isNaN(parsed) && parsed >= 0) {
                    return parsed;
                }
            }
        } catch (err) {
            console.warn('Failed to load balance:', err);
        }
        return this.INITIAL_BALANCE;
    }

    // Save balance to localStorage
    saveBalance() {
        try {
            localStorage.setItem(this.STORAGE_KEY, this.balance.toString());
            this.notifyListeners();
        } catch (err) {
            console.warn('Failed to save balance:', err);
        }
    }

    // Get current balance
    getBalance() {
        return this.balance;
    }

    // Add coins to balance
    addCoins(amount) {
        if (amount > 0) {
            this.balance += amount;
            this.saveBalance();
            return true;
        }
        return false;
    }

    // Deduct coins from balance
    deductCoins(amount) {
        if (amount > 0 && this.balance >= amount) {
            this.balance -= amount;
            this.saveBalance();
            return true;
        }
        return false;
    }

    // Check if player can afford amount
    canAfford(amount) {
        return this.balance >= amount;
    }

    // Get reward for clearing lines
    getLineReward(linesCleared) {
        const rewards = {
            1: 10,   // 1 line = 10 TC
            2: 30,   // 2 lines = 30 TC
            3: 100,  // 3 lines = 100 TC
            4: 500   // Tetris (4 lines) = 500 TC
        };
        return rewards[linesCleared] || 0;
    }

    // Award coins for clearing lines
    awardLinesCleared(linesCleared) {
        const reward = this.getLineReward(linesCleared);
        if (reward > 0) {
            this.addCoins(reward);
            return reward;
        }
        return 0;
    }

    // Check and award daily bonus
    checkDailyBonus() {
        try {
            const today = new Date().toDateString();
            const lastBonus = localStorage.getItem(this.LAST_BONUS_KEY);
            
            if (lastBonus !== today) {
                this.addCoins(this.DAILY_BONUS);
                localStorage.setItem(this.LAST_BONUS_KEY, today);
                return true;
            }
        } catch (err) {
            console.warn('Failed to check daily bonus:', err);
        }
        return false;
    }

    // Add listener for balance changes
    addListener(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }

    // Remove listener
    removeListener(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    // Notify all listeners of balance change
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.balance);
            } catch (err) {
                console.warn('Listener error:', err);
            }
        });
    }

    // Reset balance (for testing/debugging)
    reset() {
        this.balance = this.INITIAL_BALANCE;
        this.saveBalance();
        try {
            localStorage.removeItem(this.LAST_BONUS_KEY);
        } catch (err) {
            console.warn('Failed to reset bonus:', err);
        }
    }

    // Format coins for display
    formatCoins(amount = null) {
        const value = amount !== null ? amount : this.balance;
        return value.toLocaleString();
    }
}

// Create global instance
window.tetriCoins = new TetriCoins();
