"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { MOCK_EMPLOYEES, MOCK_DEPARTMENTS, MOCK_TASKS, MOCK_LEAVES, MOCK_ATTENDANCE, MOCK_PRODUCTIVITY, getFullName } from '@/lib/mock-data'
import {
  Users, CheckCircle2, Clock, TrendingUp, CalendarRange, BarChart3,
  ArrowUp, ArrowDown, Activity, Target, Briefcase, Building2,
} from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

// Mock chart data
const attendanceTrend = [
  { day: 'Mon', present: 45, absent: 3, wfh: 5 },
  { day: 'Tue', present: 47, absent: 2, wfh: 4 },
  { day: 'Wed', present: 44, absent: 4, wfh: 5 },
  { day: 'Thu', present: 46, absent: 3, wfh: 4 },
  { day: 'Fri', present: 42, absent: 5, wfh: 6 },
]

const taskDistribution = [
  { name: 'Completed', value: 45, color: '#10b981' },
  { name: 'In Progress', value: 28, color: '#3b82f6' },
  { name: 'Pending', value: 18, color: '#94a3b8' },
  { name: 'Blocked', value: 9, color: '#ef4444' },
]

const deptPerformance = [
  { dept: 'Engineering', score: 88, tasks: 32, members: 4 },
  { dept: 'Design', score: 92, tasks: 18, members: 2 },
  { dept: 'HR', score: 85, tasks: 12, members: 1 },
  { dept: 'Marketing', score: 78, tasks: 8, members: 0 },
  { dept: 'Operations', score: 82, tasks: 6, members: 1 },
]

const monthlyHours = [
  { month: 'Jan', hours: 1680 },
  { month: 'Feb', hours: 1520 },
  { month: 'Mar', hours: 1760 },
  { month: 'Apr', hours: 1640 },
  { month: 'May', hours: 1720 },
  { month: 'Jun', hours: 1580 },
]

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState('30d')

  const totalEmployees = MOCK_EMPLOYEES.filter(e => e.status === 'active').length
  const totalTasks = MOCK_TASKS.length
  const completedTasks = MOCK_TASKS.filter(t => t.status === 'completed').length
  const pendingLeaves = MOCK_LEAVES.filter(l => l.status === 'pending').length
  const avgProductivity = Math.round(MOCK_PRODUCTIVITY.reduce((a, p) => a + p.score, 0) / MOCK_PRODUCTIVITY.length)

  return (
    <motion.div className="flex flex-col gap-6 pb-12" variants={containerVars} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Analytics</h1>
          <p className="text-muted-foreground mt-1">Organization-wide insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border overflow-hidden">
          {['7d', '30d', '90d'].map((range) => (
            <button key={range} onClick={() => setDateRange(range)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${dateRange === range ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}>
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Employees', value: totalEmployees, icon: <Users className="w-5 h-5" />, iconBg: 'bg-blue-500/10 text-blue-500', change: '+2', up: true },
          { title: 'Task Completion', value: `${Math.round((completedTasks / totalTasks) * 100)}%`, icon: <CheckCircle2 className="w-5 h-5" />, iconBg: 'bg-emerald-500/10 text-emerald-500', change: '+5%', up: true },
          { title: 'Avg Productivity', value: avgProductivity, icon: <Target className="w-5 h-5" />, iconBg: 'bg-purple-500/10 text-purple-500', change: '+3', up: true },
          { title: 'Pending Leaves', value: pendingLeaves, icon: <CalendarRange className="w-5 h-5" />, iconBg: 'bg-amber-500/10 text-amber-500', change: '-1', up: false },
        ].map((kpi) => (
          <motion.div key={kpi.title} variants={itemVars}>
            <Card className="hover:border-primary/20 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.iconBg}`}>{kpi.icon}</div>
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${kpi.up ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {kpi.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {kpi.change}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{kpi.title}</span>
                <span className="text-3xl font-bold block mt-1">{kpi.value}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend */}
        <motion.div variants={itemVars} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trend</CardTitle>
              <CardDescription>Daily attendance breakdown this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="day" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="present" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Present" />
                  <Bar dataKey="wfh" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} name="WFH" />
                  <Bar dataKey="absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Task Distribution */}
        <motion.div variants={itemVars}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Task Status</CardTitle>
              <CardDescription>Distribution across all teams</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={taskDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {taskDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {taskDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Work Hours */}
        <motion.div variants={itemVars}>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Work Hours</CardTitle>
              <CardDescription>Total hours logged across all employees</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyHours}>
                  <defs>
                    <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="hours" stroke="hsl(var(--primary))" fill="url(#hoursGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Performance */}
        <motion.div variants={itemVars}>
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Productivity scores by department</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {deptPerformance.map((dept) => (
                <div key={dept.dept} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{dept.dept}</span>
                      <span className="text-sm font-bold">{dept.score}%</span>
                    </div>
                    <Progress value={dept.score} className="h-2" />
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span>{dept.members} members</span>
                      <span>{dept.tasks} tasks</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
