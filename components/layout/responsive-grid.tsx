"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { useLayoutManager } from './layout-manager'

export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}

export function ResponsiveGrid({
  columns = { mobile: 1, tablet: 2, desktop: 4 },
  className,
  children,
  ...props
}: ResponsiveGridProps) {
  const { density, isMobile, isTablet } = useLayoutManager()
  
  // Smart Density Logic
  const gapClasses = {
    'comfortable': 'gap-4 md:gap-6',
    'compact': 'gap-3 md:gap-4',
    'ultra-compact': 'gap-2',
  }
  
  // Adaptive columns
  const cols = isMobile 
    ? columns.mobile 
    : isTablet 
      ? columns.tablet 
      : columns.desktop

  return (
    <div
      className={cn(
        "grid w-full auto-rows-[minmax(180px,auto)]",
        gapClasses[density],
        className
      )}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      {...props}
    >
      {children}
    </div>
  )
}
