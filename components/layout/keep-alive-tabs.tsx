'use client'

import React, { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Preload the components dynamically
const DashboardView = dynamic(() => import('@/components/employee/dashboard-view'), {
  loading: () => <TabLoader />
})
const WorkSessionView = dynamic(() => import('@/components/employee/session-view'), {
  loading: () => <TabLoader />
})
const TasksView = dynamic(() => import('@/components/employee/tasks-view'), {
  loading: () => <TabLoader />
})
const LeavesView = dynamic(() => import('@/components/employee/leaves-view'), {
  loading: () => <TabLoader />
})
const PayrollView = dynamic(() => import('@/components/employee/payroll-view'), {
  loading: () => <TabLoader />
})

function TabLoader() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
      <p className="text-sm text-muted-foreground mt-4 animate-pulse">Loading module...</p>
    </div>
  )
}

export function KeepAliveTabs() {
  const searchParams = useSearchParams()
  const activeTab = searchParams?.get('tab') || 'overview'

  // We mount ALL tabs wrapped in suspense, but only display the active one via CSS.
  // This achieves the 0ms tab switch requested by the user, bypassing React unmounts.
  return (
    <div className="w-full h-full relative">
      <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
        <DashboardView />
      </div>
      <div style={{ display: activeTab === 'session' ? 'block' : 'none' }}>
        <WorkSessionView />
      </div>
      <div style={{ display: activeTab === 'tasks' ? 'block' : 'none' }}>
        <TasksView />
      </div>
      <div style={{ display: activeTab === 'leaves' ? 'block' : 'none' }}>
        <LeavesView />
      </div>
      <div style={{ display: activeTab === 'payroll' ? 'block' : 'none' }}>
        <PayrollView />
      </div>
    </div>
  )
}
