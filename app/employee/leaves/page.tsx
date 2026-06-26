"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BentoGrid, BentoSlot } from '@/components/enterprise/bento-grid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLeaveStore } from '@/store/use-leave-store'
import { useAuthStore } from '@/store/use-auth-store'
import { usePolicyStore } from '@/store/use-policy-store'
import { ApplyLeaveWizard } from '@/components/leaves/apply-leave-wizard'
import { LeaveCalendar } from '@/components/leaves/leave-calendar'
import { LEAVE_TYPES, LEAVE_STATUSES } from '@/lib/constants'
import { MOCK_EMPLOYEES, getFullName } from '@/lib/demo/generators/legacy-mock-data'
import type { LeaveType, LeaveStatus } from '@/lib/types'
import {
  Plus, Calendar, Clock, X, FileText, CheckCircle2,
  XCircle, AlertCircle, ChevronRight, Palmtree, Stethoscope,
  Siren, UploadCloud, FileUp, Info, ShieldAlert,
} from 'lucide-react'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

const leaveIcons: Partial<Record<LeaveType, React.ReactNode>> = {
  casual: <Palmtree className="w-5 h-5" />,
  medical: <Stethoscope className="w-5 h-5" />,
  emergency: <Siren className="w-5 h-5" />,
}

const leaveIconColors: Partial<Record<LeaveType, string>> = {
  casual: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  medical: 'bg-red-500/10 text-red-500 border-red-500/20',
  emergency: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
}

const statusIcons: Partial<Record<LeaveStatus, React.ReactNode>> = {
  hr_verification: <Clock className="w-3.5 h-3.5" />,
  manager_approval: <CheckCircle2 className="w-3.5 h-3.5" />,
  payroll_processing: <CheckCircle2 className="w-3.5 h-3.5" />,
  completed: <CheckCircle2 className="w-3.5 h-3.5" />,
}

