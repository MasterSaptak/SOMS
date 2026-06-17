import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type EmployeeRow = Database['public']['Tables']['employees']['Row']

export async function getEmployeeByUserId(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      profiles(first_name, last_name, avatar_url)
    `)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching employee:', error)
  }

  return data
}

export async function getAllEmployees() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      profiles(first_name, last_name, avatar_url)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all employees:', error)
    return []
  }

  return data
}

export async function updateEmployeeProfile(employeeId: string, updates: Partial<EmployeeRow>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', employeeId)
    .select()
    .single()

  if (error) throw error
  return data
}
