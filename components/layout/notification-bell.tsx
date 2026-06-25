"use client"

import React, { useEffect, useState } from 'react'
import { Bell, Check, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { getNotificationsAction, markNotificationReadAction } from '@/app/actions/employee.actions'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

function getIcon(type: string) {
  switch (type) {
    case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    case 'error': return <XCircle className="w-4 h-4 text-red-500" />
    case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />
    default: return <Info className="w-4 h-4 text-blue-500" />
  }
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const loadNotifications = async () => {
    const res = await getNotificationsAction()
    if (res.success && res.data) {
      setNotifications(res.data)
    }
  }

  useEffect(() => {
    loadNotifications()
    // Optional: Add realtime subscription or polling here if needed
    const interval = setInterval(loadNotifications, 30000) // 30s poll
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await markNotificationReadAction(id)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted/50 transition-colors h-10 w-10">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background"
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4 mt-2" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
              {unreadCount} New
            </span>
          )}
        </div>
        
        <div className="flex flex-col max-h-[350px] overflow-y-auto overflow-x-hidden">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`flex gap-3 p-4 border-b border-border/50 last:border-0 transition-colors hover:bg-muted/30 ${!notification.is_read ? 'bg-primary/5' : ''}`}
                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              >
                <div className="shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <p className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-foreground/80'}`}>
                      {notification.title}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {notification.message}
                  </p>
                  <span className="text-[10px] text-muted-foreground/70 mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </div>
                {!notification.is_read && (
                  <div className="shrink-0 flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
