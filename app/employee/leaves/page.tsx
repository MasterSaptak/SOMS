"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLeaveStore } from '@/store/use-leave-store'
import { useAuthStore } from '@/store/use-auth-store'
import { useAuth } from '@/hooks/use-auth'
import { LEAVE_TYPES, LEAVE_STATUSES } from '@/lib/constants'
import { MOCK_EMPLOYEES, getFullName } from '@/lib/demo/generators/legacy-mock-data'
import type { LeaveType, LeaveStatus } from '@/lib/types'
import {
  Plus, Calendar, Clock, X, FileText, CheckCircle2,
  XCircle, AlertCircle, ChevronRight, Palmtree, Stethoscope,
  Siren, Home,
} from 'lucide-react'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

const leaveIcons: Record<LeaveType, React.ReactNode> = {
  casual: <Palmtree className="w-5 h-5" />,
  medical: <Stethoscope className="w-5 h-5" />,
  emergency: <Siren className="w-5 h-5" />,
  wfh: <Home className="w-5 h-5" />,
}

const leaveIconColors: Record<LeaveType, string> = {
  casual: 'bg-blue-500/10 text-blue-500',
  medical: 'bg-red-500/10 text-red-500',
  emergency: 'bg-amber-500/10 text-amber-500',
  wfh: 'bg-emerald-500/10 text-emerald-500',
}

const statusIcons: Record<LeaveStatus, React.ReactNode> = {
  pending: <Clock className="w-3.5 h-3.5" />,
  manager_approved: <CheckCircle2 className="w-3.5 h-3.5" />,
  hr_approved: <CheckCircle2 className="w-3.5 h-3.5" />,
  rejected: <XCircle className="w-3.5 h-3.5" />,
  cancelled: <XCircle className="w-3.5 h-3.5" />,
}

