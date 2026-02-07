// Team Tournament UI Controller
class TeamTournamentUI {
    constructor() {
        this.modal = document.getElementById('team-tournament-modal');
        this.closeBtn = document.getElementById('close-team-tournament');
        this.openBtn = document.getElementById('team-tournament-btn');
        
        this.tabs = document.querySelectorAll('.team-tournament-tab');
        this.sections = document.querySelectorAll('.team-tournament-section');
        
        // Team management elements
        this.teamNameInput = document.getElementById('team-name-input');
        this.teamSizeInput = document.getElementById('team-size-input');
        this.createTeamBtn = document.getElementById('create-team-btn');
        this.teamList = document.getElementById('team-list');
        
        // Tournament setup elements
        this.teamSelectionList = document.getElementById('team-selection-list');
        this.selectedTeamsDisplay = document.getElementById('selected-teams-display');
        this.startTournamentBtn = document.getElementById('start-team-tournament-btn');
        
        // Active tournament elements
        this.matchDisplay = document.getElementById('tournament-match-display');
        this.bracketDisplay = document.getElementById('tournament-bracket-display');
        
        this.selectedTeamIds = [];
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Modal controls
        if (this.openBtn) {
            this.openBtn.addEventListener('click', () => this.open());
        }
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        
        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
        
        // Team creation
        if (this.createTeamBtn) {
            this.createTeamBtn.addEventListener('click', () => this.createTeam());
        }
        
        // Tournament start
        if (this.startTournamentBtn) {
            this.startTournamentBtn.addEventListener('click', () => this.startTournament());
        }
    }
    
    open() {
        this.modal.classList.add('active');
        this.refreshTeamList();
        this.switchTab('teams');
    }
    
    close() {
        this.modal.classList.remove('active');
        this.selectedTeamIds = [];
    }
    
    switchTab(tabName) {
        // Update tabs
        this.tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update sections
        this.sections.forEach(section => {
            section.classList.remove('active');
        });
        
        const activeSection = document.getElementById(`${tabName}-section`);
        if (activeSection) {
            activeSection.classList.add('active');
        }
        
        // Refresh content based on tab
        if (tabName === 'teams') {
            this.refreshTeamList();
        } else if (tabName === 'setup') {
            this.refreshTeamSelectionList();
        } else if (tabName === 'active') {
            this.refreshActiveTournament();
        }
    }
    
    createTeam() {
        const name = this.teamNameInput.value.trim();
        const size = parseInt(this.teamSizeInput.value);
        
        if (!name) {
            alert('Please enter a team name');
            return;
        }
        
        const result = window.teamTournamentSystem.createTeam(name, size);
        
        if (result.success) {
            this.teamNameInput.value = '';
            this.refreshTeamList();
            this.showNotification('Team created successfully!', 'success');
        } else {
            this.showNotification(result.message, 'error');
        }
    }
    
