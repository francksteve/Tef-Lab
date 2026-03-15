'use client'
import { useRef, useState, useCallback } from 'react'

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void
  maxDurationSeconds: number
  label?: string
}

type RecorderState = 'idle' | 'recording' | 'done'

export default function AudioRecorder({
  onRecordingComplete,
  maxDurationSeconds,
  label = "Démarrer l'enregistrement",
}: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [state, setState] = useState<RecorderState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop()
    setState('done')
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        onRecordingComplete(blob)
        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start(1000)
      setState('recording')
      setElapsed(0)

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1
          if (next >= maxDurationSeconds) {
            stopRecording()
            return maxDurationSeconds
          }
          return next
        })
      }, 1000)
    } catch {
      alert("Impossible d'accéder au microphone. Vérifiez les permissions de votre navigateur.")
    }
  }, [onRecordingComplete, maxDurationSeconds, stopRecording])

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="flex flex-col items-center gap-4">
      {state === 'recording' && (
        <div className="flex items-center gap-3 text-red-600 font-semibold">
          <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          <span>
            Enregistrement en cours : {fmt(elapsed)} / {fmt(maxDurationSeconds)}
          </span>
        </div>
      )}

      {state === 'idle' && (
        <button
          onClick={startRecording}
          className="px-6 py-3 bg-tef-blue text-white rounded-lg font-semibold hover:bg-tef-blue-hover transition-colors"
        >
          🎤 {label}
        </button>
      )}

      {state === 'recording' && (
        <button
          onClick={stopRecording}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          ⏹ Terminer l’enregistrement
        </button>
      )}

      {state === 'done' && audioUrl && (
        <div className="w-full space-y-2">
          <p className="text-green-600 font-semibold text-center">✅ Enregistrement terminé ({fmt(elapsed)})</p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
    </div>
  )
}
