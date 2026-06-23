"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useLeaveStore } from '@/store/use-leave-store'
import { usePolicyStore } from '@/store/use-policy-store'
import { useAuthStore } from '@/store/use-auth-store'
import { MOCK_EMPLOYEES, getFullName } from '@/lib/demo/generators/legacy-mock-data'
import type { LeavePolicy } from '@/lib/types'
import { X, ArrowRight, ArrowLeft, Palmtree, Stethoscope, Siren, UploadCloud, Calendar, FileText, CheckCircle2 } from 'lucide-react'

const leaveIcons: Record<string, React.ReactNode> = {
  casual: <Palmtree className="w-5 h-5" />,
  medical: <Stethoscope className="w-5 h-5" />,
  emergency: <Siren className="w-5 h-5" />,
  custom: <Calendar className="w-5 h-5" />
}

export function ApplyLeaveWizard({ onClose }: { onClose: () => void }) {
  const { employee } = useAuthStore()
  const { submitLeave } = useLeaveStore()
  const { getPoliciesForOrg } = usePolicyStore()
  
  // Hardcoded org-1 for demo purposes
  const policies = getPoliciesForOrg('org-1')
  
  const [step, setStep] = useState(1)
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null)
  
  // Form State
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [managerId, setManagerId] = useState('')
  const [isHalfDay, setIsHalfDay] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const managers = MOCK_EMPLOYEES.filter(e => e.id !== employee?.id)

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPolicy || !employee || !startDate || !endDate || !reason.trim()) return

    submitLeave({
      employeeId: employee.id,
      policyId: selectedPolicy.id,
      leaveType: selectedPolicy.leaveType,
      startDate,
      endDate,
      reason: reason.trim(),
      managerId: managerId || null,
      isPaid: selectedPolicy.isPaid,
      ...(selectedPolicy.requiresDocuments && { documents: files.map(f => f.name) }),
    })
    
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
    <div className="fixed inset-0 z-50 flex flex-col md:items-center justify-end md:justify-center bg-black/50 backdrop-blur-sm sm:p-4 overflow-hidden" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full h-[90vh] md:h-auto md:max-w-2xl bg-card md:rounded-2xl rounded-t-2xl border-t md:border border-border shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-card/80 backdrop-blur-md flex items-center justify-between p-5 border-b border-border/60 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">Apply for Leave</h2>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-1.5 w-12 rounded-full ${step >= s ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <h3 className="text-lg font-medium mb-2">Select Leave Policy</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {policies.map((policy) => (
                    <button
                      key={policy.id}
                      onClick={() => setSelectedPolicy(policy)}
                      className={`flex flex-col p-4 rounded-xl border text-left transition-all hover:border-primary/50 ${
                        selectedPolicy?.id === policy.id ? 'border-primary ring-1 ring-primary bg-primary/5 shadow-sm' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {leaveIcons[policy.leaveType] || leaveIcons.custom}
                        </div>
                        <Badge variant="secondary" className={policy.isPaid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}>
                          {policy.isPaid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </div>
                      <span className="font-semibold">{policy.name}</span>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {policy.maxDays < 999 ? `Max ${policy.maxDays} days/year` : 'Unlimited allowance'}. 
                        {policy.requiresDocuments ? ' Documents required.' : ''}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <h3 className="text-lg font-medium">Leave Details</h3>
                
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

                {selectedPolicy?.halfDayAllowed && (
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

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Reason</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a reason for your leave..."
                    rows={4}
                    required
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Reporting Manager (Optional)</label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select manager...</option>
                    {managers.map((mgr) => (
                      <option key={mgr.id} value={mgr.id}>{getFullName(mgr)} — {mgr.designation}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <h3 className="text-lg font-medium">Supporting Documents</h3>
                
                {selectedPolicy?.requiresDocuments ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 p-4 rounded-xl flex items-start gap-3">
                    <UploadCloud className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <strong>Documents Required</strong><br/>
                      This leave policy requires supporting documents (e.g., Medical Certificate, Proof of Emergency) for HR verification.
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-xl text-sm text-muted-foreground">
                    Documents are optional for this policy. You can upload them if they support your request.
                  </div>
                )}

                <div className="flex flex-col gap-4 p-8 border-2 border-dashed border-border/50 rounded-xl bg-muted/20 items-center justify-center text-center">
                  <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                  <div>
                    <label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline font-medium">Click to browse</label>
                    <span className="text-muted-foreground text-sm"> or drag and drop</span>
                  </div>
                  <Input 
                    id="file-upload" 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={(e) => setFiles(Array.from(e.target.files || []))} 
                  />
                  <p className="text-xs text-muted-foreground">PDF, PNG, JPG (max 5MB)</p>
                </div>

                {files.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Uploaded Files</span>
                    <div className="flex flex-col gap-2">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 px-3 border rounded-lg bg-background text-sm">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span className="truncate max-w-[200px]">{file.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center justify-center text-center pb-4 border-b">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold">Review Request</h3>
                  <p className="text-sm text-muted-foreground">Please confirm your details before submitting.</p>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Policy</span>
                    <span className="font-medium">{selectedPolicy?.name}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Duration</span>
                    <span className="font-medium">{getDayCount()} Day(s)</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Period</span>
                    <span className="font-medium">{startDate} to {endDate}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Type</span>
                    <span className="font-medium flex items-center gap-2">
                      <Badge variant="outline" className={selectedPolicy?.isPaid ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}>
                        {selectedPolicy?.isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 border-t pt-4">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Reason</span>
                  <p className="bg-muted/50 p-3 rounded-lg border mt-1">{reason}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-card flex items-center justify-between p-5 border-t border-border/60 shrink-0">
          <Button variant="ghost" onClick={step === 1 ? onClose : handleBack} className="gap-2">
            {step > 1 && <ArrowLeft className="w-4 h-4" />}
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 4 ? (
            <Button onClick={handleNext} disabled={(step === 1 && !selectedPolicy) || (step === 2 && (!startDate || !endDate || !reason))} className="gap-2">
              Next Step <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <CheckCircle2 className="w-4 h-4" /> Submit Request
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
