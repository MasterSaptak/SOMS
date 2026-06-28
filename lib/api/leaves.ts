import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type LeaveInsert = Database['public']['Tables']['leaves']['Insert']

export async function getLeaves(employeeId?: string) {
  const supabase = await createClient()

  let query = (supabase as any)
    .from('leaves')
    .select(`
      *,
      employee:employees!leaves_employee_id_fkey(
        profiles(first_name, last_name, avatar_url)
      )
    `)
    .order('created_at', { ascending: false })

  if (employeeId) {
    query = query.eq('employee_id', employeeId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching leaves:', error)
    return []
  }

  return data
}

export async function applyForLeave(leave: LeaveInsert) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leaves')
    .insert(leave)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLeaveStatus(leaveId: string, newStatus: string, approvedByEmployeeId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leaves')
    .update({ 
      status: newStatus, 
      approved_by: newStatus === 'approved' ? approvedByEmployeeId : null,
      updated_at: new Date().toISOString() 
    })
    .eq('id', leaveId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function cancelLeave(leaveId: string, employeeId: string) {
  const supabase = await createClient()

  // Verify status is pending and belongs to employee
  const { error } = await supabase
    .from('leaves')
    .delete()
    .eq('id', leaveId)
    .eq('employee_id', employeeId)
    .eq('status', 'pending')

  if (error) throw error
  return true
}
