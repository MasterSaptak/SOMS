"use client"

import React, { useEffect } from 'react'
import { useLayoutManager } from './layout-manager'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { SidebarContext } from '@/components/ui/sidebar'

export function NavigationSystem() {
  const { isMobile, isTablet } = useLayoutManager()
  const { setCollapsed } = React.useContext(SidebarContext)

  // Auto-collapse sidebar on tablet
  useEffect(() => {
    if (isTablet) {
      setCollapsed(true)
    } else if (!isMobile && !isTablet) {
      setCollapsed(false)
    }
  }, [isTablet, isMobile, setCollapsed])

  return (
    <>
      {/* Desktop & Tablet: sidebar visible */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      {/* Mobile: bottom navigation + sidebar available via sheet */}
      {isMobile && <MobileBottomNav />}
    </>
  )
}
