import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-black text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 z-50 shadow-md">
      <WifiOff size={14} />
      <span>You&apos;re offline — songs won&apos;t play, but your saved data is still viewable.</span>
    </div>
  )
}
