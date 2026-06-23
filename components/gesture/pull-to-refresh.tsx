"use client"

import React, { useState, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  className?: string
}

export function PullToRefresh({ children, onRefresh, className }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(-1)
  const currentY = useRef(0)
  
  const threshold = 80
  const maxPull = 120

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull-to-refresh if we are at the very top of the scroll container
    if (containerRef.current?.scrollTop === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY
    } else {
      startY.current = -1
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current < 0 || isRefreshing) return
    
    currentY.current = e.touches[0].clientY
    const distance = currentY.current - startY.current

    if (distance > 0) {
      // Add resistance to the pull
      const resistance = distance * 0.4
      setPullDistance(Math.min(resistance, maxPull))
    }
  }

  const handleTouchEnd = async () => {
    if (startY.current < 0 || isRefreshing) return
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true)
      setPullDistance(threshold - 30) // bounce back to loading position
      
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
    
    startY.current = -1
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-surface-base">
      <div 
        className="absolute top-0 inset-x-0 flex justify-center z-0 transition-all duration-200 ease-out"
        style={{ 
          transform: `translateY(${pullDistance - 50}px)`,
          opacity: Math.min(pullDistance / threshold, 1)
        }}
      >
        <div className="bg-surface-elevated shadow-sm border border-border/50 rounded-full p-2.5 flex items-center justify-center">
          <RefreshCw 
            className={`w-4 h-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 2}deg)` }}
          />
        </div>
      </div>

      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative z-10 w-full h-full overflow-y-auto overscroll-y-none bg-surface-base ${!isRefreshing && pullDistance === 0 ? '' : 'transition-transform duration-200 ease-out'} ${className || ''}`}
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {children}
      </div>
    </div>
  )
}
