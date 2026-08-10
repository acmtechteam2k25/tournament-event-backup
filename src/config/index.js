// Configuration for tournament app
export const config = {
  // Set to true to use Supabase database
  USE_DATABASE: true,

  // Backward-compat single tournament ID (kept for legacy code paths)
  TOURNAMENT_ID: '550e8400-e29b-41d4-a716-446655440000',

  // Multiple tournaments support
  // Provide distinct IDs so data stays isolated per tournament in Supabase
  TOURNAMENTS: {
    // 2nd Year tournament
    secondYear: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: '2nd Year Tournament 2k25',
      maxParticipants: 16,
      numRounds: 4
    },
    // 3rd Year tournament
    thirdYear: {
      id: 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234',
      name: '3rd Year Tournament 2k25',
      maxParticipants: 8,
      numRounds: 3
    }
  },
  DEFAULT_TOURNAMENT_KEY: 'secondYear',

  // Tournament details (global fallbacks)
  TOURNAMENT_NAME: 'Tournament 2k25',
  MAX_PARTICIPANTS: 16,
  NUM_ROUNDS: 4,

  // Tournament dates
  REGISTRATION_START: '2025-10-04T09:00:00Z',
  REGISTRATION_END: '2025-10-08T23:59:59Z',
  TOURNAMENT_START: '2025-10-09T09:00:00Z',
  TOURNAMENT_END: '2025-10-11T18:00:00Z',

  // Redirect URL after successful participant verification
  // Change this single value to update the redirect destination everywhere
  PARTICIPANT_REDIRECT_URL: 'https://vnrvjiet.acm.org',

  // Environment check
  checkEnvironment: () => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
    return !!(supabaseUrl && supabaseKey)
  }
}

export default config
