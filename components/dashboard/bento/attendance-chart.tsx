"use client"

import React from 'react'
import {
  ChartWidget,
  RECHARTS_TOOLTIP_STYLE,
  RECHARTS_AXIS_STYLE,
  RECHARTS_GRID_STYLE,
} from '@/components/enterprise/primitives/chart-widget'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import type { WidgetState } from '@/components/enterprise/tokens'

interface AttendanceChartProps {
  data: Array<{ day: string; present: number; wfh: number; absent: number }>
  state?: WidgetState
  className?: string
}

export function AttendanceChart({ data, state = 'idle', className }: AttendanceChartProps) {
  return (
    <ChartWidget
      title="Attendance Trend"
      subtitle="Present vs WFH vs Absent — last 5 days"
      icon={<BarChart3 className="w-4 h-4" />}
      state={state}
      widgetId="attendance-chart"
      className={className}
      height={220}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid {...RECHARTS_GRID_STYLE} />
          <XAxis dataKey="day" {...RECHARTS_AXIS_STYLE} />
          <YAxis {...RECHARTS_AXIS_STYLE} />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
            {...RECHARTS_TOOLTIP_STYLE}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          />
          <Bar dataKey="present" name="Present" stackId="a" fill="hsl(var(--chart-2))" radius={[0, 0, 4, 4]} animationDuration={800} />
          <Bar dataKey="wfh" name="WFH" stackId="a" fill="hsl(var(--chart-1))" animationDuration={800} />
          <Bar dataKey="absent" name="Absent" stackId="a" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWidget>
  )
}
