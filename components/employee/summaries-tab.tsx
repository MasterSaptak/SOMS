import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckSquare, CalendarRange, Clock, PieChart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function SummariesTab({ employeeId }: { employeeId: string }) {
  const supabase = createClient()
  const [tasks, setTasks] = useState<any[]>([])
  const [leaves, setLeaves] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      
      const [tasksRes, leavesRes, attendanceRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('assigned_to', employeeId).limit(5).order('created_at', { ascending: false }),
        supabase.from('leaves').select('*').eq('employee_id', employeeId).limit(5).order('created_at', { ascending: false }),
        supabase.from('attendance').select('*').eq('employee_id', employeeId).limit(30).order('date', { ascending: false })
      ])

      if (tasksRes.data) setTasks(tasksRes.data)
      if (leavesRes.data) setLeaves(leavesRes.data)
      if (attendanceRes.data) setAttendance(attendanceRes.data)

      setIsLoading(false)
    }

    if (employeeId) loadData()
  }, [employeeId, supabase])

  if (isLoading) return <div className="p-4 text-sm animate-pulse">Loading summaries...</div>

  // Calculate attendance stats
  const presentCount = attendance.filter(a => a.status === 'present').length
  const absentCount = attendance.filter(a => a.status === 'absent').length
  const halfDayCount = attendance.filter(a => a.status === 'half_day').length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Attendance Summary */}
      <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm flex flex-col">
        <h4 className="font-semibold flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-emerald-500" /> Recent Attendance (Last 30 days)
        </h4>
        <div className="flex justify-around items-center mb-6 mt-2">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-emerald-500">{presentCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase">Present</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-amber-500">{halfDayCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase">Half Day</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-red-500">{absentCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase">Absent</span>
          </div>
        </div>
        <div className="mt-auto flex gap-1 flex-wrap">
          {attendance.slice(0, 14).map(a => {
            let color = 'bg-slate-500'
            if (a.status === 'present') color = 'bg-emerald-500'
            else if (a.status === 'absent') color = 'bg-red-500'
            else if (a.status === 'half_day') color = 'bg-amber-500'
            return <div key={a.id} className={`w-3 h-3 rounded-full ${color}`} title={`${a.date}: ${a.status}`} />
          })}
          {attendance.length === 0 && <span className="text-xs text-muted-foreground">No attendance records</span>}
        </div>
      </div>

      {/* Active Tasks Summary */}
      <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
        <h4 className="font-semibold flex items-center gap-2 mb-4">
          <CheckSquare className="w-4 h-4 text-blue-500" /> Recent Tasks
        </h4>
        <div className="flex flex-col gap-3">
          {tasks.map(t => (
            <div key={t.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
              <span className="truncate pr-2">{t.title}</span>
              <Badge variant="outline" className="text-[10px] capitalize shrink-0">{t.status?.replace('_', ' ') || 'Unknown'}</Badge>
            </div>
          ))}
          {tasks.length === 0 && <span className="text-xs text-muted-foreground">No assigned tasks</span>}
        </div>
      </div>

      {/* Recent Leaves Summary */}
      <div className="col-span-full bg-card border border-border/50 rounded-xl p-5 shadow-sm">
        <h4 className="font-semibold flex items-center gap-2 mb-4">
          <CalendarRange className="w-4 h-4 text-purple-500" /> Recent Leave Requests
        </h4>
        <div className="flex flex-col gap-3">
          {leaves.map(l => (
            <div key={l.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <span className="capitalize font-medium">{l.leave_type}</span>
                <span className="text-muted-foreground text-xs">({l.start_date} to {l.end_date})</span>
              </div>
              <Badge variant="secondary" className="text-[10px] capitalize">{l.status}</Badge>
            </div>
          ))}
          {leaves.length === 0 && <span className="text-xs text-muted-foreground">No leave records</span>}
        </div>
      </div>

    </div>
  )
}
