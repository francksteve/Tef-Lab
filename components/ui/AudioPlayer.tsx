'use client'
import { useRef, useState, useEffect } from 'react'

interface AudioPlayerProps {
  src: string
  label?: string
  autoPlay?: boolean
  initialPlayed?: boolean
  onPlayed?: () => void
}

export default function AudioPlayer({
  src,
  label = 'Écouter le document audio',
  autoPlay = false,
  initialPlayed = false,
  onPlayed,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [played, setPlayed] = useState(initialPlayed)
  const [playing, setPlaying] = useState(false)

  // Autoplay on mount when the group is first visited and audio not yet played
  useEffect(() => {
    if (autoPlay && !initialPlayed && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Autoplay blocked by browser — user can still click manually
        setPlaying(false)
      })
      setPlaying(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // runs once on mount — captures initial autoPlay/initialPlayed values

  const handlePlay = () => {
    if (played) return
    audioRef.current?.play()
    setPlaying(true)
  }

  const handleEnded = () => {
    setPlayed(true)
    setPlaying(false)
    onPlayed?.()
  }

  return (
    <div className="flex flex-col items-center gap-2 my-2">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={src} onEnded={handleEnded} />
      <button
        onClick={handlePlay}
        disabled={played}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
          played
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : playing
            ? 'bg-orange-500 text-white cursor-default'
            : 'bg-tef-blue text-white hover:bg-tef-blue-hover'
        }`}
      >
        {played
          ? '🔇 Audio déjà écouté'
          : playing
          ? '🔊 En cours de lecture…'
          : `▶ ${label}`}
      </button>
      {played && (
        <p className="text-sm text-gray-500 italic">
          Cet audio ne peut être écouté qu&apos;une seule fois.
        </p>
      )}
    </div>
  )
}
