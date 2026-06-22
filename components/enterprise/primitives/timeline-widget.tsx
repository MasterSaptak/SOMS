"use client"

import React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { WidgetShell } from '@/components/enterprise/primitives/widget-shell'
import { slideInLeft } from '@/components/enterprise/motion'
import { StatusIndicator } from '@/components/enterprise/primitives/status-indicator'
import { Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { WidgetState } from '@/components/enterprise/tokens'

// ─── Types ─── //

export interface TimelineEntry {
  id: string
  icon?: React.ReactNode
  title: string
  subtitle?: string
  timestamp: string | Date
  badge?: React.ReactNode
}

interface TimelineWidgetProps {
  /** Card title */
  title?: string
  /** Card subtitle */
  subtitle?: string
  /** Icon for header */
  icon?: React.ReactNode
  /** Header right actions */
  actions?: React.ReactNode
  /** Timeline entries */
  entries: TimelineEntry[]
  /** Whether the feed is live (shows indicator) */
  isLive?: boolean
  /** Maximum entries to display */
  maxEntries?: number
  /** Widget state */
  state?: WidgetState
  /** Additional class names */
  className?: string
  /** Stable widget ID */
  widgetId?: string
}

export function TimelineWidget({
  title = 'Activity',
  subtitle,
  icon,
  actions,
  entries,
  isLive = false,
  maxEntries = 10,
  state = 'idle',
  className,
  widgetId,
}: TimelineWidgetProps) {
  const displayed = entries.slice(0, maxEntries)

  return (
    <WidgetShell
      title={title}
      subtitle={subtitle}
      icon={icon}
      actions={
        actions || (isLive ? <StatusIndicator variant="live" showLabel size="sm" /> : undefined)
      }
      state={isLive && state === 'idle' ? 'live' : state}
      widgetId={widgetId}
      className={cn('h-full', className)}
      scrollable
      noPadding
    >
      <div className="flex flex-col">
        {displayed.map((entry, index) => (
          <motion.div
            key={entry.id}
            variants={slideInLeft}
            initial="hidden"
            animate="show"
            transition={{ delay: index * 0.04 }}
            className="flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group"
          >
            {/* Icon / Avatar */}
            <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-muted transition-colors">
              {entry.icon || <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug truncate">{entry.title}</p>
              {entry.subtitle && (
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {entry.subtitle}
                </p>
              )}
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="w-2.5 h-2.5 text-muted-foreground/60" />
                <span className="text-[10px] text-muted-foreground">
                  {typeof entry.timestamp === 'string'
                    ? formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })
                    : formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Badge */}
            {entry.badge && <div className="shrink-0 mt-1">{entry.badge}</div>}
          </motion.div>
        ))}

        {displayed.length === 0 && state === 'idle' && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Clock className="w-6 h-6 mb-2 opacity-30" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>

      {/* Fade-out gradient at bottom */}
      {displayed.length > 5 && (
        <div className="sticky bottom-0 h-8 bg-gradient-to-t from-surface-primary to-transparent pointer-events-none" />
      )}
    </WidgetShell>
  )
}
