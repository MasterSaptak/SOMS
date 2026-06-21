"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Video, Plus, Calendar, Clock, MapPin, Users, ExternalLink,
  FileText, CheckCircle2, Circle, ChevronRight,
} from 'lucide-react'

interface Meeting {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  type: 'video' | 'in_person' | 'hybrid'
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
  organizer: string
  attendees: string[]
  hasNotes: boolean
  actionItems: number
  agenda?: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  upcoming: { label: 'Upcoming', color: 'bg-blue-500/10 text-blue-600' },
  in_progress: { label: 'In Progress', color: 'bg-emerald-500/10 text-emerald-600' },
  completed: { label: 'Completed', color: 'bg-slate-500/10 text-slate-600' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-600' },
}

const MOCK_MEETINGS: Meeting[] = [
  { id: 'mt1', title: 'Design Review — Dashboard v2', date: '2026-06-20', startTime: '10:00', endTime: '11:00', location: 'Apollo Room', type: 'in_person', status: 'completed', organizer: 'Sarah Chen', attendees: ['John Doe', 'Alice Wong', 'Sarah Chen'], hasNotes: true, actionItems: 3, agenda: 'Review new dashboard component designs and color palette' },
  { id: 'mt2', title: 'Sprint Planning — Sprint 14', date: '2026-06-20', startTime: '14:00', endTime: '15:30', location: 'Orion Room', type: 'hybrid', status: 'upcoming', organizer: 'Mike Johnson', attendees: ['Mike Johnson', 'Alice Wong', 'Bob Martinez', 'Admin User'], hasNotes: false, actionItems: 0, agenda: 'Plan Sprint 14 scope, review backlog priorities, assign stories' },
  { id: 'mt3', title: 'Weekly Team Standup', date: '2026-06-21', startTime: '09:30', endTime: '10:00', location: 'Google Meet', type: 'video', status: 'upcoming', organizer: 'Mike Johnson', attendees: ['Mike Johnson', 'Alice Wong', 'Bob Martinez', 'Admin User'], hasNotes: false, actionItems: 0 },
  { id: 'mt4', title: 'HR Policy Review', date: '2026-06-22', startTime: '11:00', endTime: '12:00', location: 'Gemini Room', type: 'in_person', status: 'upcoming', organizer: 'Priya Sharma', attendees: ['Priya Sharma', 'Admin User'], hasNotes: false, actionItems: 0, agenda: 'Review updated WFH policy and Q3 leave calendar' },
  { id: 'mt5', title: '1:1 with Manager', date: '2026-06-19', startTime: '16:00', endTime: '16:30', location: 'Google Meet', type: 'video', status: 'completed', organizer: 'Sarah Chen', attendees: ['Sarah Chen', 'John Doe'], hasNotes: true, actionItems: 2, agenda: 'Career growth discussion, Q2 review prep' },
  { id: 'mt6', title: 'Q3 All-Hands', date: '2026-07-01', startTime: '10:00', endTime: '12:00', location: 'Main Auditorium', type: 'in_person', status: 'upcoming', organizer: 'Admin User', attendees: ['All Employees'], hasNotes: false, actionItems: 0, agenda: 'Q2 recap, Q3 goals, new product announcements' },
]

export default function MeetingsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  const upcomingMeetings = MOCK_MEETINGS.filter((m) => m.status === 'upcoming' || m.status === 'in_progress')
  const pastMeetings = MOCK_MEETINGS.filter((m) => m.status === 'completed' || m.status === 'cancelled')

  const displayedMeetings = tab === 'upcoming' ? upcomingMeetings : pastMeetings

  return (
    <motion.div
      className="flex flex-col gap-6 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground mt-1">Schedule, join, and manage your meetings</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingMeetings.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pastMeetings.filter(m => m.hasNotes).length}</p>
              <p className="text-xs text-muted-foreground">With Notes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{MOCK_MEETINGS.reduce((sum, m) => sum + m.actionItems, 0)}</p>
              <p className="text-xs text-muted-foreground">Action Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">4.5h</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 w-fit">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t} ({t === 'upcoming' ? upcomingMeetings.length : pastMeetings.length})
          </button>
        ))}
      </div>

      {/* Meeting List */}
      <div className="flex flex-col gap-3">
        {displayedMeetings.map((meeting) => {
          const statusCfg = STATUS_CONFIG[meeting.status]
          return (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      meeting.type === 'video' ? 'bg-blue-500/10' : meeting.type === 'hybrid' ? 'bg-purple-500/10' : 'bg-emerald-500/10'
                    }`}>
                      {meeting.type === 'video' ? (
                        <Video className="w-5 h-5 text-blue-500" />
                      ) : meeting.type === 'hybrid' ? (
                        <Video className="w-5 h-5 text-purple-500" />
                      ) : (
                        <MapPin className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{meeting.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(meeting.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meeting.startTime} — {meeting.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {meeting.location}
                        </span>
                      </div>
                      {meeting.agenda && (
                        <p className="text-xs text-muted-foreground mt-2">{meeting.agenda}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2.5">
                        <div className="flex -space-x-1.5">
                          {meeting.attendees.slice(0, 4).map((name, i) => (
                            <Avatar key={i} className="w-6 h-6 border-2 border-card">
                              <AvatarFallback className="text-[9px]">
                                {name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {meeting.attendees.length > 4 && (
                            <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                              +{meeting.attendees.length - 4}
                            </div>
                          )}
                        </div>
                        {meeting.hasNotes && (
                          <Badge variant="outline" className="text-[10px]">
                            <FileText className="w-3 h-3 mr-0.5" />
                            Notes
                          </Badge>
                        )}
                        {meeting.actionItems > 0 && (
                          <Badge variant="outline" className="text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" />
                            {meeting.actionItems} actions
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`text-[10px] capitalize ${statusCfg.color}`}>
                      {statusCfg.label}
                    </Badge>
                    {meeting.status === 'upcoming' && meeting.type !== 'in_person' && (
                      <Button size="sm" variant="outline" className="text-xs">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </motion.div>
  )
}
