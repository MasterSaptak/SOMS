"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { WidgetShell } from '@/components/enterprise/widget-shell'
import { MetricCard } from '@/components/enterprise/metric-card'
import { useAppStore } from '@/store/use-app-store'
import { createClient } from '@/lib/supabase/client'
import { formatTime } from '@/lib/format-time'
import { 
  Clock, 
  Flame,
  ListTodo,
  Target,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Activity,
  Briefcase,
  Sparkles,
  Zap,
  Coffee,
  CheckCircle,
  Bell,
  Play,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

// Lazy load recharts — removes ~300KB from initial bundle
const LazyChart = dynamic(() => import('recharts').then(mod => {
  const { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } = mod
  // Return a wrapper component
  return { default: ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
        <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
      </AreaChart>
    </ResponsiveContainer>
  )}
}), { ssr: false, loading: () => <div className="h-[120px] w-full animate-pulse bg-muted/30 rounded-lg" /> })

const productivityData = [
  { time: '9am', score: 65 },
  { time: '11am', score: 85 },
  { time: '1pm', score: 70 },
  { time: '3pm', score: 92 },
  { time: '5pm', score: 88 },
]



export default function EmployeeDashboard() {
  const { sessionState, totalWorkSeconds } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  
  const [employee, setEmployee] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  
  const supabase = createClient()
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: emp } = await (supabase as any)
        .from('employees')
        .select('id, user_id, organization_id, full_name, profile_photo, employment_status')
        .eq('user_id', user.id)
        .single()
      
      if (emp) {
        setEmployee(emp)
        // Fetch tasks in parallel — don't block on sequential await
        const { getEmployeeTasksAction } = await import('@/app/actions/task.actions')
        getEmployeeTasksAction(emp.id, (emp as any).organization_id).then(myTasksRes => {
          if (myTasksRes.success) {
            setTasks(myTasksRes.data)
          }
        })
      }
      
      setIsLoading(false)
    }
    
    loadDashboard()
  }, [])

  const firstName = employee?.full_name?.split(' ')[0] || 'there'
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  const completedTasks = tasks.filter(t => t.status === 'completed')

  const productivityScore = 85
  const dailyTarget = 28800
  const progressPercent = Math.min((totalWorkSeconds / dailyTarget) * 100, 100)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const dynamicActivityFeed = [
    ...completedTasks.slice(0, 2).map((t: any) => ({
      id: `c-${t.id}`,
      title: 'Task completed',
      desc: t.title,
      time: 'Recently',
      icon: <CheckCircle className="w-4 h-4 text-emerald-500" />
    })),
    ...pendingTasks.slice(0, 2).map((t: any) => ({
      id: `p-${t.id}`,
      title: 'Task assigned',
      desc: t.title,
      time: 'Pending',
      icon: <Bell className="w-4 h-4 text-blue-500" />
    }))
  ]

  if (dynamicActivityFeed.length === 0) {
    dynamicActivityFeed.push({
      id: 'empty',
      title: 'Welcome to SOMS',
      desc: 'Your activity will appear here',
      time: 'Just now',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />
    })
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 pb-12 w-full animate-in fade-in duration-700">
      
      {/* 1. Greeting — compact on mobile */}
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight text-foreground">{greeting}, {firstName}</h1>
        <p className="text-muted-foreground text-xs md:text-sm">{currentDate}</p>
      </div>

      {/* 2. Clock In / Workspace — full-width on mobile */}
      <div className="flex items-center gap-3 p-3 md:p-4 rounded-2xl border border-border/40 bg-surface-primary">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
          sessionState === 'working' ? 'bg-emerald-500/10 text-emerald-600' :
          sessionState === 'break' ? 'bg-amber-500/10 text-amber-600' :
          'bg-muted text-muted-foreground'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            sessionState === 'working' ? 'bg-emerald-500 animate-pulse' :
            sessionState === 'break' ? 'bg-amber-500 animate-pulse' :
            'bg-muted-foreground/40'
          }`} />
          {sessionState === 'working' ? 'Working' : sessionState === 'break' ? 'On Break' : 'Offline'}
        </div>
        <div className="flex-1" />
        <Button asChild size="sm" className="rounded-full shadow-none px-5 h-9">
          <Link href="/employee?tab=session">
            <Play className="w-3.5 h-3.5 mr-1.5" />
            {sessionState === 'idle' ? 'Start Working' : 'Open Workspace'}
          </Link>
        </Button>
      </div>

      {/* 3. Today's Summary — 2x2 compact grid on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 md:p-4 rounded-2xl bg-surface-primary border border-border/40">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Time Logged</span>
          </div>
          <div className="text-lg md:text-2xl font-bold">{sessionState !== 'idle' ? formatTime(totalWorkSeconds).slice(0, 5) : '0h 00m'}</div>
        </div>
        <div className="p-3 md:p-4 rounded-2xl bg-surface-primary border border-border/40">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Tasks</span>
          </div>
          <div className="text-lg md:text-2xl font-bold">{completedTasks.length}<span className="text-sm text-muted-foreground font-normal"> / {tasks.length}</span></div>
        </div>
        <div className="p-3 md:p-4 rounded-2xl bg-surface-primary border border-border/40">
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Meeting</span>
          </div>
          <div className="text-lg md:text-2xl font-bold">2:30 PM</div>
        </div>
        <div className="p-3 md:p-4 rounded-2xl bg-surface-primary border border-border/40">
          <div className="flex items-center gap-1.5 mb-2">
            <Target className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Productivity</span>
          </div>
          <div className="text-lg md:text-2xl font-bold">{productivityScore}%</div>
        </div>
      </div>

      {/* 4. Productivity Card — compact linear bar on mobile */}
      <div className="p-4 rounded-2xl bg-surface-primary border border-border/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold">Productivity Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-semibold">+12% this week</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl md:text-3xl font-bold">{productivityScore}%</span>
              <span className="text-xs text-emerald-600 font-semibold">Excellent</span>
            </div>
            <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${productivityScore}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>
        {/* Desktop: show chart */}
        <div className="hidden md:block h-[120px] w-full mt-4">
          <LazyChart data={productivityData} />
        </div>
      </div>

      {/* 5. AI Insights — compact */}
      <WidgetShell
        title="AI Insights"
        subtitle="Smart recommendations for your day"
        isLoading={isLoading}
        className="border-purple-500/20 bg-gradient-to-br from-surface-primary to-purple-500/5"
        action={<Sparkles className="w-4 h-4 text-purple-500" />}
      >
        <div className="flex gap-3 items-start mt-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-xs md:text-sm font-medium leading-relaxed">
              Hi {firstName}! Your productivity peaks around <span className="text-purple-500 font-bold">3:00 PM</span>. Schedule deep-work task <span className="font-semibold text-foreground">&quot;{pendingTasks.length > 0 ? pendingTasks[0].title : 'Planning & Strategy'}&quot;</span> for that time.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="secondary" className="rounded-full text-xs h-7 md:h-8 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-0">
                <Calendar className="w-3 h-3 mr-1" /> Schedule
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full text-xs h-7 md:h-8">
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </WidgetShell>

      {/* 6-7. Quick Actions + Activity Feed — side by side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Quick Actions */}
        <WidgetShell title="Quick Actions" isLoading={isLoading}>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" className="h-20 md:h-24 flex flex-col items-center justify-center gap-2 bg-surface-primary hover:bg-surface-secondary border-border/40 hover:border-primary/30 transition-all rounded-2xl" asChild>
              <Link href="/employee?tab=leaves">
                <Coffee className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold tracking-wide">Leave</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 md:h-24 flex flex-col items-center justify-center gap-2 bg-surface-primary hover:bg-surface-secondary border-border/40 hover:border-amber-500/30 transition-all rounded-2xl" asChild>
              <Link href="/employee?tab=tasks">
                <Activity className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold tracking-wide">Tasks</span>
              </Link>
            </Button>
          </div>
        </WidgetShell>

        {/* Activity Feed */}
        <WidgetShell
          title="Activity Feed"
          subtitle="Your recent actions"
          isLoading={isLoading}
        >
          <div className="flex flex-col gap-4 md:gap-6 mt-3 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-border/50">
            {dynamicActivityFeed.map((activity) => (
              <div key={activity.id} className="flex gap-3 md:gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-surface-primary border-2 border-border flex items-center justify-center shrink-0 mt-0.5">
                  {activity.icon}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs md:text-sm font-semibold truncate">{activity.title}</span>
                  <span className="text-[11px] md:text-xs text-muted-foreground truncate">{activity.desc}</span>
                  <span className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-wider mt-0.5">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </WidgetShell>
      </div>
    </div>
  )
}
