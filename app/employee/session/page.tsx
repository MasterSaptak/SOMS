"use client"

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
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
  Activity,
  Clock,
  Sun,
  Moon,
  Sunrise,
  LogOut,
  CheckCircle2,
  Loader2,
  Timer,
  Zap,
  TrendingUp,
  CalendarDays,
  ShieldAlert,
  BarChart3,
  XCircle,
  ChevronRight,
  RotateCcw,
} from 'lucide-react'
import { formatTime } from '@/lib/format-time'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// Extracted Components
import { CircularProgress } from './_components/circular-progress'
import { StatusBadge } from './_components/status-badge'
import { SmartWarning } from './_components/smart-warning'
import { EarlyExitDialog } from './_components/early-exit-dialog'
import { SessionSummaryDialog } from './_components/session-summary-dialog'
import { InteractiveTimeline } from './_components/interactive-timeline'
import { SessionResultCard } from './_components/session-result-card'

// ============================================================
// Constants
// ============================================================
const NORMAL_WORK_SECONDS = 4 * 3600 // 4h
const MAX_BUFFER_SECONDS = 30 * 60 // 30m

// ============================================================
// Animation Variants
// ============================================================
const containerVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVars: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

// ============================================================
// Helper: Greeting
// ============================================================
function getGreeting(): { text: string; icon: React.ReactNode } {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good Morning', icon: <Sunrise className="w-5 h-5 text-amber-400" /> }
  if (hour < 17) return { text: 'Good Afternoon', icon: <Sun className="w-5 h-5 text-orange-400" /> }
  return { text: 'Good Evening', icon: <Moon className="w-5 h-5 text-indigo-400" /> }
}

