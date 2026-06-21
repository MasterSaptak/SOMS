"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { LayoutGrid, List, Search, Eye, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EmployeeCard } from '@/components/employee/employee-card'
import { AddEmployeeDialog } from '@/components/employee/add-employee-dialog'
import { getEmployeesAction } from '@/app/actions/employee.actions'
import { getDepartmentsAction, getWorkLocationsAction, getDesignationsAction } from '@/app/actions/structure.actions'
import type { Employee, Department, WorkLocation, Designation } from '@/lib/types'

const containerVars = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVars = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0 },
}

export default function EmployeeDirectoryPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [locations, setLocations] = useState<WorkLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        const [empRes, deptRes, desigRes, locRes] = await Promise.all([
          getEmployeesAction(),
          getDepartmentsAction(),
          getDesignationsAction(),
          getWorkLocationsAction()
        ])
        
        if (empRes.success) setEmployees(empRes.data)
        if (deptRes.success) setDepartments(deptRes.data)
        if (desigRes.success) setDesignations(desigRes.data)
        if (locRes.success) setLocations(locRes.data)
      } catch (e) {
        console.error('Failed to load directory data:', e)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filtered = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`
    const matchSearch = search === '' || fullName.toLowerCase().includes(search.toLowerCase()) || emp.employeeCode.toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'all' || emp.departmentId === deptFilter
    const matchStatus = statusFilter === 'all' || emp.status === statusFilter
    const matchLocation = locationFilter === 'all' || emp.workLocationId === locationFilter
    return matchSearch && matchDept && matchStatus && matchLocation
  })

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Employee Directory
            <Badge variant="secondary" className="text-sm font-normal">{filtered.length} members</Badge>
          </h1>
          <p className="text-muted-foreground mt-1">Manage and view all organization members.</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>Add Employee</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between bg-card p-4 rounded-xl border border-border/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or code..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="flex items-center border border-border/50 rounded-md p-1 bg-muted/30 ml-auto md:ml-0">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('grid')}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(emp => (
            <motion.div key={emp.id} variants={itemVars}>
              <EmployeeCard employee={emp} onClick={() => router.push(`/admin/hr/directory/${emp.id}`)} />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl border-border">
              No employees found matching the filters.
            </div>
          )}
        </div>
      ) : (
        <motion.div variants={itemVars} className="border border-border/50 rounded-xl overflow-hidden bg-card">
          <div className="grid grid-cols-[minmax(200px,2fr)_minmax(120px,1fr)_minmax(150px,1.5fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(60px,auto)] gap-4 p-4 font-semibold text-sm border-b border-border/50 bg-muted/20 text-muted-foreground">
            <div>Employee</div>
            <div>Department</div>
            <div>Designation</div>
            <div>Status</div>
            <div>Location</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="flex flex-col relative min-h-[200px]">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10">
                <span className="text-muted-foreground animate-pulse">Loading data...</span>
              </div>
            )}
            {filtered.map(emp => {
              const dept = departments.find(d => d.id === emp.departmentId)
              const desig = designations.find(d => d.id === emp.designationId)
              const loc = locations.find(l => l.id === emp.workLocationId)
              
              let statusColor = 'bg-slate-500 text-white'
              if (emp.status === 'active') statusColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
              else if (emp.status === 'on_leave') statusColor = 'bg-amber-500/10 text-amber-600 border-amber-200'
              else if (emp.status === 'terminated') statusColor = 'bg-red-500/10 text-red-600 border-red-200'

              return (
                <div key={emp.id} className="grid grid-cols-[minmax(200px,2fr)_minmax(120px,1fr)_minmax(150px,1.5fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(60px,auto)] gap-4 p-4 items-center border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors cursor-pointer" onClick={() => router.push(`/admin/hr/directory/${emp.id}`)}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={emp.avatarUrl} />
                      <AvatarFallback>{emp.firstName[0]}{emp.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <div className="font-medium text-sm truncate">{emp.firstName} {emp.lastName}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{emp.employeeCode}</div>
                    </div>
                  </div>
                  <div className="text-sm truncate text-muted-foreground">{dept?.name || '-'}</div>
                  <div className="text-sm truncate text-muted-foreground">{desig?.title || '-'}</div>
                  <div>
                    <Badge variant="outline" className={`text-[10px] capitalize ${statusColor}`}>
                      {emp.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-sm truncate text-muted-foreground">{loc?.name || '-'}</div>
                  <div className="text-right flex justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No employees found.</div>
            )}
          </div>
        </motion.div>
      )}

      <AddEmployeeDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </motion.div>
  )
}
