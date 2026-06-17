"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck, X } from 'lucide-react'
import { useNotificationStore } from '@/store/use-notification-store'
import { useAuthStore } from '@/store/use-auth-store'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { NOTIFICATION_TYPES } from '@/lib/constants'

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore()

  const userNotifications = user
    ? notifications.filter(n => n.userId === user.id).slice(0, 20)
    : []
  const userUnread = userNotifications.filter(n => !n.isRead).length

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {userUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1 border-2 border-background">
            {userUnread > 9 ? '9+' : userUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex items-center gap-1">
              {userUnread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 gap-1 text-muted-foreground"
                  onClick={markAllRead}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[400px]">
            {userNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              userNotifications.map((notification) => {
                const typeConfig = NOTIFICATION_TYPES[notification.type]
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-border/30 hover:bg-accent/50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-primary/[0.03]' : ''
                    }`}
                    onClick={() => {
                      markRead(notification.id)
                      if (notification.actionUrl) {
                        setIsOpen(false)
                      }
                    }}
                  >
                    {/* Icon */}
                    <span className="text-lg shrink-0 mt-0.5">{typeConfig?.icon || '🔔'}</span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {notification.actionUrl ? (
                        <Link
                          href={notification.actionUrl}
                          className="block"
                          onClick={() => setIsOpen(false)}
                        >
                          <p className={`text-sm leading-snug ${!notification.isRead ? 'font-medium' : ''}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {notification.message}
                          </p>
                        </Link>
                      ) : (
                        <>
                          <p className={`text-sm leading-snug ${!notification.isRead ? 'font-medium' : ''}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {notification.message}
                          </p>
                        </>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
