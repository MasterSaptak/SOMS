"use client"

import React, { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AppUpdater() {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      // 1. Clear app-specific caches (Workbox/Next.js PWA caches)
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames
            .filter(name => name.includes('workbox') || name.includes('next-pwa'))
            .map(name => caches.delete(name))
        )
      }

      // 2. Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const registration of registrations) {
          await registration.unregister()
        }
      }

      // 3. Clear local storage/session storage to force a clean slate
      localStorage.clear()
      sessionStorage.clear()

      // 4. Force reload the page from the server to get fresh assets
      window.location.href = window.location.href
    } catch (error) {
      console.error('Failed to update app:', error)
      setIsUpdating(false)
    }
  }

  // Hide in development if desired, but fine to show always for testing
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleUpdate}
      disabled={isUpdating}
      className="gap-2 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-all rounded-full h-9"
    >
      <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
      <span className="text-xs font-semibold hidden md:inline">{isUpdating ? 'Updating...' : 'Update'}</span>
    </Button>
  )
}
