'use client'

interface WordCounterProps {
  text: string
  minimum: number
}

export function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

export default function WordCounter({ text, minimum }: WordCounterProps) {
  const count = countWords(text)
  const reached = count >= minimum
  const remaining = minimum - count

  return (
    <div className={`flex items-center gap-2 text-sm font-medium mt-1 ${reached ? 'text-green-600' : 'text-red-500'}`}>
      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${reached ? 'bg-green-100' : 'bg-red-100'}`}>
        {reached ? '✓' : '!'}
      </span>
      <span>
        {count} mot{count !== 1 ? 's' : ''} / minimum {minimum}
        {!reached && ` — encore ${remaining} mot${remaining !== 1 ? 's' : ''}`}
      </span>
    </div>
  )
}
