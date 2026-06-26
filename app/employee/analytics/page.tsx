"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sparkles, TrendingUp, TrendingDown, Target, Brain, Calendar, Clock, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/store/use-auth-store'
import { EmptyState } from '@/components/ui/empty-state';
// TODO: Fetch real data instead of mock data
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'
import { cn } from '@/lib/utils'

const containerVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
}

const weeklyProductivity = [
  { day: 'Mon', score: 82, focus: 4, meetings: 2 },
  { day: 'Tue', score: 88, focus: 5, meetings: 1 },
  { day: 'Wed', score: 85, focus: 4.5, meetings: 3 },
  { day: 'Thu', score: 92, focus: 6, meetings: 1 },
  { day: 'Fri', score: 95, focus: 6.5, meetings: 0.5 },
]

const monthlyBurnoutRisk = [
  { week: 'W1', risk: 20 },
  { week: 'W2', risk: 35 },
  { week: 'W3', risk: 55 },
  { week: 'W4', risk: 30 },
]

const severityStyles = {
  info: 'text-indigo-500 bg-indigo-500/10 border-indigo-200 dark:border-indigo-800',
  warning: 'text-amber-500 bg-amber-500/10 border-amber-200 dark:border-amber-800',
  critical: 'text-red-500 bg-red-500/10 border-red-200 dark:border-red-800',
  improvement: 'text-emerald-500 bg-emerald-500/10 border-emerald-200 dark:border-emerald-800',
  pattern: 'text-blue-500 bg-blue-500/10 border-blue-200 dark:border-blue-800',
  productivity_tip: 'text-purple-500 bg-purple-500/10 border-purple-200 dark:border-purple-800',
  burnout_warning: 'text-orange-500 bg-orange-500/10 border-orange-200 dark:border-orange-800'
}

export default function AnalyticsPage() {
  const { employee } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const myInsights = ([] as any[]).filter(i => i.employeeId === employee?.id)
  const myScore = ([] as any[]).find(p => p.employeeId === employee?.id)?.score || 85

  return (
    <motion.div className="flex flex-col gap-6 pb-12" variants={containerVars} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            AI Analytics & Insights
          </h1>
          <p className="text-muted-foreground mt-1">Personalized productivity metrics and workflow optimizations.</p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVars}>
          <Card className="h-full bg-gradient-to-br from-card to-purple-500/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Overall Productivity</p>
                  <p className="text-4xl font-bold">{myScore}<span className="text-xl text-muted-foreground">/100</span></p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 font-medium">+4%</span>
                <span className="text-muted-foreground">from last week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVars}>
          <Card className="h-full bg-gradient-to-br from-card to-emerald-500/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Deep Work Average</p>
                  <p className="text-4xl font-bold">5.2<span className="text-xl text-muted-foreground">h</span></p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 font-medium">+1.5h</span>
                <span className="text-muted-foreground">from last week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVars}>
          <Card className="h-full bg-gradient-to-br from-card to-orange-500/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Burnout Risk</p>
                  <p className="text-4xl font-bold">Low</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <TrendingDown className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 font-medium">-15%</span>
                <span className="text-muted-foreground">from last week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Chart */}
        <motion.div variants={itemVars}>
          <Card>
            <CardHeader>
              <CardTitle>Focus vs Meetings</CardTitle>
              <CardDescription>Your weekly time distribution (hours)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyProductivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <RechartsTooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="focus" name="Focus Time" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="meetings" name="Meetings" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Burnout Risk Chart */}
        <motion.div variants={itemVars}>
          <Card>
            <CardHeader>
              <CardTitle>Burnout Risk Trend</CardTitle>
              <CardDescription>AI prediction based on work hours and break frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyBurnoutRisk} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="risk" name="Risk %" stroke="hsl(var(--chart-5))" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights Feed */}
      <motion.div variants={itemVars}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Insights Engine</CardTitle>
                <CardDescription>Personalized recommendations based on your work patterns</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-3 h-3 mr-1" /> Auto-Updating
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {myInsights.map((insight) => (
              <div key={insight.id} className={cn("p-4 rounded-xl border flex gap-4 transition-colors", severityStyles[insight.insightType as keyof typeof severityStyles] || severityStyles.info)}>
                <div className="mt-1">
                  {insight.severity === 'critical' || insight.severity === 'warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <span className="text-xs font-medium opacity-70">
                      {new Date(insight.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm opacity-90 leading-relaxed">{insight.content}</p>
                </div>
              </div>
            ))}
            {myInsights.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No insights generated yet. Keep working!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
