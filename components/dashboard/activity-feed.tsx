"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, Clock, Coffee, LogIn, LogOut, FileText, CalendarCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end' | 'task_completed' | 'leave_applied' | 'leave_approved'
  description: string
  timestamp: string
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  isLoading?: boolean
  className?: string
}

const iconMap = {
  clock_in: <LogIn className="w-3.5 h-3.5" />,
  clock_out: <LogOut className="w-3.5 h-3.5" />,
  break_start: <Coffee className="w-3.5 h-3.5" />,
  break_end: <Clock className="w-3.5 h-3.5" />,
  task_completed: <CheckCircle2 className="w-3.5 h-3.5" />,
  leave_applied: <FileText className="w-3.5 h-3.5" />,
  leave_approved: <CalendarCheck className="w-3.5 h-3.5" />,
}

const colorMap = {
  clock_in: 'bg-emerald-500 text-white',
  clock_out: 'bg-slate-500 text-white',
  break_start: 'bg-amber-500 text-white',
  break_end: 'bg-blue-500 text-white',
  task_completed: 'bg-primary text-primary-foreground',
  leave_applied: 'bg-orange-500 text-white',
  leave_approved: 'bg-emerald-600 text-white',
}

export function ActivityFeed({ activities, isLoading = false, className }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-7 h-7 rounded-full shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-full mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[13px] top-0 bottom-0 w-[2px] bg-border/60" />

          <div className="flex flex-col gap-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 relative">
                {/* Icon dot */}
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm",
                  colorMap[activity.type]
                )}>
                  {iconMap[activity.type]}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <p className="text-sm leading-snug">{activity.description}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Default mock activities
export const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: 'a1', type: 'clock_in', description: 'Clocked in for the day', timestamp: '2026-06-17T09:02:00Z' },
  { id: 'a2', type: 'task_completed', description: 'Completed "Security Audit Report"', timestamp: '2026-06-17T10:30:00Z' },
  { id: 'a3', type: 'break_start', description: 'Started lunch break', timestamp: '2026-06-17T13:00:00Z' },
  { id: 'a4', type: 'break_end', description: 'Resumed work after break', timestamp: '2026-06-17T13:45:00Z' },
  { id: 'a5', type: 'leave_applied', description: 'Applied for casual leave (Jun 23-24)', timestamp: '2026-06-15T14:00:00Z' },
  { id: 'a6', type: 'leave_approved', description: 'WFH request for Jun 18 approved', timestamp: '2026-06-14T16:00:00Z' },
]
