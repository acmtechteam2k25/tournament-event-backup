# Tournament 2k25 Setup Instructions

## 📋 Quick Setup

### 1. **Run the SQL in Supabase**
- Go to your Supabase dashboard
- Navigate to SQL Editor
- Copy and paste the contents of `database/insert_single_tournament.sql`
- Execute the query

### 2. **Tournament Details**
- **Tournament ID:** `550e8400-e29b-41d4-a716-446655440000`
- **Name:** Tournament 2k25
- **Max Participants:** 64
- **Rounds:** 6 (Round 1, Round 2, Round 3, Quarter Finals, Semi Finals, Final)

### 3. **Tournament Schedule**
- **Registration Opens:** October 4, 2025 at 9:00 AM UTC
- **Registration Closes:** October 8, 2025 at 11:59 PM UTC
- **Tournament Starts:** October 9, 2025 at 9:00 AM UTC
- **Tournament Ends:** October 11, 2025 at 6:00 PM UTC

## 🎯 **How to Use**

### Admin Panel Features:
1. **Match Management** - Set winners for matches, manage scores
2. **Bracket View** - Visual bracket with real-time updates
3. **Tournament Setup** - Add participants (up to 64)
4. **Database Status** - Check connection and create tournament if needed

### Public Features:
1. **Bracket View** - Public-facing tournament bracket
2. **Real-time updates** - Bracket updates as matches are completed

## 🔧 **Configuration**

All tournament settings are centralized in `src/config/index.js`:
- Tournament ID is fixed across the entire application
- Database integration is enabled by default
- Fallback to localStorage if database is unavailable

## 🚀 **Getting Started**

1. **Admin Login** → Go to `/admin` and login
2. **Add Participants** → Use "Tournament Setup" tab to add 64 participants
3. **Manage Matches** → Use "Match Management" to set winners and scores
4. **View Progress** → Check "Bracket View" for visual representation

## 📝 **Notes**

- The tournament uses a single-elimination bracket system
- Each round progresses winners to the next round
- Final match determines the tournament champion
- All data is stored in Supabase with real-time capabilities