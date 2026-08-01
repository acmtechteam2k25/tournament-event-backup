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
 * Asks for a 10-digit mobile number and verifies it belongs to one of
 * the two participants assigned to THAT specific match.
 *
 * Props:
 *  isOpen        {boolean}   — controls visibility
 *  onClose       {function}  — called on Cancel / Escape / backdrop click
 *  matchLabel    {string}    — e.g. "R1 / M4" — shown in the modal header
 *  player1Id     {string|null} — UUID of participant 1 (null = TBD)
 *  player2Id     {string|null} — UUID of participant 2 (null = TBD)
 *  redirectUrl   {string}    — match-specific redirect URL (from DB); falls back to config default
 *
 * Extensibility note:
 *  verificationMethod prop is reserved for future methods (otp, email, qr).
 *  Only 'mobile' is implemented now.
 */
const ParticipantVerificationModal = ({
  isOpen,
  onClose,
  matchLabel = 'Match',
  player1Id = null,
  player2Id = null,
  redirectUrl = null,
  verificationMethod = 'mobile', // reserved: 'otp' | 'email' | 'qr'
}) => {
  const [mobileNumber, setMobileNumber] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  // Reset state whenever the modal opens (e.g. a different match is clicked)
  useEffect(() => {
    if (isOpen) {
      setMobileNumber('')
      setError(null)
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [isOpen])

  // Close on Escape
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
      // Verify against only the two participants of this match
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

      // Verification succeeded — redirect to the match-specific URL (or global default)
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
      style={{ background: 'rgba(0, 0, 0, 0.82)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400/80 cal-sans-regular">
                Participant Access
              </span>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white/80 transition-colors text-lg leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <h2 className="text-xl font-bold text-white bodoni-moda">
              Verify Your Registration
            </h2>
            <p className="text-sm text-white/60 mt-1 cal-sans-regular">
              {matchLabel}
            </p>
          </div>

          {/* Warning if match has no real players yet */}
          {!hasBothPlayers && (
            <div className="mb-5 px-4 py-3 rounded-lg border border-amber-400/30 bg-amber-500/10 text-amber-200 text-sm cal-sans-regular">
              ⚠ One or both participants for this match are not yet determined (TBD).
              Verification will only succeed for the assigned participant(s).
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label
                htmlFor="mobile-input"
                className="block text-sm font-medium text-white/80 mb-2 cal-sans-regular"
              >
                10-digit Mobile Number
              </label>
              <input
                ref={inputRef}
                id="mobile-input"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={mobileNumber}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Enter your mobile number"
                className={`w-full px-4 py-3 rounded-lg text-white placeholder-white/30 bg-white/5 border transition-all duration-200 focus:outline-none focus:ring-0 cal-sans-regular text-base tracking-widest ${
                  error
                    ? 'border-red-400/60 focus:border-red-400'
                    : 'border-white/15 focus:border-amber-400/60 hover:border-white/25'
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

            {/* Digit count indicator */}
            <div className="flex justify-end mb-5 -mt-3">
              <span className={`text-xs cal-sans-regular ${mobileNumber.length === 10 ? 'text-amber-400' : 'text-white/30'}`}>
                {mobileNumber.length}/10
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-white/15 text-white/70 hover:bg-white/5 hover:text-white hover:border-white/25 transition-all duration-200 text-sm cal-sans-regular disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || mobileNumber.length !== 10}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm cal-sans-regular transition-all duration-200 ${
                  loading || mobileNumber.length !== 10
                    ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black transform hover:scale-[1.02] shadow-lg hover:shadow-amber-400/20'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
