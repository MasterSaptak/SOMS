"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarService, CalendarEvent, EventType } from '@/lib/calendar/calendar.service'
import { Country } from '@/lib/calendar/holiday.engine'
import { EventVisualizer } from '@/components/calendar/EventVisualizer'
import { DailyTimelineDrawer } from '@/components/calendar/DailyTimelineDrawer'
import { AIInsightsPanel } from '@/components/calendar/AIInsightsPanel'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Search,
  Filter,
  Users,
  Building,
  Globe2,
  Focus
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ViewScope = 'my_calendar' | 'team' | 'department' | 'organization'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const days = []
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ date: daysInPrevMonth - i, month: month - 1, year, isCurrentMonth: false })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: i, month, year, isCurrentMonth: true })
  }
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: i, month: month + 1, year, isCurrentMonth: false })
  }
  return days
}

function formatDateKey(year: number, month: number, date: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
}

const ALL_LAYERS = [
  { id: 'attendance', label: 'Attendance', color: 'bg-emerald-500', group: 'personal' },
  { id: 'leaves', label: 'Leaves', color: 'bg-orange-500', group: 'personal' },
  { id: 'projects', label: 'Projects', color: 'bg-purple-500', group: 'work' },
  { id: 'tasks', label: 'Tasks', color: 'bg-blue-500', group: 'personal' },
  { id: 'missions', label: 'Missions', color: 'bg-indigo-500', group: 'org' },
  { id: 'goals', label: 'Goals / OKRs', color: 'bg-teal-500', group: 'org' },
  { id: 'meetings', label: 'Meetings', color: 'bg-cyan-500', group: 'work' },
  { id: 'company_events', label: 'Company Events', color: 'bg-blue-800', group: 'org' },
  { id: 'holidays', label: 'Holidays', color: 'bg-red-500', group: 'org' },
  { id: 'birthdays', label: 'Birthdays', color: 'bg-pink-500', group: 'personal' },
  { id: 'training', label: 'Training', color: 'bg-amber-500', group: 'work' },
  { id: 'reminders', label: 'Reminders', color: 'bg-slate-500', group: 'personal' },
]

