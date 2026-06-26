"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { BentoGrid, BentoSlot } from '@/components/enterprise/bento-grid'
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
  Bell
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

const activityFeed = [
  { id: 1, title: 'Meeting completed', desc: 'Q3 Planning with Design Team', time: '10 mins ago', icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
  { id: 2, title: 'Task assigned', desc: 'Update component library', time: '1 hour ago', icon: <Bell className="w-4 h-4 text-blue-500" /> },
  { id: 3, title: 'Leave approved', desc: 'Annual vacation (Oct 12-15)', time: '2 hours ago', icon: <Calendar className="w-4 h-4 text-purple-500" /> },
  { id: 4, title: 'Check-in', desc: 'Started work', time: '5 hours ago', icon: <Clock className="w-4 h-4 text-amber-500" /> },
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

  const firstName = employee?.full_name?.split(' ')[0] || 'Saptak' // Using prompt suggestion
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  const completedTasks = tasks.filter(t => t.status === 'completed')

  const productivityScore = 85
  const dailyTarget = 28800
  const progressPercent = Math.min((totalWorkSeconds / dailyTarget) * 100, 100)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex flex-col gap-6 pb-12 w-full animate-in fade-in duration-700">
      
      {/* 1. Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{greeting}, {firstName}</h1>
          <p className="text-muted-foreground mt-1 text-sm">Here is your workspace overview for {currentDate}</p>
        </div>
        
        <div className="flex items-center gap-3 bg-surface-primary p-1.5 rounded-full border border-border/40 shadow-sm">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
            sessionState === 'working' ? 'bg-primary/10 text-primary' :
            sessionState === 'break' ? 'bg-amber-500/10 text-amber-600' :
            'bg-muted text-muted-foreground'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              sessionState === 'working' ? 'bg-primary animate-pulse' :
              sessionState === 'break' ? 'bg-amber-500 animate-pulse' :
              'bg-muted-foreground/40'
            }`} />
            {sessionState === 'working' ? 'Working' : sessionState === 'break' ? 'On Break' : 'Offline'}
          </div>
          <Button asChild size="sm" className="rounded-full shadow-none px-6">
            <Link href="/employee/session">Open Workspace</Link>
          </Button>
        </div>
      </div>

      {/* 2. Bento Grid Layout */}
      <BentoGrid>
        
        {/* HERO CARD - Wide and prominent */}
        <BentoSlot span="large">
          <WidgetShell className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground border-none shadow-lg">
            <div className="flex flex-col h-full justify-between p-2">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-4xl font-black tracking-tight mb-2">Today&apos;s Summary</h2>
                  <p className="text-primary-foreground/80 text-sm font-medium">You are on track to hit your weekly productivity goals.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-black/10 rounded-2xl p-4 backdrop-blur-md">
                  <div className="text-primary-foreground/70 text-xs font-bold uppercase tracking-wider mb-1">Time Logged</div>
                  <div className="text-2xl font-bold">{sessionState !== 'idle' ? formatTime(totalWorkSeconds).slice(0, 5) : '0h 00m'}</div>
                </div>
                <div className="bg-black/10 rounded-2xl p-4 backdrop-blur-md">
                  <div className="text-primary-foreground/70 text-xs font-bold uppercase tracking-wider mb-1">Tasks Done</div>
                  <div className="text-2xl font-bold">{completedTasks.length} / {tasks.length}</div>
                </div>
                <div className="bg-black/10 rounded-2xl p-4 backdrop-blur-md">
                  <div className="text-primary-foreground/70 text-xs font-bold uppercase tracking-wider mb-1">Next Meeting</div>
                  <div className="text-2xl font-bold">2:30 PM</div>
                </div>
              </div>
            </div>
          </WidgetShell>
        </BentoSlot>

        <BentoSlot>
          <MetricCard
            title="Productivity Score"
            value={`${productivityScore}%`}
            trend={{ value: "Excellent", isPositive: true }}
            progress={{ value: productivityScore, color: "bg-emerald-500" }}
            icon={<Target className="w-4 h-4 text-emerald-500" />}
            isLoading={isLoading}
            className="border-emerald-500/20 bg-gradient-to-br from-surface-primary to-emerald-500/5"
          />
        </BentoSlot>

        <BentoSlot>
          <WidgetShell title="Productivity Trend" isLoading={isLoading} className="pb-0 px-0">
            <div className="h-[120px] w-full mt-4">
              <LazyChart data={productivityData} />
            </div>
          </WidgetShell>
        </BentoSlot>

        {/* AI INSIGHT CARD */}
        <BentoSlot span="wide">
          <WidgetShell
            title="AI Insights"
            subtitle="Smart recommendations for your day"
            isLoading={isLoading}
            className="border-purple-500/20 bg-gradient-to-br from-surface-primary to-purple-500/5"
            action={<Sparkles className="w-4 h-4 text-purple-500" />}
          >
            <div className="flex gap-4 items-start mt-2">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-relaxed">
                  Hi Saptak! Your productivity peaks around <span className="text-purple-500 font-bold">3:00 PM</span>. I recommend scheduling your deep-work task <span className="font-semibold text-foreground">"Update component library"</span> for that time block to maximize efficiency.
                </p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="secondary" className="rounded-full text-xs h-8 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-0">
                    <Calendar className="w-3 h-3 mr-1" /> Schedule Task
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full text-xs h-8">
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </WidgetShell>
        </BentoSlot>

        <BentoSlot span="tall">
          <WidgetShell
            title="Activity Feed"
            subtitle="Your recent actions"
            isLoading={isLoading}
          >
            <div className="flex flex-col gap-6 mt-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-border/50">
              {activityFeed.map((activity) => (
                <div key={activity.id} className="flex gap-4 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-surface-primary border-2 border-border flex items-center justify-center shrink-0 mt-0.5">
                    {activity.icon}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{activity.title}</span>
                    <span className="text-xs text-muted-foreground">{activity.desc}</span>
                    <span className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-wider mt-1">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </WidgetShell>
        </BentoSlot>

        <BentoSlot>
          <WidgetShell
            title="Quick Actions"
            isLoading={isLoading}
          >
            <div className="grid grid-cols-2 gap-3 h-full mt-2">
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 bg-surface-primary hover:bg-surface-secondary border-border/40 hover:border-primary/30 transition-all rounded-2xl" asChild>
                <Link href="/employee/leaves">
                  <Coffee className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold tracking-wide">Leave</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 bg-surface-primary hover:bg-surface-secondary border-border/40 hover:border-amber-500/30 transition-all rounded-2xl" asChild>
                <Link href="/employee/tasks">
                  <Activity className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold tracking-wide">Tasks</span>
                </Link>
              </Button>
            </div>
          </WidgetShell>
        </BentoSlot>

      </BentoGrid>
    </div>
  )
}
