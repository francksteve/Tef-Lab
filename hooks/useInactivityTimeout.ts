'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import { signOut } from 'next-auth/react'

const TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const WARNING_MS = 5 * 60 * 1000  // warn 5 minutes before sign-out (at 25 min)

export function useInactivityTimeout() {
  const [showWarning, setShowWarning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(300)

  const timeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearAll = useCallback(() => {
    if (timeoutRef.current)   clearTimeout(timeoutRef.current)
    if (warningRef.current)   clearTimeout(warningRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }, [])

  const resetTimer = useCallback(() => {
    clearAll()
    setShowWarning(false)

    // Show warning at 25 min (5 min before sign-out)
    warningRef.current = setTimeout(() => {
      setShowWarning(true)
      setRemainingSeconds(300)
      countdownRef.current = setInterval(() => {
        setRemainingSeconds((prev) => (prev <= 1 ? 0 : prev - 1))
      }, 1000)
    }, TIMEOUT_MS - WARNING_MS)

    // Auto sign-out at 30 min
    timeoutRef.current = setTimeout(() => {
      signOut({ callbackUrl: '/connexion?raison=inactivite' })
    }, TIMEOUT_MS)
  }, [clearAll])

  // Stay connected — reset the timer
  const stayConnected = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    resetTimer()
    events.forEach((e) => document.addEventListener(e, resetTimer, { passive: true }))
    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimer))
      clearAll()
    }
  }, [resetTimer, clearAll])

  return { showWarning, remainingSeconds, stayConnected }
}
