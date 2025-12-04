// Language Selection and Rules Screen Logic
class LanguageSelector {
    constructor() {
        this.LANGUAGE_KEY = 'tetrisLanguage';
        this.RULES_SHOWN_KEY = 'tetrisRulesShown';
        
        this.languageScreen = document.getElementById('language-screen');
        this.rulesScreen = document.getElementById('rules-screen');
        this.gameContainer = document.querySelector('.game-container');
        this.languageChangeBtn = document.getElementById('language-change-btn');
        
        this.currentLanguage = this.getSavedLanguage();
        this.rulesShown = this.getRulesShown();
        
        this.init();
    }
    
    init() {
        // Check if language is selected
        if (!this.currentLanguage) {
            this.showLanguageScreen();
        } else if (!this.rulesShown) {
            // Language selected but rules not shown
            applyTranslations(this.currentLanguage);
            this.showRulesScreen();
        } else {
            // Everything is set up, show game
            applyTranslations(this.currentLanguage);
            this.showGame();
        }
        
        // Set up event listeners
        this.setupLanguageButtons();
        this.setupRulesButton();
        this.setupLanguageChangeButton();
    }
    
    getSavedLanguage() {
        return localStorage.getItem(this.LANGUAGE_KEY);
    }
    
    getRulesShown() {
        return localStorage.getItem(this.RULES_SHOWN_KEY) === 'true';
    }
    
    saveLanguage(lang) {
        localStorage.setItem(this.LANGUAGE_KEY, lang);
        this.currentLanguage = lang;
    }
    
    saveRulesShown() {
        localStorage.setItem(this.RULES_SHOWN_KEY, 'true');
        this.rulesShown = true;
    }
    
    showLanguageScreen() {
        if (this.languageScreen) {
            this.languageScreen.style.display = 'flex';
        }
        if (this.rulesScreen) {
            this.rulesScreen.style.display = 'none';
        }
        if (this.gameContainer) {
            this.gameContainer.style.display = 'none';
        }
    }
    
    showRulesScreen() {
        if (this.languageScreen) {
            this.languageScreen.style.display = 'none';
        }
        if (this.rulesScreen) {
            this.rulesScreen.style.display = 'flex';
        }
        if (this.gameContainer) {
            this.gameContainer.style.display = 'none';
        }
    }
    
    showGame() {
        if (this.languageScreen) {
            this.languageScreen.style.display = 'none';
        }
        if (this.rulesScreen) {
            this.rulesScreen.style.display = 'none';
        }
        if (this.gameContainer) {
            this.gameContainer.style.display = 'grid';
        }
    }
    
    setupLanguageButtons() {
        const languageButtons = document.querySelectorAll('.language-btn');
        languageButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                this.selectLanguage(lang);
            });
        });
    }
    
    selectLanguage(lang) {
        this.saveLanguage(lang);
        applyTranslations(lang);
        
        // Show rules screen after language selection
        this.showRulesScreen();
    }
    
    setupRulesButton() {
        const startPlayingBtn = document.getElementById('start-playing-btn');
        if (startPlayingBtn) {
            startPlayingBtn.addEventListener('click', () => {
                this.saveRulesShown();
                this.showGame();
                
                // Trigger game ready event
                window.dispatchEvent(new CustomEvent('gameReady'));
            });
        }
    }
    
    setupLanguageChangeButton() {
        if (this.languageChangeBtn) {
            this.languageChangeBtn.addEventListener('click', () => {
                this.showLanguageModal();
            });
        }
    }
    
    showLanguageModal() {
        // Create modal for language change
        const existingModal = document.getElementById('language-change-modal');
        if (existingModal) {
            existingModal.style.display = 'flex';
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'language-change-modal';
        modal.className = 'modal language-modal';
        modal.innerHTML = `
            <div class="modal-content language-modal-content">
                <span class="close-modal" id="close-language-modal">&times;</span>
                <h2 data-i18n="select_language">Select Language</h2>
                <div class="language-options">
                    <button class="language-btn modal-lang-btn" data-lang="en">🇬🇧 English</button>
                    <button class="language-btn modal-lang-btn" data-lang="ar">🇸🇦 العربية</button>
                    <button class="language-btn modal-lang-btn" data-lang="zh">🇨🇳 中文</button>
                    <button class="language-btn modal-lang-btn" data-lang="ru">🇷🇺 Русский</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Apply translations to modal
        applyTranslations(this.currentLanguage);
        
        // Set up close button
        const closeBtn = modal.querySelector('#close-language-modal');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Set up language buttons in modal
        const modalLangButtons = modal.querySelectorAll('.modal-lang-btn');
        modalLangButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                this.changeLanguage(lang);
                modal.style.display = 'none';
            });
        });
        
        modal.style.display = 'flex';
    }
    
    changeLanguage(lang) {
        this.saveLanguage(lang);
        applyTranslations(lang);
        
        // Trigger language change event for other components
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }
}

// Initialize language selector when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.languageSelector = new LanguageSelector();
});