    refreshTeamList() {
        const teams = window.teamTournamentSystem.getTeams();
        
        if (!this.teamList) return;
        
        if (teams.length === 0) {
            this.teamList.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No teams created yet. Create your first team above!</p>';
            return;
        }
        
        this.teamList.innerHTML = teams.map(team => `
            <div class="team-card" data-team-id="${team.id}">
                <div class="team-card-header">
                    <div class="team-name">${this.escapeHtml(team.name)}</div>
                    <button class="team-delete-btn" onclick="teamTournamentUI.deleteTeam('${team.id}')">
                        <span data-i18n="delete_team">Delete</span>
                    </button>
                </div>
                <div class="team-players">
                    <strong><span data-i18n="players">Players</span>:</strong>
                    ${team.players.map(p => `
                        <div class="team-player">
                            <span>${this.escapeHtml(p.name)}</span>
                            <span style="color: ${p.aiType === 'aggressive' ? '#ff6b6b' : '#4ecdc4'}">${p.aiType}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="team-stats">
                    <div><strong><span data-i18n="matches_played">Matches Played</span>:</strong> ${team.stats.matchesPlayed}</div>
                    <div><strong><span data-i18n="matches_won">Matches Won</span>:</strong> ${team.stats.matchesWon}</div>
                    <div><strong><span data-i18n="avg_score">Avg Score</span>:</strong> ${team.stats.avgScore}</div>
                </div>
            </div>
        `).join('');
        
        // Apply translations
        if (window.applyTranslations) {
            const currentLang = localStorage.getItem('tetrisLanguage') || 'en';
            window.applyTranslations(currentLang);
        }
    }
    
    deleteTeam(teamId) {
        if (!confirm('Are you sure you want to delete this team?')) {
            return;
        }
        
        const result = window.teamTournamentSystem.deleteTeam(teamId);
        
        if (result.success) {
            this.refreshTeamList();
            this.refreshTeamSelectionList();
            this.showNotification('Team deleted', 'success');
        } else {
            this.showNotification(result.message, 'error');
        }
    }
    
    refreshTeamSelectionList() {
        const teams = window.teamTournamentSystem.getTeams();
        
        if (!this.teamSelectionList) return;
        
        if (teams.length === 0) {
            this.teamSelectionList.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No teams available. Create teams first!</p>';
            return;
        }
        
        this.teamSelectionList.innerHTML = teams.map(team => `
            <div class="team-card ${this.selectedTeamIds.includes(team.id) ? 'selected' : ''}" 
                 data-team-id="${team.id}"
                 onclick="teamTournamentUI.toggleTeamSelection('${team.id}')">
                <div class="team-card-header">
                    <div class="team-name">${this.escapeHtml(team.name)}</div>
                    <div style="color: #4CAF50;">${this.selectedTeamIds.includes(team.id) ? '✓ Selected' : ''}</div>
                </div>
                <div class="team-players">
                    <strong>${team.players.length} <span data-i18n="players">Players</span></strong>
                </div>
                <div class="team-stats">
                    <div><strong>W/L:</strong> ${team.stats.matchesWon}/${team.stats.matchesPlayed - team.stats.matchesWon}</div>
                    <div><strong><span data-i18n="avg_score">Avg Score</span>:</strong> ${team.stats.avgScore}</div>
                </div>
            </div>
        `).join('');
        
        this.updateSelectedTeamsDisplay();
        
        // Apply translations
        if (window.applyTranslations) {
            const currentLang = localStorage.getItem('tetrisLanguage') || 'en';
            window.applyTranslations(currentLang);
        }
    }
    
    toggleTeamSelection(teamId) {
        const index = this.selectedTeamIds.indexOf(teamId);
        
        if (index > -1) {
            this.selectedTeamIds.splice(index, 1);
        } else {
            this.selectedTeamIds.push(teamId);
        }
        
        this.refreshTeamSelectionList();
    }
    
    updateSelectedTeamsDisplay() {
        if (!this.selectedTeamsDisplay) return;
        
        if (this.selectedTeamIds.length === 0) {
            this.selectedTeamsDisplay.innerHTML = '<p style="color: #888;">No teams selected yet...</p>';
            this.startTournamentBtn.disabled = true;
            return;
        }
        
        const teams = window.teamTournamentSystem.getTeams();
        const selectedTeams = teams.filter(t => this.selectedTeamIds.includes(t.id));
        
        this.selectedTeamsDisplay.innerHTML = selectedTeams.map(team => `
            <span class="selected-team-chip">
                ${this.escapeHtml(team.name)}
                <span class="remove-team" onclick="teamTournamentUI.toggleTeamSelection('${team.id}')">×</span>
            </span>
        `).join('');
        
        this.startTournamentBtn.disabled = this.selectedTeamIds.length < 2;
    }
    
    startTournament() {
        if (this.selectedTeamIds.length < 2) {
            this.showNotification('Select at least 2 teams', 'error');
            return;
        }
        
        const result = window.teamTournamentSystem.startTournament(this.selectedTeamIds);
        
        if (result.success) {
            this.showNotification('Tournament started!', 'success');
            
            // Show active tournament tab
            const activeTab = document.querySelector('[data-tab="active"]');
            if (activeTab) {
                activeTab.style.display = 'block';
            }
            
            this.switchTab('active');
            this.startNextMatch();
        } else {
            this.showNotification(result.message, 'error');
        }
    }
    
    startNextMatch() {
        const tournament = window.teamTournamentSystem.activeTournament;
        if (!tournament) return;
        
        const matchIndex = tournament.currentMatchIndex;
        const result = window.teamTournamentSystem.startTeamMatch(matchIndex);
        
        if (result.success) {
            this.displayMatch();
        } else {
            this.showNotification(result.message, 'error');
        }
    }
    
    async playRound() {
        const result = await window.teamTournamentSystem.playRound();
        
        if (result.success) {
            this.displayMatch();
            
            // Check if match is complete
            if (window.teamTournamentSystem.isMatchComplete()) {
                setTimeout(() => this.completeMatch(), 2000);
            }
        } else {
            this.showNotification(result.message, 'error');
        }
    }
    
    completeMatch() {
        const result = window.teamTournamentSystem.completeMatch();
        
        if (result.success) {
            this.showMatchResult(result.result);
            
            // Check if tournament is complete
            if (window.teamTournamentSystem.isTournamentComplete()) {
                setTimeout(() => this.completeTournament(), 3000);
            } else {
                // Move to next match
                setTimeout(() => {
                    window.teamTournamentSystem.nextMatch();
                    this.startNextMatch();
                }, 3000);
            }
        }
    }
    
    completeTournament() {
        const result = window.teamTournamentSystem.completeTournament();
        
        if (result.success) {
            this.showTournamentResult(result.result);
        }
    }
    
    displayMatch() {
        const match = window.teamTournamentSystem.currentMatch;
        if (!match || !this.matchDisplay) return;
        
        const isComplete = window.teamTournamentSystem.isMatchComplete();
        
        this.matchDisplay.innerHTML = `
            <div class="team-match-display">
                <div class="match-header">
                    <h3><span data-i18n="match">Match</span> ${window.teamTournamentSystem.activeTournament.currentMatchIndex + 1}</h3>
                    <p><span data-i18n="match_round">Round</span> ${match.currentRound + 1} / ${window.teamTournamentSystem.MATCH_ROUNDS}</p>
                </div>
                
                <div class="match-teams">
                    <div class="match-team ${match.roundsWon.team1 > match.roundsWon.team2 && isComplete ? 'winner' : ''}">
                        <div class="match-team-name">${this.escapeHtml(match.team1.name)}</div>
                        <div class="match-team-score">${match.team1Score}</div>
                        <div style="color: #aaa;"><span data-i18n="rounds_won">Rounds Won</span>: ${match.roundsWon.team1}</div>
                    </div>
                    
                    <div class="match-vs"><span data-i18n="team_vs_team">vs</span></div>
                    
                    <div class="match-team ${match.roundsWon.team2 > match.roundsWon.team1 && isComplete ? 'winner' : ''}">
                        <div class="match-team-name">${this.escapeHtml(match.team2.name)}</div>
                        <div class="match-team-score">${match.team2Score}</div>
                        <div style="color: #aaa;"><span data-i18n="rounds_won">Rounds Won</span>: ${match.roundsWon.team2}</div>
                    </div>
                </div>
                
                ${match.rounds.length > 0 ? `
                    <div class="match-rounds">
                        <h4>Round History:</h4>
                        ${match.rounds.map(round => `
                            <div class="round-display">
                                <h4><span data-i18n="match_round">Round</span> ${round.roundNumber}</h4>
                                <div class="round-scores">
                                    <span class="team1">${this.escapeHtml(match.team1.name)}: ${round.team1Score}</span>
                                    <span class="team2">${this.escapeHtml(match.team2.name)}: ${round.team2Score}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${!isComplete ? `
                    <button class="team-tournament-btn success" onclick="teamTournamentUI.playRound()">
                        <span data-i18n="play_round">Play Round</span>
                    </button>
                ` : `
                    <p style="text-align: center; color: #4CAF50; font-size: 1.2em; margin-top: 20px;">
                        Match Complete! Moving to next match...
                    </p>
                `}
            </div>
        `;
        
        this.displayBracket();
        
        // Apply translations
        if (window.applyTranslations) {
            const currentLang = localStorage.getItem('tetrisLanguage') || 'en';
            window.applyTranslations(currentLang);
        }
    }
    
    displayBracket() {
        const tournament = window.teamTournamentSystem.activeTournament;
        if (!tournament || !this.bracketDisplay) return;
        
        this.bracketDisplay.innerHTML = `
            <div class="tournament-bracket">
                <h3>Tournament Bracket:</h3>
                ${tournament.bracket.map((match, idx) => `
                    <div class="bracket-match ${match.winner ? 'completed' : ''}">
                        <strong><span data-i18n="match">Match</span> ${idx + 1}</strong>
                        <div class="bracket-teams">
                            <div class="bracket-team ${match.winner === match.team1 ? 'winner' : ''}">
                                ${this.escapeHtml(match.team1.name)}
                            </div>
                            <div class="bracket-team ${match.winner === match.team2 ? 'winner' : ''}">
                                ${this.escapeHtml(match.team2.name)}
                            </div>
                        </div>
                        ${match.winner ? `<p style="color: #4CAF50; margin-top: 5px;">Winner: ${this.escapeHtml(match.winner.name)}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
        
        // Apply translations
        if (window.applyTranslations) {
            const currentLang = localStorage.getItem('tetrisLanguage') || 'en';
            window.applyTranslations(currentLang);
        }
    }
    
    showMatchResult(result) {
        if (!this.matchDisplay) return;
        
        this.matchDisplay.innerHTML = `
            <div class="team-match-display">
                <div class="match-header">
                    <h3 style="color: #4CAF50;">Match Complete!</h3>
                </div>
                
                <div class="match-teams">
                    <div class="match-team winner">
                        <div class="match-team-name">🏆 ${this.escapeHtml(result.winner.name)}</div>
                        <div class="match-team-score">${result.winnerScore}</div>
                    </div>
                    
                    <div class="match-vs"><span data-i18n="team_vs_team">vs</span></div>
                    
                    <div class="match-team">
                        <div class="match-team-name">${this.escapeHtml(result.loser.name)}</div>
                        <div class="match-team-score">${result.loserScore}</div>
                    </div>
                </div>
                
                <p style="text-align: center; color: #aaa; margin-top: 20px;">
                    Loading next match...
                </p>
            </div>
        `;
        
        // Apply translations
        if (window.applyTranslations) {
            const currentLang = localStorage.getItem('tetrisLanguage') || 'en';
            window.applyTranslations(currentLang);
        }
    }
    
    showTournamentResult(result) {
        if (!this.matchDisplay) return;
        
        this.matchDisplay.innerHTML = `
            <div class="team-match-display">
                <div class="match-header">
                    <h2 style="color: #FFD700;">🏆 <span data-i18n="tournament_winner">Tournament Winner</span>! 🏆</h2>
                    <h3 style="color: #7b68ee; margin-top: 20px;">${this.escapeHtml(result.winner.name)}</h3>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <p style="font-size: 1.2em; color: #fff;">Congratulations!</p>
                </div>
                
                <button class="team-tournament-btn" onclick="teamTournamentUI.switchTab('teams')">
                    <span data-i18n="back_to_menu">Back to Menu</span>
                </button>
            </div>
        `;
        
        // Hide active tournament tab
        const activeTab = document.querySelector('[data-tab="active"]');
        if (activeTab) {
            activeTab.style.display = 'none';
        }
        
        this.bracketDisplay.innerHTML = '';
        
        // Apply translations
        if (window.applyTranslations) {
            const currentLang = localStorage.getItem('tetrisLanguage') || 'en';
            window.applyTranslations(currentLang);
        }
    }
    
    refreshActiveTournament() {
        if (window.teamTournamentSystem.activeTournament) {
            this.displayMatch();
        } else {
            if (this.matchDisplay) {
                this.matchDisplay.innerHTML = '<p style="color: #888; text-align: center; padding: 40px;">No active tournament</p>';
            }
            if (this.bracketDisplay) {
                this.bracketDisplay.innerHTML = '';
            }
        }
    }
    
    showNotification(message, type = 'info') {
        // Simple notification - could be enhanced with a toast library
        alert(message);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize UI when DOM is ready
let teamTournamentUI;
document.addEventListener('DOMContentLoaded', () => {
    teamTournamentUI = new TeamTournamentUI();
    window.teamTournamentUI = teamTournamentUI;
});
