"use client"

import React from 'react'
import { motion } from 'motion/react'
import { Zap, X } from 'lucide-react'

interface SmartWarningProps {
  message: string
  type: 'info' | 'warning' | 'urgent'
  onDismiss: () => void
}

const COLORS = {
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
  urgent: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300',
}

export function SmartWarning({ message, type, onDismiss }: SmartWarningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium ${COLORS[type]}`}
    >
      <Zap className="w-4 h-4 shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}
