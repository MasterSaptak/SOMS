"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { WidgetShell } from '@/components/enterprise/widget-shell'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ChevronDown,
  ChevronUp,
  Coffee,
  Pizza,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Loader2,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import { formatTime } from '@/lib/format-time'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVars: any = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  completed: {
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Completed',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  completed_with_compensation: {
    bg: 'bg-indigo-500/10 border-indigo-500/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    label: 'With Compensation',
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
  },
  ended_early: {
    bg: 'bg-red-500/10 border-red-500/30',
    text: 'text-red-600 dark:text-red-400',
    label: 'Ended Early',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
}

const BREAK_COLORS: Record<string, string> = {
  lunch: 'bg-orange-500',
  food: 'bg-amber-500',
  personal: 'bg-purple-500',
  emergency: 'bg-red-500',
}

const BREAK_ICONS: Record<string, React.ReactNode> = {
  lunch: <Pizza className="w-3 h-3" />,
  food: <Coffee className="w-3 h-3" />,
  personal: <User className="w-3 h-3" />,
  emergency: <AlertTriangle className="w-3 h-3" />,
}

interface HistoryRecord {
  id: string
  date: string
  clock_in: string
  clock_out: string | null
  total_working_hours: number | null
  // is_early_leave: boolean | null
  notes: string | null
  breaks: {
    id: string
    start_time: string
    end_time: string | null
    duration_minutes: number | null
  }[]
}

function getStatus(record: HistoryRecord): string {
  // if (record.is_early_leave) return 'ended_early'
  if ((record.total_working_hours || 0) > 4) return 'completed_with_compensation'
  return 'completed'
}

