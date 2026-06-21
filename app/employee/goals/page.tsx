"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Target, Plus, ChevronRight, ChevronDown, MessageSquare,
  TrendingUp, Calendar, CheckCircle2, Circle, AlertCircle,
} from 'lucide-react'

interface KeyResult {
  id: string
  title: string
  current: number
  target: number
  unit: string
  status: 'on_track' | 'at_risk' | 'behind' | 'completed'
}

interface Goal {
  id: string
  title: string
  description: string
  quarter: string
  progress: number
  status: 'active' | 'completed' | 'paused'
  keyResults: KeyResult[]
  updatesCount: number
  lastUpdate: string
}

const STATUS_COLORS: Record<string, { label: string; color: string; bg: string }> = {
  on_track: { label: 'On Track', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  at_risk: { label: 'At Risk', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  behind: { label: 'Behind', color: 'text-red-500', bg: 'bg-red-500/10' },
  completed: { label: 'Completed', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  active: { label: 'Active', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  paused: { label: 'Paused', color: 'text-slate-500', bg: 'bg-slate-500/10' },
}

const MOCK_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Improve Design System Adoption',
    description: 'Increase usage of the SOMS design system across all product teams to ensure UI consistency and reduce development time.',
    quarter: 'Q2 2026',
    progress: 72,
    status: 'active',
    keyResults: [
      { id: 'kr1', title: 'Migrate 90% of components to design system tokens', current: 78, target: 90, unit: '%', status: 'on_track' },
      { id: 'kr2', title: 'Reduce custom CSS by 50%', current: 35, target: 50, unit: '%', status: 'at_risk' },
      { id: 'kr3', title: 'Publish 20 new reusable components', current: 16, target: 20, unit: 'components', status: 'on_track' },
    ],
    updatesCount: 5,
    lastUpdate: '2026-06-15',
  },
  {
    id: 'g2',
    title: 'Enhance Team Productivity',
    description: 'Implement tools and processes to improve overall team productivity score by 15% and reduce context switching.',
    quarter: 'Q2 2026',
    progress: 55,
    status: 'active',
    keyResults: [
      { id: 'kr4', title: 'Achieve team productivity score of 90+', current: 86, target: 90, unit: 'points', status: 'on_track' },
      { id: 'kr5', title: 'Reduce average task completion time by 20%', current: 12, target: 20, unit: '%', status: 'behind' },
      { id: 'kr6', title: 'Implement 3 automation workflows', current: 1, target: 3, unit: 'workflows', status: 'at_risk' },
    ],
    updatesCount: 3,
    lastUpdate: '2026-06-12',
  },
  {
    id: 'g3',
    title: 'Master Cloud Architecture',
    description: 'Complete AWS Solutions Architect certification and implement cloud-native patterns in 2 production services.',
    quarter: 'Q2 2026',
    progress: 100,
    status: 'completed',
    keyResults: [
      { id: 'kr7', title: 'Pass AWS Solutions Architect exam', current: 1, target: 1, unit: 'exam', status: 'completed' },
      { id: 'kr8', title: 'Migrate 2 services to serverless', current: 2, target: 2, unit: 'services', status: 'completed' },
    ],
    updatesCount: 8,
    lastUpdate: '2026-06-01',
  },
]

export default function GoalsPage() {
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set(['g1']))

  const toggleGoal = (id: string) => {
    setExpandedGoals((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const overallProgress = Math.round(MOCK_GOALS.reduce((sum, g) => sum + g.progress, 0) / MOCK_GOALS.length)

  return (
    <motion.div
      className="flex flex-col gap-6 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals & OKRs</h1>
          <p className="text-muted-foreground mt-1">Track your quarterly objectives and key results</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase">Overall Progress</div>
            <div className="text-2xl font-bold mt-1">{overallProgress}%</div>
            <Progress value={overallProgress} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase">Active Goals</div>
            <div className="text-2xl font-bold mt-1">{MOCK_GOALS.filter(g => g.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground mt-1">This quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase">Key Results</div>
            <div className="text-2xl font-bold mt-1">{MOCK_GOALS.reduce((sum, g) => sum + g.keyResults.length, 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all goals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase">Completed</div>
            <div className="text-2xl font-bold mt-1 text-emerald-500">{MOCK_GOALS.filter(g => g.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Goals achieved</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="flex flex-col gap-4">
        {MOCK_GOALS.map((goal) => {
          const isExpanded = expandedGoals.has(goal.id)
          const statusConfig = STATUS_COLORS[goal.status]

          return (
            <motion.div key={goal.id} layout>
              <Card className="overflow-hidden">
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className="w-full text-left"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base">{goal.title}</CardTitle>
                          <CardDescription className="mt-1">{goal.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs">{goal.quarter}</Badge>
                        <Badge variant="outline" className={`text-xs ${statusConfig.color} ${statusConfig.bg}`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="ml-8 mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>{goal.progress}% complete</span>
                        <span>{goal.keyResults.length} key results</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                  </CardHeader>
                </button>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    <div className="ml-8 flex flex-col gap-3">
                      {goal.keyResults.map((kr) => {
                        const krStatus = STATUS_COLORS[kr.status]
                        const krProgress = Math.round((kr.current / kr.target) * 100)

                        return (
                          <div key={kr.id} className="p-3 rounded-xl border border-border/50 bg-muted/20">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                {kr.status === 'completed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                                )}
                                <span className="text-sm">{kr.title}</span>
                              </div>
                              <Badge variant="outline" className={`text-[10px] ${krStatus.color}`}>
                                {krStatus.label}
                              </Badge>
                            </div>
                            <div className="ml-6 mt-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>{kr.current} / {kr.target} {kr.unit}</span>
                                <span>{krProgress}%</span>
                              </div>
                              <Progress value={krProgress} className="h-1.5" />
                            </div>
                          </div>
                        )
                      })}

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {goal.updatesCount} updates
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Last updated {new Date(goal.lastUpdate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
