// Achievement System
class AchievementSystem {
    constructor() {
        this.STORAGE_KEY = 'tetrisAchievements';
        
        // Define all achievements
        this.achievements = {
            lucky: {
                id: 'lucky',
                name: '🍀 Везунчик',
                description: '5 выигрышных ставок подряд',
                reward: 200,
                unlocked: false,
                unlockedAt: null
            },
            analyst: {
                id: 'analyst',
                name: '🔮 Аналитик',
                description: 'Угадал 10 победителей',
                reward: 500,
                unlocked: false,
                unlockedAt: null,
                progress: 0,
                target: 10
            },
            rich: {
                id: 'rich',
                name: '💎 Богач',
                description: 'Накопил 10000 TC',
                reward: 0, // Badge only
                unlocked: false,
                unlockedAt: null
            },
            sniper: {
                id: 'sniper',
                name: '🎯 Снайпер',
                description: 'Угадал точный диапазон очков 3 раза',
                reward: 300,
                unlocked: false,
                unlockedAt: null,
                progress: 0,
                target: 3
            },
            streak: {
                id: 'streak',
                name: '🔥 На волне',
                description: '3 Tetris подряд в своей игре',
                reward: 150,
                unlocked: false,
                unlockedAt: null,
                progress: 0,
                target: 3
            }
        };
        
        this.loadAchievements();
        this.notificationQueue = [];
    }

