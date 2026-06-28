"use client"

import React, { createContext, useEffect, useState } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

interface DeviceContextType {
  device: DeviceType
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export const DeviceContext = createContext<DeviceContextType | undefined>(undefined)

// Breakpoints based on standard Tailwind sizes
const TABLET_BREAKPOINT = 768
const DESKTOP_BREAKPOINT = 1024

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<DeviceType>('desktop') // Default for SSR / initial render
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const handleResize = () => {
      const width = window.innerWidth
      if (width < TABLET_BREAKPOINT) {
        setDevice('mobile')
      } else if (width >= TABLET_BREAKPOINT && width < DESKTOP_BREAKPOINT) {
        setDevice('tablet')
      } else {
        setDevice('desktop')
      }
    }

    // Initial check
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // To avoid hydration mismatch, return desktop/default shape before mount or render nothing?
  // We'll render with the default 'desktop' state and it will adjust instantly on mount.
  
  const value: DeviceContextType = {
    device,
    isMobile: isClient ? device === 'mobile' : false,
    isTablet: isClient ? device === 'tablet' : false,
    isDesktop: isClient ? device === 'desktop' : true, // Default to true for SSR
  }

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  )
}
