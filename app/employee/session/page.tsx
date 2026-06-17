"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
    
    setSessionState('working')
    const today = new Date().toISOString().split('T')[0]
    
    // Create DB Record
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        employee_id: employeeId,
        date: today,
        clock_in: new Date().toISOString(),
        is_late: new Date().getHours() >= 9
      })
      .select()
      .single()

    if (data) {
      setAttendanceId(data.id)
    }
  }

  const endWork = async () => {
    if (!attendanceId) return
    setSessionState('idle')
    setTotalWorkSeconds(0)
    
    const { data: attendance } = await supabase
      .from('attendance')
      .select('clock_in')
      .eq('id', attendanceId)
      .single()

    if (attendance) {
      const clockInTime = new Date(attendance.clock_in).getTime()
      const clockOutTime = new Date().getTime()
      const diffHours = (clockOutTime - clockInTime) / (1000 * 60 * 60)

      await supabase
        .from('attendance')
        .update({
          clock_out: new Date().toISOString(),
          total_working_hours: parseFloat(diffHours.toFixed(2)),
          is_early_leave: new Date().getHours() < 17
        })
        .eq('id', attendanceId)
    }
  }

  const startBreak = async (type: string) => {
    if (!attendanceId) return
    setSessionState('break')
    setActiveBreak(type)
    setTotalBreakSeconds(0)

    const { data } = await supabase
      .from('breaks')
      .insert({
        attendance_id: attendanceId,
        start_time: new Date().toISOString()
      })
      .select()
      .single()

    if (data) {
      setBreakRecordId(data.id)
    }
  }

  const endBreak = async () => {
    if (!breakRecordId) return
    setSessionState('working')
    setActiveBreak(null)
    setTotalBreakSeconds(0)

    const { data: brk } = await supabase
      .from('breaks')
      .select('start_time')
      .eq('id', breakRecordId)
      .single()

    if (brk) {
      const startTime = new Date(brk.start_time).getTime()
      const endTime = new Date().getTime()
      const durationMins = Math.round((endTime - startTime) / (1000 * 60))

      await supabase
        .from('breaks')
        .update({
          end_time: new Date().toISOString(),
          duration_minutes: durationMins
        })
        .eq('id', breakRecordId)
    }
  }

  const handleBreak = (type: string) => {
    if (sessionState === "break" && activeBreak === type) {
      endBreak()
    } else {
      startBreak(type)
    }
  }

  const dailyTarget = 28800
  const progressPercent = Math.min((totalWorkSeconds / dailyTarget) * 100, 100)

  const breakOptions = [
    { type: 'lunch', label: 'Lunch Break', icon: <Pizza className="w-5 h-5" />, color: 'bg-orange-500' },
    { type: 'food', label: 'Snack/Coffee', icon: <Coffee className="w-5 h-5" />, color: 'bg-amber-600' },
    { type: 'personal', label: 'Personal', icon: <User className="w-5 h-5" />, color: 'bg-blue-500' },
    { type: 'emergency', label: 'Emergency', icon: <AlertTriangle className="w-5 h-5" />, color: 'bg-destructive' },
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
          <Card className="border-border/60 shadow-lg relative overflow-hidden">
            <div className={`absolute top-0 -left-1/4 w-1/2 h-full blur-[100px] rounded-full opacity-20 transition-colors duration-1000 ${
              sessionState === 'working' ? 'bg-primary' : 
              sessionState === 'break' ? 'bg-amber-500' : 'bg-transparent'
            }`} />

            <CardContent className="p-8 relative z-10 flex flex-col items-center justify-center text-center py-16">
              
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
                {sessionState === 'idle' && !attendanceId ? (
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-lg rounded-full shadow-primary/25 hover:shadow-primary/40 transition-all font-semibold gap-2"
                    onClick={startWork}
                  >
                    <Play className="fill-current w-5 h-5" /> Start Work Session
                  </Button>
                ) : sessionState === 'idle' && attendanceId ? (
                  <Button 
                    size="lg" 
                    disabled
                    className="h-14 px-8 text-lg rounded-full shadow-primary/25 font-semibold gap-2"
                  >
                    Session Completed Today
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      variant="destructive"
                      className="h-14 px-8 text-lg rounded-full font-semibold gap-2"
                      onClick={endWork}
                    >
                      <Square className="fill-current w-5 h-5" /> End Session
                    </Button>
                    
                    {sessionState === 'break' && (
                      <Button 
                        size="lg" 
                        variant="secondary"
                        className="h-14 px-8 text-lg rounded-full font-semibold gap-2 border border-border"
                        onClick={endBreak}
                      >
                        <Play className="fill-current w-5 h-5" /> Resume Work
                      </Button>
                    )}
                  </>
                )}
              </div>

            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVars} className="flex flex-col gap-6">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Daily Target</CardTitle>
              <CardDescription>8 hours default requirement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 relative mt-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-3xl font-bold">{Math.floor(progressPercent)}%</span>
                  <span className="text-sm text-muted-foreground font-medium">of 8h 00m</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVars} className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Break Management</CardTitle>
              <CardDescription>Take allowed breaks without accruing penalties.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {breakOptions.map((b) => {
                  const isActive = sessionState === 'break' && activeBreak === b.type;
                  const isDisabled = sessionState === 'idle';

                  return (
                    <button
                      key={b.type}
                      disabled={isDisabled}
                      onClick={() => handleBreak(b.type)}
                      className={`relative flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-300 gap-3
                        ${isDisabled ? 'opacity-50 cursor-not-allowed bg-muted/50 border-transparent' : 
                          isActive ? `border-${b.color.split('-')[1]}-500/50 bg-${b.color.split('-')[1]}-500/10 shadow-sm ring-1 ring-${b.color.split('-')[1]}-500` : 
                          'hover:border-border hover:bg-card hover:shadow-sm bg-background border-border/40'}
                      `}
                    >
                      <div className={`p-3 rounded-full text-white ${b.color} shadow-sm transition-transform ${isActive ? 'scale-110' : ''}`}>
                        {b.icon}
                      </div>
                      <span className="font-semibold text-sm">
                        {isActive ? 'Resume Work' : b.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
