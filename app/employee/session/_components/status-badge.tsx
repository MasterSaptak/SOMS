"use client"

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export type SessionDisplayState = 'idle' | 'working' | 'paused' | 'break' | 'completed' | 'ended_early' | 'compensation'

interface StatusBadgeProps {
  sessionState: SessionDisplayState
  activeBreak: string | null
  isCompleted: boolean
  isEarlyExit?: boolean
  isUsingCompensation?: boolean
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  completed: { label: 'Completed', bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  ended_early: { label: 'Ended Early', bg: 'bg-red-500/15', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  compensation: { label: 'Compensation Time', bg: 'bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-500 animate-pulse' },
  working: { label: 'Working', bg: 'bg-primary/15', text: 'text-primary', dot: 'bg-primary animate-pulse' },
  paused: { label: 'Paused', bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  break_lunch: { label: 'Lunch Break', bg: 'bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  break_food: { label: 'Snack / Coffee', bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  break_personal: { label: 'Personal Break', bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
  break_emergency: { label: 'Emergency Break', bg: 'bg-red-500/15', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  break_default: { label: 'On Break', bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  idle: { label: 'Ready', bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground/50' },
}

export function StatusBadge({ sessionState, activeBreak, isCompleted, isEarlyExit, isUsingCompensation }: StatusBadgeProps) {
  const config = useMemo(() => {
    if (isCompleted && isEarlyExit) return STATUS_CONFIG.ended_early
    if (isCompleted) return STATUS_CONFIG.completed
    if (isUsingCompensation && sessionState === 'working') return STATUS_CONFIG.compensation
    if (sessionState === 'paused') return STATUS_CONFIG.paused
    if (sessionState === 'working') return STATUS_CONFIG.working
    if (sessionState === 'break') {
      const key = `break_${activeBreak || 'default'}`
      return STATUS_CONFIG[key] || STATUS_CONFIG.break_default
    }
    return STATUS_CONFIG.idle
  }, [sessionState, activeBreak, isCompleted, isEarlyExit, isUsingCompensation])

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={config.label}
        initial={{ opacity: 0, y: -8, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${config.bg} ${config.text}`}
      >
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        {config.label}
      </motion.span>
    </AnimatePresence>
  )
}
