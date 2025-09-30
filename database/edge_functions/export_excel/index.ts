// Supabase Edge Function: export_excel
// Outputs an Excel workbook with one sheet per round and a summary sheet

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type RoundBreakdown = {
  round_number: number
  round_points: number
  matches_played: number
}

type PlayerRow = {
  player_id: string
  player_name: string
  roll_number: string
  total_points: number
  wins: number
  losses: number
  round_breakdown: RoundBreakdown[]
}

// Minimal XLSX writer using SheetJS lite CDN build
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs'

function withCors(body: BodyInit | null, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      ...extraHeaders,
    },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return withCors(null, 200)
  }
  try {
    const url = new URL(req.url)
    const tournamentId = url.searchParams.get('tournamentId')
    if (!tournamentId) {
      return withCors(JSON.stringify({ error: 'Missing tournamentId' }), 400, { 'Content-Type': 'application/json' })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return withCors(JSON.stringify({ error: 'Server configuration missing' }), 500, { 'Content-Type': 'application/json' })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { data, error } = await supabase.rpc('get_tournament_cumulative_scores', {
      p_tournament_id: tournamentId
    })
    if (error) throw error

    const rows = (data || []) as PlayerRow[]

    const wb = XLSX.utils.book_new()

    // Summary sheet
    const summaryData = [
      ['Roll No', 'Name', 'Total Points', 'Wins', 'Losses']
    ]
    for (const r of rows) {
      summaryData.push([r.roll_number, r.player_name, r.total_points, r.wins, r.losses])
    }
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

    // Per-round sheets (optional)
    const maxRound = Math.max(0, ...rows.flatMap(r => r.round_breakdown?.map(b => b.round_number) || []))
    for (let round = 1; round <= maxRound; round++) {
      const sheetData = [['Roll No', 'Name', 'Round Points', 'Matches Played']]
      for (const r of rows) {
        const rb = r.round_breakdown?.find(b => b.round_number === round)
        sheetData.push([
          r.roll_number,
          r.player_name,
          rb?.round_points ?? 0,
          rb?.matches_played ?? 0
        ])
      }
      const ws = XLSX.utils.aoa_to_sheet(sheetData)
      XLSX.utils.book_append_sheet(wb, ws, `Round ${round}`)
    }

    const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
    const filename = `tournament_${tournamentId}_report.xlsx`

    return withCors(out, 200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`
    })

  } catch (err) {
    return withCors(JSON.stringify({ error: String(err?.message || err) }), 500, { 'Content-Type': 'application/json' })
  }
})


