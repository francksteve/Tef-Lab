'use client'
import { useRef, useState } from 'react'

interface FileUploadProps {
  type: 'image' | 'audio'
  value: string
  onChange: (url: string) => void
  label: string
  required?: boolean
}

export default function FileUpload({ type, value, onChange, label, required }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const accept = type === 'image' ? 'image/*' : 'audio/*'

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const { url } = await res.json()
        onChange(url)
      } else {
        const data = await res.json().catch(() => ({}))
        setUploadError(data?.error ?? 'Erreur lors du téléchargement')
      }
    } catch {
      setUploadError('Erreur réseau lors du téléchargement')
    } finally {
      setUploading(false)
      // Reset input so same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {!required && <span className="text-gray-400 font-normal ml-1">(optionnel)</span>}
      </label>

      {/* Preview */}
      {value && type === 'image' && (
        <img
          src={value}
          alt="Aperçu"
          className="mb-2 h-28 w-auto rounded-lg border border-gray-200 object-contain bg-gray-50"
        />
      )}
      {value && type === 'audio' && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio controls src={value} className="mb-2 w-full h-9" />
      )}

      {/* URL input + upload button */}
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tef-blue min-w-0"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0"
        >
          {uploading ? '⏳ Upload…' : type === 'image' ? '🖼 Importer' : '🎵 Importer'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {uploadError && <p className="text-red-600 text-xs mt-1">{uploadError}</p>}
    </div>
  )
}
