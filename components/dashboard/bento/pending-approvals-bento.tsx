"use client"

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { WidgetShell } from '@/components/enterprise/primitives/widget-shell'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, CalendarRange, ArrowRight } from 'lucide-react'
import { MOCK_LEAVES, getEmployeeById, getFullName } from '@/lib/demo/generators/legacy-mock-data'
import Link from 'next/link'
import type { WidgetState } from '@/components/enterprise/tokens'

interface PendingApprovalsBentoProps {
  state?: WidgetState
  className?: string
}

const typeColors: Record<string, string> = {
  casual: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800',
  medical: 'bg-red-500/10 text-red-600 border-red-200 dark:text-red-400 dark:border-red-800',
  emergency: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800',
  wfh: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-800',
}

export function PendingApprovalsBento({ state = 'idle', className }: PendingApprovalsBentoProps) {
  const [leaves, setLeaves] = useState(MOCK_LEAVES.filter((l) => l.status === 'pending'))
  const [actioned, setActioned] = useState<Record<string, 'approved' | 'rejected'>>({})

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setActioned((prev) => ({ ...prev, [id]: action }))
    setTimeout(() => {
      setLeaves((prev) => prev.filter((l) => l.id !== id))
    }, 800)
  }

  return (
    <WidgetShell
      title="Pending Approvals"
      icon={<CalendarRange className="w-4 h-4" />}
      state={leaves.length === 0 ? 'empty' : state}
      emptyMessage="All caught up! No pending approvals."
      widgetId="pending-approvals"
      className={cn('h-full', className)}
      scrollable
      noPadding
      actions={
        <Badge variant="secondary" className="text-[10px] h-5 px-2">
          {leaves.length}
        </Badge>
      }
    >
      <div className="flex flex-col divide-y divide-border/20">
        {leaves.map((leave) => {
          const employee = getEmployeeById(leave.employeeId)
          const isActioned = !!actioned[leave.id]
          const actionType = actioned[leave.id]

          const startStr = new Date(leave.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })
          const endStr = new Date(leave.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })
          const dateDisplay = startStr === endStr ? startStr : `${startStr} – ${endStr}`

          return (
            <div
              key={leave.id}
              className={cn(
                'px-5 py-3 transition-all duration-300',
                isActioned ? 'opacity-40 grayscale' : 'hover:bg-muted/20'
              )}
            >
              <div className="flex gap-3">
                <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                  <AvatarImage src={employee?.avatarUrl || undefined} />
                  <AvatarFallback className="text-[9px] bg-primary/10">
                    {employee ? `${employee.firstName[0]}${employee.lastName[0]}` : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold truncate">
                      {employee ? getFullName(employee) : 'Unknown'}
                    </span>
                    <Badge variant="outline" className={cn('text-[8px] capitalize shrink-0 h-4 px-1', typeColors[leave.leaveType] || '')}>
                      {leave.leaveType}
                    </Badge>
                  </div>
                  <div className="text-[11px] font-medium mt-0.5">{dateDisplay}</div>
                  <div className={cn('text-[10px] text-muted-foreground line-clamp-1 mt-0.5', isActioned && 'line-through')}>
                    {leave.reason}
                  </div>

                  {!isActioned && (
                    <div className="flex gap-1.5 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] flex-1 rounded-full border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-600"
                        onClick={() => handleAction(leave.id, 'approved')}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] flex-1 rounded-full border-red-500/30 hover:bg-red-500/10 hover:text-red-600"
                        onClick={() => handleAction(leave.id, 'rejected')}
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                  {isActioned && (
                    <div className={cn('mt-1.5 text-[10px] font-semibold', actionType === 'approved' ? 'text-emerald-500' : 'text-red-500')}>
                      {actionType === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-border/30 bg-surface-primary/90 backdrop-blur-sm">
        <Link
          href="/admin/leaves"
          className="flex items-center justify-center gap-1 px-5 py-2.5 text-[11px] font-medium text-primary hover:bg-muted/20 transition-colors"
        >
          View All Requests <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </WidgetShell>
  )
}
