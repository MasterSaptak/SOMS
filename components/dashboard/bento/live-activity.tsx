"use client"

import React, { useEffect, useState } from 'react'
import { TimelineWidget, type TimelineEntry } from '@/components/enterprise/primitives/timeline-widget'
import { Badge } from '@/components/ui/badge'
import { Activity, User, FileText, Settings, AlertCircle, Clock, CheckSquare, CalendarRange } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import type { WidgetState } from '@/components/enterprise/tokens'

const activityIconMap: Record<string, React.ReactNode> = {
  user_action: <User className="w-3.5 h-3.5 text-blue-500" />,
  document_upload: <FileText className="w-3.5 h-3.5 text-emerald-500" />,
  system_update: <Settings className="w-3.5 h-3.5 text-gray-500" />,
  alert: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
  check_in: <Clock className="w-3.5 h-3.5 text-emerald-500" />,
  task_completed: <CheckSquare className="w-3.5 h-3.5 text-blue-500" />,
  leave_approved: <CalendarRange className="w-3.5 h-3.5 text-amber-500" />,
}

interface LiveActivityProps {
  className?: string
}

export function LiveActivity({ className }: LiveActivityProps) {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [state, setState] = useState<WidgetState>('loading')

  useEffect(() => {
    async function loadFeed() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('organization_activity')
        .select(`*, profiles(first_name, last_name, avatar_url)`)
        .order('created_at', { ascending: false })
        .limit(10)

      if (data && data.length > 0) {
        const mapped: TimelineEntry[] = data.map((item: any) => ({
          id: item.id,
          icon: activityIconMap[item.activity_type] || <Activity className="w-3.5 h-3.5 text-primary" />,
          title: item.message || 'Activity recorded',
          subtitle: item.profiles
            ? `${item.profiles.first_name} ${item.profiles.last_name}`
            : undefined,
          timestamp: item.created_at || new Date().toISOString(),
        }))
        setEntries(mapped)
        setState('idle')
      } else if (error) {
        setState('empty')
      } else {
        setState('empty')
      }
    }

    loadFeed()

    // Realtime subscription
    const supabase = createClient()
    const subscription = supabase
      .channel('public:organization_activity')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'organization_activity' },
        () => { loadFeed() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  return (
    <TimelineWidget
      title="Live Activity"
      subtitle="Real-time organization updates"
      icon={<Activity className="w-4 h-4" />}
      entries={entries}
      isLive={state === 'idle' && entries.length > 0}
      state={state}
      widgetId="live-activity"
      className={className}
    />
  )
}
