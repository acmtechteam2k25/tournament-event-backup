// Configuration for tournament app
export const config = {
  // Set to true to use Supabase database
  USE_DATABASE: true,
  
  // Backward-compat single tournament ID (kept for legacy code paths)
  TOURNAMENT_ID: '550e8400-e29b-41d4-a716-446655440000',
  
  // Multiple tournaments support
  // Provide distinct IDs so data stays isolated per tournament in Supabase
  TOURNAMENTS: {
    // New tournament for 1st year (replace id with actual one when created)
    firstYear: {
      id: '11111111-1111-1111-1111-111111111111',
      name: '1st Year Tournament 2k25',
      maxParticipants: 16,
      numRounds: 4
    },
    // Current initialized tournament mapped to 2nd year
    secondYear: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: '2nd Year Tournament 2k25',
      maxParticipants: 16,
      numRounds: 4
    },
    // New tournament for 3rd year (replace with actual ID once created)
    thirdYear: {
      id: 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234',
      name: '3rd/4th Year Tournament 2k25',
      maxParticipants: 16,
      numRounds: 4
    }
  },
  DEFAULT_TOURNAMENT_KEY: 'secondYear',
  
  // Tournament details
  TOURNAMENT_NAME: 'Tournament 2k25',
  MAX_PARTICIPANTS: 64,
  NUM_ROUNDS: 6,
  
  // Tournament dates
  REGISTRATION_START: '2025-10-04T09:00:00Z',
  REGISTRATION_END: '2025-10-08T23:59:59Z',
  TOURNAMENT_START: '2025-10-09T09:00:00Z',
  TOURNAMENT_END: '2025-10-11T18:00:00Z',
  
  // Environment check
  checkEnvironment: () => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
    
    // Environment check removed for cleaner console
    
    return !!(supabaseUrl && supabaseKey)
  }
}

export default config