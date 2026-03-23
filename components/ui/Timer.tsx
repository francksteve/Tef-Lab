'use client'
import { useEffect, useState, useCallback } from 'react'

interface TimerProps {
  durationSeconds: number
  onTimeUp: () => void
}

export default function Timer({ durationSeconds, onTimeUp }: TimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds)

  const handleTimeUp = useCallback(() => {
    onTimeUp()
  }, [onTimeUp])

  useEffect(() => {
    if (remaining <= 0) {
      handleTimeUp()
      return
    }
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [remaining, handleTimeUp])

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0')
  const secs = (remaining % 60).toString().padStart(2, '0')
  const isUrgent = remaining > 0 && remaining <= 300

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 h-[40px] flex items-center justify-center font-bold text-base transition-colors ${
        remaining === 0
          ? 'bg-gray-600 text-white'
          : isUrgent
          ? 'bg-red-600 text-white animate-pulse'
          : 'bg-tef-blue text-white'
      }`}
    >
      ⏱️ Temps restant : {mins}:{secs}
    </div>
  )
}
