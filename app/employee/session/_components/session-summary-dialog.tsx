"use client"

import React from 'react'
import { motion } from 'motion/react'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Coffee,
  Pizza,
  User,
  AlertTriangle,
  Pause,
  TrendingUp,
  ShieldAlert,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/format-time'

interface BreakSummary {
  type: string
  durationSeconds: number
}

interface SessionSummaryDialogProps {
  startTime: string | null
  endTime: string
  sessionDurationSeconds: number
  effectiveWorkSeconds: number
  breaks: BreakSummary[]
  totalBreakSeconds: number
  compensationEarned: number
  completionPercent: number
  status: 'completed' | 'ended_early'
  reason?: string
  notes?: string
  onClose: () => void
}

const BREAK_ICONS: Record<string, React.ReactNode> = {
  lunch: <Pizza className="w-4 h-4" />,
  food: <Coffee className="w-4 h-4" />,
  personal: <User className="w-4 h-4" />,
  emergency: <AlertTriangle className="w-4 h-4" />,
  paused: <Pause className="w-4 h-4" />,
}

const BREAK_LABELS: Record<string, string> = {
  lunch: 'Lunch Break',
  food: 'Coffee / Snack',
  personal: 'Personal Break',
  emergency: 'Emergency Break',
  paused: 'Paused',
}

const BREAK_COLORS: Record<string, string> = {
  lunch: 'text-orange-500 bg-orange-500/10',
  food: 'text-amber-500 bg-amber-500/10',
  personal: 'text-purple-500 bg-purple-500/10',
  emergency: 'text-red-500 bg-red-500/10',
  paused: 'text-blue-500 bg-blue-500/10',
}

function SummaryRow({ label, value, icon, accent }: {
  label: string
  value: string
  icon?: React.ReactNode
  accent?: string
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5">
        {icon && <span className={accent || 'text-muted-foreground'}>{icon}</span>}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className={`text-sm font-mono font-bold tabular-nums ${accent || ''}`}>{value}</span>
    </div>
  )
}

export function SessionSummaryDialog({
  startTime,
  endTime,
  sessionDurationSeconds,
  effectiveWorkSeconds,
  breaks,
  totalBreakSeconds,
  compensationEarned,
  completionPercent,
  status,
  reason,
  notes,
  onClose,
}: SessionSummaryDialogProps) {
  const formatTimeStr = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const isEarly = status === 'ended_early'

  // Aggregate breaks by type
  const breaksByType: Record<string, number> = {}
  breaks.forEach(b => {
    breaksByType[b.type] = (breaksByType[b.type] || 0) + b.durationSeconds
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 text-center relative ${
          isEarly
            ? 'bg-gradient-to-b from-red-500/10 to-transparent'
            : 'bg-gradient-to-b from-emerald-500/10 to-transparent'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            isEarly ? 'bg-red-500/10' : 'bg-emerald-500/10'
          }`}>
            {isEarly
              ? <XCircle className="w-8 h-8 text-red-500" />
              : <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            }
          </div>
          <h2 className="text-xl font-bold mb-1">Today&apos;s Work Summary</h2>
          <p className="text-xs text-muted-foreground">
            {isEarly ? 'Session ended early' : 'Session completed successfully'}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 pb-2 max-h-[50vh] overflow-y-auto">
          <div className="divide-y divide-border/30">
            <SummaryRow
              label="Started"
              value={formatTimeStr(startTime)}
              icon={<Clock className="w-4 h-4" />}
            />
            <SummaryRow
              label="Ended"
              value={formatTimeStr(endTime)}
              icon={<Clock className="w-4 h-4" />}
            />
            <SummaryRow
              label="Session Duration"
              value={formatTime(sessionDurationSeconds)}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <SummaryRow
              label="Effective Working Time"
              value={formatTime(effectiveWorkSeconds)}
              icon={<TrendingUp className="w-4 h-4" />}
              accent="text-primary"
            />

            {/* Break Breakdown */}
            {Object.entries(breaksByType).map(([type, secs]) => (
              <SummaryRow
                key={type}
                label={BREAK_LABELS[type] || type}
                value={formatTime(secs)}
                icon={BREAK_ICONS[type] || <Coffee className="w-4 h-4" />}
                accent={BREAK_COLORS[type]?.split(' ')[0] || ''}
              />
            ))}
            {Object.keys(breaksByType).length === 0 && (
              <SummaryRow
                label="Breaks"
                value="None"
                icon={<Coffee className="w-4 h-4" />}
              />
            )}

            {compensationEarned > 0 && (
              <SummaryRow
                label="Compensation Earned"
                value={`+${formatTime(compensationEarned)}`}
                icon={<ShieldAlert className="w-4 h-4" />}
                accent="text-indigo-500"
              />
            )}

            <SummaryRow
              label="Completion"
              value={`${completionPercent}%`}
              icon={<TrendingUp className="w-4 h-4" />}
              accent={completionPercent >= 100 ? 'text-emerald-500' : completionPercent >= 80 ? 'text-amber-500' : 'text-red-500'}
            />

            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isEarly
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}>
                {isEarly ? 'Ended Early' : 'Completed'}
              </span>
            </div>

            {reason && (
              <div className="py-2.5">
                <span className="text-sm text-muted-foreground block mb-1">Reason</span>
                <span className="text-sm font-medium">{reason}</span>
              </div>
            )}

            {notes && (
              <div className="py-2.5">
                <span className="text-sm text-muted-foreground block mb-1">Notes</span>
                <span className="text-sm text-foreground/80">{notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/60">
          <Button onClick={onClose} className="w-full rounded-full h-12 text-sm font-semibold">
            Close Summary
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
