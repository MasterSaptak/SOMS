"use client"

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { BentoGrid, BentoSlot } from '@/components/enterprise/layout/bento-grid'
import { MetricCard } from '@/components/enterprise/primitives/metric-card'
import { ExecutiveOverview } from '@/components/dashboard/bento/executive-overview'
import { AICopilotPanel } from '@/components/dashboard/bento/ai-copilot-panel'
import { WorkspaceStatus } from '@/components/dashboard/bento/workspace-status'
import { QuickActions } from '@/components/dashboard/bento/quick-actions'
import { PendingApprovalsBento } from '@/components/dashboard/bento/pending-approvals-bento'
import { SystemUpdateCenter } from '@/components/dashboard/bento/system-update-center'
import {
  Users, Clock, CalendarRange, Activity, Calendar, CheckSquare, Briefcase, Loader2
} from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state';

const ChartLoader = () => <div className="flex items-center justify-center h-full min-h-[200px] bg-surface-secondary/20 rounded-xl animate-pulse"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>

const AttendanceChart = dynamic(() => import('@/components/dashboard/bento/attendance-chart').then(mod => mod.AttendanceChart), { loading: ChartLoader, ssr: false })
const DepartmentPerformance = dynamic(() => import('@/components/dashboard/bento/department-performance').then(mod => mod.DepartmentPerformance), { loading: ChartLoader, ssr: false })
const HeadcountDonut = dynamic(() => import('@/components/dashboard/bento/headcount-donut').then(mod => mod.HeadcountDonut), { loading: ChartLoader, ssr: false })
const LiveActivity = dynamic(() => import('@/components/dashboard/bento/live-activity').then(mod => mod.LiveActivity), { loading: ChartLoader, ssr: false })
// TODO: Fetch real data instead of mock data

export default function AdminDashboard() {
  // ─── Compute KPIs (same logic as before) ─── //
  const activeEmployeesCount = ([] as any[]).filter((e) => e.status === 'active').length
  const today = '2026-06-17'
  const todayAttendance = ([] as any[]).filter(
    (a) => a.date === today && (a.status === 'present' || a.status === 'wfh')
  ).length
  const attendanceRate =
    activeEmployeesCount > 0 ? Math.round((todayAttendance / activeEmployeesCount) * 100) : 0
  const pendingLeavesCount = ([] as any[]).filter((l) => l.status === 'pending').length
  const activeProductivity = ([] as any[]).filter((p) => p.score > 0)
  const orgHealthScore =
    activeProductivity.length > 0
      ? Math.round(
          activeProductivity.reduce((acc, curr) => acc + curr.score, 0) / activeProductivity.length
        )
      : 0

  const pendingTasks = ([] as any[]).filter((t) => t.status === 'pending' || t.status === 'in_progress').length

  // ─── Chart Data (same as before) ─── //
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

  // ─── Greeting ─── //
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning, Admin' : hour < 17 ? 'Good Afternoon, Admin' : 'Good Evening, Admin'
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // ─── AI Briefing (same API call) ─── //
  const [briefing, setBriefing] = useState<string | null>(null)
  const [briefingLoading, setBriefingLoading] = useState(true)

  const fetchBriefing = async () => {
    setBriefingLoading(true)
    try {
      const res = await fetch('/api/ai/briefing')
      if (res.ok) {
        const json = await res.json()
        setBriefing(json.briefing)
      } else {
        setBriefing('Unable to load briefing. Check AI service connectivity.')
      }
    } catch {
      setBriefing('Unable to connect to AI service.')
    } finally {
      setBriefingLoading(false)
    }
  }

  useEffect(() => {
    fetchBriefing()
  }, [])

  // ─── AI Insights (existing mock data) ─── //
  const aiInsights = ([] as any[]).map((i) => ({
    id: i.id,
    title: i.title,
    content: i.content,
    severity: i.severity,
    type: i.insightType,
    timestamp: i.createdAt,
  }))

  return (
    <div className="flex flex-col gap-2 pb-12 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Enterprise overview and AI intelligence</p>
      </div>

      {/* Bento Dashboard */}
      <BentoGrid gap="md">

        {/* Row 1: Hero + KPIs */}
        <BentoSlot size="hero" widgetId="executive-overview">
          <ExecutiveOverview
            greeting={greeting}
            date={dateStr}
            healthScore={orgHealthScore}
            miniStats={[
              { label: 'Active', value: activeEmployeesCount, icon: <Users className="w-3.5 h-3.5" /> },
              { label: 'Attendance', value: attendanceRate, suffix: '%', icon: <Clock className="w-3.5 h-3.5" /> },
              { label: 'Tasks', value: pendingTasks, icon: <CheckSquare className="w-3.5 h-3.5" /> },
              { label: 'Meetings', value: 3, icon: <Calendar className="w-3.5 h-3.5" /> },
            ]}
            aiConfidence={92}
          />
        </BentoSlot>

        <BentoSlot size="small" widgetId="kpi-employees">
          <MetricCard
            title="Active Employees"
            value={activeEmployeesCount}
            trend={1}
            trendLabel="+1 this month"
            subtitle={`${([] as any[]).length} total headcount`}
            icon={<Users className="w-4 h-4" />}
            sparklineData={[6, 7, 7, 8, 8, 9, 9]}
            sparklineColor="blue"
          />
        </BentoSlot>

        <BentoSlot size="small" widgetId="kpi-attendance">
          <MetricCard
            title="Attendance Rate"
            value={attendanceRate}
            suffix="%"
            trend={3}
            subtitle={`${todayAttendance} present · ${activeEmployeesCount - todayAttendance} absent/leave`}
            icon={<Clock className="w-4 h-4" />}
            sparklineData={[78, 82, 80, 88, 85, 90, attendanceRate]}
            sparklineColor="emerald"
            progress={attendanceRate}
            progressColor="bg-emerald-500"
          />
        </BentoSlot>

        {/* Row 2: Charts + AI */}
        <BentoSlot size="wide" widgetId="attendance-chart">
          <AttendanceChart data={attendanceTrend} />
        </BentoSlot>

        <BentoSlot size="tall" widgetId="ai-copilot">
          <AICopilotPanel
            briefing={briefing}
            briefingLoading={briefingLoading}
            insights={aiInsights}
            onRefreshBriefing={fetchBriefing}
          />
        </BentoSlot>

        <BentoSlot size="medium" widgetId="dept-performance">
          <DepartmentPerformance data={deptPerformance} />
        </BentoSlot>

        <BentoSlot size="medium" widgetId="headcount">
          <HeadcountDonut data={deptHeadcount} />
        </BentoSlot>

        {/* Row 3: Activity + Workspace + Actions + Approvals */}
        <BentoSlot size="medium" widgetId="system-update">
          <SystemUpdateCenter />
        </BentoSlot>

        <BentoSlot size="wide" widgetId="live-activity">
          <LiveActivity />
        </BentoSlot>

        <BentoSlot size="medium" widgetId="workspace">
          <WorkspaceStatus />
        </BentoSlot>

        <BentoSlot size="medium" widgetId="quick-actions">
          <QuickActions />
        </BentoSlot>

        <BentoSlot size="wide" widgetId="pending-approvals">
          <PendingApprovalsBento />
        </BentoSlot>

      </BentoGrid>
    </div>
  )
}
