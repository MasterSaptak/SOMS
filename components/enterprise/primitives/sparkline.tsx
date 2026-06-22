"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { CHART_COLORS } from '@/components/enterprise/tokens'

interface SparklineProps {
  data: number[]
  color?: keyof typeof CHART_COLORS
  height?: number
  filled?: boolean
  className?: string
}

export function Sparkline({
  data,
  color = 'blue',
  height = 40,
  filled = true,
  className,
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }))
  const fillColor = CHART_COLORS[color]

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`sparkline-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity={filled ? 0.3 : 0} />
              <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={fillColor}
            strokeWidth={1.5}
            fill={`url(#sparkline-grad-${color})`}
            dot={false}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
