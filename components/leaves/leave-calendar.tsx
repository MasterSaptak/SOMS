"use client"

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Palmtree, Stethoscope, Siren, Building2, Clock, CheckCircle2 } from 'lucide-react'
import { useLeaveStore } from '@/store/use-leave-store'
import { useAuthStore } from '@/store/use-auth-store'
import { MOCK_EMPLOYEES, getFullName } from '@/lib/demo/generators/legacy-mock-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Mock Company Holidays
const COMPANY_HOLIDAYS = [
  { date: '2026-06-19', name: 'Juneteenth' },
  { date: '2026-07-04', name: 'Independence Day' },
]

export function LeaveCalendar() {
  const { employee } = useAuthStore()
  const { leaves } = useLeaveStore()
  const [attendance, setAttendance] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  const [currentDate, setCurrentDate] = useState(new Date('2026-06-01T00:00:00')) // Mocking around June 2026 based on legacy data

  useEffect(() => {
    async function fetchAttendance() {
      if (!employee?.id) return
      const supabase = createClient()
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employee.id)
      
      if (data) setAttendance(data)
    }
    fetchAttendance()
  }, [employee?.id])

  // Calendar math
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  const startDate = new Date(startOfMonth)
  startDate.setDate(startDate.getDate() - startDate.getDay()) // Adjust to previous Sunday

  const endDate = new Date(endOfMonth)
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay())) // Adjust to next Saturday

  const calendarDays = []
  let d = new Date(startDate)
  while (d <= endDate) {
    calendarDays.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }

  // Formatting helper
  const dateStr = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const getEventsForDay = (date: Date) => {
    const dStr = dateStr(date)
    const events: { type: 'me' | 'team' | 'holiday' | 'attendance', title: string, icon: any, color: string }[] = []

    // Check holidays
    const holiday = COMPANY_HOLIDAYS.find(h => h.date === dStr)
    if (holiday) {
      events.push({ type: 'holiday', title: holiday.name, icon: Building2, color: 'bg-purple-500/10 text-purple-600 border-purple-200' })
    }

    // Check leaves
    leaves.forEach(leave => {
      // Only show approved or completed leaves on team calendar, plus all my pending ones
      const isMe = leave.employeeId === employee?.id
      if (!isMe && (leave.status === 'pending' || leave.status === 'rejected' || leave.status === 'cancelled')) return

      const lStart = dateStr(new Date(leave.startDate))
      const lEnd = dateStr(new Date(leave.endDate))

      if (dStr >= lStart && dStr <= lEnd) {
        let icon = Palmtree
        if (leave.leaveType === 'medical') icon = Stethoscope
        if (leave.leaveType === 'emergency') icon = Siren

        if (isMe) {
          events.push({ type: 'me', title: 'My Leave', icon, color: 'bg-primary/10 text-primary border-primary/30' })
        } else {
          const emp = MOCK_EMPLOYEES.find(e => e.id === leave.employeeId)
          events.push({ type: 'team', title: emp ? getFullName(emp) : 'Team Member', icon, color: 'bg-muted text-muted-foreground border-border' })
        }
      }
    })

    // Check Attendance
    const todayAttendance = attendance.find(a => a.date === dStr)
    if (todayAttendance) {
      if (todayAttendance.clock_out) {
        const hours = todayAttendance.total_working_hours?.toFixed(1) || '0'
        events.push({ type: 'attendance', title: `${hours}h worked`, icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' })
      } else {
        events.push({ type: 'attendance', title: `Clocked In`, icon: Clock, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' })
      }
    }

    return events
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  return (
    <div className="flex flex-col border border-border/50 rounded-2xl overflow-hidden bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Me</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-muted-foreground/50" /> Team</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /> Holiday</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Attendance</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8"><ChevronLeft className="w-4 h-4"/></Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8">Today</Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8"><ChevronRight className="w-4 h-4"/></Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-b border-border/50 bg-muted/40 text-sm font-semibold">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="p-3 text-center text-muted-foreground">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 auto-rows-[120px]">
        {calendarDays.map((day, idx) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth()
          const events = getEventsForDay(day)
          const isToday = dateStr(day) === dateStr(new Date())

          return (
            <div 
              key={idx} 
              onClick={() => setSelectedDate(day)}
              className={`border-b border-r border-border/50 p-2 flex flex-col gap-1 transition-colors hover:bg-muted/10 cursor-pointer ${!isCurrentMonth ? 'bg-muted/20 opacity-50' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                  {day.getDate()}
                </span>
              </div>
              <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
                {events.map((evt, eIdx) => {
                  const Icon = evt.icon
                  return (
                    <div key={eIdx} className={`text-[10px] flex items-center gap-1.5 p-1 px-1.5 rounded-md border ${evt.color} truncate font-medium`}>
                      <Icon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{evt.title}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Day Details Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</DialogTitle>
            <DialogDescription>
              Activity and details for this day.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            {selectedDate && (() => {
              const events = getEventsForDay(selectedDate)
              if (events.length === 0) return <p className="text-sm text-muted-foreground text-center py-4">No activity on this date.</p>
              
              return events.map((evt, idx) => {
                const Icon = evt.icon
                return (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${evt.color}`}>
                    <div className="p-2 rounded-full bg-background/50">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{evt.title}</span>
                      <span className="text-xs opacity-80 uppercase tracking-wider">{evt.type === 'me' ? 'My Leave' : evt.type}</span>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
