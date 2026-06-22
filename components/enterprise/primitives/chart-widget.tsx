"use client"

import React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { WidgetShell } from '@/components/enterprise/primitives/widget-shell'
import { chartReveal } from '@/components/enterprise/motion'
import {
  RECHARTS_TOOLTIP_STYLE,
  RECHARTS_AXIS_STYLE,
  RECHARTS_GRID_STYLE,
  type WidgetState,
} from '@/components/enterprise/tokens'

interface ChartWidgetProps {
  /** Card title */
  title: string
  /** Subtitle / description */
  subtitle?: string
  /** Icon for the header */
  icon?: React.ReactNode
  /** Header right actions */
  actions?: React.ReactNode
  /** Recharts composition */
  children: React.ReactNode
  /** Chart container height */
  height?: number
  /** Widget state */
  state?: WidgetState
  /** Additional class names */
  className?: string
  /** Stable widget ID */
  widgetId?: string
}

export function ChartWidget({
  title,
  subtitle,
  icon,
  actions,
  children,
  height = 250,
  state = 'idle',
  className,
  widgetId,
}: ChartWidgetProps) {
  return (
    <WidgetShell
      title={title}
      subtitle={subtitle}
      icon={icon}
      actions={actions}
      state={state}
      widgetId={widgetId}
      className={cn('h-full', className)}
    >
      <motion.div
        variants={chartReveal}
        initial="hidden"
        animate="show"
        style={{ height }}
        className="w-full"
      >
        {children}
      </motion.div>
    </WidgetShell>
  )
}

/** Re-export shared Recharts style constants for convenience */
export { RECHARTS_TOOLTIP_STYLE, RECHARTS_AXIS_STYLE, RECHARTS_GRID_STYLE }