// ─── Apply Leave Dialog ───
function ApplyLeaveDialog({ onClose }: { onClose: () => void }) {
  const { submitLeave } = useLeaveStore()
  const { employee } = useAuthStore()
  const [leaveType, setLeaveType] = useState<LeaveType | null>(null)
  
  // Generic Fields
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [managerId, setManagerId] = useState('')
  const [isHalfDay, setIsHalfDay] = useState(false)
  
  // Medical Fields
  const [hospitalName, setHospitalName] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [prescription, setPrescription] = useState<File | null>(null)
  const [medicalCert, setMedicalCert] = useState<File | null>(null)
  
  // Emergency Fields
  const [emergencyCategory, setEmergencyCategory] = useState('Family')

  const managers = MOCK_EMPLOYEES.filter(e => e.id !== employee?.id)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!leaveType || !startDate || !endDate || !reason.trim()) return
    if (leaveType === 'medical' && !prescription) return // Validation

    const newLeave = {
      employeeId: employee?.id || '',
      leaveType,
      startDate,
      endDate,
      reason: reason.trim(),
      managerId: managerId || null,
      isPaid: leaveType !== 'emergency',
      verificationStatus: leaveType === 'medical' ? 'pending' : undefined,
      payrollProcessed: false,
      salaryDeducted: false,
      ...(leaveType === 'emergency' && { emergencyCategory }),
      ...(leaveType === 'medical' && { doctorName, hospitalName, documents: ['prescription.pdf'] }),
    } as any

    submitLeave(newLeave)
    onClose()
  }

  const getDayCount = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return diff > 0 ? (isHalfDay ? 0.5 : diff) : 0
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md rounded-t-2xl flex items-center justify-between p-6 border-b border-border/60">
          <h2 className="text-xl font-semibold">Apply for Leave</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {/* Step 1: Choose Leave Type */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select Leave Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(LEAVE_TYPES) as LeaveType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLeaveType(type)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all text-center relative overflow-hidden group ${
                    leaveType === type
                      ? 'border-primary ring-1 ring-primary bg-primary/5 shadow-md'
                      : 'border-border/50 hover:bg-muted/30 hover:border-border'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${leaveIconColors[type]} border shadow-sm group-hover:scale-110 transition-transform`}>
                    {leaveIcons[type]}
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">{LEAVE_TYPES[type].label}</span>
                    <Badge variant="secondary" className={`mt-1.5 text-[10px] ${type === 'emergency' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                      {type === 'emergency' ? 'Unpaid' : 'Paid'}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {leaveType && (
              <motion.div
                key={leaveType}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-6 overflow-hidden"
              >
                <div className="h-px bg-border/50 w-full" />
                
                {/* Warning Banner for Emergency */}
                {leaveType === 'emergency' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm leading-relaxed">
                      <strong>Emergency Leave is unpaid.</strong><br/>
                      Salary deduction may apply according to company policy. Please provide detailed explanation.
                    </div>
                  </div>
                )}

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">From Date</label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="h-11" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">To Date</label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} required className="h-11" />
                  </div>
                </div>

                {leaveType === 'casual' && (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="halfDay" checked={isHalfDay} onChange={e => setIsHalfDay(e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                    <label htmlFor="halfDay" className="text-sm">Apply for Half Day</label>
                  </div>
                )}

                {getDayCount() > 0 && (
                  <div className="text-sm font-medium flex items-center gap-2 bg-muted/40 p-3 rounded-lg border border-border/50">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Total Duration: <span className="text-primary">{getDayCount()} day{getDayCount() > 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Dynamic Fields */}
                {leaveType === 'medical' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Doctor Name</label>
                      <Input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} required placeholder="Dr. John Doe" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Hospital / Clinic Name</label>
                      <Input value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required placeholder="City Hospital" />
                    </div>
                  </div>
                )}

                {leaveType === 'emergency' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Emergency Category</label>
                    <select
                      value={emergencyCategory}
                      onChange={(e) => setEmergencyCategory(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="Family">Family Emergency</option>
                      <option value="Personal">Personal Emergency</option>
                      <option value="Travel">Urgent Travel</option>
                      <option value="Other">Unexpected Situation</option>
                    </select>
                  </div>
                )}

                {/* Reason */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">{leaveType === 'emergency' ? 'Detailed Explanation' : leaveType === 'medical' ? 'Medical Reason' : 'Reason'}</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={`Please explain your ${leaveType} leave...`}
                    rows={3}
                    required
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                </div>

                {/* File Uploads */}
                {leaveType === 'medical' && (
                  <div className="flex flex-col gap-4 p-4 border border-dashed rounded-xl bg-muted/20">
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2 mb-1">
                        Prescription <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-muted-foreground mb-2">Required for all medical leaves</p>
                      <Input type="file" onChange={(e) => setPrescription(e.target.files?.[0] || null)} required className="h-10 cursor-pointer file:cursor-pointer" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Medical Certificate (Optional)</label>
                      <Input type="file" onChange={(e) => setMedicalCert(e.target.files?.[0] || null)} className="h-10 cursor-pointer file:cursor-pointer" />
                    </div>
                  </div>
                )}

                {(leaveType === 'casual' || leaveType === 'emergency') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Supporting Documents (Optional)</label>
                    <Input type="file" multiple className="h-10 cursor-pointer file:cursor-pointer" />
                  </div>
                )}

                {/* Reporting Manager */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Reporting Manager</label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select manager...</option>
                    {managers.map((mgr) => (
                      <option key={mgr.id} value={mgr.id}>{getFullName(mgr)} — {mgr.designation?.title || (typeof mgr.designation === 'string' ? mgr.designation : '—')}</option>
                    ))}
                  </select>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/60 sticky bottom-0 bg-card">
            <Button type="button" variant="ghost" onClick={onClose} className="h-11 px-6">Cancel</Button>
            <Button type="submit" disabled={!leaveType} className="h-11 px-6">Submit Request</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Leave History Row ───
function LeaveRow({ leave, onCancel }: { leave: ReturnType<typeof useLeaveStore.getState>['leaves'][0]; onCancel: (id: string) => void }) {
  const { policies } = usePolicyStore()
  const policy = policies.find(p => p.id === leave.policyId) || policies.find(p => p.leaveType === leave.leaveType)
  
  // Use fallback for legacy records that don't have a valid status config
  const statusInfo = LEAVE_STATUSES[leave.status] || { label: leave.status.replace('_', ' ').toUpperCase(), color: 'text-muted-foreground', bgColor: 'bg-muted' }
  const typeLabel = policy?.name || LEAVE_TYPES[leave.leaveType as keyof typeof LEAVE_TYPES]?.label || leave.leaveType
  const start = new Date(leave.startDate)
  const end = new Date(leave.endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const canCancel = leave.status === 'pending'

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border border-border/40 hover:bg-muted/10 hover:border-border transition-all shadow-sm group">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${leaveIconColors[leave.leaveType]}`}>
          {leaveIcons[leave.leaveType]}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold">{typeLabel}</span>
            <Badge className={`text-[10px] uppercase font-bold ${statusInfo.bgColor} ${statusInfo.color} border-none gap-1 px-2 py-0.5`}>
              {statusIcons[leave.status] || <Clock className="w-3.5 h-3.5" />}
              {statusInfo.label}
            </Badge>
            <Badge variant="outline" className={`text-[10px] ${leave.isPaid ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-amber-600 border-amber-200 bg-amber-50'} dark:bg-transparent`}>
              {leave.isPaid ? 'Paid' : 'Unpaid'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {days > 1 && ` — ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {days} day{days > 1 ? 's' : ''}
            </span>
            {leave.documents && leave.documents.length > 0 && (
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <FileUp className="w-3.5 h-3.5" />
                {leave.documents.length} Document(s)
              </span>
            )}
          </div>
          
          {leave.reason && (
            <p className="text-sm text-foreground/80 mt-1 max-w-2xl">{leave.reason}</p>
          )}
          
          {/* Details for specific types */}
          {(leave.emergencyCategory || leave.doctorName) && (
            <div className="mt-2 flex gap-3 text-xs">
              {leave.emergencyCategory && (
                 <span className="bg-muted px-2 py-1 rounded border">Category: {leave.emergencyCategory}</span>
              )}
              {leave.doctorName && (
                 <span className="bg-muted px-2 py-1 rounded border">Doctor: {leave.doctorName} ({leave.hospitalName})</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          Applied {new Date(leave.createdAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View Details
          </Button>
          {canCancel && (
            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onCancel(leave.id)}>
              Cancel Request
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───
export default function LeavesPage() {
  const { employee } = useAuthStore()
  const { getForEmployee, getBalance, cancelLeave } = useLeaveStore()
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('history')

  const myLeaves = employee ? getForEmployee(employee.id) : []
  const balance = employee ? getBalance(employee.id) : { casual: 2, medical: 2, emergency: 0 }
  
  // Calculate stats
  const usedCasual = LEAVE_TYPES.casual.maxDays - balance.casual
  const usedMedical = LEAVE_TYPES.medical.maxDays - balance.medical
  const emergencyTaken = myLeaves.filter(l => l.leaveType === 'emergency').length
  const totalPaidUsed = usedCasual + usedMedical
  const totalPaidAllowed = LEAVE_TYPES.casual.maxDays + LEAVE_TYPES.medical.maxDays
  const pendingRequests = myLeaves.filter(l => l.status === 'pending').length

  return (
    <motion.div className="flex flex-col gap-8 pb-12" variants={containerVars} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track your leaves and apply for time off</p>
        </div>
        <Button onClick={() => setShowApplyDialog(true)} className="gap-2 h-11 px-6 rounded-full shadow-lg hover:shadow-xl transition-all hidden md:flex">
          <Plus className="w-4 h-4" />
          Apply Leave
        </Button>
      </motion.div>

      {/* Modern Bento Leave Dashboard */}
      <motion.div variants={itemVars}>
        <BentoGrid className="grid-cols-1 md:grid-cols-4 auto-rows-[160px]">
          
          {/* Casual Leave */}
          <BentoSlot className="col-span-1 row-span-1">
            <div className="bg-card rounded-3xl border border-border/50 p-6 flex flex-col justify-between h-full relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                <Palmtree className="w-24 h-24 text-blue-500" />
              </div>
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Palmtree className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="font-semibold text-sm">Casual Leave</span>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 text-[10px] uppercase">Paid</Badge>
              </div>
              <div className="relative z-10">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{balance.casual}</span>
                  <span className="text-sm font-medium text-muted-foreground">Remaining</span>
                  <span className="text-xs text-muted-foreground ml-auto">{LEAVE_TYPES.casual.maxDays} Total</span>
                </div>
                <Progress value={(usedCasual / LEAVE_TYPES.casual.maxDays) * 100} className="h-1.5 [&>div]:bg-blue-500" />
                <p className="text-[10px] text-muted-foreground mt-3 line-clamp-1">For personal work, vacations or family events.</p>
              </div>
            </div>
          </BentoSlot>

          {/* Medical Leave */}
          <BentoSlot className="col-span-1 row-span-1">
             <div className="bg-card rounded-3xl border border-border/50 p-6 flex flex-col justify-between h-full relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                <Stethoscope className="w-24 h-24 text-red-500" />
              </div>
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="font-semibold text-sm">Medical Leave</span>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 text-[10px] uppercase">Paid</Badge>
              </div>
              <div className="relative z-10">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{balance.medical}</span>
                  <span className="text-sm font-medium text-muted-foreground">Remaining</span>
                  <span className="text-xs text-muted-foreground ml-auto">{LEAVE_TYPES.medical.maxDays} Total</span>
                </div>
                <Progress value={(usedMedical / LEAVE_TYPES.medical.maxDays) * 100} className="h-1.5 [&>div]:bg-red-500" />
                <p className="text-[10px] text-muted-foreground mt-3 line-clamp-1 flex items-center gap-1"><UploadCloud className="w-3 h-3"/> Documents required.</p>
              </div>
            </div>
          </BentoSlot>

          {/* Emergency Leave */}
          <BentoSlot className="col-span-1 row-span-1">
             <div className="bg-card rounded-3xl border border-amber-500/20 p-6 flex flex-col justify-between h-full relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                <Siren className="w-24 h-24 text-amber-500" />
              </div>
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Siren className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="font-semibold text-sm">Emergency</span>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 text-[10px] uppercase">Unpaid</Badge>
              </div>
              <div className="relative z-10 flex flex-col justify-end h-full mt-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-500">Unlimited</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">For urgent personal or family emergencies.<br/>Approval Required.</p>
              </div>
            </div>
          </BentoSlot>

          {/* Summary Widget */}
          <BentoSlot className="col-span-1 row-span-1">
            <div className="bg-primary/5 rounded-3xl border border-primary/10 p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-all">
              <h3 className="font-semibold text-sm mb-4 text-primary flex items-center gap-2">
                <Info className="w-4 h-4" /> Leave Summary
              </h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mt-auto">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Casual</span>
                  <span className="font-medium">{balance.casual} / 2</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Medical</span>
                  <span className="font-medium">{balance.medical} / 2</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Paid Used</span>
                  <span className="font-medium text-emerald-600">{totalPaidUsed} / {totalPaidAllowed}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Emergency</span>
                  <span className="font-medium text-amber-600">{emergencyTaken} Taken</span>
                </div>
              </div>
              
              {/* Mini Analytics Trend */}
              <div className="mt-4 pt-4 border-t border-primary/10">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Monthly Utilization Trend</span>
                  <span className="text-primary font-medium">12%</span>
                </div>
                <div className="flex items-end gap-1 h-8">
                  {[10, 20, 15, 30, 40, 25, 12].map((val, i) => (
                    <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${val}%` }}>
                      <div className="w-full bg-primary rounded-t-sm" style={{ height: '50%' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </BentoSlot>
        </BentoGrid>
      </motion.div>

      {/* Leave History */}
      <motion.div variants={itemVars} className="flex flex-col gap-4 mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Attendance & Leaves History</h2>
            <TabsList className="bg-muted/50 rounded-full">
              <TabsTrigger value="history" className="rounded-full px-4">All History</TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-full px-4">Calendar View</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="history" className="m-0">
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="p-6">
              {myLeaves.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <Palmtree className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-semibold">No leave requests yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">When you take time off, your leave history and status will appear here.</p>
                  <Button variant="outline" className="mt-6 rounded-full" onClick={() => setShowApplyDialog(true)}>Apply for Leave</Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {myLeaves.map((leave) => (
                    <LeaveRow key={leave.id} leave={leave} onCancel={cancelLeave} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="m-0">
          <LeaveCalendar />
        </TabsContent>
      </Tabs>
    </motion.div>

    {/* Mobile FAB */}
    <Button 
      onClick={() => setShowApplyDialog(true)} 
      className="md:hidden fixed bottom-20 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center p-0 z-40 bg-primary text-primary-foreground"
    >
      <Plus className="w-6 h-6" />
    </Button>

    {/* Dialog */}
    {showApplyDialog && <ApplyLeaveWizard onClose={() => setShowApplyDialog(false)} />}
  </motion.div>
  )
}
