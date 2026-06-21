"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Clock,
  MapPin,
  Users,
} from 'lucide-react'

type ViewMode = 'month' | 'week' | 'day'

interface CalendarEvent {
  id: string
  title: string
  type: 'meeting' | 'leave' | 'holiday' | 'birthday' | 'deadline' | 'company_event'
  date: string
  startTime?: string
  endTime?: string
  allDay?: boolean
  location?: string
  attendees?: string[]
  color: string
}

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  meeting: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-l-blue-500' },
  leave: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-l-emerald-500' },
  holiday: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-l-red-500' },
  birthday: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-l-purple-500' },
  deadline: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-l-orange-500' },
  company_event: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-l-cyan-500' },
}

const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'ce1', title: 'Design Review', type: 'meeting', date: '2026-06-20', startTime: '10:00', endTime: '11:00', location: 'Apollo Room', attendees: ['Sarah Chen', 'John Doe'], color: 'blue' },
  { id: 'ce2', title: 'Sprint Planning', type: 'meeting', date: '2026-06-20', startTime: '14:00', endTime: '15:30', location: 'Orion Room', attendees: ['Mike Johnson', 'Alice Wong', 'Bob Martinez'], color: 'blue' },
  { id: 'ce3', title: 'Alice Wong — Medical Leave', type: 'leave', date: '2026-06-20', allDay: true, color: 'emerald' },
  { id: 'ce4', title: 'John Doe — Casual Leave', type: 'leave', date: '2026-06-23', allDay: true, color: 'emerald' },
  { id: 'ce5', title: 'John Doe — Casual Leave', type: 'leave', date: '2026-06-24', allDay: true, color: 'emerald' },
  { id: 'ce6', title: 'Q3 All-Hands Meeting', type: 'company_event', date: '2026-07-01', startTime: '10:00', endTime: '12:00', location: 'Main Auditorium', color: 'cyan' },
  { id: 'ce7', title: 'Independence Day', type: 'holiday', date: '2026-08-15', allDay: true, color: 'red' },
  { id: 'ce8', title: 'API Integration Testing Due', type: 'deadline', date: '2026-06-19', color: 'orange' },
  { id: 'ce9', title: 'HR Sync', type: 'meeting', date: '2026-06-18', startTime: '09:00', endTime: '09:30', location: 'Gemini Room', color: 'blue' },
  { id: 'ce10', title: 'Team Outing', type: 'company_event', date: '2026-07-19', allDay: true, color: 'cyan' },
  { id: 'ce11', title: 'Team Outing', type: 'company_event', date: '2026-07-20', allDay: true, color: 'cyan' },
  { id: 'ce12', title: 'Sarah Chen Birthday 🎂', type: 'birthday', date: '2026-06-25', allDay: true, color: 'purple' },
  { id: 'ce13', title: 'Marketing Landing Page Due', type: 'deadline', date: '2026-06-28', color: 'orange' },
  { id: 'ce14', title: 'CI/CD Pipeline Due', type: 'deadline', date: '2026-06-21', color: 'orange' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const days: { date: number; month: number; year: number; isCurrentMonth: boolean }[] = []

  // Previous month fill
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ date: daysInPrevMonth - i, month: month - 1, year, isCurrentMonth: false })
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: i, month, year, isCurrentMonth: true })
  }

  // Next month fill
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: i, month: month + 1, year, isCurrentMonth: false })
  }

  return days
}

function formatDateKey(year: number, month: number, date: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  const monthDays = getMonthDays(year, month)

  const eventsByDate = MOCK_EVENTS.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = []
    acc[event.date].push(event)
    return acc
  }, {})

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : []

  return (
    <motion.div
      className="flex flex-col gap-6 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage your schedule, meetings, and events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" className="hidden md:flex" onClick={() => {}}>
            <Plus className="w-4 h-4 mr-1" />
            New Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-semibold min-w-[180px] text-center">
                    {MONTHS[month]} {year}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                  {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                        viewMode === mode
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-px mb-1">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px bg-border/30 rounded-xl overflow-hidden">
                {monthDays.map((day, index) => {
                  const dateKey = formatDateKey(day.year, day.month, day.date)
                  const dayEvents = eventsByDate[dateKey] || []
                  const isToday = dateKey === todayKey
                  const isSelected = dateKey === selectedDate

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`min-h-[100px] p-1.5 text-left transition-all border border-transparent hover:border-primary/20 ${
                        day.isCurrentMonth ? 'bg-card' : 'bg-muted/30'
                      } ${isSelected ? 'ring-2 ring-primary/30 bg-primary/5' : ''}`}
                    >
                      <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-primary text-primary-foreground'
                          : day.isCurrentMonth
                          ? 'text-foreground'
                          : 'text-muted-foreground/50'
                      }`}>
                        {day.date}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {dayEvents.slice(0, 3).map((event) => {
                          const colors = EVENT_COLORS[event.type]
                          return (
                            <div
                              key={event.id}
                              className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium border-l-2 ${colors.bg} ${colors.text} ${colors.border}`}
                            >
                              {event.title}
                            </div>
                          )
                        })}
                        {dayEvents.length > 3 && (
                          <span className="text-[10px] text-muted-foreground pl-1.5">
                            +{dayEvents.length - 3} more
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Selected Day Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                {selectedDate
                  ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                  : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {selectedDate ? 'No events on this day' : 'Click a date to see events'}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedEvents.map((event) => {
                    const colors = EVENT_COLORS[event.type]
                    return (
                      <div
                        key={event.id}
                        className={`p-3 rounded-xl border-l-4 ${colors.bg} ${colors.border}`}
                      >
                        <h4 className={`text-sm font-semibold ${colors.text}`}>{event.title}</h4>
                        {event.startTime && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {event.startTime} — {event.endTime}
                          </div>
                        )}
                        {event.allDay && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                            <CalendarDays className="w-3 h-3" />
                            All day
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            {event.attendees.join(', ')}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Type Legend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {Object.entries(EVENT_COLORS).map(([type, colors]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${colors.bg} border-l-2 ${colors.border}`} />
                    <span className="text-xs capitalize text-muted-foreground">
                      {type.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {MOCK_EVENTS
                  .filter((e) => e.date >= todayKey)
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .slice(0, 5)
                  .map((event) => {
                    const colors = EVENT_COLORS[event.type]
                    return (
                      <div key={event.id} className="flex items-center gap-2 py-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.bg.replace('/10', '')}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{event.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {event.startTime ? ` • ${event.startTime}` : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
