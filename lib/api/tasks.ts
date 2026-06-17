import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type TaskInsert = Database['public']['Tables']['tasks']['Insert']

export async function getTasks(employeeId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('tasks')
    .select(`
      *,
      assigned_to_profile:employees!tasks_assigned_to_fkey(
        profiles(first_name, last_name, avatar_url)
      ),
      created_by_profile:employees!tasks_created_by_fkey(
        profiles(first_name, last_name, avatar_url)
      )
    `)
    .order('created_at', { ascending: false })

  if (employeeId) {
    query = query.eq('assigned_to', employeeId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return data
}

export async function createTask(task: TaskInsert) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTaskStatus(taskId: string, newStatus: string, updatedByEmployeeId: string) {
  const supabase = await createClient()

  // 1. Get current status
  const { data: currentTask } = await supabase
    .from('tasks')
    .select('status')
    .eq('id', taskId)
    .single()

  // 2. Update task
  const { data: task, error } = await supabase
    .from('tasks')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error

  // 3. Log the update
  if (currentTask && currentTask.status !== newStatus) {
    await supabase.from('task_updates').insert({
      task_id: taskId,
      updated_by: updatedByEmployeeId,
      content: `Status changed to ${newStatus.replace('_', ' ')}`,
      previous_status: currentTask.status,
      new_status: newStatus
    })
  }

  return task
}

export async function getTaskUpdates(taskId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('task_updates')
    .select(`
      *,
      employees(
        profiles(first_name, last_name, avatar_url)
      )
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching task updates:', error)
    return []
  }

  return data
}