// ─── Apply Leave Dialog ───
function ApplyLeaveDialog({ onClose }: { onClose: () => void }) {
  const { applyLeave } = useLeaveStore()
  const { employee } = useAuthStore()
  const [leaveType, setLeaveType] = useState<LeaveType>('casual')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [managerId, setManagerId] = useState('')

  const managers = MOCK_EMPLOYEES.filter(e => e.id !== employee?.id)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate || !reason.trim()) return
    applyLeave({
      employeeId: employee?.id || '',
      leaveType,
      startDate,
      endDate,
      reason: reason.trim(),
      managerId: managerId || null,
    })
    onClose()
  }

  const getDayCount = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return diff > 0 ? diff : 0
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-4 bg-card rounded-2xl border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border/60">
          <h2 className="text-lg font-semibold">Apply for Leave</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Leave Type Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Leave Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(LEAVE_TYPES) as LeaveType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLeaveType(type)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    leaveType === type
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border/50 hover:bg-muted/30'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${leaveIconColors[type]}`}>
                    {leaveIcons[type]}
                  </div>
                  <div>
                    <span className="text-sm font-medium block">{LEAVE_TYPES[type].label}</span>
                    {type !== 'wfh' && (
                      <span className="text-[10px] text-muted-foreground">{LEAVE_TYPES[type].maxDays} days/yr</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} required />
            </div>
          </div>
          {getDayCount() > 0 && (
            <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
              📅 Duration: <strong>{getDayCount()} day{getDayCount() > 1 ? 's' : ''}</strong>
            </div>
          )}

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason..."
              rows={3}
              required
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          {/* Reporting Manager */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Reporting Manager</label>
            <select
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select manager...</option>
              {managers.map((mgr) => (
                <option key={mgr.id} value={mgr.id}>{getFullName(mgr)} — {mgr.designation}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Leave History Row ───
function LeaveRow({ leave, onCancel }: { leave: ReturnType<typeof useLeaveStore.getState>['leaves'][0]; onCancel: (id: string) => void }) {
  const config = LEAVE_STATUSES[leave.status]
  const typeConfig = LEAVE_TYPES[leave.leaveType]
  const start = new Date(leave.startDate)
  const end = new Date(leave.endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const canCancel = leave.status === 'pending'

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/20 transition-colors gap-3">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${leaveIconColors[leave.leaveType]}`}>
          {leaveIcons[leave.leaveType]}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium">{typeConfig.label}</span>
            <Badge className={`text-[10px] uppercase font-bold ${config.bgColor} ${config.color} border-none gap-1`}>
              {statusIcons[leave.status]}
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {days > 1 && ` — ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </span>
            <span>{days} day{days > 1 ? 's' : ''}</span>
          </div>
          {leave.reason && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{leave.reason}</p>
          )}
        </div>
      </div>
      {canCancel && (
        <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={() => onCancel(leave.id)}>
          Cancel Request
        </Button>
      )}
    </div>
  )
}

// ─── Main Page ───
export default function LeavesPage() {
  const { employee } = useAuthStore()
  const { getForEmployee, getBalance, cancelLeave, getPending, approveLeave, rejectLeave } = useLeaveStore()
  const { can } = useAuth()
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('my-leaves')

  const myLeaves = employee ? getForEmployee(employee.id) : []
  const balance = employee ? getBalance(employee.id) : { casual: 12, medical: 6, emergency: 3, wfh: 999 }
  const pendingApprovals = getPending()
  const canApprove = can('leaves', 'approve')

  const balanceCards: { type: LeaveType; used: number; total: number }[] = [
    { type: 'casual', used: LEAVE_TYPES.casual.maxDays - balance.casual, total: LEAVE_TYPES.casual.maxDays },
    { type: 'medical', used: LEAVE_TYPES.medical.maxDays - balance.medical, total: LEAVE_TYPES.medical.maxDays },
    { type: 'emergency', used: LEAVE_TYPES.emergency.maxDays - balance.emergency, total: LEAVE_TYPES.emergency.maxDays },
  ]

  return (
    <motion.div className="flex flex-col gap-6" variants={containerVars} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground mt-1">Track your leaves and apply for time off</p>
        </div>
        <Button onClick={() => setShowApplyDialog(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Apply Leave
        </Button>
      </motion.div>

      {/* Leave Balance Cards */}
      <motion.div variants={itemVars} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {balanceCards.map(({ type, used, total }) => (
          <Card key={type} className="hover:border-primary/20 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${leaveIconColors[type]}`}>
                  {leaveIcons[type]}
                </div>
                <span className="text-2xl font-bold">{balance[type]}</span>
              </div>
              <h3 className="text-sm font-medium mb-1">{LEAVE_TYPES[type].label}</h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{used} used</span>
                <span>{total} total</span>
              </div>
              <Progress value={(used / total) * 100} className="h-1.5" />
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVars}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="my-leaves" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              My Leaves
              <span className="ml-1 text-[10px] bg-muted rounded-full px-1.5 py-0.5">{myLeaves.length}</span>
            </TabsTrigger>
            {canApprove && (
              <TabsTrigger value="approvals" className="gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approvals
                {pendingApprovals.length > 0 && (
                  <span className="ml-1 text-[10px] bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5">{pendingApprovals.length}</span>
                )}
              </TabsTrigger>
            )}
            <TabsTrigger value="calendar" className="gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* My Leaves Tab */}
          <TabsContent value="my-leaves" className="flex flex-col gap-3">
            {myLeaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Palmtree className="w-12 h-12 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium">No leave requests yet</p>
                <p className="text-xs text-muted-foreground mt-1">Click &quot;Apply Leave&quot; to submit your first request</p>
              </div>
            ) : (
              myLeaves.map((leave) => (
                <LeaveRow key={leave.id} leave={leave} onCancel={cancelLeave} />
              ))
            )}
          </TabsContent>

          {/* Approvals Tab */}
          {canApprove && (
            <TabsContent value="approvals" className="flex flex-col gap-3">
              {pendingApprovals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium">No pending approvals</p>
                  <p className="text-xs text-muted-foreground mt-1">All leave requests have been processed</p>
                </div>
              ) : (
                pendingApprovals.map((leave) => {
                  const emp = MOCK_EMPLOYEES.find(e => e.id === leave.employeeId)
                  return (
                    <Card key={leave.id} className="hover:border-primary/20 transition-colors">
                      <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${leaveIconColors[leave.leaveType]}`}>
                            {leaveIcons[leave.leaveType]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{emp ? getFullName(emp) : 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">
                              {LEAVE_TYPES[leave.leaveType].label} · {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {leave.startDate !== leave.endDate && ` — ${new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                            </p>
                            {leave.reason && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{leave.reason}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => rejectLeave(leave.id)}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              const level = leave.status === 'pending' ? 'manager' : 'hr'
                              approveLeave(leave.id, employee?.id || '', level as 'manager' | 'hr')
                            }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            {leave.status === 'pending' ? 'Approve' : 'HR Approve'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </TabsContent>
          )}

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const now = new Date()
                    const year = now.getFullYear()
                    const month = now.getMonth()
                    const firstDay = new Date(year, month, 1).getDay()
                    const daysInMonth = new Date(year, month + 1, 0).getDate()
                    const cells: React.ReactNode[] = []

                    // Empty cells for days before start
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} className="h-10" />)
                    }

                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      const isToday = day === now.getDate()
                      const leave = myLeaves.find(l => {
                        const s = l.startDate
                        const e = l.endDate
                        return dateStr >= s && dateStr <= e && (l.status === 'hr_approved' || l.status === 'manager_approved' || l.status === 'pending')
                      })

                      let bgClass = ''
                      if (leave) {
                        if (leave.status === 'hr_approved' || leave.status === 'manager_approved') bgClass = 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                        else if (leave.status === 'pending') bgClass = 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                      }

                      cells.push(
                        <div
                          key={day}
                          className={`h-10 flex items-center justify-center rounded-lg text-sm transition-colors ${
                            isToday ? 'bg-primary text-primary-foreground font-bold' : bgClass || 'hover:bg-muted'
                          }`}
                        >
                          {day}
                        </div>
                      )
                    }
                    return cells
                  })()}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-3 h-3 rounded bg-primary" /> Today
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-3 h-3 rounded bg-emerald-500/30" /> Approved
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-3 h-3 rounded bg-amber-500/30" /> Pending
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Dialog */}
      {showApplyDialog && <ApplyLeaveDialog onClose={() => setShowApplyDialog(false)} />}
    </motion.div>
  )
}
