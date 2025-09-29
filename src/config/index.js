// Configuration for tournament app
export const config = {
  // Set to true to use Supabase database
  USE_DATABASE: true,
  
  // Tournament 2k25 - Single tournament ID for entire application
  TOURNAMENT_ID: '550e8400-e29b-41d4-a716-446655440000',
  
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