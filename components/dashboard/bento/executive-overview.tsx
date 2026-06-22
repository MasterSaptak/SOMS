"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { WidgetShell } from '@/components/enterprise/primitives/widget-shell'
import { RadialProgress } from '@/components/enterprise/primitives/radial-progress'
import { AnimatedCounter } from '@/components/enterprise/primitives/animated-counter'
import { StatusIndicator } from '@/components/enterprise/primitives/status-indicator'
import { Brain, Sparkles, Users, Calendar, CheckSquare, Clock } from 'lucide-react'
import type { WidgetState } from '@/components/enterprise/tokens'

interface MiniStat {
  label: string
  value: number
  suffix?: string
  icon: React.ReactNode
}

interface ExecutiveOverviewProps {
  greeting: string
  date: string
  healthScore: number
  miniStats: MiniStat[]
  aiConfidence?: number
  state?: WidgetState
  className?: string
}

export function ExecutiveOverview({
  greeting,
  date,
  healthScore,
  miniStats,
  aiConfidence = 92,
  state = 'idle',
  className,
}: ExecutiveOverviewProps) {
  return (
    <WidgetShell
      state={state}
      widgetId="executive-overview"
      surface="elevated"
      className={cn('h-full', className)}
      noPadding
    >
      <div className="relative h-full flex flex-col p-6 md:p-8 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-chart-3/[0.03] pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.04] rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />

        {/* Top Row — Greeting + AI Badge */}
        <div className="relative z-10 flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{greeting}</h1>
            <p className="text-sm text-muted-foreground mt-1">{date}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-primary">AI Active</span>
            <StatusIndicator variant="online" size="sm" />
          </div>
        </div>

        {/* Main Content — Health Score + Stats */}
        <div className="relative z-10 flex-1 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
          {/* Org Health Radial */}
          <div className="flex flex-col items-center gap-2">
            <RadialProgress
              value={healthScore}
              size="lg"
              strokeWidth={5}
              label="health"
              color={
                healthScore >= 80
                  ? 'hsl(var(--chart-2))'
                  : healthScore >= 60
                    ? 'hsl(var(--chart-4))'
                    : 'hsl(var(--chart-5))'
              }
            />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Org Health
            </span>
          </div>

          {/* Mini Stats Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {miniStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-1 p-3 rounded-xl bg-surface-secondary/60"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">{stat.icon}</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider truncate">
                    {stat.label}
                  </span>
                </div>
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix || ''}
                  className="text-xl font-bold"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom — AI Confidence Bar */}
        <div className="relative z-10 mt-4 flex items-center gap-3 pt-4 border-t border-border/30">
          <Brain className="w-4 h-4 text-primary/60" />
          <span className="text-[11px] text-muted-foreground font-medium">AI Confidence</span>
          <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${aiConfidence}%` }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="text-[11px] font-semibold tabular-nums">{aiConfidence}%</span>
        </div>
      </div>
    </WidgetShell>
  )
}
