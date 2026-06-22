"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { WidgetShell } from '@/components/enterprise/primitives/widget-shell'
import { AnimatedCounter } from '@/components/enterprise/primitives/animated-counter'
import { TrendBadge } from '@/components/enterprise/primitives/trend-badge'
import { Sparkline } from '@/components/enterprise/primitives/sparkline'
import { Progress } from '@/components/ui/progress'
import type { WidgetState } from '@/components/enterprise/tokens'
import type { CHART_COLORS } from '@/components/enterprise/tokens'

interface MetricCardProps {
  /** Card title */
  title: string
  /** Primary metric value */
  value: number
  /** Prefix for the value (e.g. "$") */
  prefix?: string
  /** Suffix for the value (e.g. "%" or "/100") */
  suffix?: string
  /** Number of decimal places */
  decimals?: number
  /** Trend percentage (positive = up, negative = down) */
  trend?: number
  /** Trend label (e.g. "vs last week") */
  trendLabel?: string
  /** Icon to show in the header */
  icon?: React.ReactNode
  /** Subtitle text */
  subtitle?: string
  /** Sparkline data (array of numbers) */
  sparklineData?: number[]
  /** Sparkline color */
  sparklineColor?: keyof typeof CHART_COLORS
  /** Progress bar value (0-100) */
  progress?: number
  /** Progress bar color class */
  progressColor?: string
  /** Widget state */
  state?: WidgetState
  /** Additional class names */
  className?: string
  /** Stable widget ID */
  widgetId?: string
}

export function MetricCard({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  trend,
  trendLabel,
  icon,
  subtitle,
  sparklineData,
  sparklineColor = 'blue',
  progress,
  progressColor,
  state = 'idle',
  className,
  widgetId,
}: MetricCardProps) {
  return (
    <WidgetShell
      title={title}
      icon={icon}
      state={state}
      widgetId={widgetId}
      className={cn('h-full', className)}
      actions={
        trend !== undefined ? <TrendBadge value={trend} size="sm" /> : undefined
      }
    >
      <div className="flex flex-col gap-3 mt-1">
        {/* Large metric number */}
        <div className="flex items-end gap-1.5">
          <AnimatedCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
            className="text-[var(--text-metric-sm)] font-bold leading-none"
          />
        </div>

        {/* Subtitle / trend label */}
        {(subtitle || trendLabel) && (
          <p className="text-[11px] text-muted-foreground leading-tight">
            {subtitle || trendLabel}
          </p>
        )}

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <Sparkline data={sparklineData} color={sparklineColor} height={36} />
        )}

        {/* Progress bar */}
        {progress !== undefined && (
          <Progress
            value={progress}
            className="h-1.5 bg-muted/50"
            indicatorClassName={progressColor || 'bg-primary'}
          />
        )}
      </div>
    </WidgetShell>
  )
}
