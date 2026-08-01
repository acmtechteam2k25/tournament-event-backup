/**
 * Participant Verification Helpers
 *
 * Extensible helpers for verifying tournament participants before granting access.
 * Currently implements mobile number verification.
 * Future methods (OTP, email, QR) can be added here without changing call sites.
 */

import { supabase } from '../lib/supabase'
import { config } from '../config'

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate that a mobile number is exactly 10 digits.
 * @param {string} mobile
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateMobileNumber(mobile) {
  if (!mobile || typeof mobile !== 'string') {
    return { valid: false, error: 'Please enter a mobile number.' }
  }
  const trimmed = mobile.trim()
  if (!/^\d{10}$/.test(trimmed)) {
    return { valid: false, error: 'Mobile number must be exactly 10 digits.' }
  }
  return { valid: true, error: null }
}

// ─── Match-scoped verification (primary) ─────────────────────────────────────

/**
 * Verify a mobile number against the two specific participants assigned to a match.
 * ONLY checks whether the number belongs to player1 or player2 of that match.
 * Cross-match and cross-tournament lookups are blocked by design.
 *
 * @param {string} mobileNumber   - 10-digit mobile number entered by the user
 * @param {string|null} player1Id - UUID of participant 1 in the match (may be null for TBD)
 * @param {string|null} player2Id - UUID of participant 2 in the match (may be null for TBD)
 * @returns {Promise<{ found: boolean, participant: object|null, error: string|null }>}
 */
export async function verifyParticipantByMobileForMatch(mobileNumber, player1Id, player2Id) {
  // Collect only real (non-null) participant IDs
  const validIds = [player1Id, player2Id].filter(Boolean)

  if (validIds.length === 0) {
    return {
      found: false,
      participant: null,
      error: 'No participants assigned to this match yet.'
    }
  }

  try {
    const { data, error } = await supabase
      .from('participants')
      .select('id, name, roll_number, tournament_id')
      .in('id', validIds)
      .eq('mobile_number', mobileNumber.trim())
      .limit(1)

    if (error) {
      return { found: false, participant: null, error: 'Verification failed. Please try again.' }
    }

    if (!data || data.length === 0) {
      return {
        found: false,
        participant: null,
        error: 'Mobile number not registered for this match.'
      }
    }

    return { found: true, participant: data[0], error: null }
  } catch (err) {
    return { found: false, participant: null, error: 'Verification failed. Please try again.' }
  }
}

// ─── Tournament-scoped verification (kept for backward-compat) ───────────────

/**
 * Check whether a mobile number belongs to any participant in the given tournament.
 * Searches ONLY within the specified tournament.
 * Prefer verifyParticipantByMobileForMatch for match-level gating.
 *
 * @param {string} mobileNumber
 * @param {string} tournamentId
 * @returns {Promise<{ found: boolean, participant: object|null, error: string|null }>}
 */
export async function verifyParticipantByMobile(mobileNumber, tournamentId) {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('id, name, roll_number, tournament_id')
      .eq('tournament_id', tournamentId)
      .eq('mobile_number', mobileNumber.trim())
      .limit(1)

    if (error) {
      return { found: false, participant: null, error: 'Verification failed. Please try again.' }
    }

    if (!data || data.length === 0) {
      return {
        found: false,
        participant: null,
        error: 'Mobile number not registered for this tournament.'
      }
    }

    return { found: true, participant: data[0], error: null }
  } catch (err) {
    return { found: false, participant: null, error: 'Verification failed. Please try again.' }
  }
}

// ─── Redirect ─────────────────────────────────────────────────────────────────

/**
 * Redirect the participant to the given URL (or the global default from config).
 * Opens in the same tab so the participant lands on the problem/resource.
 *
 * @param {string} [url] - specific URL (e.g. match.redirectUrl); falls back to config default
 */
export function redirectParticipant(url) {
  const destination = url || config.PARTICIPANT_REDIRECT_URL
  window.location.href = destination
}
