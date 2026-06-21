"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  UserPlus,
  TrendingUp,
  ArrowRightLeft,
  Flame,
  CheckCircle2,
  Award,
  AlertTriangle,
  CalendarRange,
  Star,
  DollarSign,
  LogOut,
  Search,
  Filter,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

type TimelineEventType = 'joined' | 'promotion' | 'transfer' | 'attendance_milestone' | 'task_completed' | 'award' | 'warning' | 'leave' | 'review' | 'salary_revision' | 'exit'

interface TimelineEvent {
  id: string
  eventType: TimelineEventType
  title: string
  description: string
  date: string
  metadata?: Record<string, string>
}

const EVENT_TYPE_CONFIG: Record<TimelineEventType, { icon: React.ReactNode; color: string; bg: string }> = {
  joined: { icon: <UserPlus className="w-4 h-4" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  promotion: { icon: <TrendingUp className="w-4 h-4" />, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' },
  transfer: { icon: <ArrowRightLeft className="w-4 h-4" />, color: 'text-cyan-500', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  attendance_milestone: { icon: <Flame className="w-4 h-4" />, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/30' },
  task_completed: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  award: { icon: <Award className="w-4 h-4" />, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' },
  warning: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
  leave: { icon: <CalendarRange className="w-4 h-4" />, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/30' },
  review: { icon: <Star className="w-4 h-4" />, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  salary_revision: { icon: <DollarSign className="w-4 h-4" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  exit: { icon: <LogOut className="w-4 h-4" />, color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/30' },
}

const MOCK_TIMELINE: TimelineEvent[] = [
  { id: 'tl1', eventType: 'joined', title: 'Joined SOMS', description: 'Started as Product Designer in the Design department', date: '2025-03-15', metadata: { department: 'Design', designation: 'Product Designer' } },
  { id: 'tl2', eventType: 'task_completed', title: 'First Task Completed', description: 'Completed "Welcome Onboarding Checklist" — unlocked "First Blood" achievement', date: '2025-03-20' },
  { id: 'tl3', eventType: 'attendance_milestone', title: '30-Day Attendance Streak', description: 'Maintained perfect attendance for 30 consecutive working days', date: '2025-05-01' },
  { id: 'tl4', eventType: 'leave', title: 'Casual Leave', description: 'Took 2 days casual leave for personal errands', date: '2025-06-05', metadata: { days: '2', type: 'Casual' } },
  { id: 'tl5', eventType: 'review', title: 'Q2 Performance Review', description: 'Received "Exceeds Expectations" rating. Strengths: design quality, collaboration. Growth area: documentation.', date: '2025-07-15', metadata: { rating: 'Exceeds Expectations' } },
  { id: 'tl6', eventType: 'award', title: 'Employee of the Month', description: 'Recognized for outstanding contributions to the Design System revamp project', date: '2025-08-01' },
  { id: 'tl7', eventType: 'salary_revision', title: 'Salary Revision', description: 'Annual salary revision effective from September 2025', date: '2025-09-01', metadata: { increment: '15%' } },
  { id: 'tl8', eventType: 'task_completed', title: 'Major Project Delivered', description: 'Led the complete redesign of the Employee Dashboard — shipped to production', date: '2025-10-20' },
  { id: 'tl9', eventType: 'attendance_milestone', title: '7-Day Login Streak', description: 'Logged in for 7 consecutive days — unlocked "On Fire" achievement (Silver)', date: '2026-06-17' },
  { id: 'tl10', eventType: 'award', title: 'Q2 Project Completion Bonus', description: 'Earned 500 reward points for completing Q2 project ahead of schedule', date: '2026-06-10' },
  { id: 'tl11', eventType: 'leave', title: 'Casual Leave Request', description: 'Applied for casual leave Jun 23-24 for family function — pending approval', date: '2026-06-15', metadata: { days: '2', type: 'Casual', status: 'Pending' } },
] as TimelineEvent[];

const ALL_TIMELINE_EVENTS = [...MOCK_TIMELINE].sort((a, b) => b.date.localeCompare(a.date));

const ALL_TYPES: TimelineEventType[] = ['joined', 'promotion', 'transfer', 'attendance_milestone', 'task_completed', 'award', 'warning', 'leave', 'review', 'salary_revision']

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

const itemVars = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 24 } }
}

export default function TimelinePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<Set<TimelineEventType>>(new Set())
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  React.useEffect(() => {
    async function loadEvents() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: emp } = await supabase.from('employees').select('id').eq('user_id', user.id).single()
      if (!emp) return

      const { data } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('employee_id', emp.id)
        .order('date', { ascending: false })

      if (data) {
        const parsed = data.map((d: any) => ({
          id: d.id,
          eventType: d.event_type as TimelineEventType,
          title: d.title,
          description: d.description,
          date: d.date,
          metadata: d.metadata || undefined
        }))
        setEvents(parsed)
      } else {
        // Fallback to MOCK_TIMELINE if no data
        setEvents(ALL_TIMELINE_EVENTS)
      }
      setIsLoading(false)
    }
    loadEvents()
  }, [])

  const filteredEvents = events.filter((event) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!event.title.toLowerCase().includes(q) && !event.description.toLowerCase().includes(q)) {
        return false
      }
    }
    if (selectedTypes.size > 0 && !selectedTypes.has(event.eventType)) {
      return false
    }
    return true
  })

  const toggleType = (type: TimelineEventType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  return (
    <motion.div
      className="flex flex-col gap-6 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Timeline</h1>
        <p className="text-muted-foreground mt-1">Your complete activity history at SOMS</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search timeline..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground mr-1" />
          {ALL_TYPES.map((type) => {
            const config = EVENT_TYPE_CONFIG[type]
            const isSelected = selectedTypes.has(type)
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border transition-all ${
                  isSelected
                    ? `${config.bg} ${config.color}`
                    : 'border-border text-muted-foreground hover:border-primary/20'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            )
          })}
        </div>
      </div>

      {/* Timeline */}
      <motion.div
        className="relative"
        variants={containerVars}
        initial="hidden"
        animate="show"
      >
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

        <div className="flex flex-col gap-1">
          {filteredEvents.map((event, index) => {
            const config = EVENT_TYPE_CONFIG[event.eventType]
            const dateObj = new Date(event.date + 'T00:00:00')
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

            // Show year dividers
            const prevEvent = filteredEvents[index - 1]
            const showYearDivider = !prevEvent || new Date(prevEvent.date + 'T00:00:00').getFullYear() !== dateObj.getFullYear()

            return (
              <React.Fragment key={event.id}>
                {showYearDivider && (
                  <div className="flex items-center gap-3 py-3 pl-2">
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold z-10">
                      {dateObj.getFullYear()}
                    </div>
                  </div>
                )}
                <motion.div
                  variants={itemVars}
                  className="flex items-start gap-4 py-3 pl-2 group"
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-card ${config.bg} ${config.color}`}>
                    {config.icon}
                  </div>

                  {/* Content */}
                  <Card className="flex-1 group-hover:shadow-md transition-shadow border-border/50">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold">{event.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                          {event.metadata && (
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {Object.entries(event.metadata).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-[10px]">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">{formattedDate}</span>
                          <Badge variant="outline" className={`text-[10px] ${config.color} capitalize`}>
                            {event.eventType.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </React.Fragment>
            )
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No timeline events match your filters</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
