"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { STATUS_VARIANTS, type StatusVariant } from '@/components/enterprise/tokens'

interface StatusIndicatorProps {
  variant: StatusVariant
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
}

export function StatusIndicator({ variant, size = 'md', showLabel = false, className }: StatusIndicatorProps) {
  const config = STATUS_VARIANTS[variant]

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative flex">
        {config.pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              config.color
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full', sizeClasses[size], config.color)} />
      </span>
      {showLabel && (
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {config.label}
        </span>
      )}
    </span>
  )
}
