"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { WidgetShell } from '@/components/enterprise/primitives/widget-shell'
import { AnimatedCounter } from '@/components/enterprise/primitives/animated-counter'
import { StatusIndicator } from '@/components/enterprise/primitives/status-indicator'
import { MapPin, Clock, Coffee, Calendar, Monitor } from 'lucide-react'
import type { WidgetState } from '@/components/enterprise/tokens'

interface WorkspaceStatusProps {
  officeName?: string
  checkedIn?: boolean
  workHours?: number
  onBreak?: boolean
  nextMeeting?: string
  currentProject?: string
  state?: WidgetState
  className?: string
}

function RealtimeClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold tabular-nums tracking-tight">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {time.toLocaleTimeString([], { second: '2-digit' }).slice(-2)}
      </span>
    </div>
  )
}

export function WorkspaceStatus({
  officeName = 'HQ — Mumbai',
  checkedIn = true,
  workHours = 6.5,
  onBreak = false,
  nextMeeting = '2:30 PM — Sprint Review',
  currentProject = 'SOMS Enterprise',
  state = 'idle',
  className,
}: WorkspaceStatusProps) {
  return (
    <WidgetShell
      title="Workspace"
      icon={<Monitor className="w-4 h-4" />}
      state={state}
      widgetId="workspace-status"
      className={cn('h-full', className)}
      actions={
        <StatusIndicator variant={checkedIn ? 'online' : 'offline'} showLabel size="sm" />
      }
    >
      <div className="flex flex-col gap-4 mt-1">
        {/* Clock */}
        <RealtimeClock />

        {/* Info rows */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 text-sm">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{officeName}</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm">
            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>
              <AnimatedCounter value={workHours} decimals={1} className="font-semibold" />
              <span className="text-muted-foreground ml-1">hrs today</span>
            </span>
          </div>

          {onBreak && (
            <div className="flex items-center gap-2.5 text-sm">
              <Coffee className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-amber-600 dark:text-amber-400 font-medium">On Break</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-sm">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate text-muted-foreground">{nextMeeting}</span>
          </div>
        </div>
      </div>
    </WidgetShell>
  )
}
