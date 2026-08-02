import React, { useState, useEffect, useRef } from 'react'
import {
  validateMobileNumber,
  verifyParticipantByMobileForMatch,
  redirectParticipant
} from '../utils/verificationHelpers'

/**
 * ParticipantVerificationModal
 *
 * Shown when a public user clicks a match card in the bracket view.
 * Verifies the mobile number belongs to one of the two participants
 * assigned to THAT specific match — no tournament-wide lookup.
 *
 * Props:
 *  isOpen          {boolean}      — controls visibility
 *  onClose         {function}     — called on Cancel / Escape / backdrop click
 *  matchLabel      {string}       — e.g. "Round 1 — Match 4"
 *  player1Id       {string|null}  — UUID of participant 1 (null = TBD)
 *  player2Id       {string|null}  — UUID of participant 2 (null = TBD)
 *  redirectUrl     {string|null}  — match-specific redirect URL from DB
 *  verificationMethod {string}    — reserved for future: 'otp' | 'email' | 'qr'
 */
const ParticipantVerificationModal = ({
  isOpen,
  onClose,
  matchLabel = 'Match',
  player1Id = null,
  player2Id = null,
  redirectUrl = null,
  verificationMethod = 'mobile',
}) => {
  const [mobileNumber, setMobileNumber] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  // Reset whenever modal opens for a new match
  useEffect(() => {
    if (isOpen) {
      setMobileNumber('')
      setError(null)
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setMobileNumber(val)
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { valid, error: validationError } = validateMobileNumber(mobileNumber)
    if (!valid) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Verify ONLY against the two participants of this specific match
      const { found, error: lookupError } = await verifyParticipantByMobileForMatch(
        mobileNumber,
        player1Id,
        player2Id
      )

      if (!found) {
        setError(lookupError || 'Mobile number not registered for this match.')
        setLoading(false)
        return
      }

      // Redirect to this match's own URL (falls back to config default)
      redirectParticipant(redirectUrl)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const hasBothPlayers = player1Id && player2Id

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-md bg-black/60 backdrop-blur-xl border border-[#0d9c57]/30 rounded-2xl shadow-2xl overflow-hidden">

        {/* Top accent bar — green, matching site theme */}
        <div className="h-0.5 w-full bg-gradient-to-r from-[#024028] via-[#0d9c57] to-[#024028]" />

        <div className="p-6 sm:p-8">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="tektur-title text-xs font-semibold uppercase tracking-widest text-[#0d9c57]">
                Participant Access
              </span>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white transition-colors text-lg leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <h2 className="tektur-title text-xl font-bold text-white mt-2">
              Verify Your Registration
            </h2>
            <p className="cal-sans-regular text-sm text-white/60 mt-1">
              {matchLabel}
            </p>
          </div>

          {/* Warning when one or both players are TBD */}
          {!hasBothPlayers && (
            <div className="mb-5 px-4 py-3 rounded-lg border border-[#0d9c57]/30 bg-[#024028]/40 text-white/80 text-sm cal-sans-regular">
              ⚠ One or both participants for this match are not yet determined (TBD).
              Verification will only succeed for the assigned participant(s).
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label
                htmlFor="modal-mobile-input"
                className="block text-sm font-medium text-white/80 mb-2 cal-sans-regular"
              >
                10-digit Mobile Number
              </label>
              <input
                ref={inputRef}
                id="modal-mobile-input"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={mobileNumber}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Enter your mobile number"
                className={`w-full px-4 py-3 rounded-lg text-white placeholder-white/30 bg-white/5 border transition-all duration-200 focus:outline-none focus:ring-1 cal-sans-regular text-base tracking-widest ${
                  error
                    ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-white/15 focus:border-[#0d9c57] focus:ring-[#0d9c57]/20 hover:border-[#0d9c57]/40'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                autoComplete="tel"
              />
              {error && (
                <p className="mt-2 text-sm text-red-400 cal-sans-regular flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">⚠</span>
                  <span>{error}</span>
                </p>
              )}
            </div>

            {/* Digit counter */}
            <div className="flex justify-end mb-5 -mt-3">
              <span
                className={`text-xs cal-sans-regular ${
                  mobileNumber.length === 10 ? 'text-[#0d9c57]' : 'text-white/30'
                }`}
              >
                {mobileNumber.length}/10
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {/* Cancel */}
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-white/15 text-white/70 hover:bg-white/5 hover:text-white hover:border-white/30 transition-all duration-200 text-sm cal-sans-regular disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              {/* Continue — matches "Join the Arena" / "Register Soon" button style */}
              <button
                type="submit"
                disabled={loading || mobileNumber.length !== 10}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm cal-sans-regular transition-all duration-300 ${
                  loading || mobileNumber.length !== 10
                    ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                    : 'border-[#0d9c57] bg-gradient-to-r from-[#024028] to-[#0d9c57] text-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(13,156,87,0.45)]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    {/* Spinner uses green border — matches site theme */}
                    <span className="inline-block w-4 h-4 border-2 border-[#0d9c57]/30 border-t-[#0d9c57] rounded-full animate-spin" />
                    Verifying…
                  </span>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ParticipantVerificationModal