    // Load achievements from storage
    loadAchievements() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const saved = JSON.parse(stored);
                Object.keys(saved).forEach(key => {
                    if (this.achievements[key]) {
                        this.achievements[key] = { ...this.achievements[key], ...saved[key] };
                    }
                });
            }
        } catch (err) {
            console.warn('Failed to load achievements:', err);
        }
    }

    // Save achievements to storage
    saveAchievements() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.achievements));
        } catch (err) {
            console.warn('Failed to save achievements:', err);
        }
    }

    // Unlock an achievement
    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) {
            return false;
        }
        
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        this.saveAchievements();
        
        // Award coins if applicable
        if (achievement.reward > 0) {
            window.tetriCoins.addCoins(achievement.reward);
        }
        
        // Show notification
        this.showAchievementNotification(achievement);
        
        return true;
    }

    // Check betting-related achievements
    checkBettingAchievements(betStats, wonLastBet) {
        // Lucky - 5 winning bets in a row
        if (betStats.currentStreak >= 5 && !this.achievements.lucky.unlocked) {
            this.unlockAchievement('lucky');
        }
        
        // Analyst - 10 total wins
        if (wonLastBet) {
            this.achievements.analyst.progress = betStats.totalWon;
            if (betStats.totalWon >= 10 && !this.achievements.analyst.unlocked) {
                this.unlockAchievement('analyst');
            }
        }
        
        this.saveAchievements();
    }

    // Check score range achievement (Sniper)
    checkSniperAchievement(betWon, betType) {
        if (betWon && betType === 'score_range' && !this.achievements.sniper.unlocked) {
            this.achievements.sniper.progress++;
            if (this.achievements.sniper.progress >= 3) {
                this.unlockAchievement('sniper');
            }
            this.saveAchievements();
        }
    }

    // Check balance achievement (Rich)
    checkBalanceAchievement(balance) {
        if (balance >= 10000 && !this.achievements.rich.unlocked) {
            this.unlockAchievement('rich');
        }
    }

    // Check Tetris streak achievement
    checkTetrisStreak(consecutiveTetris) {
        if (!this.achievements.streak.unlocked) {
            this.achievements.streak.progress = consecutiveTetris;
            if (consecutiveTetris >= 3) {
                this.unlockAchievement('streak');
            } else {
                this.saveAchievements();
            }
        }
    }

    // Reset Tetris streak progress
    resetTetrisStreak() {
        if (!this.achievements.streak.unlocked) {
            this.achievements.streak.progress = 0;
            this.saveAchievements();
        }
    }

    // Get all achievements
    getAllAchievements() {
        return Object.values(this.achievements);
    }

    // Get unlocked achievements
    getUnlockedAchievements() {
        return Object.values(this.achievements).filter(a => a.unlocked);
    }

    // Get locked achievements
    getLockedAchievements() {
        return Object.values(this.achievements).filter(a => !a.unlocked);
    }

    // Get achievement progress percentage
    getProgress() {
        const total = Object.keys(this.achievements).length;
        const unlocked = this.getUnlockedAchievements().length;
        return Math.floor((unlocked / total) * 100);
    }

    // Show achievement notification
    showAchievementNotification(achievement) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.name.split(' ')[0]}</div>
            <div class="achievement-content">
                <div class="achievement-title">Достижение разблокировано!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                ${achievement.reward > 0 ? `<div class="achievement-reward">+${achievement.reward} TC</div>` : ''}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }

    // Create leaderboard entry
    addLeaderboardEntry(name, balance) {
        const LEADERBOARD_KEY = 'tetrisLeaderboard';
        let leaderboard = [];
        
        try {
            const stored = localStorage.getItem(LEADERBOARD_KEY);
            if (stored) {
                leaderboard = JSON.parse(stored);
            }
        } catch (err) {
            console.warn('Failed to load leaderboard:', err);
        }
        
        // Add or update entry
        const existing = leaderboard.findIndex(entry => entry.name === name);
        if (existing >= 0) {
            if (balance > leaderboard[existing].balance) {
                leaderboard[existing].balance = balance;
                leaderboard[existing].date = Date.now();
            }
        } else {
            leaderboard.push({
                name: name,
                balance: balance,
                date: Date.now()
            });
        }
        
        // Sort by balance and keep top 10
        leaderboard.sort((a, b) => b.balance - a.balance);
        leaderboard = leaderboard.slice(0, 10);
        
        try {
            localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
        } catch (err) {
            console.warn('Failed to save leaderboard:', err);
        }
        
        return leaderboard;
    }

    // Get leaderboard
    getLeaderboard() {
        const LEADERBOARD_KEY = 'tetrisLeaderboard';
        try {
            const stored = localStorage.getItem(LEADERBOARD_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (err) {
            console.warn('Failed to load leaderboard:', err);
        }
        return [];
    }

    // Generate share text
    generateShareText(score, balance) {
        const unlockedCount = this.getUnlockedAchievements().length;
        const totalCount = Object.keys(this.achievements).length;
        
        return `🎮 Tetris PWA - Мой результат!\n\n` +
               `📊 Счёт: ${score}\n` +
               `💰 Баланс: ${balance} TC\n` +
               `🏆 Достижения: ${unlockedCount}/${totalCount}\n\n` +
               `Играй в Tetris с виртуальной валютой!`;
    }

    // Share to social media
    shareResult(score, balance) {
        const text = this.generateShareText(score, balance);
        
        if (navigator.share) {
            // Use Web Share API if available
            navigator.share({
                title: 'Tetris PWA',
                text: text
            }).catch(err => {
                console.log('Share cancelled or failed:', err);
            });
        } else {
            // Fallback: copy to clipboard
            this.copyToClipboard(text);
            this.showMessage('Результат скопирован в буфер обмена!');
        }
    }

    // Copy text to clipboard
    copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.warn('Failed to copy:', err);
        }
        
        document.body.removeChild(textarea);
    }

    // Show temporary message
    showMessage(message) {
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

    // Reset all achievements (for testing)
    resetAll() {
        Object.keys(this.achievements).forEach(key => {
            this.achievements[key].unlocked = false;
            this.achievements[key].unlockedAt = null;
            if (this.achievements[key].progress !== undefined) {
                this.achievements[key].progress = 0;
            }
        });
        this.saveAchievements();
    }
}

// Create global instance
window.achievementSystem = new AchievementSystem();
