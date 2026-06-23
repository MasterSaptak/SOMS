"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { useLayoutManager } from './layout-manager'

export interface AdaptivePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: {
    mobile?: number | 'full'
    tablet?: number | 'full'
    desktop?: number | 'full' | 'wide' | 'tall' | 'large'
  }
}

export function AdaptivePanel({
  span = { mobile: 1, tablet: 1, desktop: 1 },
  className,
  children,
  ...props
}: AdaptivePanelProps) {
  const { isMobile, isTablet } = useLayoutManager()
  
  const currentSpan = isMobile 
    ? span.mobile 
    : isTablet 
      ? span.tablet 
      : span.desktop

  const spanClasses: Record<string | number, string> = {
    1: "col-span-1 row-span-1",
    2: "col-span-2 row-span-1",
    3: "col-span-3 row-span-1",
    4: "col-span-4 row-span-1",
    "wide": "col-span-2 row-span-1",
    "tall": "col-span-1 row-span-2",
    "large": "col-span-2 row-span-2",
    "full": "col-span-full",
  }

  return (
    <div
      className={cn(
        "flex w-full h-full",
        spanClasses[currentSpan as keyof typeof spanClasses] || "col-span-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
