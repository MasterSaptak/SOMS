"use client"

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface RadialProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  strokeWidth?: number
  showValue?: boolean
  label?: string
  color?: string
  className?: string
}

const sizeConfig = {
  sm: { dimension: 48, fontSize: 'text-xs', labelSize: 'text-[8px]' },
  md: { dimension: 72, fontSize: 'text-lg', labelSize: 'text-[9px]' },
  lg: { dimension: 96, fontSize: 'text-2xl', labelSize: 'text-[10px]' },
}

export function RadialProgress({
  value,
  max = 100,
  size = 'md',
  strokeWidth = 4,
  showValue = true,
  label,
  color = 'hsl(var(--primary))',
  className,
}: RadialProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const config = sizeConfig[size]
  const radius = (config.dimension - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const percentage = Math.min((animatedValue / max) * 100, 100)
  const offset = circumference - (percentage / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.dimension}
        height={config.dimension}
        viewBox={`0 0 ${config.dimension} ${config.dimension}`}
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold tabular-nums', config.fontSize)}>
            {Math.round(percentage)}
          </span>
          {label && (
            <span className={cn('text-muted-foreground uppercase tracking-wider font-medium', config.labelSize)}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
