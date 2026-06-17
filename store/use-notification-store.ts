"use client"

import { create } from 'zustand'
import type { Notification } from '@/lib/types'
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  removeNotification: (id: string) => void
  getForUser: (userId: string) => Notification[]
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `n${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    set(state => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  markRead: (id: string) => {
    set(state => {
      const notifications = state.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
      return {
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length,
      }
    })
  },

  markAllRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
  },

  removeNotification: (id: string) => {
    set(state => {
      const notifications = state.notifications.filter(n => n.id !== id)
      return {
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length,
      }
    })
  },

  getForUser: (userId: string) => {
    return get().notifications.filter(n => n.userId === userId)
  },
}))
