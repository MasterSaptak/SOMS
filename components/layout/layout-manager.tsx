"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useDevice } from '@/hooks/use-device'

type Density = 'comfortable' | 'compact' | 'ultra-compact'

interface LayoutContextValue {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  density: Density
  setDensity: (density: Density) => void
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined)

export function LayoutManager({ children }: { children: React.ReactNode }) {
  const device = useDevice()
  const [density, setDensity] = useState<Density>('comfortable')

  // Example: Persist density to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('soms-density') as Density
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDensity(saved)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('soms-density', density)
    // Add a class to the body to globally alter spacing via CSS variables
    document.body.setAttribute('data-density', density)
  }, [density])

  return (
    <LayoutContext.Provider value={{ ...device, density, setDensity }}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayoutManager() {
  const context = useContext(LayoutContext)
  if (!context) throw new Error("useLayoutManager must be used within LayoutManager")
  return context
}