// ============================================================
// Main Page
// ============================================================
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

  const [currentTime, setCurrentTime] = useState(new Date())
  const [employeeName, setEmployeeName] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [isEarlyExit, setIsEarlyExit] = useState(false)
  const [showEarlyExitDialog, setShowEarlyExitDialog] = useState(false)
  const [showSummaryDialog, setShowSummaryDialog] = useState(false)
  const [activeWarning, setActiveWarning] = useState<{ message: string; type: 'info' | 'warning' | 'urgent' } | null>(null)
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<number>>(new Set())
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null)
  const autoEndTriggeredRef = useRef(false)

  // Session summary data (populated on end)
  const [summaryData, setSummaryData] = useState<{
    startTime: string | null
    endTime: string
    sessionDurationSeconds: number
    effectiveWorkSeconds: number
    breaks: { type: string; durationSeconds: number }[]
    totalBreakSeconds: number
    compensationEarned: number
    completionPercent: number
    status: 'completed' | 'ended_early'
    reason?: string
    notes?: string
  } | null>(null)

  // Compensation Engine State
  const [initialCompensationBalanceSeconds, setInitialCompensationBalanceSeconds] = useState(0)

  // Clock-in time (for summary)
  const [clockInTime, setClockInTime] = useState<string | null>(null)

  // Break records (for summary)
  const [breakRecords, setBreakRecords] = useState<{ type: string; start_time: string; end_time: string | null; duration_minutes: number | null }[]>([])
  const [isRemote, setIsRemote] = useState(false)

  // Session analytics (from past data)
  const [sessionAnalytics, setSessionAnalytics] = useState({
    totalSessions: 0,
    completedSessions: 0,
    earlyQuitSessions: 0,
    avgWorkedHours: 0,
    totalCompensationRecovered: 0,
    pendingBalance: 0,
    attendanceRate: 0,
  })

  // Live Clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Load state & calculate compensation
  useEffect(() => {
    async function initSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: emp } = await supabase
        .from('employees')
        .select('id, full_name')
        .eq('user_id', user.id)
        .single()

      if (!emp) return
      setEmployeeId(emp.id)
      setEmployeeName(emp.full_name || '')

      const today = new Date().toISOString().split('T')[0]

      // Calculate Historical Compensation Balance
      const { data: pastAttendance } = await supabase
        .from('attendance')
        .select('date, total_working_hours')
        .eq('employee_id', emp.id)
        .neq('date', today)
        .not('clock_out', 'is', null)
        .order('date', { ascending: true })

      let balanceHours = 0
      let totalSessions = 0
      let earlyQuits = 0
      let totalWorkedAll = 0
      let compRecovered = 0

      if (pastAttendance) {
        totalSessions = pastAttendance.length
        pastAttendance.forEach((record: any) => {
          const hours = record.total_working_hours || 0
          totalWorkedAll += hours
          // if (record.is_early_leave) earlyQuits++
          if (hours < 4) {
            balanceHours += (4 - hours)
          } else if (hours > 4) {
            const recovered = Math.min(hours - 4, 0.5)
            compRecovered += recovered
            balanceHours = Math.max(0, balanceHours - (hours - 4))
          }
        })
      }

      setInitialCompensationBalanceSeconds(balanceHours * 3600)
      setSessionAnalytics({
        totalSessions,
        completedSessions: totalSessions - earlyQuits,
        earlyQuitSessions: earlyQuits,
        avgWorkedHours: totalSessions > 0 ? Math.round((totalWorkedAll / totalSessions) * 10) / 10 : 0,
        totalCompensationRecovered: Math.round(compRecovered * 10) / 10,
        pendingBalance: Math.round(balanceHours * 10) / 10,
        attendanceRate: totalSessions > 0 ? Math.round(((totalSessions - earlyQuits) / totalSessions) * 100) : 0,
      })

      // Current Day Attendance
      const { data: attendance } = await supabase
        .from('attendance')
        .select(`*, breaks(*)`)
        .eq('employee_id', emp.id)
        .eq('date', today)
        .single()

      if (attendance) {
        setAttendanceId(attendance.id)
        setClockInTime(attendance.clock_in)
        setBreakRecords((attendance.breaks as any) || [])

        if (attendance.clock_out) {
          setSessionState('idle')
          setIsCompleted(true)
          setIsEarlyExit(false)

          if (attendance.clock_in) {
            const clockIn = new Date(attendance.clock_in).getTime()
            const clockOut = new Date(attendance.clock_out).getTime()
            let workedSecs = Math.floor((clockOut - clockIn) / 1000)
            const breaks = attendance.breaks || []
            breaks.forEach((b: any) => {
              if (b.end_time) {
                workedSecs -= Math.floor((new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / 1000)
              }
            })
            setTotalWorkSeconds(Math.max(workedSecs, 0))
          }
        } else {
          const breaks = attendance.breaks || []
          const activeBreakRecord = breaks.find((b: any) => !b.end_time)

          if (activeBreakRecord) {
            setSessionState('break')
            setBreakRecordId(activeBreakRecord.id)
            setActiveBreak('lunch')
            setBreakStartTime(new Date(activeBreakRecord.start_time))
          } else {
            setSessionState('working')
          }

          const clockIn = new Date(attendance.clock_in).getTime()
          const now = new Date().getTime()
          let diffSecs = Math.floor((now - clockIn) / 1000)

          breaks.forEach((b: any) => {
            if (b.end_time) {
              const breakDur = Math.floor((new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / 1000)
              diffSecs -= breakDur
            } else {
              const activeDur = Math.floor((now - new Date(b.start_time).getTime()) / 1000)
              diffSecs -= activeDur
              setTotalBreakSeconds(activeDur)
            }
          })

          setTotalWorkSeconds(diffSecs > 0 ? diffSecs : 0)
        }
      }
      setIsLoading(false)
    }

    initSession()
  }, [])

  // Timer tick
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

  // ============================================================
  // Compensation Engine Derived Values
  // ============================================================
  const compensationAvailableToday = Math.min(MAX_BUFFER_SECONDS, initialCompensationBalanceSeconds)
  const dynamicDailyLimitSeconds = NORMAL_WORK_SECONDS + compensationAvailableToday

  const recoveredTodaySeconds = totalWorkSeconds > NORMAL_WORK_SECONDS
    ? Math.min(totalWorkSeconds - NORMAL_WORK_SECONDS, compensationAvailableToday)
    : 0
  const remainingBalanceSeconds = Math.max(0, initialCompensationBalanceSeconds - recoveredTodaySeconds)

  const progressPercent = Math.min((totalWorkSeconds / dynamicDailyLimitSeconds) * 100, 100)
  const remainingSeconds = Math.max(dynamicDailyLimitSeconds - totalWorkSeconds, 0)
  const isUsingCompensation = totalWorkSeconds > NORMAL_WORK_SECONDS
  const productivityPercent = totalWorkSeconds > 0
    ? Math.round((totalWorkSeconds / (totalWorkSeconds + totalBreakSeconds)) * 100)
    : 0

  // Auto-end
  useEffect(() => {
    if (totalWorkSeconds >= dynamicDailyLimitSeconds && sessionState === 'working' && !autoEndTriggeredRef.current) {
      autoEndTriggeredRef.current = true
      handleAutoEnd()
    }
  }, [totalWorkSeconds, dynamicDailyLimitSeconds, sessionState])

  // ============================================================
  // Build Summary Data
  // ============================================================
  const buildSummary = useCallback((status: 'completed' | 'ended_early', reason?: string, notes?: string) => {
    const endTime = new Date().toISOString()
    const startMs = clockInTime ? new Date(clockInTime).getTime() : Date.now()
    const endMs = new Date(endTime).getTime()
    const sessionDuration = Math.floor((endMs - startMs) / 1000)

    const breaksSummary = breakRecords
      .filter(b => b.end_time)
      .map(b => ({
        type: b.type || 'break',
        durationSeconds: Math.floor((new Date(b.end_time!).getTime() - new Date(b.start_time).getTime()) / 1000),
      }))

    const totalBrkSecs = breaksSummary.reduce((acc, b) => acc + b.durationSeconds, 0)
    const effectiveWork = Math.max(sessionDuration - totalBrkSecs, 0)
    const compEarned = effectiveWork > NORMAL_WORK_SECONDS
      ? Math.min(effectiveWork - NORMAL_WORK_SECONDS, MAX_BUFFER_SECONDS)
      : 0

    const completion = Math.min(Math.round((effectiveWork / NORMAL_WORK_SECONDS) * 100), 100)

    setSummaryData({
      startTime: clockInTime,
      endTime,
      sessionDurationSeconds: sessionDuration,
      effectiveWorkSeconds: effectiveWork,
      breaks: breaksSummary,
      totalBreakSeconds: totalBrkSecs,
      compensationEarned: compEarned,
      completionPercent: completion,
      status,
      reason,
      notes,
    })
    setShowSummaryDialog(true)
  }, [clockInTime, breakRecords])

  const handleAutoEnd = async () => {
    if (!attendanceId) return

    const { data: attendance } = await supabase
      .from('attendance')
      .select('clock_in')
      .eq('id', attendanceId)
      .single()

    if (attendance) {
      const clockIn = new Date(attendance.clock_in).getTime()
      const clockOutTime = new Date().getTime()
      const diffHours = (clockOutTime - clockIn) / (1000 * 60 * 60)

      await supabase
        .from('attendance')
        .update({
          clock_out: new Date().toISOString(),
          total_working_hours: parseFloat(diffHours.toFixed(2))
        })
        .eq('id', attendanceId)
    }

    setSessionState('idle')
    setIsCompleted(true)
    buildSummary('completed')
  }

  // Smart Warnings
  useEffect(() => {
    if (sessionState !== 'working') return

    const dynamicWarnings = [
      { seconds: 2 * 3600, message: "Consider taking a short break. ðŸ§˜", type: 'info' as const },
      { seconds: Math.max(2 * 3600 + 1, dynamicDailyLimitSeconds - 45 * 60), message: "You're approaching today's work limit. â°", type: 'warning' as const },
      { seconds: Math.max(2 * 3600 + 2, dynamicDailyLimitSeconds - 10 * 60), message: "Only 10 minutes remaining! âš¡", type: 'urgent' as const },
    ]

    for (const threshold of dynamicWarnings) {
      const diff = totalWorkSeconds - threshold.seconds
      if (diff >= 0 && diff < 5 && !dismissedWarnings.has(threshold.seconds)) {
        setActiveWarning({ message: threshold.message, type: threshold.type })
        return
      }
    }
  }, [totalWorkSeconds, sessionState, dismissedWarnings, dynamicDailyLimitSeconds])

  const dismissWarning = useCallback(() => {
    if (activeWarning) {
      setDismissedWarnings(prev => {
        const next = new Set(prev)
        next.add(Math.max(2 * 3600 + 1, dynamicDailyLimitSeconds - 45 * 60))
        next.add(Math.max(2 * 3600 + 2, dynamicDailyLimitSeconds - 10 * 60))
        next.add(2 * 3600)
        return next
      })
    }
    setActiveWarning(null)
  }, [activeWarning, dynamicDailyLimitSeconds])

  // ============================================================
  // DB Actions
  // ============================================================
  const startWork = async () => {
    if (!employeeId || attendanceId) return
    if (isCompleted) return

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('attendance')
      .upsert({
        employee_id: employeeId,
        date: today,
        clock_in: new Date().toISOString(),
        is_late: new Date().getHours() >= 9,
        clock_out: null,
        total_working_hours: null
      }, { onConflict: 'employee_id,date' })
      .select()
      .single()

    if (error) {
      alert(`Error starting session: ${error.message}`)
      return
    }

    if (data) {
      setAttendanceId(data.id)
      setClockInTime(data.clock_in)
      setSessionState('working')
      autoEndTriggeredRef.current = false
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
      const clockIn = new Date(attendance.clock_in).getTime()
      const clockOutTime = new Date().getTime()
      const diffHours = (clockOutTime - clockIn) / (1000 * 60 * 60)

      const isEarly = diffHours < 4

      // Refresh break records before building summary
      const { data: currentBreaks } = await supabase
        .from('breaks')
        .select('*')
        .eq('attendance_id', attendanceId)

      if (currentBreaks) setBreakRecords(currentBreaks as any)

      const summaryJson = JSON.stringify({
        clock_in: attendance.clock_in,
        clock_out: new Date().toISOString(),
        worked_hours: parseFloat(diffHours.toFixed(2)),
        status: isEarly ? 'ended_early' : 'completed',
      })

      const { error } = await supabase
        .from('attendance')
        .update({
          clock_out: new Date().toISOString(),
          total_working_hours: parseFloat(diffHours.toFixed(2))
        })
        .eq('id', attendanceId)

      if (error) {
        alert(`Error ending session: ${error.message}`)
        return
      }
    }

    setSessionState('idle')
    setIsCompleted(true)
    setIsEarlyExit(false)
    buildSummary('completed')
  }

  const handleEarlyExit = async (reason: string, notes: string) => {
    if (!attendanceId) return

    const { data: attendance } = await supabase
      .from('attendance')
      .select('clock_in')
      .eq('id', attendanceId)
      .single()

    if (attendance) {
      const clockIn = new Date(attendance.clock_in).getTime()
      const clockOutTime = new Date().getTime()
      const diffHours = (clockOutTime - clockIn) / (1000 * 60 * 60)

      // Refresh break records
      const { data: currentBreaks } = await supabase
        .from('breaks')
        .select('*')
        .eq('attendance_id', attendanceId)

      if (currentBreaks) setBreakRecords(currentBreaks as any)

      const summaryJson = JSON.stringify({
        clock_in: attendance.clock_in,
        clock_out: new Date().toISOString(),
        worked_hours: parseFloat(diffHours.toFixed(2)),
        status: 'ended_early',
        reason,
        notes,
      })

      await supabase
        .from('attendance')
        .update({
          clock_out: new Date().toISOString(),
          total_working_hours: parseFloat(diffHours.toFixed(2))
        })
        .eq('id', attendanceId)
    }

    setSessionState('idle')
    setIsCompleted(true)
    setIsEarlyExit(true)
    setShowEarlyExitDialog(false)
    buildSummary('ended_early', reason, notes)
  }

  const startBreak = async (type: string) => {
    if (!attendanceId) {
      alert('Error: Attendance ID is missing. Please restart your session.')
      return
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
      setBreakStartTime(new Date())
      setBreakRecords(prev => [...prev, { ...data, type }])
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

      // Update break records for summary
      setBreakRecords(prev => prev.map(b =>
        b.start_time === brk.start_time
          ? { ...b, end_time: new Date().toISOString(), duration_minutes: durationMins }
          : b
      ))
    }

    setSessionState('working')
    setActiveBreak(null)
    setTotalBreakSeconds(0)
    setBreakStartTime(null)
  }

  const handleBreak = (type: string) => {
    if (sessionState === "break" && activeBreak === type) {
      endBreak()
    } else {
      startBreak(type)
    }
  }

  const resetSession = async () => {
    if (!attendanceId) return
    setIsLoading(true)
    const { error: err1 } = await supabase.from('breaks').delete().eq('attendance_id', attendanceId)
    if (err1) { alert(`Error: ${err1.message}`); setIsLoading(false); return }
    const { error: err2 } = await supabase.from('attendance').delete().eq('id', attendanceId)
    if (err2) { alert(`Error: ${err2.message}`); setIsLoading(false); return }

    setAttendanceId(null)
    setBreakRecordId(null)
    setTotalWorkSeconds(0)
    setTotalBreakSeconds(0)
    setSessionState('idle')
    setActiveBreak(null)
    setIsCompleted(false)
    setIsEarlyExit(false)
    setClockInTime(null)
    setBreakRecords([])
    setSummaryData(null)
    autoEndTriggeredRef.current = false
    setIsLoading(false)

    // Recalculate compensation
    const today = new Date().toISOString().split('T')[0]
    const { data: pastAttendance } = await supabase
      .from('attendance')
      .select('date, total_working_hours')
      .eq('employee_id', employeeId as string)
      .neq('date', today)
      .not('clock_out', 'is', null)
      .order('date', { ascending: true })

    let balanceHours = 0
    if (pastAttendance) {
      pastAttendance.forEach((record: any) => {
        const hours = record.total_working_hours || 0
        if (hours < 4) balanceHours += (4 - hours)
        else if (hours > 4) balanceHours = Math.max(0, balanceHours - (hours - 4))
      })
    }
    setInitialCompensationBalanceSeconds(balanceHours * 3600)
  }

  const greeting = useMemo(() => getGreeting(), [currentTime.getHours()])
  const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  // Session status label
  const sessionStatusLabel = useMemo(() => {
    if (isCompleted && isEarlyExit) return 'Ended Early'
    if (isCompleted) return 'Completed'
    if (isUsingCompensation && sessionState === 'working') return 'Compensation Time'
    if (sessionState === 'working') return 'Working'
    if (sessionState === 'break') return activeBreak ? `${activeBreak.charAt(0).toUpperCase() + activeBreak.slice(1)} Break` : 'On Break'
    return 'Ready'
  }, [isCompleted, isEarlyExit, isUsingCompensation, sessionState, activeBreak])

  const breakOptions = [
    { type: 'lunch', label: 'Lunch Break', hint: '~30 min', icon: <Pizza className="w-5 h-5" />, color: 'bg-orange-500', activeBg: 'bg-orange-500/15', ring: 'ring-orange-500', border: 'border-orange-500/50', shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]', textColor: 'text-orange-600 dark:text-orange-400' },
    { type: 'food', label: 'Snack/Coffee', hint: '~10 min', icon: <Coffee className="w-5 h-5" />, color: 'bg-amber-500', activeBg: 'bg-amber-500/15', ring: 'ring-amber-500', border: 'border-amber-500/50', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]', textColor: 'text-amber-600 dark:text-amber-400' },
    { type: 'personal', label: 'Personal', hint: '~15 min', icon: <User className="w-5 h-5" />, color: 'bg-purple-500', activeBg: 'bg-purple-500/15', ring: 'ring-purple-500', border: 'border-purple-500/50', shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]', textColor: 'text-purple-600 dark:text-purple-400' },
    { type: 'emergency', label: 'Emergency', hint: 'Urgent', icon: <AlertTriangle className="w-5 h-5" />, color: 'bg-red-500', activeBg: 'bg-red-500/15', ring: 'ring-red-500', border: 'border-red-500/50', shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]', textColor: 'text-red-600 dark:text-red-400' },
  ] as const

  // ============================================================
  // Loading
  // ============================================================
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
        <p className="text-sm text-muted-foreground">Loading workspace...</p>
      </div>
    )
  }

  return (
    <motion.div
      className="flex flex-col gap-4 md:gap-5 max-w-[1400px] mx-auto pb-24 md:pb-12 px-1"
      variants={containerVars}
      initial="hidden"
      animate="show"
    >
      {/* â”€â”€ Header â”€â”€ */}
      <motion.div variants={itemVars} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {greeting.icon}
            <span className="text-xs font-medium text-muted-foreground">{greeting.text}{employeeName ? `, ${employeeName.split(' ')[0]}` : ''}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Work Session</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="rounded-full gap-1.5 h-8 text-[11px] font-semibold text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20" onClick={resetSession}>
            <RotateCcw className="w-3 h-3" /> Dev Reset
          </Button>
          <Link href="/employee/session/history">
            <Button variant="ghost" size="sm" className="rounded-full gap-1.5 h-8 text-[11px] font-semibold text-muted-foreground hover:text-primary">
              <History className="w-3 h-3" /> History <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <CalendarDays className="w-3 h-3" />
            <span>{dayName}, {dateStr}</span>
            <span className="font-mono text-foreground/80 tabular-nums">{timeStr}</span>
          </div>
        </div>
      </motion.div>

      {/* â”€â”€ Smart Warning â”€â”€ */}
      <AnimatePresence>
        {activeWarning && (
          <motion.div variants={itemVars}>
            <SmartWarning message={activeWarning.message} type={activeWarning.type} onDismiss={dismissWarning} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MAIN DASHBOARD GRID
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 md:gap-5 items-start">

        {/* â”€â”€ LEFT COLUMN: Timer + Controls â”€â”€ */}
        <motion.div variants={itemVars} className="flex flex-col gap-4 md:gap-5">

          {/* â•â•â• HERO CARD â•â•â• */}
          <WidgetShell className="relative overflow-hidden bg-surface-elevated">
            {/* Background glow */}
            <div className={`absolute -top-20 -left-20 w-60 h-60 blur-[120px] rounded-full opacity-15 pointer-events-none transition-colors duration-1000 ${
              isCompleted && isEarlyExit ? 'bg-red-500' :
              isCompleted ? 'bg-emerald-500' :
              isUsingCompensation ? 'bg-indigo-500' :
              sessionState === 'working' ? 'bg-primary' :
              sessionState === 'break' ? 'bg-amber-500' : 'bg-transparent'
            }`} />

            <div className="relative z-10 p-4 sm:p-5 md:p-6">
              {/* Status bar */}
              <div className="flex justify-between items-center mb-4">
                <StatusBadge sessionState={sessionState} activeBreak={activeBreak} isCompleted={isCompleted} isEarlyExit={isEarlyExit} isUsingCompensation={isUsingCompensation} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                  Scheduled: {formatTime(NORMAL_WORK_SECONDS)}
                </span>
              </div>

              {/* â”€â”€ Timer + Stats â€” Stacked Vertically â”€â”€ */}
              <div className="flex flex-col items-center gap-5">
                {/* Circular Timer ── responsive container */}
                <div className="w-[clamp(140px,28vw,200px)] aspect-square">
                  <CircularProgress
                    value={progressPercent}
                    size={200}
                    strokeWidth={10}
                    containerClassName="w-full h-full"
                    color={
                      isCompleted && isEarlyExit ? 'stroke-red-500' :
                      isCompleted ? 'stroke-emerald-500' :
                      isUsingCompensation ? 'stroke-indigo-500' :
                      'stroke-primary'
                    }
                    glowColor={sessionState === 'working' ? (isUsingCompensation ? 'indigo' : 'primary') : undefined}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <motion.span
                        key="session"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ fontSize: 'clamp(1.25rem, 3.5vw, 2.25rem)' }}
                        className={`font-mono font-black tracking-tighter tabular-nums leading-none ${isUsingCompensation && sessionState === 'working' ? 'text-indigo-500' : ''}`}
                      >
                        {formatTime(totalWorkSeconds + totalBreakSeconds)}
                      </motion.span>
                      <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                        {Math.floor(progressPercent)}% • {sessionState === 'break' ? 'Break (Counting...)' : 'Full Session'}
                      </span>
                    </div>
                  </CircularProgress>
                </div>

                {/* ─── KPI Stats Grid ── color-coded, no clipping ─── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                  {/* Full Session */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 transition-colors">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-emerald-600/70 dark:text-emerald-400/70 flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 shrink-0" /> Full Session
                    </span>
                    <span className={`text-base sm:text-lg font-black font-mono tabular-nums tracking-tight leading-none ${isUsingCompensation ? 'text-indigo-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {formatTime(totalWorkSeconds + totalBreakSeconds)}
                    </span>
                  </div>
                  {/* Remaining */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-sky-500/5 border border-sky-500/15 transition-colors">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-sky-600/70 dark:text-sky-400/70 flex items-center gap-1.5">
                      <Timer className="w-3 h-3 shrink-0" /> Remaining Time
                    </span>
                    <span className={`text-base sm:text-lg font-black font-mono tabular-nums tracking-tight leading-none ${remainingSeconds <= 600 ? 'text-red-500 animate-pulse' : 'text-sky-600 dark:text-sky-400'}`}>
                      {formatTime(remainingSeconds)}
                    </span>
                  </div>
                  {/* Limit */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-violet-500/5 border border-violet-500/15 transition-colors">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-violet-600/70 dark:text-violet-400/70 flex items-center gap-1.5">
                      <Activity className="w-3 h-3 shrink-0" /> Daily Limit
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono tabular-nums tracking-tight leading-none text-violet-600 dark:text-violet-400">
                      {formatTime(dynamicDailyLimitSeconds)}
                    </span>
                  </div>
                  {/* Break */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 transition-colors">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-amber-600/70 dark:text-amber-400/70 flex items-center gap-1.5">
                      <Coffee className="w-3 h-3 shrink-0" /> Break Time
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono tabular-nums tracking-tight leading-none text-amber-600 dark:text-amber-400">
                      {formatTime(totalBreakSeconds)}
                    </span>
                  </div>
                </div>
              </div>

              {/* â”€â”€ Interactive Timeline â”€â”€ */}
              <div className="w-full mt-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Daily Progress</span>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground tabular-nums">
                    {formatTime(totalWorkSeconds)} / {formatTime(dynamicDailyLimitSeconds)}
                  </span>
                </div>
                <InteractiveTimeline
                  clockInIso={clockInTime}
                  breaks={breakRecords}
                  currentTimeIso={new Date().toISOString()}
                  officeHoursSeconds={NORMAL_WORK_SECONDS}
                  maxDurationSeconds={dynamicDailyLimitSeconds}
                  sessionState={sessionState}
                />
              </div>

              {/* â”€â”€ Break Management â€” Action Cards â”€â”€ */}
              <div className="w-full mt-5 pt-4 border-t border-border/40">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5" /> Break Management
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {breakOptions.map((b) => {
                    const isActive = sessionState === 'break' && activeBreak === b.type
                    const isDisabled = sessionState === 'idle' || isCompleted

                    return (
                      <button
                        key={b.type}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleBreak(b.type)}
                        className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all duration-300 gap-2 overflow-hidden h-full
                          ${!isDisabled && 'hover:scale-[1.03] active:scale-[0.97]'}
                          ${isDisabled ? 'opacity-40 cursor-not-allowed bg-muted/30 border-transparent' :
                            isActive ? `${b.border} ${b.activeBg} ${b.shadow} ring-2 ${b.ring}` :
                            'hover:border-border hover:shadow-md bg-background/60 border-border/30'}`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeBreakBg"
                            className={`absolute inset-0 ${b.activeBg} pointer-events-none`}
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          />
                        )}
                        <div className={`p-2.5 rounded-xl text-white ${b.color} shadow-sm transition-all duration-300 relative z-10 ${isActive ? 'scale-105 shadow-lg' : 'group-hover:scale-110'}`}>
                          {React.cloneElement(b.icon as React.ReactElement, { className: 'w-4 h-4' } as any)}
                        </div>
                        <div className="flex flex-col items-center gap-0.5 relative z-10">
                          <span className="font-semibold text-[11px] sm:text-xs text-center leading-tight">
                            {isActive ? 'End Break' : b.label}
                          </span>
                          {!isActive && (
                            <span className="text-[9px] text-muted-foreground font-medium">{b.hint}</span>
                          )}
                        </div>
                        {isActive && (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-[10px] font-mono font-bold relative z-10 tabular-nums ${b.textColor}`}>
                            {formatTime(totalBreakSeconds)}
                          </motion.span>
                        )}
                        {!isActive && !isDisabled && (
                          <span className={`text-[9px] font-bold uppercase tracking-wider relative z-10 ${b.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                            Start
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* â”€â”€ Action Buttons â”€â”€ */}
              <div className="flex flex-col w-full items-center justify-center mt-5 pt-4 border-t border-border/40">
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div key="completed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full">
                      <SessionResultCard
                        isEarlyExit={isEarlyExit}
                        workedHours={totalWorkSeconds / 3600}
                        officeHours={NORMAL_WORK_SECONDS / 3600}
                        earlyExitReason={summaryData?.reason}
                        compensationAdded={summaryData?.compensationEarned ? summaryData.compensationEarned / 60 : undefined}
                      />
                      <div className="flex justify-center mt-3">
                        {summaryData && (
                          <Button variant="ghost" size="sm" onClick={() => setShowSummaryDialog(true)} className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full text-xs">
                            <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> View Full Report
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ) : sessionState === 'idle' && !attendanceId ? (
                    <motion.div key="start" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        size="lg"
                        className="h-12 px-8 text-base rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all duration-300 font-semibold gap-2 group"
                        onClick={startWork}
                      >
                        <Play className="fill-current w-4 h-4 group-hover:scale-110 transition-transform" /> Start Work Session
                      </Button>
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border border-border/40 rounded-full cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => setIsRemote(!isRemote)}>
                        <div className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors ${isRemote ? 'bg-orange-500' : 'bg-muted-foreground/30'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isRemote ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">Remote</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:justify-center">
                      {sessionState === 'break' && (
                        <Button size="lg" className="h-11 px-6 text-sm rounded-full font-semibold gap-2 shadow-[0_0_15px_rgba(var(--primary),0.3)] bg-primary text-primary-foreground group" onClick={endBreak}>
                          <Play className="fill-current w-4 h-4 group-hover:scale-110 transition-transform" /> Resume Work
                        </Button>
                      )}
                      <Button
                        size="lg"
                        variant={sessionState === 'working' ? 'destructive' : 'secondary'}
                        className={`h-11 px-6 text-sm rounded-full font-semibold gap-2 group border ${
                          sessionState === 'working' ? 'shadow-[0_0_15px_rgba(220,38,38,0.3)] border-transparent' : 'shadow-sm border-border'
                        }`}
                        onClick={endWork}
                      >
                        <Square className="fill-current w-4 h-4 group-hover:scale-110 transition-transform" />
                        {isUsingCompensation ? 'End Recovery' : 'End Session'}
                      </Button>
                      {sessionState === 'working' && (
                        <Button size="lg" variant="ghost" className="h-11 px-4 text-xs rounded-full font-medium gap-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20" onClick={() => setShowEarlyExitDialog(true)}>
                          <LogOut className="w-3.5 h-3.5" /> End Today&apos;s Session
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </WidgetShell>
        </motion.div>

        {/* â”€â”€ RIGHT COLUMN: Compensation + Analytics â”€â”€ */}
        <motion.div variants={itemVars} className="flex flex-col gap-4 md:gap-5">
          {/* â•â•â• Compensation Policy Card â•â•â• */}
          <WidgetShell className="bg-surface-elevated overflow-hidden relative group border-orange-500/10">
            <div className="absolute top-0 right-0 p-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
              <ShieldAlert className="w-24 h-24 text-orange-500" />
            </div>

            <div className="relative z-10 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border/40">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-xs tracking-tight">Compensation Policy</h3>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Recovery Engine</p>
                </div>
              </div>

              {/* Policy stats */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center bg-muted/20 px-3 py-2.5 rounded-xl border border-border/30">
                  <span className="text-[11px] font-medium text-muted-foreground">Official Work Time</span>
                  <span className="text-xs font-mono font-bold tabular-nums">04:00:00</span>
                </div>
                <div className="flex justify-between items-center bg-orange-500/5 px-3 py-2.5 rounded-xl border border-orange-500/15">
                  <span className="text-[11px] font-medium text-orange-600 dark:text-orange-400">Comp. Available</span>
                  <span className="text-xs font-mono font-bold tabular-nums text-orange-600 dark:text-orange-400">{formatTime(compensationAvailableToday)}</span>
                </div>
                <div className="flex justify-between items-center bg-primary/5 px-3 py-2.5 rounded-xl border border-primary/15">
                  <span className="text-[11px] font-bold text-primary">Today&apos;s Max Limit</span>
                  <span className="text-xs font-mono font-black tabular-nums text-primary">{formatTime(dynamicDailyLimitSeconds)}</span>
                </div>
              </div>

              <div className="h-px bg-border/30 my-1" />

              {/* Balance details */}
              <div className="space-y-3 mt-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Missing Hours</span>
                  <span className="text-base font-mono font-black text-red-500 tabular-nums">-{formatTime(initialCompensationBalanceSeconds)}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Recovered Today</span>
                  <span className={`text-base font-mono font-black tabular-nums ${recoveredTodaySeconds > 0 ? 'text-emerald-500' : 'text-muted-foreground/50'}`}>+{formatTime(recoveredTodaySeconds)}</span>
                </div>
                <div className="pt-2 border-t border-border/30 flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Remaining Balance</span>
                  <span className={`text-lg font-mono font-black tabular-nums ${remainingBalanceSeconds > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {remainingBalanceSeconds > 0 ? '-' : ''}{formatTime(remainingBalanceSeconds)}
                  </span>
                </div>
              </div>

              <p className="text-[9px] text-muted-foreground/60 leading-relaxed mt-4 pt-3 border-t border-border/30">
                * Extra time is only permitted to recover a negative balance. Auto clock-out at daily limit.
              </p>
            </div>
          </WidgetShell>

          {/* â•â•â• Session Analytics (compact) â•â•â• */}
          <WidgetShell className="bg-surface-elevated">
            <div className="flex items-center gap-1.5 mb-3">
              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Session Analytics</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Sessions', value: sessionAnalytics.totalSessions.toString(), color: '' },
                { label: 'Completed', value: sessionAnalytics.completedSessions.toString(), color: 'text-emerald-500' },
                { label: 'Early Quits', value: sessionAnalytics.earlyQuitSessions.toString(), color: sessionAnalytics.earlyQuitSessions > 0 ? 'text-red-500' : '' },
                { label: 'Avg. Hours', value: `${sessionAnalytics.avgWorkedHours}h`, color: '' },
                { label: 'Comp. Recovered', value: `${sessionAnalytics.totalCompensationRecovered}h`, color: 'text-indigo-500' },
                { label: 'Pending', value: `${sessionAnalytics.pendingBalance}h`, color: sessionAnalytics.pendingBalance > 0 ? 'text-red-500' : 'text-emerald-500' },
                { label: 'Attendance', value: `${sessionAnalytics.attendanceRate}%`, color: sessionAnalytics.attendanceRate >= 80 ? 'text-emerald-500' : 'text-amber-500' },
              ].map(stat => (
                <div key={stat.label} className="flex justify-between items-center px-2.5 py-2 rounded-xl bg-muted/15 border border-border/20">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</span>
                  <span className={`text-sm font-black tabular-nums ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </WidgetShell>
        </motion.div>
      </div>

      {/* â”€â”€ Dialogs â”€â”€ */}
      <AnimatePresence>
        {showEarlyExitDialog && (
          <EarlyExitDialog totalWorkSeconds={totalWorkSeconds} normalWorkSeconds={NORMAL_WORK_SECONDS} onConfirm={handleEarlyExit} onClose={() => setShowEarlyExitDialog(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSummaryDialog && summaryData && (
          <SessionSummaryDialog
            startTime={summaryData.startTime} endTime={summaryData.endTime}
            sessionDurationSeconds={summaryData.sessionDurationSeconds} effectiveWorkSeconds={summaryData.effectiveWorkSeconds}
            breaks={summaryData.breaks} totalBreakSeconds={summaryData.totalBreakSeconds}
            compensationEarned={summaryData.compensationEarned} completionPercent={summaryData.completionPercent}
            status={summaryData.status} reason={summaryData.reason} notes={summaryData.notes}
            onClose={() => setShowSummaryDialog(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

