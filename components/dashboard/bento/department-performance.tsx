"use client"

import React from 'react'
import { WidgetShell } from '@/components/enterprise/primitives/widget-shell'
import { AnimatedCounter } from '@/components/enterprise/primitives/animated-counter'
import { Progress } from '@/components/ui/progress'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WidgetState } from '@/components/enterprise/tokens'

interface DeptData {
  dept: string
  score: number
  members: number
}

interface DepartmentPerformanceProps {
  data: DeptData[]
  state?: WidgetState
  className?: string
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'bg-emerald-500'
  if (score >= 80) return 'bg-blue-500'
  return 'bg-amber-500'
}

export function DepartmentPerformance({ data, state = 'idle', className }: DepartmentPerformanceProps) {
  return (
    <WidgetShell
      title="Department Performance"
      subtitle="Avg. productivity by department"
      icon={<Trophy className="w-4 h-4" />}
      state={state}
      widgetId="department-performance"
      className={cn('h-full', className)}
    >
      <div className="flex flex-col gap-3.5 mt-1">
        {data.map((dept) => (
          <div key={dept.dept} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{dept.dept}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{dept.members} members</span>
                <span className="text-sm font-semibold tabular-nums">{dept.score}</span>
              </div>
            </div>
            <Progress
              value={dept.score}
              className="h-1.5 bg-muted/40"
              indicatorClassName={getScoreColor(dept.score)}
            />
          </div>
        ))}
      </div>
    </WidgetShell>
  )
}
