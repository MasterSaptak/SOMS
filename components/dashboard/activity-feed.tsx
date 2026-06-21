"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity, User, FileText, Settings, AlertCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'motion/react'

export function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadFeed() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('organization_activity')
        .select(`
          *,
          profiles(first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (data) {
        setActivities(data)
      }
      setIsLoading(false)
    }

    loadFeed()

    const supabase = createClient()
    const subscription = supabase
      .channel('public:organization_activity')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'organization_activity' },
        (payload) => {
          // Ideally fetch profile data or append with basic details
          loadFeed()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'user_action': return <User className="w-4 h-4 text-blue-500" />
      case 'document_upload': return <FileText className="w-4 h-4 text-emerald-500" />
      case 'system_update': return <Settings className="w-4 h-4 text-gray-500" />
      case 'alert': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Activity className="w-4 h-4 text-primary" />
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Live Activity Feed
        </CardTitle>
        <CardDescription>Real-time organizational updates</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">
                    {activity.profiles?.first_name} {activity.profiles?.last_name && (
                      <span className="font-semibold">{activity.profiles.first_name} {activity.profiles.last_name} </span>
                    )}
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    {activity.created_at ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }) : 'Just now'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
