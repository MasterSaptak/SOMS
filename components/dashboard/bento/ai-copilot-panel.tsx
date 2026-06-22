"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { WidgetShell } from '@/components/enterprise/primitives/widget-shell'
import { StatusIndicator } from '@/components/enterprise/primitives/status-indicator'
import { Badge } from '@/components/ui/badge'
import { Brain, Sparkles, AlertTriangle, AlertCircle, Info, TrendingUp, Lightbulb, ArrowRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { WidgetState } from '@/components/enterprise/tokens'

interface AIInsight {
  id: string
  title: string
  content: string
  severity: 'info' | 'warning' | 'critical'
  type: string
  timestamp: string
}

interface AICopilotPanelProps {
  briefing: string | null
  briefingLoading?: boolean
  insights: AIInsight[]
  onRefreshBriefing?: () => void
  state?: WidgetState
  className?: string
}

const severityConfig = {
  critical: { Icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/8' },
  warning: { Icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/8' },
  info: { Icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/8' },
}

export function AICopilotPanel({
  briefing,
  briefingLoading = false,
  insights,
  onRefreshBriefing,
  state = 'idle',
  className,
}: AICopilotPanelProps) {
  const sortedInsights = [...insights].sort((a, b) => {
    const sev = { critical: 3, warning: 2, info: 1 }
    return sev[b.severity] - sev[a.severity]
  }).slice(0, 5)

  return (
    <WidgetShell
      title="AI Executive Copilot"
      icon={<Brain className="w-4 h-4" />}
      state={state}
      widgetId="ai-copilot"
      surface="elevated"
      className={cn('h-full', className)}
      noPadding
      scrollable
      actions={
        <div className="flex items-center gap-1.5">
          <StatusIndicator variant="online" size="sm" />
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Active</span>
        </div>
      }
    >
      <div className="flex flex-col">
        {/* Briefing Section */}
        <div className="px-5 py-4 border-b border-border/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                Today&apos;s Briefing
              </span>
            </div>
            {onRefreshBriefing && (
              <button
                onClick={onRefreshBriefing}
                className="p-1 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground"
                disabled={briefingLoading}
              >
                <RotateCcw className={cn('w-3 h-3', briefingLoading && 'animate-spin')} />
              </button>
            )}
          </div>
          {briefingLoading ? (
            <div className="flex flex-col gap-2">
              <div className="skeleton-shimmer rounded h-3 w-full" />
              <div className="skeleton-shimmer rounded h-3 w-5/6" />
              <div className="skeleton-shimmer rounded h-3 w-4/6" />
            </div>
          ) : (
            <p className="text-sm text-foreground/90 leading-relaxed">
              {briefing || 'No briefing available.'}
            </p>
          )}
        </div>

        {/* Insights Section */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-1.5 mb-3">
            <Lightbulb className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Insights & Anomalies
            </span>
            <Badge variant="secondary" className="text-[9px] ml-auto h-4 px-1.5">
              {insights.length}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col">
          {sortedInsights.map((insight, index) => {
            const config = severityConfig[insight.severity]
            const time = new Date(insight.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.06 }}
                className={cn(
                  'px-5 py-3 hover:bg-muted/20 transition-colors cursor-pointer group',
                  insight.severity === 'critical' && 'bg-red-500/[0.03]'
                )}
              >
                <div className="flex gap-3">
                  <div className={cn('mt-0.5 shrink-0', config.color)}>
                    <config.Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold truncate">{insight.title}</h4>
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">{time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {insight.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="px-5 py-4 mt-auto border-t border-border/30">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
            Quick Actions
          </span>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              View Trends
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 rounded-full">
              <AlertCircle className="w-3 h-3" />
              Risk Report
            </Button>
          </div>
        </div>
      </div>
    </WidgetShell>
  )
}