export function EnterpriseTimeline() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Parse pre-filters from URL
  const urlProjectId = searchParams?.get('project_id')
  const [country, setCountry] = useState<Country>('Global')
  
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)) // June 2026 demo
  const [viewScope, setViewScope] = useState<ViewScope>('my_calendar')
  const [focusMode, setFocusMode] = useState(false)
  
  // Default active layers
  const defaultLayers = ['tasks', 'meetings', 'leaves', 'projects', 'attendance']
  const focusLayers = ['tasks', 'meetings', 'projects', 'leaves', 'reminders']
  
  const [activeLayers, setActiveLayers] = useState<string[]>(
    urlProjectId ? ['projects', 'tasks', 'meetings', 'leaves'] : defaultLayers
  )
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthDays = getMonthDays(year, month)
  const today = new Date()
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  // Toggle Focus Mode
  useEffect(() => {
    if (focusMode) {
      setViewScope('my_calendar')
      setActiveLayers(focusLayers)
    } else {
      if(!urlProjectId) setActiveLayers(defaultLayers)
    }
  }, [focusMode])

  useEffect(() => {
    async function loadEvents() {
      const fetchedEvents = await CalendarService.getMonthlyEvents(
        year, month, country, activeLayers, { projectId: urlProjectId || undefined }
      )
      setEvents(fetchedEvents)
    }
    loadEvents()
  }, [year, month, country, activeLayers, viewScope, urlProjectId])

  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const dateKey = formatDateKey(event.date.getFullYear(), event.date.getMonth(), event.date.getDate())
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(event)
    
    // Handle multi-day events (duration bars/ribbons)
    if (event.endDate) {
      let d = new Date(event.date)
      d.setDate(d.getDate() + 1)
      while (d <= event.endDate) {
        const nextKey = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
        if (!acc[nextKey]) acc[nextKey] = []
        // Push a clone to mark as spanning
        acc[nextKey].push({...event, title: ''}) // Empty title for spanning days to render continuously if needed
        d.setDate(d.getDate() + 1)
      }
    }
    
    return acc
  }, {})

  // Hierarchy sorting for display
  const priorityOrder: Record<EventType, number> = {
    holiday: 1,
    company_event: 2,
    mission: 3,
    goal: 4,
    project: 5,
    meeting: 6,
    training: 7,
    task: 8,
    reminder: 9,
    leave: 10,
    attendance: 11,
    birthday: 12
  }

  const handleEventClick = (event: CalendarEvent) => {
    // Navigation logic based on event type
    switch (event.type) {
      case 'task':
        router.push(`/employee?sheet=task&id=${event.id}`)
        break
      case 'project':
        router.push(`/employee?tab=projects&id=${event.id}`)
        break
      default:
        console.log('Opened detail for', event.title)
    }
  }

  return (
    <motion.div className="flex flex-col h-full gap-4 pb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Enterprise Timeline</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Unified Operational View
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          
          {/* Scope Selector */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 mr-2">
            {[
              { id: 'my_calendar', icon: null, label: 'My Calendar' },
              { id: 'team', icon: <Users className="w-3 h-3 mr-1" />, label: 'Team' },
              { id: 'organization', icon: <Globe2 className="w-3 h-3 mr-1" />, label: 'Org' },
            ].map((scope) => (
              <button
                key={scope.id}
                onClick={() => { setViewScope(scope.id as ViewScope); setFocusMode(false); }}
                className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewScope === scope.id && !focusMode
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {scope.icon}
                {scope.label}
              </button>
            ))}
          </div>
          
          <Select value={country} onValueChange={(val) => setCountry(val as Country)}>
            <SelectTrigger className="w-[130px] h-8 text-xs bg-card mr-2">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Global">Global (All)</SelectItem>
              <SelectItem value="India">India</SelectItem>
              <SelectItem value="Bangladesh">Bangladesh</SelectItem>
              <SelectItem value="Austria">Austria</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant={focusMode ? 'default' : 'outline'} 
            size="sm" 
            className={`shadow-md transition-all ${focusMode ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => setFocusMode(!focusMode)}
          >
            <Focus className="w-4 h-4 mr-1" />
            Focus Mode
          </Button>
          
          <Button variant="default" size="sm" className="hidden md:flex shadow-md bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4 flex-1">
        {/* Left Sidebar (Filters) */}
        <div className="hidden lg:flex flex-col gap-4">
          <Card className="border-border/50 shadow-sm flex-1">
            <CardHeader className="pb-3 pt-4 px-4 border-b border-border/50">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> Calendar Layers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-4 overflow-y-auto max-h-[60vh] hide-scrollbar">
              <div className="flex flex-col gap-6">
                {['personal', 'work', 'org'].map(group => (
                  <div key={group}>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{group} Layers</h3>
                    <div className="flex flex-col gap-3">
                      {ALL_LAYERS.filter(l => l.group === group).map(layer => (
                        <label key={layer.id} className="flex items-center gap-3 cursor-pointer group/layer">
                          <input 
                            type="checkbox" 
                            disabled={focusMode}
                            checked={activeLayers.includes(layer.id)}
                            onChange={(e) => {
                              if (e.target.checked) setActiveLayers([...activeLayers, layer.id])
                              else setActiveLayers(activeLayers.filter(l => l !== layer.id))
                            }}
                            className="rounded border-border/50 text-primary focus:ring-primary/20 transition-all cursor-pointer disabled:opacity-50"
                          />
                          <div className={`w-2.5 h-2.5 rounded-full ${layer.color} opacity-80 group-hover/layer:opacity-100 transition-opacity`} />
                          <span className={`text-sm font-medium transition-colors ${focusMode ? 'text-muted-foreground/50' : 'text-muted-foreground group-hover/layer:text-foreground'}`}>{layer.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {viewScope !== 'my_calendar' && (
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-4 flex flex-col gap-2 bg-muted/20">
                 <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Resource Utilization</h4>
                 <div className="flex justify-between text-sm"><span>Engineering</span><span className="font-medium text-emerald-600">72%</span></div>
                 <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[72%]" /></div>
                 
                 <div className="flex justify-between text-sm mt-2"><span>Support</span><span className="font-medium text-red-600">100%</span></div>
                 <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-red-500 w-full" /></div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Calendar Grid Center */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="border-border/50 shadow-sm flex-1 flex flex-col">
            <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-lg font-bold min-w-[160px] text-center">
                    {MONTHS[month]} {year}
                  </h2>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="grid grid-cols-7 border-b border-border/50 bg-muted/30">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-xs font-bold text-muted-foreground py-2 tracking-wider uppercase">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(120px,1fr)] bg-border gap-px border-b border-border">
                {monthDays.map((day, index) => {
                  const dateKey = formatDateKey(day.year, day.month, day.date)
                  let dayEvents = eventsByDate[dateKey] || []
                  
                  // Sort by priority for consistent timeline hierarchy
                  dayEvents = dayEvents.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type])
                  
                  const isToday = dateKey === todayKey
                  const isSelected = dateKey === selectedDate
                  
                  const dayOfWeek = new Date(day.year, day.month, day.date).getDay()
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                  const bgClass = day.isCurrentMonth 
                    ? (isWeekend ? 'bg-[url(/stripes.png)] bg-muted/30' : 'bg-card') 
                    : 'bg-muted/10 opacity-60'

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`min-h-[120px] p-1 flex flex-col transition-all cursor-pointer hover:bg-muted/50 ${bgClass} ${isSelected ? 'ring-2 ring-primary/50 z-10 relative' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1 px-1">
                        <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : isWeekend ? 'text-muted-foreground/60' : 'text-foreground'
                        }`}>
                          {day.date}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-[1px] overflow-y-auto no-scrollbar pb-1">
                        {dayEvents.map((event, i) => (
                           <div key={`${event.id}-${i}`}>
                             <EventVisualizer event={event} onClick={handleEventClick} />
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

        {/* Right Sidebar (AI Insights) */}
        <div className="hidden xl:flex flex-col gap-4">
           <AIInsightsPanel events={events} />
        </div>
      </div>
      
      <DailyTimelineDrawer 
        isOpen={!!selectedDate} 
        onClose={() => setSelectedDate(null)} 
        date={selectedDate}
        events={selectedDate ? (eventsByDate[selectedDate] || []) : []}
        onEventClick={handleEventClick}
      />
    </motion.div>
  )
}
