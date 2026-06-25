"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { EmployeeSummary, HRDashboardStats } from '@/lib/repositories/hr.repository'
import { Search, Plus, Building2, UserCheck, UserX, Eye, Users, ShieldAlert, UserMinus } from 'lucide-react'
import { EmployeeDetailDrawer } from './EmployeeDetailDrawer'
import { EmployeeDialog } from './EmployeeDialog'
import { AnimatePresence } from 'motion/react'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

export function HRDashboardClient({ employees, stats, organizationId }: { employees: EmployeeSummary[], stats: HRDashboardStats, organizationId: string }) {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Extract unique departments for the filter
  const departments = Array.from(
    new Map(employees.map(e => e.department).filter(Boolean).map(d => [d!.id, d])).values()
  )

  const filtered = employees.filter(emp => {
    const matchSearch = search === '' || 
      emp.full_name.toLowerCase().includes(search.toLowerCase()) || 
      (emp.employee_id_string || '').toLowerCase().includes(search.toLowerCase())
    const matchDept = selectedDept === 'all' || emp.department?.id === selectedDept
    return matchSearch && matchDept
  })

  const activeCount = employees.filter(e => e.status === 'active').length
  const onLeaveCount = employees.filter(e => e.status === 'on_leave').length

  return (
    <motion.div className="flex flex-col gap-6 pb-12" variants={containerVars} initial="hidden" animate="show">
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Management</h1>
          <p className="text-muted-foreground mt-1">{stats.totalEmployees} employees · {stats.active} active · {stats.onLeave} on leave</p>
        </div>
        <Button className="gap-1.5" onClick={() => setShowAddDialog(true)}><Plus className="w-4 h-4" />Add Employee</Button>
      </motion.div>

      {/* Advanced Stats */}
      <motion.div variants={itemVars} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">{stats.totalEmployees}</span>
              <Users className="w-4 h-4 text-muted-foreground mb-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-emerald-600">{stats.active}</span>
              <UserCheck className="w-4 h-4 text-emerald-600/50 mb-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inactive</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-destructive">{stats.inactive}</span>
              <UserMinus className="w-4 h-4 text-destructive/50 mb-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">On Leave</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-amber-600">{stats.onLeave}</span>
              <ShieldAlert className="w-4 h-4 text-amber-600/50 mb-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Probation</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-blue-600">{stats.probation}</span>
              <Users className="w-4 h-4 text-blue-600/50 mb-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New Hires (30d)</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-purple-600">{stats.newHires}</span>
              <Plus className="w-4 h-4 text-purple-600/50 mb-1" />
            </div>
          </CardContent>
        </Card>

      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVars} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..." className="pl-9" />
        </div>
        <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d!.id} value={d!.id}>{d!.name}</option>)}
        </select>
      </motion.div>

      {/* Employee Table */}
      <motion.div variants={itemVars}>
        <Card>
          <CardContent className="p-0">
            <div className="hidden md:grid grid-cols-[1fr_140px_140px_100px_60px] gap-4 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
              <span>Employee</span><span>Department</span><span>Designation</span><span>Status</span><span></span>
            </div>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Search className="w-10 h-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">No employees found</p>
              </div>
            ) : (
              filtered.map(emp => {
                const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                
                return (
                  <div key={emp.id} className="group grid grid-cols-1 md:grid-cols-[1fr_140px_140px_100px_60px] gap-4 px-4 py-3 items-center border-b border-border/40 last:border-0 hover:bg-muted/50 transition-colors">
                    
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-10 h-10 shrink-0 border border-border/50">
                        {emp.profile_photo ? (
                          <img src={emp.profile_photo} alt={emp.full_name} className="object-cover w-full h-full" />
                        ) : (
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">{getInitials(emp.full_name)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{emp.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{emp.employee_id_string || 'No ID'}</p>
                      </div>
                    </div>

                    <div className="hidden md:block">
                      <p className="text-sm">{emp.department?.name || '—'}</p>
                    </div>

                    <div className="hidden md:block">
                      <p className="text-sm text-muted-foreground truncate">{emp.designation?.title || '—'}</p>
                    </div>

                    <div className="hidden md:flex items-center">
                      {emp.status === 'active' ? (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-normal">Active</Badge>
                      ) : emp.status === 'on_leave' ? (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-normal">On Leave</Badge>
                      ) : (
                        <Badge variant="secondary" className="font-normal capitalize">{emp.status}</Badge>
                      )}
                    </div>

                    <div className="hidden md:flex justify-end">
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setSelectedEmployee(emp.id)}>
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>

                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {selectedEmployee && (
          <EmployeeDetailDrawer
            organizationId={organizationId}
            employeeId={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
          />
        )}
        {showAddDialog && (
          <EmployeeDialog
            organizationId={organizationId}
            onClose={() => setShowAddDialog(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
