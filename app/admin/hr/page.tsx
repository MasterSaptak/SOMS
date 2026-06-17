"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { MOCK_EMPLOYEES, MOCK_DEPARTMENTS, MOCK_USERS, getFullName, getDepartmentById } from '@/lib/mock-data'
import { ROLES } from '@/lib/constants'
import type { UserRole } from '@/lib/types'
import { Search, Plus, X, Mail, Phone, Calendar, Building2, UserCheck, UserX, Eye } from 'lucide-react'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

export default function HRManagementPage() {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  const filtered = MOCK_EMPLOYEES.filter(emp => {
    const matchSearch = search === '' || getFullName(emp).toLowerCase().includes(search.toLowerCase()) || emp.employeeCode.toLowerCase().includes(search.toLowerCase())
    const matchDept = selectedDept === 'all' || emp.departmentId === selectedDept
    return matchSearch && matchDept
  })

  const selectedEmp = selectedEmployee ? MOCK_EMPLOYEES.find(e => e.id === selectedEmployee) : null
  const selectedUser = selectedEmp ? MOCK_USERS.find(u => u.id === selectedEmp.userId) : null
  const selectedDeptData = selectedEmp ? getDepartmentById(selectedEmp.departmentId) : null

  const activeCount = MOCK_EMPLOYEES.filter(e => e.status === 'active').length
  const onLeaveCount = MOCK_EMPLOYEES.filter(e => e.status === 'on_leave').length

  return (
    <motion.div className="flex flex-col gap-6 pb-12" variants={containerVars} initial="hidden" animate="show">
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Management</h1>
          <p className="text-muted-foreground mt-1">{MOCK_EMPLOYEES.length} employees · {activeCount} active · {onLeaveCount} on leave</p>
        </div>
        <Button className="gap-1.5"><Plus className="w-4 h-4" />Add Employee</Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVars} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MOCK_DEPARTMENTS.slice(0, 4).map(dept => {
          const count = MOCK_EMPLOYEES.filter(e => e.departmentId === dept.id).length
          return (
            <Card key={dept.id} className="hover:border-primary/20 transition-colors cursor-pointer" onClick={() => setSelectedDept(dept.id === selectedDept ? 'all' : dept.id)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{dept.name}</p>
                  <p className="text-xs text-muted-foreground">{count} members</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVars} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..." className="pl-9" />
        </div>
        <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option value="all">All Departments</option>
          {MOCK_DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </motion.div>

      {/* Employee Table + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <motion.div variants={itemVars} className={selectedEmp ? 'lg:col-span-2' : 'lg:col-span-3'}>
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
                  const dept = getDepartmentById(emp.departmentId)
                  const isSelected = selectedEmployee === emp.id
                  return (
                    <div key={emp.id} className={`grid grid-cols-1 md:grid-cols-[1fr_140px_140px_100px_60px] gap-2 md:gap-4 items-center p-4 border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`} onClick={() => setSelectedEmployee(isSelected ? null : emp.id)}>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="text-xs font-medium">{emp.firstName[0]}{emp.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{getFullName(emp)}</p>
                          <p className="text-[11px] text-muted-foreground">{emp.employeeCode}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{dept?.name || '—'}</span>
                      <span className="text-xs truncate">{emp.designation}</span>
                      <Badge variant="outline" className={`text-[10px] w-fit ${emp.status === 'active' ? 'text-emerald-600 border-emerald-200' : emp.status === 'on_leave' ? 'text-amber-600 border-amber-200' : 'text-red-600 border-red-200'}`}>
                        {emp.status === 'active' ? 'Active' : emp.status === 'on_leave' ? 'On Leave' : 'Terminated'}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex"><Eye className="w-4 h-4" /></Button>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Detail Panel */}
        {selectedEmp && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Profile</h3>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedEmployee(null)}><X className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="w-16 h-16 mb-3">
                    <AvatarFallback className="text-xl">{selectedEmp.firstName[0]}{selectedEmp.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">{getFullName(selectedEmp)}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEmp.designation}</p>
                  {selectedUser && (
                    <Badge className="mt-2 text-[10px]" variant="outline">{ROLES[selectedUser.role as UserRole]?.label}</Badge>
                  )}
                </div>
                <Separator className="mb-4" />
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground"><Mail className="w-4 h-4 shrink-0" /><span className="truncate">{selectedUser?.email || '—'}</span></div>
                  <div className="flex items-center gap-3 text-muted-foreground"><Phone className="w-4 h-4 shrink-0" /><span>{selectedEmp.phone}</span></div>
                  <div className="flex items-center gap-3 text-muted-foreground"><Building2 className="w-4 h-4 shrink-0" /><span>{selectedDeptData?.name || '—'}</span></div>
                  <div className="flex items-center gap-3 text-muted-foreground"><Calendar className="w-4 h-4 shrink-0" /><span>Joined {new Date(selectedEmp.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span></div>
                  <div className="flex items-center gap-3 text-muted-foreground">{selectedEmp.status === 'active' ? <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" /> : <UserX className="w-4 h-4 text-red-500 shrink-0" />}<span>{selectedEmp.status === 'active' ? 'Active' : selectedEmp.status}</span></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
