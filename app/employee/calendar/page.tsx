"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ApplyLeaveWizard } from '@/components/leaves/apply-leave-wizard'
import { LeaveBalancesWidget } from '@/components/leaves/leave-balances-widget'
import { CalendarService, CalendarEvent } from '@/lib/calendar/calendar.service'
import { Country } from '@/lib/calendar/holiday.engine'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Search,
  Globe,
  Filter,
  Settings,
  Sparkles
} from 'lucide-react'

type ViewMode = 'month' | 'week' | 'day' | 'agenda' | 'timeline'

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

export default function EnterpriseCalendarPlatform() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)) // Starting in June 2026 for demo
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  
  // Platform State
  const [country, setCountry] = useState<Country>('India')
  const [activeLayers, setActiveLayers] = useState<string[]>(['holidays', 'company_events', 'attendance', 'leaves', 'meetings'])
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthDays = getMonthDays(year, month)
  
  const today = new Date()
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  // Load events from the Calendar Engine
  useEffect(() => {
    async function loadEvents() {
      const fetchedEvents = await CalendarService.getMonthlyEvents(year, month, country, activeLayers)
      setEvents(fetchedEvents)
    }
    loadEvents()
  }, [year, month, country, activeLayers])

  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const dateKey = formatDateKey(event.date.getFullYear(), event.date.getMonth(), event.date.getDate())
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(event)
    return acc
  }, {})

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1))
  }

  const goToToday = () => setCurrentDate(new Date())

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : []

  return (
    <motion.div
      className="flex flex-col h-full gap-4 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Enterprise Calendar</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Powered by SOMS Calendar Engine
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {/* Country Selector */}
          <div className="flex items-center bg-muted/50 rounded-lg p-1 mr-2 border border-border/50">
            <Globe className="w-4 h-4 ml-2 text-muted-foreground" />
            <select 
              value={country} 
              onChange={(e) => setCountry(e.target.value as Country)}
              className="bg-transparent text-sm font-medium border-none focus:ring-0 outline-none px-2 py-1"
            >
              <option value="India">India</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="Austria">Austria</option>
              <option value="Global">Global</option>
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={goToToday} className="hidden sm:flex">Today</Button>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map((mode) => (
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
          <Button variant="default" size="sm" className="hidden md:flex shadow-md" onClick={() => setShowApplyDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Apply Leave
          </Button>
        </div>
      </div>

      <div className="px-1">
        <LeaveBalancesWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
        {/* Left Sidebar (Filters) */}
        <div className="hidden lg:flex flex-col gap-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Filter className="w-4 h-4" /> Calendar Layers
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-col gap-3">
                {[
                  { id: 'attendance', label: 'Attendance', color: 'bg-emerald-500' },
                  { id: 'leaves', label: 'Leaves', color: 'bg-orange-500' },
                  { id: 'company_events', label: 'Company Events', color: 'bg-blue-500' },
                  { id: 'holidays', label: 'Holidays', color: 'bg-purple-500' },
                  { id: 'meetings', label: 'Meetings', color: 'bg-indigo-500' },
                  { id: 'birthdays', label: 'Birthdays', color: 'bg-pink-500' }
                ].map(layer => (
                  <label key={layer.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={activeLayers.includes(layer.id)}
                      onChange={(e) => {
                        if (e.target.checked) setActiveLayers([...activeLayers, layer.id])
                        else setActiveLayers(activeLayers.filter(l => l !== layer.id))
                      }}
                      className="rounded border-border/50 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                    />
                    <div className={`w-2.5 h-2.5 rounded-full ${layer.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{layer.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Mini Calendar Placeholder */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-4 flex items-center justify-center min-h-[200px] text-muted-foreground text-sm font-medium bg-muted/20">
              Mini Calendar Preview
            </CardContent>
          </Card>
        </div>

        {/* Calendar Grid Center */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="border-border/50 shadow-sm flex-1 flex flex-col">
            <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateMonth(-1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-lg font-bold min-w-[160px] text-center">
                    {MONTHS[month]} {year}
                  </h2>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateMonth(1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-border/50 bg-muted/30">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-xs font-bold text-muted-foreground py-2 tracking-wider uppercase">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-border gap-px border-b border-border">
                {monthDays.map((day, index) => {
                  const dateKey = formatDateKey(day.year, day.month, day.date)
                  const dayEvents = eventsByDate[dateKey] || []
                  const isToday = dateKey === todayKey
                  const isSelected = dateKey === selectedDate
                  
                  // Mock Company Holiday logic (Wed & Sun)
                  const dayOfWeek = new Date(day.year, day.month, day.date).getDay()
                  const isCompanyHoliday = dayOfWeek === 0 || dayOfWeek === 3 // Sun, Wed
                  const bgClass = day.isCurrentMonth 
                    ? (isCompanyHoliday ? 'bg-[url(/stripes.png)] bg-muted/30' : 'bg-card') 
                    : 'bg-muted/10 opacity-60'

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`min-h-[100px] p-1.5 flex flex-col transition-all cursor-pointer hover:bg-muted/50 ${bgClass} ${isSelected ? 'ring-2 ring-primary/50 z-10' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : isCompanyHoliday ? 'text-muted-foreground' : 'text-foreground'
                        }`}>
                          {day.date}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-0.5 overflow-y-auto no-scrollbar">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`text-[10px] px-1.5 py-0.5 rounded-sm truncate font-medium border border-transparent hover:border-black/10 dark:hover:border-white/10 transition-colors ${event.color}`}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar (AI Insights & Day Details) */}
        <div className="flex flex-col gap-4">
          <Card className="border-border/50 shadow-sm bg-gradient-to-b from-primary/5 to-transparent">
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" /> AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-background rounded-xl shadow-sm border border-border/50 text-sm">
                  <p className="font-semibold mb-1">Leave Prediction</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    18 employees requested leave before Durga Puja. Recommend temporary staffing.
                  </p>
                </div>
                <div className="p-3 bg-background rounded-xl shadow-sm border border-border/50 text-sm">
                  <p className="font-semibold mb-1">Expected Attendance</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-emerald-600">92%</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Tomorrow</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm flex-1">
            <CardHeader className="pb-3 pt-4 px-4 border-b border-border/50">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>{selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Day Details'}</span>
                {selectedDate && <Badge variant="outline" className="text-[10px] uppercase">Selected</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {!selectedDate ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50 py-10">
                  <CalendarDays className="w-10 h-10 mb-2" />
                  <p className="text-sm font-medium">Select a day to view timeline</p>
                </div>
              ) : selectedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No events scheduled.</p>
              ) : (
                <div className="flex flex-col gap-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {selectedEvents.map((event, idx) => (
                    <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                       <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-background bg-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                       <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-border/50 bg-card shadow-sm">
                         <div className="flex items-center justify-between mb-1">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{event.type}</span>
                         </div>
                         <h4 className="text-sm font-semibold">{event.title}</h4>
                         {event.metadata?.description && (
                           <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.metadata.description}</p>
                         )}
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {showApplyDialog && <ApplyLeaveWizard onClose={() => setShowApplyDialog(false)} />}
    </motion.div>
  )
}
