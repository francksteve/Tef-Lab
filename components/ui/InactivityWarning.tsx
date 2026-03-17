'use client'

interface InactivityWarningProps {
  remainingSeconds: number
  onStayConnected: () => void
}

export default function InactivityWarning({ remainingSeconds, onStayConnected }: InactivityWarningProps) {
  const min = Math.floor(remainingSeconds / 60)
  const sec = remainingSeconds % 60

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">
          Session sur le point d&apos;expirer
        </h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Vous serez déconnecté automatiquement dans{' '}
          <span className="font-bold text-tef-red text-base">
            {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
          </span>{' '}
          en raison d&apos;inactivité.
        </p>
        <button
          onClick={onStayConnected}
          className="w-full py-3 bg-tef-blue text-white font-bold rounded-xl hover:bg-tef-blue-hover transition-colors text-base"
        >
          Rester connecté
        </button>
      </div>
    </div>
  )
}
