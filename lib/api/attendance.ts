import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type AttendanceRow = Database['public']['Tables']['attendance']['Row']
type BreakRow = Database['public']['Tables']['breaks']['Row']

export async function getTodayAttendance(employeeId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const { data, error } = await supabase
    .from('attendance')
    .select(`
      *,
      breaks(*)
    `)
    .eq('employee_id', employeeId)
    .eq('date', today)
    .single()

  if (error && error.code !== 'PGRST116') { // Ignore "no rows returned"
    console.error('Error fetching attendance:', error)
  }

  return data
}

export async function clockIn(employeeId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('attendance')
    .insert({
      employee_id: employeeId,
      date: today,
      clock_in: new Date().toISOString(),
      // Simple logic: Late if after 9 AM
      is_late: new Date().getHours() >= 9
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function clockOut(attendanceId: string) {
  const supabase = await createClient()
  
  // Calculate total hours
  const { data: attendance } = await supabase
    .from('attendance')
    .select('clock_in')
    .eq('id', attendanceId)
    .single()

  if (!attendance) throw new Error('Attendance not found')

  const clockInTime = new Date(attendance.clock_in).getTime()
  const clockOutTime = new Date().getTime()
  const diffHours = (clockOutTime - clockInTime) / (1000 * 60 * 60)

  const { data, error } = await supabase
    .from('attendance')
    .update({
      clock_out: new Date().toISOString(),
      total_working_hours: parseFloat(diffHours.toFixed(2)),
      // Simple logic: Early leave if before 5 PM (17:00)
      is_early_leave: new Date().getHours() < 17
    })
    .eq('id', attendanceId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function startBreak(attendanceId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('breaks')
    .insert({
      attendance_id: attendanceId,
      start_time: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function endBreak(breakId: string) {
  const supabase = await createClient()

  const { data: brk } = await supabase
    .from('breaks')
    .select('start_time')
    .eq('id', breakId)
    .single()

  if (!brk) throw new Error('Break not found')

  const startTime = new Date(brk.start_time).getTime()
  const endTime = new Date().getTime()
  const durationMins = Math.round((endTime - startTime) / (1000 * 60))

  const { data, error } = await supabase
    .from('breaks')
    .update({
      end_time: new Date().toISOString(),
      duration_minutes: durationMins
    })
    .eq('id', breakId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAllAttendance() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('attendance')
    .select(`
      *,
      employees(full_name, department),
      breaks(*)
    `)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching all attendance:', error)
    return []
  }

  return data
}
