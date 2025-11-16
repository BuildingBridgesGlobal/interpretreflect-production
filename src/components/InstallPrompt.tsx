'use client'

import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible && !isIOS) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-brand-gray-200 rounded-data shadow-card p-4 w-80">
        <div className="text-sm font-sans font-bold text-brand-primary mb-1">Works great on mobile</div>
        <div className="text-sm text-brand-gray-600 font-body mb-3">Install the app for quick access.</div>
        {deferredPrompt && (
          <button
            onClick={async () => {
              deferredPrompt.prompt()
              const r = await deferredPrompt.userChoice
              setVisible(false)
              setDeferredPrompt(null)
            }}
            className="w-full bg-brand-electric text-white rounded-data px-3 py-2 font-sans"
          >
            Install App
          </button>
        )}
        {!deferredPrompt && isIOS && (
          <div className="text-xs text-brand-gray-500 font-body">Tap Share → Add to Home Screen</div>
        )}
        <button
          onClick={() => setVisible(false)}
          className="mt-3 w-full border border-brand-gray-300 rounded-data px-3 py-2 text-brand-gray-700 font-sans"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
