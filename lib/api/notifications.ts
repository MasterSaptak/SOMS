import { createClient } from '@/lib/supabase/server'

export async function getUnreadNotifications(employeeId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching unread notifications:', error)
    return []
  }

  return data
}

export async function getAllNotifications(employeeId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false })
    .limit(50) // Keep it manageable

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
  return true
}

export async function markAllNotificationsAsRead(employeeId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('employee_id', employeeId)
    .eq('is_read', false)

  if (error) throw error
  return true
}
