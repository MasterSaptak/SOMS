"use client"

import { useState, useEffect } from 'react'

export function useNetwork() {
  const [isOnline, setIsOnline] = useState<boolean>(true)

  useEffect(() => {
    // Set initial state
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, isOffline: !isOnline }
}
