"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ClipboardList, Activity, ArrowRight, CheckCircle2, Circle, 
  BarChart, Calendar, Clock, Smile, Frown, Meh
} from 'lucide-react'

interface Survey {
  id: string
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'completed' | 'expired'
  estimatedTime: string
  questions: number
  type: 'pulse' | 'feedback' | 'evaluation'
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Action Required', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  expired: { label: 'Expired', color: 'bg-slate-500/10 text-slate-600 border-slate-200' },
}

const MOCK_SURVEYS: Survey[] = [
  { id: 's1', title: 'Q2 Team Pulse Check', description: 'Quick check-in on team morale, workload, and support needed.', dueDate: '2026-06-25', status: 'pending', estimatedTime: '5 min', questions: 10, type: 'pulse' },
  { id: 's2', title: 'New Tools Feedback', description: 'Feedback on the new design system and workflow automation tools.', dueDate: '2026-06-22', status: 'pending', estimatedTime: '8 min', questions: 15, type: 'feedback' },
  { id: 's3', title: 'H1 Self-Evaluation', description: 'Mid-year performance self-evaluation and goal review.', dueDate: '2026-06-30', status: 'pending', estimatedTime: '20 min', questions: 8, type: 'evaluation' },
  { id: 's4', title: 'Return to Office Survey', description: 'Gathering preferences for the new hybrid work schedule.', dueDate: '2026-05-15', status: 'completed', estimatedTime: '5 min', questions: 12, type: 'feedback' },
  { id: 's5', title: 'Q1 Pulse Check', description: 'Quarterly check-in on team morale and workload.', dueDate: '2026-03-30', status: 'completed', estimatedTime: '5 min', questions: 10, type: 'pulse' },
]

export default function SurveysPage() {
  const [tab, setTab] = useState<'pending' | 'completed'>('pending')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  const pendingSurveys = MOCK_SURVEYS.filter(s => s.status === 'pending')
  const completedSurveys = MOCK_SURVEYS.filter(s => s.status === 'completed' || s.status === 'expired')

  const displayedSurveys = tab === 'pending' ? pendingSurveys : completedSurveys

  return (
    <motion.div
      className="flex flex-col gap-6 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Surveys & Feedback</h1>
        <p className="text-muted-foreground mt-1">Share your voice and help improve the workplace</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Daily Check-in & Stats */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Daily Mood Check-in */}
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Daily Check-in</CardTitle>
              <CardDescription>How are you feeling today?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => setSelectedMood('great')}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    selectedMood === 'great' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600' : 'bg-card hover:bg-muted border-border text-muted-foreground'
                  }`}
                >
                  <Smile className="w-8 h-8" />
                  <span className="text-xs font-medium">Great</span>
                </button>
                <button
                  onClick={() => setSelectedMood('okay')}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    selectedMood === 'okay' ? 'bg-amber-500/20 border-amber-500/50 text-amber-600' : 'bg-card hover:bg-muted border-border text-muted-foreground'
                  }`}
                >
                  <Meh className="w-8 h-8" />
                  <span className="text-xs font-medium">Okay</span>
                </button>
                <button
                  onClick={() => setSelectedMood('struggling')}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    selectedMood === 'struggling' ? 'bg-red-500/20 border-red-500/50 text-red-600' : 'bg-card hover:bg-muted border-border text-muted-foreground'
                  }`}
                >
                  <Frown className="w-8 h-8" />
                  <span className="text-xs font-medium">Struggling</span>
                </button>
              </div>
              {selectedMood && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-center mt-4 text-muted-foreground"
                >
                  Thanks for sharing! Your feedback is anonymous.
                </motion.p>
              )}
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Your Participation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Survey Completion Rate</span>
                    <span className="font-medium text-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                    <p className="text-2xl font-bold text-primary">{completedSurveys.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">Completed</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-2xl font-bold text-amber-600">{pendingSurveys.length}</p>
                    <p className="text-[10px] text-amber-600/80 uppercase font-semibold mt-0.5">Pending</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Surveys List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 w-fit">
            <button
              onClick={() => setTab('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                tab === 'pending' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pending
              {pendingSurveys.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 text-[10px] flex items-center justify-center">
                  {pendingSurveys.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                tab === 'completed' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Completed
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {displayedSurveys.map((survey) => {
              const statusCfg = STATUS_CONFIG[survey.status]
              return (
                <Card key={survey.id} className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          survey.type === 'pulse' ? 'bg-blue-500/10 text-blue-500' :
                          survey.type === 'evaluation' ? 'bg-purple-500/10 text-purple-500' :
                          'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {survey.type === 'pulse' ? <Activity className="w-5 h-5" /> :
                           survey.type === 'evaluation' ? <BarChart className="w-5 h-5" /> :
                           <ClipboardList className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold group-hover:text-primary transition-colors">{survey.title}</h3>
                            {survey.status === 'pending' && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{survey.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {survey.status === 'completed' ? 'Completed on' : 'Due'} {new Date(survey.dueDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {survey.estimatedTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClipboardList className="w-3.5 h-3.5" />
                              {survey.questions} questions
                            </span>
                            <Badge variant="outline" className={`text-[10px] ml-1 ${statusCfg.color}`}>
                              {statusCfg.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="shrink-0 self-start sm:self-center w-full sm:w-auto mt-2 sm:mt-0">
                        {survey.status === 'pending' ? (
                          <Button className="w-full sm:w-auto gap-2">
                            Take Survey <ArrowRight className="w-4 h-4" />
                          </Button>
                        ) : survey.status === 'completed' ? (
                          <Button variant="outline" className="w-full sm:w-auto gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-500/10">
                            <CheckCircle2 className="w-4 h-4" /> View Responses
                          </Button>
                        ) : (
                          <Button variant="outline" disabled className="w-full sm:w-auto">
                            Expired
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            
            {displayedSurveys.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No {tab} surveys</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