function HistoryCard({ record, compensationBefore }: { record: HistoryRecord; compensationBefore: number }) {
  const [expanded, setExpanded] = useState(false)
  const status = getStatus(record)
  const style = STATUS_STYLES[status] || STATUS_STYLES.completed

  const workedHours = record.total_working_hours || 0
  const workedSeconds = Math.round(workedHours * 3600)
  const totalBreakMinutes = record.breaks.reduce((acc, b) => acc + (b.duration_minutes || 0), 0)
  const totalBreakSeconds = totalBreakMinutes * 60
  const compensationEarned = workedHours > 4 ? Math.min((workedHours - 4) * 3600, 1800) : 0

  const clockInTime = record.clock_in
    ? new Date(record.clock_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '—'
  const clockOutTime = record.clock_out
    ? new Date(record.clock_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '—'

  const dateFormatted = new Date(record.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  let reason = ''
  if (record.notes) {
    try {
      const parsed = JSON.parse(record.notes)
      reason = parsed.reason || ''
    } catch {
      if (record.notes.startsWith('Early Exit:')) {
        reason = record.notes.replace('Early Exit:', '').trim()
      }
    }
  }

  return (
    <motion.div variants={itemVars}>
      <WidgetShell className="overflow-hidden">
        {/* Main Row */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-4 p-4 md:p-5 text-left hover:bg-muted/20 transition-colors"
        >
          {/* Date */}
          <div className="w-16 md:w-20 shrink-0 text-center">
            <p className="text-lg md:text-xl font-black tabular-nums">
              {new Date(record.date + 'T00:00:00').getDate()}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              {new Date(record.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
            </p>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Time</p>
              <p className="text-xs font-medium truncate">{clockInTime} → {clockOutTime}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Worked</p>
              <p className="text-xs font-mono font-bold">{formatTime(workedSeconds)}</p>
            </div>
            <div className="hidden md:block">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Breaks</p>
              <p className="text-xs font-mono font-bold">{formatTime(totalBreakSeconds)}</p>
            </div>
            <div className="hidden md:block">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Comp. Earned</p>
              <p className={`text-xs font-mono font-bold ${compensationEarned > 0 ? 'text-indigo-500' : 'text-muted-foreground'}`}>
                {compensationEarned > 0 ? `+${formatTime(compensationEarned)}` : '—'}
              </p>
            </div>
          </div>

          {/* Status + Expand */}
          <div className="flex items-center gap-3 shrink-0">
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${style.bg} ${style.text}`}>
              {style.icon} {style.label}
            </span>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </div>
        </button>

        {/* Expanded Timeline */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-2 border-t border-border/30">
                {/* Mobile-only stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 md:hidden">
                  <div className="bg-muted/20 rounded-xl p-3">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Break Time</p>
                    <p className="text-sm font-mono font-bold">{formatTime(totalBreakSeconds)}</p>
                  </div>
                  <div className="bg-muted/20 rounded-xl p-3">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Comp. Earned</p>
                    <p className={`text-sm font-mono font-bold ${compensationEarned > 0 ? 'text-indigo-500' : ''}`}>
                      {compensationEarned > 0 ? `+${formatTime(compensationEarned)}` : '—'}
                    </p>
                  </div>
                </div>

                {/* Visual Timeline */}
                <div className="relative pl-6">
                  <div className="absolute left-2.5 top-0 bottom-0 w-px bg-border/50" />

                  {/* Clock In */}
                  <TimelineEvent
                    color="bg-emerald-500"
                    label="Clocked In"
                    time={clockInTime}
                  />

                  {/* Breaks */}
                  {record.breaks
                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                    .map((b, i) => {
                      const breakStart = new Date(b.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                      const breakEnd = b.end_time
                        ? new Date(b.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : 'In Progress'
                      return (
                        <React.Fragment key={b.id}>
                          <TimelineEvent
                            color="bg-amber-500"
                            label={`Break Started`}
                            time={breakStart}
                            detail={`${b.duration_minutes || 0}m`}
                          />
                          {b.end_time && (
                            <TimelineEvent
                              color="bg-primary"
                              label="Resumed Work"
                              time={breakEnd}
                            />
                          )}
                        </React.Fragment>
                      )
                    })
                  }

                  {/* Clock Out */}
                  <TimelineEvent
                    color={'bg-emerald-500'}
                    label={'Clocked Out'}
                    time={clockOutTime}
                    detail={reason || undefined}
                    isLast
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </WidgetShell>
    </motion.div>
  )
}

function TimelineEvent({ color, label, time, detail, isLast }: {
  color: string
  label: string
  time: string
  detail?: string
  isLast?: boolean
}) {
  return (
    <div className={`relative flex items-start gap-3 ${isLast ? '' : 'pb-4'}`}>
      <div className={`absolute -left-[14px] top-1 w-3 h-3 rounded-full border-2 border-background ${color} shadow-sm z-10`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">{label}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{time}</span>
        </div>
        {detail && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{detail}</p>
        )}
      </div>
    </div>
  )
}

export default function WorkHistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    earlyQuitSessions: 0,
    totalWorkedHours: 0,
    totalBreakHours: 0,
    compensationRecovered: 0,
    attendanceRate: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: emp } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!emp) return

      const { data: attendance } = await supabase
        .from('attendance')
        .select(`*, breaks(*)`)
        .eq('employee_id', emp.id)
        .not('clock_out', 'is', null)
        .order('date', { ascending: false })
        .limit(60)

      if (attendance) {
        setRecords(attendance as any)

        // Compute stats
        const total = attendance.length
        const earlyQuits = 0 // attendance.filter((r: any) => r.is_early_leave).length
        const completed = total - earlyQuits
        const totalWorked = attendance.reduce((acc: number, r: any) => acc + (r.total_working_hours || 0), 0)
        const totalBreaks = attendance.reduce((acc: number, r: any) => {
          return acc + (r.breaks || []).reduce((bAcc: number, b: any) => bAcc + (b.duration_minutes || 0), 0)
        }, 0) / 60

        let compensationRecovered = 0
        attendance.forEach((r: any) => {
          const h = r.total_working_hours || 0
          if (h > 4) compensationRecovered += Math.min(h - 4, 0.5)
        })

        setStats({
          totalSessions: total,
          completedSessions: completed,
          earlyQuitSessions: earlyQuits,
          totalWorkedHours: Math.round(totalWorked * 10) / 10,
          totalBreakHours: Math.round(totalBreaks * 10) / 10,
          compensationRecovered: Math.round(compensationRecovered * 10) / 10,
          attendanceRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        })
      }

      setIsLoading(false)
    }

    load()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
        <p className="text-sm text-muted-foreground">Loading work history...</p>
      </div>
    )
  }

  return (
    <motion.div
      className="flex flex-col gap-5 md:gap-6 max-w-5xl mx-auto pb-24 md:pb-12"
      variants={containerVars}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVars} className="flex items-center gap-4">
        <Link href="/employee/session">
          <Button variant="ghost" size="sm" className="rounded-full gap-2 h-9">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Work History</h1>
          <p className="text-sm text-muted-foreground">View your past work sessions and timeline</p>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div variants={itemVars}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Total Sessions', value: stats.totalSessions.toString(), icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { label: 'Completed', value: stats.completedSessions.toString(), icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> },
            { label: 'Early Quits', value: stats.earlyQuitSessions.toString(), icon: <XCircle className="w-3.5 h-3.5 text-red-500" /> },
            { label: 'Total Hours', value: `${stats.totalWorkedHours}h`, icon: <Clock className="w-3.5 h-3.5" /> },
            { label: 'Break Hours', value: `${stats.totalBreakHours}h`, icon: <Coffee className="w-3.5 h-3.5" /> },
            { label: 'Comp. Recovered', value: `${stats.compensationRecovered}h`, icon: <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" /> },
            { label: 'Attendance', value: `${stats.attendanceRate}%`, icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> },
          ].map(stat => (
            <WidgetShell key={stat.label} className="p-3 md:p-4 text-center">
              <div className="flex flex-col gap-1 items-center">
                {stat.icon}
                <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold leading-tight">{stat.label}</span>
                <span className="text-base md:text-lg font-black tabular-nums">{stat.value}</span>
              </div>
            </WidgetShell>
          ))}
        </div>
      </motion.div>

      {/* Session List */}
      <div className="flex flex-col gap-3">
        {records.length === 0 ? (
          <motion.div variants={itemVars} className="text-center py-16">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">No work sessions found yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Start your first session to see history here.</p>
          </motion.div>
        ) : (
          records.map((record, idx) => {
            // Calculate cumulative compensation balance before this record
            let compBefore = 0
            // Records are sorted newest first, so reverse for calculation
            const olderRecords = records.slice(idx + 1).reverse()
            olderRecords.forEach(r => {
              const h = r.total_working_hours || 0
              if (h < 4) compBefore += (4 - h)
              else if (h > 4) compBefore = Math.max(0, compBefore - (h - 4))
            })

            return <HistoryCard key={record.id} record={record} compensationBefore={compBefore} />
          })
        )}
      </div>
    </motion.div>
  )
}
