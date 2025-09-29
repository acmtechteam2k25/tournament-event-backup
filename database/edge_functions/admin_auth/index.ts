// Supabase Edge Function: admin_auth
// POST JSON body { username, password }, no query params
// Compares against secrets ADMIN_USERNAME and ADMIN_PASSWORD

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

type LoginBody = {
  username?: string
  password?: string
}

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      ...extraHeaders,
    },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return json({}, 200)
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const { username, password } = (await req.json()) as LoginBody
    if (!username || !password) {
      return json({ error: 'Missing credentials' }, 400)
    }

    const ADMIN_USERNAME = Deno.env.get('ADMIN_USERNAME')
    const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD')

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      return json({ error: 'Server not configured' }, 500)
    }

    const valid = username === ADMIN_USERNAME && password === ADMIN_PASSWORD
    if (!valid) {
      return json({ success: false, error: 'Invalid credentials' }, 401)
    }

    // Keep payload minimal; frontend stores session locally
    return json({ success: true, role: 'admin', username: ADMIN_USERNAME })
  } catch (err) {
    return json({ error: String(err?.message || err) }, 500)
  }
})


