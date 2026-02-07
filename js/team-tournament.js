// Team Tournament System for Tetris
class TeamTournamentSystem {
    constructor() {
        this.STORAGE_KEY = 'tetrisTeamTournament';
        this.MIN_TEAM_SIZE = 2;
        this.MAX_TEAM_SIZE = 4;
        this.MATCH_ROUNDS = 3; // Best of 3 rounds
        
        // Team tournament state
        this.teams = [];
        this.activeTournament = null;
        this.currentMatch = null;
        this.currentRound = 0;
        this.tournamentBracket = [];
        
        // Statistics
        this.stats = {
            tournamentsPlayed: 0,
            tournamentsWon: {},
            totalMatches: 0,
            bestTeamScore: 0
        };
        
        this.loadData();
    }
    
    // Load saved data
    loadData() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                this.teams = data.teams || [];
                this.stats = data.stats || this.stats;
            }
        } catch (err) {
            console.warn('Failed to load team tournament data:', err);
        }
    }
    
    // Save data
    saveData() {
        try {
            const data = {
                teams: this.teams,
                stats: this.stats
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (err) {
            console.warn('Failed to save team tournament data:', err);
        }
    }
    
    // Create a new team
    createTeam(teamName, playerCount = 3) {
        if (playerCount < this.MIN_TEAM_SIZE || playerCount > this.MAX_TEAM_SIZE) {
            return { success: false, message: `Team size must be between ${this.MIN_TEAM_SIZE} and ${this.MAX_TEAM_SIZE}` };
        }
        
        const team = {
            id: Date.now() + Math.random(),
            name: teamName,
            players: [],
            stats: {
                matchesPlayed: 0,
                matchesWon: 0,
                totalScore: 0,
                avgScore: 0
            }
        };
        
        // Generate AI players for the team
        for (let i = 0; i < playerCount; i++) {
            team.players.push({
                id: `${team.id}-player-${i}`,
                name: `Player ${i + 1}`,
                aiType: Math.random() > 0.5 ? 'aggressive' : 'defensive',
                stats: {
                    gamesPlayed: 0,
                    totalScore: 0,
                    bestScore: 0,
                    linesCleared: 0
                }
            });
        }
        
        this.teams.push(team);
        this.saveData();
        
        return { success: true, team: team };
    }
    
    // Get all teams
    getTeams() {
        return this.teams;
    }
    
    // Delete a team
    deleteTeam(teamId) {
        const index = this.teams.findIndex(t => t.id === teamId);
        if (index !== -1) {
            this.teams.splice(index, 1);
            this.saveData();
            return { success: true };
        }
        return { success: false, message: 'Team not found' };
    }
    
    // Start a team tournament
    startTournament(teamIds) {
        if (teamIds.length < 2) {
            return { success: false, message: 'Need at least 2 teams for a tournament' };
        }
        
        const selectedTeams = teamIds.map(id => this.teams.find(t => t.id === id)).filter(t => t);
        
        if (selectedTeams.length !== teamIds.length) {
            return { success: false, message: 'Some teams not found' };
        }
        
        this.activeTournament = {
            id: Date.now(),
            teams: selectedTeams,
            startTime: Date.now(),
            bracket: this.generateBracket(selectedTeams),
            currentMatchIndex: 0,
            winners: []
        };
        
        this.stats.tournamentsPlayed++;
        this.saveData();
        
        return { success: true, tournament: this.activeTournament };
    }
    
    // Generate tournament bracket
    generateBracket(teams) {
        const bracket = [];
        const shuffled = [...teams].sort(() => Math.random() - 0.5);
        
        // Create matches (round-robin or elimination)
        for (let i = 0; i < shuffled.length; i += 2) {
            if (i + 1 < shuffled.length) {
                bracket.push({
                    team1: shuffled[i],
                    team2: shuffled[i + 1],
                    winner: null,
                    rounds: []
                });
            }
        }
        
        return bracket;
    }
    
    // Start a team match
    startTeamMatch(matchIndex) {
        if (!this.activeTournament) {
            return { success: false, message: 'No active tournament' };
        }
        
        const match = this.activeTournament.bracket[matchIndex];
        if (!match) {
            return { success: false, message: 'Invalid match index' };
        }
        
        this.currentMatch = {
            ...match,
            team1Score: 0,
            team2Score: 0,
            currentRound: 0,
            roundsWon: { team1: 0, team2: 0 }
        };
        
        this.currentRound = 0;
        
        return { success: true, match: this.currentMatch };
    }
    
    // Play a round (all players from both teams play)
    async playRound(gameEngine) {
        if (!this.currentMatch) {
            return { success: false, message: 'No active match' };
        }
        
        const team1 = this.currentMatch.team1;
        const team2 = this.currentMatch.team2;
        
        // Simulate all players playing
        let team1RoundScore = 0;
        let team2RoundScore = 0;
        
        // Team 1 players
        for (const player of team1.players) {
            const result = await this.simulatePlayerGame(player, gameEngine);
            team1RoundScore += result.score;
            player.stats.gamesPlayed++;
            player.stats.totalScore += result.score;
            player.stats.linesCleared += result.lines;
            if (result.score > player.stats.bestScore) {
                player.stats.bestScore = result.score;
            }
        }
        
        // Team 2 players
        for (const player of team2.players) {
            const result = await this.simulatePlayerGame(player, gameEngine);
            team2RoundScore += result.score;
            player.stats.gamesPlayed++;
            player.stats.totalScore += result.score;
            player.stats.linesCleared += result.lines;
            if (result.score > player.stats.bestScore) {
                player.stats.bestScore = result.score;
            }
        }
        
        // Update match scores
        this.currentMatch.team1Score += team1RoundScore;
        this.currentMatch.team2Score += team2RoundScore;
        
        // Determine round winner
        if (team1RoundScore > team2RoundScore) {
            this.currentMatch.roundsWon.team1++;
        } else {
            this.currentMatch.roundsWon.team2++;
        }
        
        this.currentMatch.rounds.push({
            roundNumber: this.currentRound + 1,
            team1Score: team1RoundScore,
            team2Score: team2RoundScore,
            winner: team1RoundScore > team2RoundScore ? 'team1' : 'team2'
        });
        
        this.currentRound++;
        
        return {
            success: true,
            roundNumber: this.currentRound,
            team1RoundScore,
            team2RoundScore,
            team1TotalScore: this.currentMatch.team1Score,
            team2TotalScore: this.currentMatch.team2Score
        };
    }
    
    // Simulate a single player game (simplified)
    async simulatePlayerGame(player, gameEngine) {
        // This is a simplified simulation
        // In real implementation, this would integrate with the actual game engine
        const baseScore = Math.floor(Math.random() * 3000) + 500;
        const aiBonus = player.aiType === 'aggressive' ? 1.2 : 1.0;
        const score = Math.floor(baseScore * aiBonus);
        const lines = Math.floor(score / 100);
        
        return {
            score,
            lines,
            level: Math.floor(lines / 10) + 1
        };
    }
    
    // Check if match is complete
    isMatchComplete() {
        if (!this.currentMatch) return false;
        
        // Best of 3: first to win 2 rounds
        return this.currentMatch.roundsWon.team1 >= 2 || 
               this.currentMatch.roundsWon.team2 >= 2 ||
               this.currentRound >= this.MATCH_ROUNDS;
    }
    
    // Get match winner
    getMatchWinner() {
        if (!this.currentMatch) return null;
        
        if (this.currentMatch.roundsWon.team1 > this.currentMatch.roundsWon.team2) {
            return {
                winner: this.currentMatch.team1,
                loser: this.currentMatch.team2,
                winnerScore: this.currentMatch.team1Score,
                loserScore: this.currentMatch.team2Score
            };
        } else if (this.currentMatch.roundsWon.team2 > this.currentMatch.roundsWon.team1) {
            return {
                winner: this.currentMatch.team2,
                loser: this.currentMatch.team1,
                winnerScore: this.currentMatch.team2Score,
                loserScore: this.currentMatch.team1Score
            };
        } else {
            // Tie - use total score
            if (this.currentMatch.team1Score > this.currentMatch.team2Score) {
                return {
                    winner: this.currentMatch.team1,
                    loser: this.currentMatch.team2,
                    winnerScore: this.currentMatch.team1Score,
                    loserScore: this.currentMatch.team2Score
                };
            } else {
                return {
                    winner: this.currentMatch.team2,
                    loser: this.currentMatch.team1,
                    winnerScore: this.currentMatch.team2Score,
                    loserScore: this.currentMatch.team1Score
                };
            }
        }
    }
    
    // Complete current match
    completeMatch() {
        if (!this.currentMatch || !this.activeTournament) {
            return { success: false, message: 'No active match' };
        }
        
        const result = this.getMatchWinner();
        
        // Update team stats
        result.winner.stats.matchesPlayed++;
        result.winner.stats.matchesWon++;
        result.winner.stats.totalScore += result.winnerScore;
        result.winner.stats.avgScore = Math.floor(
            result.winner.stats.totalScore / result.winner.stats.matchesPlayed
        );
        
        result.loser.stats.matchesPlayed++;
        result.loser.stats.totalScore += result.loserScore;
        result.loser.stats.avgScore = Math.floor(
            result.loser.stats.totalScore / result.loser.stats.matchesPlayed
        );
        
        // Update tournament bracket
        const matchIndex = this.activeTournament.currentMatchIndex;
        this.activeTournament.bracket[matchIndex].winner = result.winner;
        this.activeTournament.winners.push(result.winner);
        
        this.stats.totalMatches++;
        
        if (result.winnerScore > this.stats.bestTeamScore) {
            this.stats.bestTeamScore = result.winnerScore;
        }
        
        this.saveData();
        
        const matchComplete = {
            ...result,
            matchData: this.currentMatch
        };
        
        this.currentMatch = null;
        
        return { success: true, result: matchComplete };
    }
    
    // Check if tournament is complete
    isTournamentComplete() {
        if (!this.activeTournament) return false;
        return this.activeTournament.currentMatchIndex >= this.activeTournament.bracket.length;
    }
    
    // Get tournament winner
    getTournamentWinner() {
        if (!this.activeTournament || !this.isTournamentComplete()) {
            return null;
        }
        
        const winners = this.activeTournament.winners;
        if (winners.length === 0) return null;
        
        // For now, return the last winner (in elimination, this would be the final winner)
        return winners[winners.length - 1];
    }
    
    // Complete tournament
    completeTournament() {
        if (!this.activeTournament) {
            return { success: false, message: 'No active tournament' };
        }
        
        const winner = this.getTournamentWinner();
        
        if (winner) {
            if (!this.stats.tournamentsWon[winner.id]) {
                this.stats.tournamentsWon[winner.id] = 0;
            }
            this.stats.tournamentsWon[winner.id]++;
        }
        
        const tournamentResult = {
            winner: winner,
            bracket: this.activeTournament.bracket,
            allWinners: this.activeTournament.winners
        };
        
        this.activeTournament = null;
        this.saveData();
        
        return { success: true, result: tournamentResult };
    }
    
    // Advance to next match
    nextMatch() {
        if (!this.activeTournament) {
            return { success: false, message: 'No active tournament' };
        }
        
        this.activeTournament.currentMatchIndex++;
        
        if (this.isTournamentComplete()) {
            return this.completeTournament();
        }
        
        return this.startTeamMatch(this.activeTournament.currentMatchIndex);
    }
}

// Initialize global team tournament system
window.teamTournamentSystem = new TeamTournamentSystem();
