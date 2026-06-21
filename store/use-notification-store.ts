"use client"

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Notification = Database['public']['Tables']['notifications']['Row']

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  
  fetchNotifications: (employeeId: string) => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: (employeeId: string) => Promise<void>
  subscribeToNotifications: (employeeId: string) => void
  unsubscribeFromNotifications: () => void
}

let subscription: any = null

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (employeeId) => {
    set({ isLoading: true })
    const supabase = createClient()
    
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(50)
        
      if (data) {
        set({ 
          notifications: data,
          unreadCount: data.filter(n => !n.is_read).length
        })
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    } finally {
      set({ isLoading: false })
    }
  },

  markAsRead: async (notificationId) => {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
    
    const { notifications } = get()
    const updated = notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    set({ 
      notifications: updated,
      unreadCount: updated.filter(n => !n.is_read).length
    })
  },

  markAllAsRead: async (employeeId) => {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('employee_id', employeeId).eq('is_read', false)
    
    const { notifications } = get()
    const updated = notifications.map(n => ({ ...n, is_read: true }))
    set({ 
      notifications: updated,
      unreadCount: 0
    })
  },

  subscribeToNotifications: (employeeId) => {
    const supabase = createClient()
    
    if (subscription) {
      supabase.removeChannel(subscription)
    }
    
    subscription = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `employee_id=eq.${employeeId}` },
        (payload) => {
          const newNotification = payload.new as Notification
          const { notifications } = get()
          
          const updated = [newNotification, ...notifications]
          set({
            notifications: updated,
            unreadCount: updated.filter(n => !n.is_read).length
          })
          
          // Here we could also trigger a toast if needed, but the component subscribing to the store can handle that.
        }
      )
      .subscribe()
  },

  unsubscribeFromNotifications: () => {
    if (subscription) {
      const supabase = createClient()
      supabase.removeChannel(subscription)
      subscription = null
    }
  }
}))
