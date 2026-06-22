"use client"

import React from 'react'
import {
  ChartWidget,
  RECHARTS_TOOLTIP_STYLE,
} from '@/components/enterprise/primitives/chart-widget'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users } from 'lucide-react'
import { CHART_COLOR_ARRAY } from '@/components/enterprise/tokens'
import type { WidgetState } from '@/components/enterprise/tokens'

interface HeadcountDonutProps {
  data: Array<{ name: string; value: number }>
  state?: WidgetState
  className?: string
}

export function HeadcountDonut({ data, state = 'idle', className }: HeadcountDonutProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <ChartWidget
      title="Headcount"
      subtitle={`${total} total employees`}
      icon={<Users className="w-4 h-4" />}
      state={state}
      widgetId="headcount-donut"
      className={className}
      height={200}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={4}
            dataKey="value"
            animationBegin={200}
            animationDuration={800}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]} />
            ))}
          </Pie>
          <Tooltip {...RECHARTS_TOOLTIP_STYLE} />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartWidget>
  )
}
