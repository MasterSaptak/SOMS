import { useState, useEffect } from 'react'
import { useMediaQuery } from './use-media-query'
import { breakpoints } from '@/lib/theme'

export function useDevice() {
  const [mounted, setMounted] = useState(false)
  
  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.lg})`)
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.md}) and (max-width: calc(${breakpoints.lg} - 1px))`)
  const isMobile = useMediaQuery(`(max-width: calc(${breakpoints.md} - 1px))`)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Default to desktop for SSR to avoid hydration mismatch
  if (!mounted) {
    return { isMobile: false, isTablet: false, isDesktop: true }
  }

  return { isMobile, isTablet, isDesktop }
}
