"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useLeaveStore } from '@/store/use-leave-store'
import { useAuthStore } from '@/store/use-auth-store'
import { usePolicyStore } from '@/store/use-policy-store'
import { LEAVE_TYPES, LEAVE_STATUSES } from '@/lib/constants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { MOCK_EMPLOYEES, MOCK_DEPARTMENTS, getFullName, getDepartmentById } from '@/lib/demo/generators/legacy-mock-data'
import type { LeaveType, LeaveStatus, LeaveRequest } from '@/lib/types'
import { 
  Search, CheckCircle2, XCircle, Clock, FileText, 
  Calendar, Filter, ChevronDown, Download, AlertCircle, ShieldAlert, FileUp,
  Stethoscope
} from 'lucide-react'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

export default function AdminLeavesPage() {
  const { employee } = useAuthStore()
  const { leaves, verifyHR, approveManager, processPayroll, rejectLeave } = useLeaveStore()
  const { policies } = usePolicyStore()
  
  const [activeTab, setActiveTab] = useState('requests')
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedLeave, setExpandedLeave] = useState<string | null>(null)

  // Enrich leaves with employee data
  const enrichedLeaves = leaves.map(leave => {
    const emp = MOCK_EMPLOYEES.find(e => e.id === leave.employeeId)
    const dept = emp ? getDepartmentById(emp.departmentId) : undefined
    return { ...leave, employee: emp, department: dept }
  })

  // Apply filters
  const filteredLeaves = enrichedLeaves.filter(leave => {
    const empName = leave.employee ? getFullName(leave.employee).toLowerCase() : ''
    const matchSearch = search === '' || empName.includes(search.toLowerCase())
    const matchDept = filterDept === 'all' || leave.employee?.departmentId === filterDept
    const matchType = filterType === 'all' || leave.leaveType === filterType
    const matchStatus = filterStatus === 'all' || leave.status === filterStatus
    return matchSearch && matchDept && matchType && matchStatus
  })

  // Sort by pending first, then by date descending
  const sortedLeaves = [...filteredLeaves].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const pendingCount = leaves.filter(l => ['submitted', 'hr_verification', 'manager_approval', 'pending'].includes(l.status)).length

  const handleAction = (leave: ReturnType<typeof useLeaveStore.getState>['leaves'][0], action: 'approve' | 'reject' | 'verify') => {
    if (!employee) return
    if (action === 'reject') {
      rejectLeave(leave.id)
      return
    }
    
    // Workflow logic
    if (action === 'verify' && (leave.status === 'submitted' || leave.status === 'pending')) {
      verifyHR(leave.id, employee.id)
    } else if (action === 'approve' && (leave.status === 'submitted' || leave.status === 'hr_verification' || leave.status === 'pending')) {
      approveManager(leave.id, employee.id)
    } else if (action === 'approve' && (leave.status === 'manager_approval' || leave.status === 'manager_approved')) {
      processPayroll(leave.id)
    }
  }

  return (
    <motion.div className="flex flex-col gap-6 pb-12" variants={containerVars} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage employee leave applications and verifications</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1 text-sm bg-amber-500/10 text-amber-600 border-amber-500/20">
            {pendingCount} Pending Action
          </Badge>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 rounded-full mb-6 w-full max-w-sm grid grid-cols-2">
          <TabsTrigger value="requests" className="rounded-full">Leave Requests</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-full">Analytics & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="m-0 flex flex-col gap-6">
          {/* Filters */}
          <motion.div variants={itemVars} className="bg-card p-4 rounded-xl border border-border/50 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search employee..." 
            className="pl-9 h-10 w-full" 
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-1 md:w-40">
            <option value="all">All Departments</option>
            {MOCK_DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-1 md:w-40">
            <option value="all">All Leave Types</option>
            {Object.entries(LEAVE_TYPES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
          </select>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-1 md:w-40">
            <option value="all">All Statuses</option>
            {Object.entries(LEAVE_STATUSES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Requests List */}
      <motion.div variants={itemVars} className="flex flex-col gap-3">
        {sortedLeaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border/50">
            <Filter className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">No requests found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          sortedLeaves.map(leave => {
            const isExpanded = expandedLeave === leave.id
            const days = Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            const policy = policies.find(p => p.id === leave.policyId) || policies.find(p => p.leaveType === leave.leaveType)
            const typeLabel = policy?.name || LEAVE_TYPES[leave.leaveType as keyof typeof LEAVE_TYPES]?.label || leave.leaveType
            const statusInfo = LEAVE_STATUSES[leave.status] || { label: leave.status.replace('_', ' ').toUpperCase(), color: 'text-muted-foreground', bgColor: 'bg-muted' }
            
            return (
              <Card key={leave.id} className={`overflow-hidden transition-all duration-200 border-border/40 hover:border-border shadow-sm ${isExpanded ? 'ring-1 ring-primary/20' : ''}`}>
                <CardContent className="p-0">
                  {/* Summary Row (Clickable) */}
                  <div 
                    className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30"
                    onClick={() => setExpandedLeave(isExpanded ? null : leave.id)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 border border-border/50">
                        <AvatarFallback className="bg-primary/5 text-primary text-sm font-semibold">
                          {leave.employee?.firstName[0]}{leave.employee?.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{leave.employee ? getFullName(leave.employee) : 'Unknown'}</span>
                          <Badge variant="outline" className={`text-[10px] uppercase font-bold border-none px-2 py-0.5 ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </Badge>
                          {leave.status === 'pending' && (
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <span>{leave.department?.name || 'No Dept'}</span>
                          <span>•</span>
                          <span className="font-semibold">{typeLabel}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {days} Day{days>1?'s':''}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 md:ml-auto">
                      <Badge variant="outline" className={`text-[10px] ${leave.isPaid ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-amber-600 border-amber-200 bg-amber-50'} dark:bg-transparent`}>
                        {leave.isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border/40 bg-muted/10 overflow-hidden"
                      >
                        <div className="p-5 flex flex-col md:flex-row gap-8">
                          {/* Left Column: Info */}
                          <div className="flex-1 flex flex-col gap-5">
                            
                            {/* Dates & Reason */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Period</p>
                                <p className="text-sm font-medium">
                                  {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Applied On</p>
                                <p className="text-sm font-medium">{new Date(leave.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Reason</p>
                              <p className="text-sm bg-background p-3 rounded-md border border-border/50">{leave.reason}</p>
                            </div>

                            {/* Medical Specific */}
                            {leave.leaveType === 'medical' && (
                              <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                                  <Stethoscope className="w-4 h-4" /> Medical Details
                                </h4>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Doctor Name</p>
                                    <p className="text-sm font-medium">{leave.doctorName || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Hospital/Clinic</p>
                                    <p className="text-sm font-medium">{leave.hospitalName || 'Not provided'}</p>
                                  </div>
                                </div>
                                
                                <div className="pt-3 border-t border-red-500/10">
                                  <p className="text-xs text-muted-foreground mb-2">Attached Documents</p>
                                  {leave.documents && leave.documents.length > 0 ? (
                                    <div className="flex gap-2 flex-wrap">
                                      {leave.documents.map((doc, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-background px-3 py-1.5 rounded text-xs border cursor-pointer hover:bg-muted transition-colors">
                                          <FileText className="w-3.5 h-3.5 text-red-500" />
                                          {doc}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-red-500 font-medium flex items-center gap-1">
                                      <AlertCircle className="w-3.5 h-3.5" /> No medical documents uploaded. Verification cannot proceed.
                                    </div>
                                  )}
                                  
                                  <div className="mt-3 flex items-center justify-between bg-background p-2 px-3 rounded text-xs border">
                                    <span className="text-muted-foreground">Verification Status</span>
                                    <Badge variant={leave.verificationStatus === 'verified' ? 'default' : 'secondary'} className={leave.verificationStatus === 'verified' ? 'bg-emerald-500' : ''}>
                                      {leave.verificationStatus?.toUpperCase() || 'PENDING'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Emergency Specific */}
                            {leave.leaveType === 'emergency' && (
                              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-500 mb-3 flex items-center gap-2">
                                  <ShieldAlert className="w-4 h-4" /> Emergency Information
                                </h4>
                                <div className="mb-3">
                                  <p className="text-xs text-muted-foreground mb-1">Emergency Category</p>
                                  <Badge variant="outline" className="bg-background border-amber-200 text-amber-700">{leave.emergencyCategory || 'Uncategorized'}</Badge>
                                </div>
                                <div className="text-xs text-muted-foreground bg-background p-2 rounded border border-amber-100 flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                  <p>This is an unpaid leave request. Approval will automatically flag this period for salary deduction in the payroll module.</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Column: Actions & Status */}
                          <div className="md:w-64 shrink-0 flex flex-col gap-4 border-l border-border/40 md:pl-8">
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Timeline</p>
                              <div className="flex flex-col gap-3 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent">
                                <div className="relative flex items-center justify-between md:justify-normal md:flex-row-reverse gap-3 group">
                                  <div className="flex items-center justify-center w-3 h-3 rounded-full border-2 border-primary bg-background shrink-0" />
                                  <div className="text-xs text-muted-foreground text-right md:w-full">
                                    <p className="font-medium text-foreground">Requested</p>
                                    <p>{new Date(leave.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                {leave.managerId && (
                                  <div className="relative flex items-center justify-between md:justify-normal md:flex-row-reverse gap-3 group">
                                    <div className="flex items-center justify-center w-3 h-3 rounded-full border-2 border-emerald-500 bg-background shrink-0" />
                                    <div className="text-xs text-muted-foreground text-right md:w-full">
                                      <p className="font-medium text-foreground">Manager Approval</p>
                                      <p>Approved</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {['submitted', 'hr_verification', 'manager_approval', 'pending', 'manager_approved'].includes(leave.status) ? (
                              <div className="mt-auto flex flex-col gap-2 pt-4">
                                {leave.status === 'manager_approval' || leave.status === 'manager_approved' ? (
                                  <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                                    onClick={() => handleAction(leave, 'approve')}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Process Payroll
                                  </Button>
                                ) : (
                                  <Button 
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                                    onClick={() => handleAction(leave, 'approve')}
                                    disabled={leave.leaveType === 'medical' && leave.verificationStatus !== 'verified'}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Approve Leave
                                  </Button>
                                )}
                                
                                <Button 
                                  variant="outline" 
                                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                  onClick={() => handleAction(leave, 'reject')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                                
                                {leave.leaveType === 'medical' && leave.verificationStatus !== 'verified' && (
                                  <Button variant="secondary" className="w-full mt-2" onClick={() => handleAction(leave, 'verify')}>
                                    <FileUp className="w-4 h-4 mr-2" />
                                    Verify Documents
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="mt-auto pt-4 flex flex-col items-center justify-center text-center p-3 bg-background rounded-lg border">
                                <span className={`text-sm font-medium ${statusInfo.color}`}>
                                  {statusInfo.label}
                                </span>
                                <span className="text-xs text-muted-foreground mt-1">
                                  Action completed
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )
          })
        )}
        </motion.div>
        </TabsContent>

        <TabsContent value="analytics" className="m-0 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-sm text-muted-foreground mb-4">Leave Utilization</h3>
                <div className="flex items-end gap-2 h-32 mb-4">
                  {[40, 25, 60, 80, 50, 70, 45, 90, 30, 55, 65, 85].map((v, i) => (
                    <div key={i} className="flex-1 bg-primary/20 rounded-t flex items-end justify-center group relative cursor-pointer hover:bg-primary/30 transition-colors">
                      <div className="w-full bg-primary rounded-t" style={{ height: `${v}%` }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Jan</span><span>Dec</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-sm text-muted-foreground mb-4">Department Trends</h3>
                <div className="flex flex-col gap-4">
                  {MOCK_DEPARTMENTS.slice(0, 4).map((d, i) => {
                    const usage = [85, 60, 40, 20][i]
                    return (
                      <div key={d.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">{d.name}</span>
                          <span className="text-muted-foreground">{usage}%</span>
                        </div>
                        <Progress value={usage} className="h-1.5" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-4">Approval Bottlenecks</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-3 bg-amber-500/10 text-amber-700 rounded-lg border border-amber-500/20 text-sm">
                      <span className="font-medium">Pending HR Verification</span>
                      <span className="font-bold text-lg">{leaves.filter(l => l.status === 'submitted' && l.leaveType === 'medical').length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-500/10 text-blue-700 rounded-lg border border-blue-500/20 text-sm">
                      <span className="font-medium">Pending Payroll</span>
                      <span className="font-bold text-lg">{leaves.filter(l => l.status === 'manager_approval' || l.status === 'manager_approved').length}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Review these queues to unblock employee workflows.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
