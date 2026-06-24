"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { WidgetShell } from '@/components/enterprise/widget-shell'
import { createClient } from '@/lib/supabase/client'
import { SmartAttendanceEngine } from '@/lib/attendance-engine'
import { SmartAttendanceStatus } from '@/lib/types'
import { 
  Users, UserCheck, Briefcase, Coffee, AlertCircle, Home, 
  CalendarDays, UserX, Clock, MapPin, ChevronDown, CheckCircle2,
  MoreVertical, ShieldAlert
} from 'lucide-react'
import { formatTime } from '@/lib/format-time'

// --- Interfaces ---
interface EmployeeRow {
  id: string
  fullName: string
  employeeCode: string
  departmentName: string
  designationTitle: string
  status: SmartAttendanceStatus
  clockIn: string | null
  workedHours: number
  breakHours: number
  isLate: boolean
}

// --- Components ---
function StatusBadge({ status, isLate }: { status: SmartAttendanceStatus, isLate: boolean }) {
  const configs: Record<string, { bg: string, text: string, label: string, icon: React.ReactNode }> = {
    present: { bg: 'bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', label: 'Present', icon: <UserCheck className="w-3.5 h-3.5" /> },
    present_compensation: { bg: 'bg-indigo-500/15', text: 'text-indigo-700 dark:text-indigo-400', label: 'Present + Comp', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    partial_day: { bg: 'bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400', label: 'Partial Day', icon: <Clock className="w-3.5 h-3.5" /> },
    approved_leave: { bg: 'bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400', label: 'On Leave', icon: <Briefcase className="w-3.5 h-3.5" /> },
    remote: { bg: 'bg-orange-500/15', text: 'text-orange-700 dark:text-orange-400', label: 'Remote', icon: <Home className="w-3.5 h-3.5" /> },
    holiday: { bg: 'bg-purple-500/15', text: 'text-purple-700 dark:text-purple-400', label: 'Holiday', icon: <CalendarDays className="w-3.5 h-3.5" /> },
    weekend: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Weekend', icon: <CalendarDays className="w-3.5 h-3.5" /> },
    absent: { bg: 'bg-red-500/15', text: 'text-red-700 dark:text-red-400', label: 'Absent', icon: <UserX className="w-3.5 h-3.5" /> },
    no_activity: { bg: 'bg-muted/50', text: 'text-muted-foreground', label: 'No Activity', icon: <Clock className="w-3.5 h-3.5" /> },
    admin_override: { bg: 'bg-gray-800/15', text: 'text-gray-800 dark:text-gray-300', label: 'Admin Override', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  }

  const c = configs[status] || configs.no_activity

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${c.bg} ${c.text}`}>
        {c.icon} {c.label}
      </span>
      {isLate && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
          Late
        </span>
      )}
    </div>
  )
}

function MetricCard({ label, value, icon, accent }: { label: string, value: number, icon: React.ReactNode, accent: string }) {
  return (
    <WidgetShell className={`p-4 border-b-4 ${accent}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-black tabular-nums">{value}</p>
        </div>
        <div className={`p-2 rounded-xl bg-muted/30`}>
          {icon}
        </div>
      </div>
    </WidgetShell>
  )
}

// --- Main Page ---
export default function AdminAttendanceDashboard() {
  const [roster, setRoster] = useState<EmployeeRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const todayStr = new Date().toISOString().split('T')[0]

      // 1. Fetch active employees
      const { data: employees } = await supabase
        .from('employees')
        .select(`
          id, full_name, employee_id_string,
          department,
          designation
        `)
        .eq('employment_status', 'active')

      // 2. Fetch today's attendance
      const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', todayStr)

      // 3. Fetch today's leaves
      const { data: leaves } = await supabase
        .from('leaves')
        .select('*')
        .lte('start_date', todayStr)
        .gte('end_date', todayStr)
        .in('status', ['manager_approved', 'hr_approved', 'completed'])

      if (employees) {
        const rows: EmployeeRow[] = employees.map(emp => {
          const att = attendance?.find(a => a.employee_id === emp.id)
          const leave = leaves?.find(l => l.employee_id === emp.id)
          
          // Map to engine formats
          let isRemote = false
          if ((att as any)?.notes) {
            try {
              const p = JSON.parse((att as any).notes)
              isRemote = p.is_remote === true
            } catch { /* ignore */ }
          }

          const attRecord = att ? {
            clock_in: att.clock_in,
            clock_out: att.clock_out,
            total_working_hours: att.total_working_hours,
            is_early_leave: att.is_early_leave,
            is_remote: isRemote,
            notes: (att as any).notes
          } : null

          const leaveRecord = leave ? {
            startDate: leave.start_date,
            endDate: leave.end_date,
            status: leave.status || 'unknown',
            leaveType: leave.leave_type
          } : null

          const status = SmartAttendanceEngine.computeDailyStatus(todayStr, attRecord, leaveRecord, false)
          const lateness = SmartAttendanceEngine.getLatenessStatus(att?.clock_in || null)
          
          return {
            id: emp.id,
            fullName: emp.full_name || 'Unknown',
            employeeCode: emp.employee_id_string || 'N/A',
            departmentName: emp.department || 'Unassigned',
            designationTitle: emp.designation || 'Employee',
            status,
            clockIn: att?.clock_in || null,
            workedHours: att?.total_working_hours || 0,
            breakHours: (((att as any)?.total_break_seconds || 0) / 3600),
            isLate: lateness === 'late' || lateness === 'slightly_late'
          }
        })

        setRoster(rows)
      }
      setIsLoading(false)
    }

    loadData()
  }, [])

  // Derived Metrics
  const metrics = useMemo(() => {
    return {
      total: roster.length,
      present: roster.filter(r => r.status === 'present' || r.status === 'present_compensation' || r.status === 'partial_day').length,
      remote: roster.filter(r => r.status === 'remote').length,
      leave: roster.filter(r => r.status === 'approved_leave').length,
      absent: roster.filter(r => r.status === 'absent' || r.status === 'no_activity').length,
      late: roster.filter(r => r.isLate).length
    }
  }, [roster])

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading Smart Engine...</div>
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Attendance</h1>
          <p className="text-muted-foreground text-sm">Powered by Smart Attendance Engine</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 bg-muted rounded-full text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Auto-sync Active
          </span>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label="Total Staff" value={metrics.total} icon={<Users className="w-5 h-5 text-muted-foreground" />} accent="border-muted" />
        <MetricCard label="Present" value={metrics.present} icon={<UserCheck className="w-5 h-5 text-emerald-500" />} accent="border-emerald-500" />
        <MetricCard label="Remote" value={metrics.remote} icon={<Home className="w-5 h-5 text-orange-500" />} accent="border-orange-500" />
        <MetricCard label="On Leave" value={metrics.leave} icon={<Briefcase className="w-5 h-5 text-blue-500" />} accent="border-blue-500" />
        <MetricCard label="Late Arrivals" value={metrics.late} icon={<AlertCircle className="w-5 h-5 text-amber-500" />} accent="border-amber-500" />
        <MetricCard label="Absent / Idle" value={metrics.absent} icon={<UserX className="w-5 h-5 text-red-500" />} accent="border-red-500" />
      </div>

      {/* Roster Table */}
      <WidgetShell className="overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-widest">Daily Roster</h2>
          <div className="text-xs text-muted-foreground">Showing {roster.length} employees</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted/30">
              <tr>
                <th className="px-6 py-4 font-bold">Employee</th>
                <th className="px-6 py-4 font-bold">Smart Status</th>
                <th className="px-6 py-4 font-bold">Arrival</th>
                <th className="px-6 py-4 font-bold">Worked</th>
                <th className="px-6 py-4 font-bold">Breaks</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {roster.map((row) => (
                <tr key={row.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {row.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{row.fullName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{row.employeeCode} • {row.departmentName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={row.status} isLate={row.isLate} />
                  </td>
                  <td className="px-6 py-3 font-mono text-xs">
                    {row.clockIn ? new Date(row.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs font-semibold">
                    {row.workedHours > 0 ? `${row.workedHours.toFixed(1)}h` : '—'}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                    {row.breakHours > 0 ? `${row.breakHours.toFixed(1)}h` : '—'}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WidgetShell>
    </div>
  )
}
