# Database Assets

This folder contains SQL and serverless code to run the tournament backend in Supabase.

## Contents

- `schema.sql`: Core tables, views, and RPCs for tournaments, rounds, matches, and scores
- `migrations/2025-09-29_cumulative_scores.sql`: Adds cumulative and round-wise score views, triggers, and RPC
- `edge_functions/export_excel/`: Supabase Edge Function to export Excel reports
- Other SQL files for bracket updates and fixes

## Setup (Supabase)

1. Create a Supabase project
2. In the SQL editor, enable extensions if required (e.g., pgcrypto for `gen_random_uuid()`):

```sql
create extension if not exists pgcrypto;
```

3. Run SQL: open `schema.sql` and execute it
4. Apply migrations: execute each file in `migrations/` (ordered by date prefix)

### Edge Functions

Deploy the Excel export function:

```bash
supabase functions deploy export_excel --project-ref <your-project-ref>
```

Set required env vars for the function:

```bash
supabase secrets set \
  SUPABASE_URL=https://<your-project-ref>.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

### Usage

- Frontend calls RPCs via `src/lib/supabase.js`
- Excel export: call the Edge Function URL

```bash
curl "https://<your-project-ref>.supabase.co/functions/v1/export_excel?tournamentId=<uuid>" \
  -H "Authorization: Bearer <anon_or_service_key>"
```

### Notes

- Cumulative marks are auto-maintained by triggers on `scores`
- Round-wise and cumulative leaderboards are available via views and `get_tournament_cumulative_scores`
- The frontend remains deployable without this `database/` folder; it is only required for setting up backend


