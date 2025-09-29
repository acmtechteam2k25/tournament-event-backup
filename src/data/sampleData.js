// Sample tournament data - temporary database
export const generateSamplePlayers = (count) => {
  const names = [
    'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Adams',
    'Frank Miller', 'Grace Lee', 'Henry Wilson', 'Ivy Chen', 'Jack Davis',
    'Kate Morgan', 'Liam Garcia', 'Maya Patel', 'Noah Thompson', 'Olivia Clark',
    'Paul Martinez', 'Quinn Taylor', 'Ruby Anderson', 'Sam Williams', 'Tina Rodriguez',
    'Uma Sharma', 'Victor Kim', 'Wendy Liu', 'Xavier Moore', 'Yara Hassan',
    'Zoe Jackson', 'Aaron Foster', 'Bella Cooper', 'Chris Turner', 'Dani Brooks',
    'Ethan Parker', 'Fiona Murphy', 'Gabe Stone', 'Holly West', 'Ian Cross',
    'Jess Reed', 'Kyle Hunt', 'Luna Bell', 'Max Ford', 'Nina Cole',
    'Oscar Lane', 'Piper Gray', 'Quinn Nash', 'Rosa Pike', 'Seth Ward',
    'Tara Vale', 'Umar Shah', 'Vera King', 'Wade Beck', 'Xara Moon',
    'Yale Ross', 'Zara Blue', 'Alex Green', 'Beth Rose', 'Carl Stone',
    'Drew Lane', 'Elle Moon', 'Finn Ward', 'Gina Cole', 'Hugo Nash',
    'Iris Pike', 'Jade Bell', 'Kris Ford', 'Lara Gray', 'Milo Hunt',
    'Nora Vale', 'Owen Hart', 'Pam Cross', 'Quin Bell', 'Rex Cole',
    'Sara Lane', 'Troy Nash', 'Ursa Pike', 
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
    seed: i + 1
  }));
};

// Generate tournament matches exactly like g-loot simpleBracket
export const generateTournamentMatches = (players) => {
  const matches = [];
  
  let matchId = 1;
  
  // Round 1: 32 matches
  for (let i = 1; i <= 32; i++) {
    const player1Index = (i - 1) * 2;
    const player2Index = (i - 1) * 2 + 1;
    
    const match = {
      id: matchId++,
      name: `Round 1 - Match ${i}`,
      nextMatchId: 32 + Math.ceil(i / 2), // Points to Round 2 matches (33-48)
      nextLooserMatchId: null,
      tournamentRoundText: '1',
      startTime: '2024-01-01',
      state: 'SCHEDULED',
      participants: []
    };
    
    // Add participants if available
    if (player1Index < players.length) {
      match.participants.push({
        id: players[player1Index].id,
        name: `(${players[player1Index].seed}) ${players[player1Index].name}`,
        resultText: null,
        isWinner: false,
        status: 'SCHEDULED',
        seed: players[player1Index].seed
      });
    }
    
    if (player2Index < players.length) {
      match.participants.push({
        id: players[player2Index].id,
        name: `(${players[player2Index].seed}) ${players[player2Index].name}`,
        resultText: null,
        isWinner: false,
        status: 'SCHEDULED',
        seed: players[player2Index].seed
      });
    }
    
    matches.push(match);
  }
  
  // Round 2: 16 matches (IDs 33-48)
  for (let i = 1; i <= 16; i++) {
    const match = {
      id: matchId++,
      name: `Round 2 - Match ${i}`,
      nextMatchId: 48 + Math.ceil(i / 2), // Points to Round 3 matches (49-56)
      nextLooserMatchId: null,
      tournamentRoundText: '2',
      startTime: '2024-01-01',
      state: 'SCHEDULED',
      participants: []
    };
    matches.push(match);
  }
  
  // Round 3: 8 matches (IDs 49-56)
  for (let i = 1; i <= 8; i++) {
    const match = {
      id: matchId++,
      name: `Quarter Final - Match ${i}`,
      nextMatchId: 56 + Math.ceil(i / 2), // Points to Round 4 matches (57-60)
      nextLooserMatchId: null,
      tournamentRoundText: '3',
      startTime: '2024-01-01',
      state: 'SCHEDULED',
      participants: []
    };
    matches.push(match);
  }
  
  // Round 4: 4 matches (IDs 57-60)
  for (let i = 1; i <= 4; i++) {
    const match = {
      id: matchId++,
      name: `Semi Final - Match ${i}`,
      nextMatchId: 60 + Math.ceil(i / 2), // Points to Round 5 matches (61-62)
      nextLooserMatchId: null,
      tournamentRoundText: '4',
      startTime: '2024-01-01',
      state: 'SCHEDULED',
      participants: []
    };
    matches.push(match);
  }
  
  // Round 5: 2 matches (IDs 61-62)
  for (let i = 1; i <= 2; i++) {
    const match = {
      id: matchId++,
      name: `Final Semi - Match ${i}`,
      nextMatchId: 63, // Points to Final (63)
      nextLooserMatchId: null,
      tournamentRoundText: '5',
      startTime: '2024-01-01',
      state: 'SCHEDULED',
      participants: []
    };
    matches.push(match);
  }
  
  // Round 6: Final (ID 63)
  const finalMatch = {
    id: 63,
    name: 'Final',
    nextMatchId: null,
    nextLooserMatchId: null,
    tournamentRoundText: '6',
    startTime: '2024-01-01',
    state: 'SCHEDULED',
    participants: []
  };
  matches.push(finalMatch);
  
  return matches;
};