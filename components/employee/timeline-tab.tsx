"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { getTimelineEventsAction } from '@/app/actions/employee.actions'
import { Calendar, UserPlus, CheckCircle, ArrowRightLeft, TrendingUp, Trophy, History } from 'lucide-react'
import { format } from 'date-fns'

interface TimelineEvent {
  id: string
  event_type: string
  title: string
  description?: string
  event_date: string
  created_at: string
}

function getEventIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'joined':
      return <UserPlus className="w-4 h-4 text-primary" />
    case 'verified':
      return <CheckCircle className="w-4 h-4 text-emerald-500" />
    case 'transferred':
      return <ArrowRightLeft className="w-4 h-4 text-blue-500" />
    case 'promoted':
      return <TrendingUp className="w-4 h-4 text-purple-500" />
    case 'award':
      return <Trophy className="w-4 h-4 text-amber-500" />
    default:
      return <History className="w-4 h-4 text-muted-foreground" />
  }
}

export function TimelineTab({ employeeId }: { employeeId: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEvents() {
      setLoading(true)
      const res = await getTimelineEventsAction(employeeId)
      if (res.success && res.data) {
        setEvents(res.data)
      }
      setLoading(false)
    }
    loadEvents()
  }, [employeeId])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Card className="border-dashed bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No Timeline Events</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            There are no recorded events for this employee's journey yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative pl-4 border-l-2 border-muted py-2 space-y-8">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative"
        >
          {/* Timeline Dot */}
          <div className="absolute -left-[35px] mt-1.5 w-8 h-8 rounded-full bg-background border-2 border-muted flex items-center justify-center shadow-sm">
            {getEventIcon(event.event_type)}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              {format(new Date(event.event_date), 'MMM d, yyyy')}
            </span>
            <Card className="hover:border-primary/50 transition-colors shadow-sm">
              <CardContent className="p-4 flex flex-col gap-1">
                <h4 className="font-semibold text-foreground text-sm">{event.title}</h4>
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
