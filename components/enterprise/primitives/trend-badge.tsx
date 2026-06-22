"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface TrendBadgeProps {
  value: number
  suffix?: string
  size?: 'sm' | 'md'
  className?: string
}

export function TrendBadge({ value, suffix = '%', size = 'md', className }: TrendBadgeProps) {
  const isPositive = value > 0
  const isNegative = value < 0

  const Icon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full font-medium',
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5',
        isPositive && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        isNegative && 'bg-red-500/10 text-red-600 dark:text-red-400',
        !isPositive && !isNegative && 'bg-gray-500/10 text-gray-500',
        className
      )}
    >
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {isPositive && '+'}
      {value}
      {suffix}
    </span>
  )
}
