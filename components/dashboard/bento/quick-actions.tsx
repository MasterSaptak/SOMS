"use client"

import React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { WidgetShell } from '@/components/enterprise/primitives/widget-shell'
import { hoverLift, tapScale } from '@/components/enterprise/motion'
import { CalendarCheck2, CheckSquare, Clock, Banknote, Users, FileText, BarChart3, Zap } from 'lucide-react'
import Link from 'next/link'
import type { WidgetState } from '@/components/enterprise/tokens'

interface QuickAction {
  label: string
  href: string
  icon: React.ReactNode
  color: string
}

const defaultActions: QuickAction[] = [
  { label: 'Review Leaves', href: '/admin/leaves', icon: <CalendarCheck2 className="w-4 h-4" />, color: 'text-amber-500' },
  { label: 'View Tasks', href: '/admin/tasks', icon: <CheckSquare className="w-4 h-4" />, color: 'text-blue-500' },
  { label: 'Attendance', href: '/admin/attendance', icon: <Clock className="w-4 h-4" />, color: 'text-emerald-500' },
  { label: 'Payroll', href: '/admin/payroll', icon: <Banknote className="w-4 h-4" />, color: 'text-purple-500' },
  { label: 'HR Panel', href: '/admin/hr', icon: <Users className="w-4 h-4" />, color: 'text-sky-500' },
  { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" />, color: 'text-rose-500' },
]

interface QuickActionsProps {
  actions?: QuickAction[]
  state?: WidgetState
  className?: string
}

export function QuickActions({ actions = defaultActions, state = 'idle', className }: QuickActionsProps) {
  return (
    <WidgetShell
      title="Quick Actions"
      icon={<Zap className="w-4 h-4" />}
      state={state}
      widgetId="quick-actions"
      className={cn('h-full', className)}
    >
      <div className="grid grid-cols-2 gap-2 mt-1">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <motion.div
              whileHover={hoverLift}
              whileTap={tapScale}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-surface-secondary/60 hover:bg-surface-secondary transition-colors cursor-pointer border border-transparent hover:border-border/30"
            >
              <span className={action.color}>{action.icon}</span>
              <span className="text-xs font-medium truncate">{action.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </WidgetShell>
  )
}
