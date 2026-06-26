"use client"

import React from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, ShieldAlert, Clock, AlertTriangle } from 'lucide-react'

interface SessionResultCardProps {
  isEarlyExit: boolean
  workedHours: number // e.g. 2.5
  officeHours: number // e.g. 4.0
  earlyExitReason?: string | null
  compensationAdded?: number // in minutes
}

export function SessionResultCard({
  isEarlyExit,
  workedHours,
  officeHours,
  earlyExitReason,
  compensationAdded
}: SessionResultCardProps) {
  
  if (!isEarlyExit) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-4"
      >
        <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-emerald-800 dark:text-emerald-300">Session Completed</h3>
          <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 mt-1">
            You have successfully completed today's required office hours. Enjoy the rest of your day!
          </p>
        </div>
      </motion.div>
    )
  }

  const missingHours = officeHours - workedHours
  const mH = Math.floor(missingHours)
  const mM = Math.round((missingHours - mH) * 60)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start gap-4"
    >
      <div className="p-2 bg-amber-500/20 rounded-full text-amber-600 dark:text-amber-400 shrink-0">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-amber-800 dark:text-amber-300">Session Ended Early</h3>
        <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-1 mb-3">
          {earlyExitReason ? `"${earlyExitReason}"` : "You ended today's session before completing the required hours."}
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-background/50 rounded-lg p-2 border border-border/50">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1">
              <Clock className="w-3 h-3" /> Missing Time
            </p>
            <p className="font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {mH}h {mM}m
            </p>
          </div>
          <div className="bg-background/50 rounded-lg p-2 border border-border/50">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Comp Balance
            </p>
            <p className="font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              +{Math.round(missingHours * 60)} mins
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
