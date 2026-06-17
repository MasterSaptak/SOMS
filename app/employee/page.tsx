"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/dashboard/stats-card'
import { useAppStore } from '@/store/use-app-store'
import { createClient } from '@/lib/supabase/client'
import { 
  Clock, 
  CheckCircle2, 
  Flame,
  ListTodo,
  Target,
  ArrowRight,
  Calendar,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { formatTime } from '@/lib/format-time'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
}

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

      // Get Employee
      const { data: emp } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (emp) {
        setEmployee(emp)
        // Get Tasks
        const { data: myTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_to', emp.id)
          .order('created_at', { ascending: false })
          
        setTasks(myTasks || [])
      }
      
      setIsLoading(false)
    }
    
    loadDashboard()
  }, [])

  const firstName = employee?.full_name?.split(' ')[0] || 'there'
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  const completedTasks = tasks.filter(t => t.status === 'completed')

  const productivityScore = 85 // Mocked for now
  const dailyTarget = 28800
  const progressPercent = Math.min((totalWorkSeconds / dailyTarget) * 100, 100)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  
  return (
    <motion.div 
      className="flex flex-col gap-6 pb-12"
      variants={containerVars}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <motion.div variants={itemVars}>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, {firstName}!</h1>
          <p className="text-muted-foreground mt-1">Here is what&apos;s happening today, {currentDate}</p>
        </motion.div>
        
        <motion.div variants={itemVars} className="flex items-center gap-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
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
          <Button asChild>
            <Link href="/employee/session">Go to Workspace</Link>
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Work Hours"
          value={sessionState !== 'idle' ? formatTime(totalWorkSeconds).slice(0, 5) : '0h 00m'}
          badge="Today"
          icon={<Clock className="w-5 h-5" />}
          hoverColor="hover:border-primary/30"
          footer={<Progress value={progressPercent} className="h-1.5 mt-1" />}
          isLoading={isLoading}
        />
        <StatsCard
          title="Attendance Streak"
          value="12 Days"
          badge="12 Days Active"
          badgeClassName="text-emerald-600 border-emerald-200"
          icon={<Flame className="w-5 h-5" />}
          iconBg="bg-emerald-500/10 text-emerald-500"
          hoverColor="hover:border-emerald-500/30"
          subtitle="🔥 Keep it up for a reward!"
          isLoading={isLoading}
        />
        <StatsCard
          title="Pending Tasks"
          value={pendingTasks.length}
          badge={`${completedTasks.length} done`}
          badgeClassName="text-blue-600 border-blue-200"
          icon={<ListTodo className="w-5 h-5" />}
          iconBg="bg-blue-500/10 text-blue-500"
          hoverColor="hover:border-blue-500/30"
          subtitle={`${tasks.length} total tasks`}
          isLoading={isLoading}
        />
        <StatsCard
          title="Productivity Score"
          value={productivityScore}
          badge="📈 Good"
          icon={<Target className="w-5 h-5" />}
          iconBg="bg-purple-500/10 text-purple-600"
          hoverColor="hover:border-purple-500/30"
          footer={
            <div className="flex items-center justify-between mt-1">
              <Progress value={productivityScore} className="h-1.5 flex-1 mr-3" indicatorClassName="bg-purple-500" />
              <span className="text-xs text-muted-foreground font-medium">{productivityScore}%</span>
            </div>
          }
          isLoading={isLoading}
          className="bg-gradient-to-br from-card to-purple-500/5"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVars} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Tasks</CardTitle>
                <CardDescription>Prioritized tasks for today</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/employee/tasks" className="text-sm font-medium">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {pendingTasks.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500/30 mb-3" />
                  <p className="text-sm text-muted-foreground">All caught up! No pending tasks.</p>
                </div>
              ) : (
                pendingTasks.slice(0, 4).map((task) => {
                  const priorityColors: Record<string, string> = {
                    critical: 'text-red-500 bg-red-500/10',
                    high: 'text-orange-500 bg-orange-500/10',
                    medium: 'text-blue-500 bg-blue-500/10',
                    low: 'text-slate-500 bg-slate-500/10',
                  }
                  return (
                    <div key={task.id} className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors gap-4">
                      <div className="flex items-start gap-4">
                        <button className="mt-0.5 rounded-full w-5 h-5 border-2 border-muted-foreground flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                        </button>
                        <div>
                          <h4 className="font-medium text-sm text-card-foreground">{task.title}</h4>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm ${priorityColors[task.priority] || 'text-slate-500 bg-slate-500/10'}`}>
                              {task.priority || 'medium'}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm text-blue-500 bg-blue-500/10">
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex flex-col gap-6">
          <motion.div variants={itemVars}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Link href="/employee/leaves" className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/50 hover:bg-accent hover:border-accent-foreground/20 transition-all text-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium">Request Leave</span>
                </Link>
                <Link href="/employee/tasks" className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/50 hover:bg-accent hover:border-accent-foreground/20 transition-all text-center gap-2">
                  <Activity className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-medium">View Tasks</span>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
