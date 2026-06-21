"use client"

import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Users, Clock, CalendarRange, Activity, ArrowUp, ArrowDown } from 'lucide-react'
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'
import { AIBriefingCard } from '@/components/ai/ai-briefing-card'
import { InsightsStream } from '@/components/ai/insights-stream'
import { PendingApprovalsWidget } from '@/components/ai/pending-approvals-widget'
import { MOCK_EMPLOYEES, MOCK_TASKS, MOCK_LEAVES, MOCK_PRODUCTIVITY, MOCK_ATTENDANCE } from '@/lib/demo/generators/legacy-mock-data'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function AdminDashboard() {
  // Compute KPIs
  const activeEmployeesCount = MOCK_EMPLOYEES.filter(e => e.status === 'active').length
  const today = '2026-06-17' // From mock data current context
  const todayAttendance = MOCK_ATTENDANCE.filter(a => a.date === today && (a.status === 'present' || a.status === 'wfh')).length
  const attendanceRate = activeEmployeesCount > 0 ? Math.round((todayAttendance / activeEmployeesCount) * 100) : 0
  const pendingLeavesCount = MOCK_LEAVES.filter(l => l.status === 'pending').length
  
  const activeProductivity = MOCK_PRODUCTIVITY.filter(p => p.score > 0)
  const orgHealthScore = activeProductivity.length > 0 
    ? Math.round(activeProductivity.reduce((acc, curr) => acc + curr.score, 0) / activeProductivity.length)
    : 0

  // Chart Data
  const attendanceTrend = [
    { day: 'Mon', present: 7, wfh: 1, absent: 2 },
    { day: 'Tue', present: 8, wfh: 1, absent: 1 },
    { day: 'Wed', present: 7, wfh: 2, absent: 1 },
    { day: 'Thu', present: 8, wfh: 1, absent: 1 },
    { day: 'Fri', present: 6, wfh: 2, absent: 2 },
  ]

  const deptPerformance = [
    { dept: 'Engineering', score: 83, members: 4 },
    { dept: 'Design', score: 88, members: 2 },
    { dept: 'HR', score: 85, members: 1 },
    { dept: 'Marketing', score: 82, members: 1 },
    { dept: 'Operations', score: 75, members: 1 },
  ]

  const deptHeadcount = [
    { name: 'Engineering', value: 4 },
    { name: 'Design', value: 2 },
    { name: 'HR', value: 1 },
    { name: 'Marketing', value: 1 },
    { name: 'Operations', value: 1 },
  ]
  const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="flex flex-col gap-6 pb-12 max-w-[1600px] mx-auto">
      
      {/* Page Header */}
      <motion.div variants={itemVars}>
        <h1 className="text-3xl font-bold tracking-tight">AI Office Manager</h1>
        <p className="text-muted-foreground mt-1">Smart insights and operations dashboard.</p>
      </motion.div>

      {/* SECTION 1: AI Briefing */}
      <motion.div variants={itemVars}>
        <AIBriefingCard />
      </motion.div>

      {/* SECTION 2: Smart KPI Row */}
      <motion.div variants={itemVars} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Card className="border-b-[3px] border-b-blue-500/50 hover:border-b-blue-500 transition-colors">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Employees</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-3xl font-bold">{activeEmployeesCount}</span>
              <span className="text-xs text-emerald-500 flex items-center font-medium mb-1"><ArrowUp className="w-3 h-3 mr-0.5" /> +1 this month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{MOCK_EMPLOYEES.length} total headcount</p>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card className="border-b-[3px] border-b-emerald-500/50 hover:border-b-emerald-500 transition-colors">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Attendance Rate</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-3xl font-bold">{attendanceRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">8 present · 1 on leave</p>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className="border-b-[3px] border-b-amber-500/50 hover:border-b-amber-500 transition-colors">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending Approvals</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <CalendarRange className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-3xl font-bold">{pendingLeavesCount}</span>
              <span className="text-xs text-amber-500 font-medium mb-1">Needs action</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Leaves and requests</p>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="border-b-[3px] border-b-purple-500/50 hover:border-b-purple-500 transition-colors">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Org Health Score</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-purple-500" />
              </div>
            </div>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-3xl font-bold">{orgHealthScore}<span className="text-lg text-muted-foreground font-normal">/100</span></span>
              <span className="text-xs text-red-500 flex items-center font-medium mb-1"><ArrowDown className="w-3 h-3 mr-0.5" /> -2% vs last wk</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on productivity & focus</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* SECTION 3: Live Feeds */}
      <motion.div variants={itemVars} className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        <div className="lg:col-span-2 h-full">
          <InsightsStream />
        </div>
        <div className="lg:col-span-1 h-full">
          <PendingApprovalsWidget />
        </div>
      </motion.div>

      {/* SECTION 4: Charts Row */}
      <motion.div variants={itemVars} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attendance Trend */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Attendance Trend</CardTitle>
            <CardDescription>Present vs WFH vs Absent over the last 5 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="present" name="Present" stackId="a" fill="hsl(var(--chart-2))" radius={[0, 0, 4, 4]} />
                <Bar dataKey="wfh" name="WFH" stackId="a" fill="hsl(var(--chart-1))" />
                <Bar dataKey="absent" name="Absent" stackId="a" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Department Performance</CardTitle>
            <CardDescription>Average productivity score by department</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col justify-center gap-4">
            {deptPerformance.map(dept => (
              <div key={dept.dept} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{dept.dept}</span>
                  <span className="text-muted-foreground">{dept.score}/100</span>
                </div>
                <Progress 
                  value={dept.score} 
                  className="h-2 bg-muted" 
                  indicatorClassName={dept.score > 85 ? 'bg-emerald-500' : dept.score > 80 ? 'bg-blue-500' : 'bg-amber-500'} 
                />
              </div>
            ))}
          </CardContent>
        </Card>

      </motion.div>

      {/* SECTION 5: Headcount Distribution */}
      <motion.div variants={itemVars}>
        <Card className="border-border/50 shadow-sm w-full lg:w-1/2">
          <CardHeader>
            <CardTitle className="text-base">Headcount Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptHeadcount}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptHeadcount.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  )
}
