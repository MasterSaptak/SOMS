"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { WidgetShell } from '@/components/enterprise/widget-shell'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Play,
  Square,
  Coffee,
  Pizza,
  User,
  AlertTriangle,
  History,
  Activity
} from 'lucide-react'
import { formatTime } from '@/lib/format-time'
import { createClient } from '@/lib/supabase/client'

const containerVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVars: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

type SessionState = 'idle' | 'working' | 'break'

export default function WorkSessionPage() {
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [activeBreak, setActiveBreak] = useState<string | null>(null)
  
  const [attendanceId, setAttendanceId] = useState<string | null>(null)
  const [breakRecordId, setBreakRecordId] = useState<string | null>(null)
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  
  const [totalWorkSeconds, setTotalWorkSeconds] = useState(0)
  const [totalBreakSeconds, setTotalBreakSeconds] = useState(0)
  
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Load state from DB
  useEffect(() => {
    async function initSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: emp } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!emp) return
      setEmployeeId(emp.id)

      const today = new Date().toISOString().split('T')[0]
      const { data: attendance } = await supabase
        .from('attendance')
        .select(`
          *,
          breaks(*)
        `)
        .eq('employee_id', emp.id)
        .eq('date', today)
        .single()

      if (attendance) {
        setAttendanceId(attendance.id)
        
        if (attendance.clock_out) {
          // Finished for the day
          setSessionState('idle')
        } else {
          // Calculate active break if any
          const breaks = attendance.breaks || []
          const activeBreakRecord = breaks.find((b: any) => !b.end_time)
          
          if (activeBreakRecord) {
            setSessionState('break')
            setBreakRecordId(activeBreakRecord.id)
            // Just use a default type for now if we didn't save it
            setActiveBreak('lunch')
          } else {
            setSessionState('working')
          }
          
          // Compute work seconds based on clock_in
          const clockInTime = new Date(attendance.clock_in).getTime()
          const now = new Date().getTime()
          let diffSecs = Math.floor((now - clockInTime) / 1000)
          
          // Subtract break durations
          breaks.forEach((b: any) => {
            if (b.end_time) {
              diffSecs -= Math.floor((new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / 1000)
            } else {
              // Current active break
              diffSecs -= Math.floor((now - new Date(b.start_time).getTime()) / 1000)
              setTotalBreakSeconds(Math.floor((now - new Date(b.start_time).getTime()) / 1000))
            }
          })
          
          setTotalWorkSeconds(diffSecs > 0 ? diffSecs : 0)
        }
      }
      setIsLoading(false)
    }

    initSession()
  }, [])

  // Simulate tick
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (sessionState === "working") {
      interval = setInterval(() => {
        setTotalWorkSeconds(prev => prev + 1)
      }, 1000)
    } else if (sessionState === "break") {
      interval = setInterval(() => {
        setTotalBreakSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [sessionState])

  const startWork = async () => {
    if (!employeeId || attendanceId) return // Prevent duplicates
    
    const today = new Date().toISOString().split('T')[0]
    
    // Use upsert to overwrite any existing 'completed' session for today (prevents duplicate key errors)
    const { data, error } = await supabase
      .from('attendance')
      .upsert({
        employee_id: employeeId,
        date: today,
        clock_in: new Date().toISOString(),
        is_late: new Date().getHours() >= 9,
        clock_out: null,
        total_working_hours: null,
        is_early_leave: null
      }, { onConflict: 'employee_id,date' })
      .select()
      .single()

    if (error) {
      alert(`Error starting session: ${error.message}`)
      return
    }

    if (data) {
      setAttendanceId(data.id)
      setSessionState('working')
    }
  }

  const endWork = async () => {
    if (!attendanceId) return
    
    const { data: attendance } = await supabase
      .from('attendance')
      .select('clock_in')
      .eq('id', attendanceId)
      .single()

    if (attendance) {
      const clockInTime = new Date(attendance.clock_in).getTime()
      const clockOutTime = new Date().getTime()
      const diffHours = (clockOutTime - clockInTime) / (1000 * 60 * 60)

      const { error } = await supabase
        .from('attendance')
        .update({
          clock_out: new Date().toISOString(),
          total_working_hours: parseFloat(diffHours.toFixed(2)),
          is_early_leave: new Date().getHours() < 17
        })
        .eq('id', attendanceId)

      if (error) {
        alert(`Error ending session: ${error.message}`)
        return
      }
    }
    
    setSessionState('idle')
    setTotalWorkSeconds(0)
  }

  const startBreak = async (type: string) => {
    if (!attendanceId) {
      alert('Error: Attendance ID is missing. Please restart your session.');
      return;
    }

    const { data, error } = await supabase
      .from('breaks')
      .insert({
        attendance_id: attendanceId,
        start_time: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      alert(`Error starting break: ${error.message}`)
      return
    }

    if (data) {
      setBreakRecordId(data.id)
      setSessionState('break')
      setActiveBreak(type)
      setTotalBreakSeconds(0)
    }
  }

  const endBreak = async () => {
    if (!breakRecordId) return

    const { data: brk } = await supabase
      .from('breaks')
      .select('start_time')
      .eq('id', breakRecordId)
      .single()

    if (brk) {
      const startTime = new Date(brk.start_time).getTime()
      const endTime = new Date().getTime()
      const durationMins = Math.round((endTime - startTime) / (1000 * 60))

      const { error } = await supabase
        .from('breaks')
        .update({
          end_time: new Date().toISOString(),
          duration_minutes: durationMins
        })
        .eq('id', breakRecordId)

      if (error) {
        alert(`Error ending break: ${error.message}`)
        return
      }
    }
    
    setSessionState('working')
    setActiveBreak(null)
    setTotalBreakSeconds(0)
  }

  const handleBreak = (type: string) => {
    if (sessionState === "break" && activeBreak === type) {
      endBreak()
    } else {
      startBreak(type)
    }
  }

  const resetSession = async () => {
    if (!attendanceId) return;
    setIsLoading(true);
    // Delete all associated breaks first
    const { error: err1 } = await supabase.from('breaks').delete().eq('attendance_id', attendanceId);
    if (err1) {
      alert(`Error deleting breaks: ${err1.message}`);
      setIsLoading(false);
      return;
    }
    // Delete the attendance record
    const { error: err2 } = await supabase.from('attendance').delete().eq('id', attendanceId);
    if (err2) {
      alert(`Error deleting attendance: ${err2.message}`);
      setIsLoading(false);
      return;
    }
    
    setAttendanceId(null);
    setBreakRecordId(null);
    setTotalWorkSeconds(0);
    setTotalBreakSeconds(0);
    setSessionState('idle');
    setActiveBreak(null);
    setIsLoading(false);
  }

  const dailyTarget = 28800
  const progressPercent = Math.min((totalWorkSeconds / dailyTarget) * 100, 100)

  const breakOptions = [
    { type: 'lunch', label: 'Lunch Break', icon: <Pizza className="w-5 h-5" />, color: 'bg-orange-500', activeBg: 'bg-orange-500/15', ring: 'ring-orange-500', border: 'border-orange-500/50', shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]' },
    { type: 'food', label: 'Snack/Coffee', icon: <Coffee className="w-5 h-5" />, color: 'bg-amber-500', activeBg: 'bg-amber-500/15', ring: 'ring-amber-500', border: 'border-amber-500/50', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' },
    { type: 'personal', label: 'Personal', icon: <User className="w-5 h-5" />, color: 'bg-blue-500', activeBg: 'bg-blue-500/15', ring: 'ring-blue-500', border: 'border-blue-500/50', shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]' },
    { type: 'emergency', label: 'Emergency', icon: <AlertTriangle className="w-5 h-5" />, color: 'bg-red-500', activeBg: 'bg-red-500/15', ring: 'ring-red-500', border: 'border-red-500/50', shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]' },
  ] as const

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading workspace...</div>
  }

  return (
    <motion.div 
      className="flex flex-col gap-6 max-w-5xl mx-auto pb-12"
      variants={containerVars}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVars}>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Work Session</h1>
        <p className="text-muted-foreground">Manage your current work, breaks, and daily productivity target.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVars} className="lg:col-span-2">
          <WidgetShell className="relative overflow-hidden">
            <div className={`absolute top-0 -left-1/4 w-1/2 h-full blur-[100px] rounded-full opacity-20 transition-colors duration-1000 ${
              sessionState === 'working' ? 'bg-primary' : 
              sessionState === 'break' ? 'bg-amber-500' : 'bg-transparent'
            }`} />

            <div className="p-8 relative z-10 flex flex-col items-center justify-center text-center py-16">
              
              <div className="mb-4">
                 <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors ${
                   sessionState === 'idle' ? 'bg-muted text-muted-foreground' :
                   sessionState === 'working' ? 'bg-primary/20 text-primary' : 
                   'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                 }`}>
                   <span className={`w-2 h-2 rounded-full ${
                     sessionState === 'idle' ? 'hidden' :
                     sessionState === 'working' ? 'bg-primary animate-pulse' : 
                     'bg-amber-500'
                   }`} />
                   {sessionState === 'idle' ? 'Ready to Code' : sessionState === 'working' ? 'Active Session' : 'On Break'}
                 </span>
              </div>

              <div className="text-[5rem] font-mono font-bold tracking-tighter leading-none mb-2 tabular-nums">
                {formatTime(sessionState === 'break' ? totalBreakSeconds : totalWorkSeconds)}
              </div>
              <p className="text-muted-foreground font-medium mb-12">
                {sessionState === 'break' ? 'Break Duration' : 'Total Work Duration Today'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <AnimatePresence mode="wait">
                  {sessionState === 'idle' && !attendanceId ? (
                    <motion.div
                      key="start"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97]"
                    >
                      <Button 
                        size="lg" 
                        className="h-14 px-8 text-lg rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all duration-300 font-semibold gap-2 group"
                        onClick={startWork}
                      >
                        <Play className="fill-current w-5 h-5 group-hover:scale-110 transition-transform duration-300" /> Start Work Session
                      </Button>
                    </motion.div>
                  ) : sessionState === 'idle' && attendanceId ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <Button 
                        size="lg" 
                        disabled
                        className="h-14 px-8 text-lg rounded-full shadow-lg font-semibold gap-2 opacity-80"
                      >
                        Session Completed Today
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetSession}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full"
                      >
                        <History className="w-4 h-4 mr-2" />
                        Reset Session (Dev Only)
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="active"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4"
                    >
                      <div className="transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97]">
                        <Button 
                          size="lg" 
                          variant="destructive"
                          className="h-14 px-8 text-lg rounded-full shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all duration-300 font-semibold gap-2 group"
                          onClick={endWork}
                        >
                          <Square className="fill-current w-5 h-5 group-hover:scale-110 transition-transform duration-300" /> End Session
                        </Button>
                      </div>
                      
                      {sessionState === 'break' && (
                        <div className="transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97]">
                          <Button 
                            size="lg" 
                            variant="secondary"
                            className="h-14 px-8 text-lg rounded-full font-semibold gap-2 border border-border shadow-md hover:shadow-lg transition-all duration-300 group"
                            onClick={endBreak}
                          >
                            <Play className="fill-current w-5 h-5 group-hover:scale-110 transition-transform duration-300" /> Resume Work
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </WidgetShell>
        </motion.div>

        <motion.div variants={itemVars} className="flex flex-col gap-6">
          <WidgetShell title="Daily Target" subtitle="8 hours default requirement" className="h-full">
            <div className="pt-2">
              <div className="flex flex-col gap-2 relative mt-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-3xl font-bold">{Math.floor(progressPercent)}%</span>
                  <span className="text-sm text-muted-foreground font-medium">of 8h 00m</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
              </div>
            </div>
          </WidgetShell>
        </motion.div>

        <motion.div variants={itemVars} className="lg:col-span-3">
          <WidgetShell title="Break Management" subtitle="Take allowed breaks without accruing penalties.">
            <div className="pt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {breakOptions.map((b) => {
                  const isActive = sessionState === 'break' && activeBreak === b.type;
                  const isDisabled = sessionState === 'idle';

                  return (
                    <button
                      key={b.type}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleBreak(b.type)}
                      className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 gap-3 overflow-hidden
                        ${!isDisabled && 'hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]'}
                        ${isDisabled ? 'opacity-50 cursor-not-allowed bg-muted/40 border-transparent' : 
                          isActive ? `${b.border} ${b.activeBg} ${b.shadow} ring-1 ${b.ring}` : 
                          'hover:border-border hover:bg-card hover:shadow-lg bg-background border-border/40'}
                      `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeBreakBackground"
                          className={`absolute inset-0 ${b.activeBg} pointer-events-none`}
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <div className={`p-4 rounded-full text-white ${b.color} shadow-md transition-transform duration-300 relative z-10 pointer-events-none ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'}`}>
                        {b.icon}
                      </div>
                      <span className="font-semibold text-sm relative z-10 pointer-events-none">
                        {isActive ? 'Resume Work' : b.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </WidgetShell>
        </motion.div>
      </div>
    </motion.div>
  )
}
