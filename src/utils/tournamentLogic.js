/**
 * Tournament Bracket Logic
 * Handles 6-round tournament with bye system for odd participants
 */

export class TournamentBracket {
  constructor(players) {
    this.players = players;
    this.rounds = [];
    this.generateBracket();
  }

  generateBracket() {
    let currentPlayers = [...this.players];
    let roundNumber = 1;

    // Only generate the first round initially
    if (currentPlayers.length > 1) {
      const round = this.createRound(currentPlayers, roundNumber);
      this.rounds.push(round);
    }
  }

  createRound(players, roundNumber) {
    const round = {
      roundNumber,
      matches: [],
      byes: []
    };

    // Handle byes for odd number of players
    let availablePlayers = [...players];
    
    if (availablePlayers.length % 2 === 1) {
      // Top performer gets bye (first player in list is assumed to be top performer)
      const byePlayer = availablePlayers.shift();
      round.byes.push({
        player: byePlayer,
        reason: 'Top performer bye'
      });
    }

    // Create matches from remaining players
    for (let i = 0; i < availablePlayers.length; i += 2) {
      const match = {
        id: `R${roundNumber}M${Math.floor(i/2) + 1}`,
        player1: availablePlayers[i],
        player2: availablePlayers[i + 1] || null,
        winner: null,
        status: 'pending' // pending, completed, walkover
      };

      // Handle walkover if player2 doesn't show up
      if (!match.player2) {
        match.winner = match.player1;
        match.status = 'walkover';
      }

      round.matches.push(match);
    }

    return round;
  }

  getQualifiedPlayers(round) {
    const qualified = [];
    
    // Add bye players
    round.byes.forEach(bye => {
      qualified.push(bye.player);
    });

    // Add match winners
    round.matches.forEach(match => {
      if (match.winner) {
        qualified.push(match.winner);
      } else if (match.status === 'walkover' && match.player1) {
        // Walkover - player1 advances
        qualified.push(match.player1);
      }
    });

    return qualified;
  }

  simulateMatch(roundNumber, matchId, winner) {
    const round = this.rounds[roundNumber - 1];
    if (!round) return false;
    
    const match = round.matches.find(m => m.id === matchId);
    
    if (match) {
      match.winner = winner;
      match.status = 'completed';
      
      // Check if all matches in this round are completed
      const allMatchesCompleted = round.matches.every(m => m.status === 'completed' || m.status === 'walkover');
      
      if (allMatchesCompleted) {
        // Generate next round if we haven't reached the final
        this.generateNextRound(roundNumber);
      }
      
      return true;
    }
    return false;
  }

  generateNextRound(completedRoundNumber) {
    // Don't generate beyond 6 rounds
    if (completedRoundNumber >= 6) return;
    
    const completedRound = this.rounds[completedRoundNumber - 1];
    const qualifiedPlayers = this.getQualifiedPlayers(completedRound);
    
    // Need at least 2 players to create next round
    if (qualifiedPlayers.length < 2) return;
    
    const nextRoundNumber = completedRoundNumber + 1;
    
    // Remove any existing subsequent rounds
    this.rounds = this.rounds.slice(0, completedRoundNumber);
    
    // Create the next round
    const nextRound = this.createRound(qualifiedPlayers, nextRoundNumber);
    this.rounds.push(nextRound);
  }

  // Check if a round is completely finished
  isRoundComplete(roundNumber) {
    const round = this.rounds[roundNumber - 1];
    if (!round) return false;
    
    return round.matches.every(match => 
      match.status === 'completed' || match.status === 'walkover'
    );
  }

  // Get number of completed rounds
  getCompletedRounds() {
    let completedCount = 0;
    for (let i = 0; i < this.rounds.length; i++) {
      if (this.isRoundComplete(i + 1)) {
        completedCount++;
      } else {
        break;
      }
    }
    return completedCount;
  }

  getBracketStructure() {
    return {
      rounds: this.rounds,
      totalRounds: 6,
      champion: this.getChampion()
    };
  }

  getChampion() {
    if (this.rounds.length === 0) return null;
    
    const finalRound = this.rounds[this.rounds.length - 1];
    const finalMatch = finalRound.matches.find(m => m.status === 'completed');
    
    return finalMatch ? finalMatch.winner : null;
  }
}

// Helper function to generate sample players
export function generateSamplePlayers(count = 32) {
  const names = [
    'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Adams',
    'Frank Miller', 'Grace Lee', 'Henry Davis', 'Iris Chen', 'Jack Wilson',
    'Kate Thompson', 'Liam Anderson', 'Maya Patel', 'Noah Garcia', 'Olivia Martinez',
    'Paul Rodriguez', 'Quinn Taylor', 'Rachel Green', 'Sam Jackson', 'Tina Turner',
    'Ulysses Grant', 'Victoria Cross', 'Walter White', 'Xena Warrior', 'Yuki Tanaka',
    'Zoe Clarke', 'Aaron Stone', 'Bella Swan', 'Carl Jung', 'Delia Smith',
    'Eddie Murphy', 'Fiona Apple'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
    seed: i + 1,
    status: 'active'
  }));
}