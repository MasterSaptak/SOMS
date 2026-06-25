// @ts-nocheck
'use client'

import React, { useState, useCallback, useTransition } from 'react'
import { 
  Search, Filter, Plus, MoreHorizontal, ChevronLeft, ChevronRight,
  Download, Upload, Trash2, UserCheck, UserX, CheckSquare, Square,
  X, Eye, Edit, ShieldAlert, ArrowRightLeft, Briefcase, FolderKanban,
  User, Activity
} from 'lucide-react'
import { getPeopleAction, updatePersonAction, createPersonAction, bulkUpdateStatusAction } from '@/app/actions/people.actions'
import PersonProfileDrawer from './PersonProfileDrawer'
import ChangeLifecycleDialog from './ChangeLifecycleDialog'

interface PersonSummary {
  id: string
  user_id: string | null
  employee_id_string: string | null
  full_name: string
  email: string
  phone: string | null
  profile_photo: string | null
  employment_status: string
  employment_type: string | null
  lifecycle_status: string | null
  department: string | null
  designation: string | null
  organization_id: string | null
  organization_name: string | null
  reports_to_employee_id: string | null
  manager_name: string | null
  joining_date: string | null
  created_at: string
}

interface PaginatedPeople {
  data: PersonSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface Props {
  initialData: PaginatedPeople
  filterOptions: {
    departments: string[]
    statuses: string[]
    employmentTypes: string[]
    lifecycleStatuses: string[]
  }
  organizationId: string | null
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
  probation: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  on_leave: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  terminated: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
}

export default function PeopleDirectoryClient({ initialData, filterOptions, organizationId }: Props) {
  const [people, setPeople] = useState<PaginatedPeople>(initialData)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [actionMenu, setActionMenu] = useState<string | null>(null)
  const [lifecycleDialogPerson, setLifecycleDialogPerson] = useState<PersonSummary | null>(null)

  // Create form state
  const [newPerson, setNewPerson] = useState({ full_name: '', email: '', phone: '', department: '', designation: '', employment_type: 'permanent' })

  const fetchPeople = useCallback((page = 1) => {
    startTransition(async () => {
      const result = await getPeopleAction({
        organizationId,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        department: deptFilter !== 'all' ? deptFilter : undefined,
        employmentType: typeFilter !== 'all' ? typeFilter : undefined,
        page,
        pageSize: 50,
      })
      if (result.success) setPeople(result.data!)
    })
  }, [organizationId, search, statusFilter, deptFilter, typeFilter])

  const handleSearch = () => fetchPeople(1)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === people.data.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(people.data.map(p => p.id)))
    }
  }

  const handleBulkStatus = (status: string) => {
    startTransition(async () => {
      await bulkUpdateStatusAction([...selected], status)
      setSelected(new Set())
      fetchPeople(people.page)
    })
  }

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createPersonAction({
        ...newPerson,
        organization_id: organizationId || undefined,
      })
      if (result.success) {
        setShowCreateDialog(false)
        setNewPerson({ full_name: '', email: '', phone: '', department: '', designation: '', employment_type: 'permanent' })
        fetchPeople(1)
      }
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">People</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {people.total} {people.total === 1 ? 'person' : 'people'} in the directory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Person
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}
        >
          <Filter size={16} />
          Filters
        </button>
        <button
          onClick={() => fetchPeople(1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 rounded-xl border border-border bg-card/50">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); }}
              className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Statuses</option>
              {filterOptions.statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); }}
              className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Departments</option>
              {filterOptions.departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Employment Type</label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); }}
              className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Types</option>
              {filterOptions.employmentTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => fetchPeople(1)} className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium text-primary">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => handleBulkStatus('active')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium hover:bg-emerald-200 transition-colors">
              <UserCheck size={14} /> Activate
            </button>
            <button onClick={() => handleBulkStatus('inactive')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors">
              <UserX size={14} /> Deactivate
            </button>
            <button onClick={() => handleBulkStatus('suspended')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors">
              <ShieldAlert size={14} /> Suspend
            </button>
            <button onClick={() => setSelected(new Set())} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="w-10 px-4 py-3 text-left">
                  <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground transition-colors">
                    {selected.size === people.data.length && people.data.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Person</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Employee ID</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden lg:table-cell">Department</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden lg:table-cell">Designation</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden xl:table-cell">Organization</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden xl:table-cell">Manager</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden xl:table-cell">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {people.data.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center text-muted-foreground">
                    <User size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-base font-medium">No people found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                people.data.map((person) => (
                  <tr
                    key={person.id}
                    className={`hover:bg-accent/30 transition-colors cursor-pointer ${selected.has(person.id) ? 'bg-primary/5' : ''}`}
                    onClick={() => setSelectedPerson(person.id)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleSelect(person.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                        {selected.has(person.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {person.profile_photo ? (
                          <img src={person.profile_photo} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-border" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {getInitials(person.full_name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{person.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{person.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell font-mono text-xs">
                      {person.employee_id_string || '—'}
                    </td>
                    <td className="px-4 py-3 text-foreground hidden lg:table-cell">
                      {person.department || <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-foreground hidden lg:table-cell">
                      {person.designation || <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-foreground hidden xl:table-cell text-xs">
                      {person.organization_name || <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-foreground hidden xl:table-cell text-xs">
                      {person.manager_name || <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-xs capitalize text-muted-foreground">{person.employment_type || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[person.employment_status] || statusColors.active}`}>
                        {person.employment_status?.replace('_', ' ') || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                      {person.joining_date ? new Date(person.joining_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === person.id ? null : person.id)}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {actionMenu === person.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
                            <div className="absolute right-0 top-8 z-50 w-48 rounded-xl border border-border bg-card shadow-lg py-1">
                              <button onClick={() => { setSelectedPerson(person.id); setActionMenu(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                                <Eye size={14} /> View Profile
                              </button>
                              <button onClick={() => { setSelectedPerson(person.id); setActionMenu(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                                <Edit size={14} /> Edit
                              </button>
                              <div className="border-t border-border my-1" />
                              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                                <ArrowRightLeft size={14} /> Transfer
                              </button>
                              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                                <Briefcase size={14} /> Assign Team
                              </button>
                              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                                <FolderKanban size={14} /> Assign Project
                              </button>
                              <div className="border-t border-border my-1" />
                              <button onClick={() => { setLifecycleDialogPerson(person); setActionMenu(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                                <Activity size={14} /> Update Lifecycle
                              </button>
                              <div className="border-t border-border my-1" />
                              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {people.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing {((people.page - 1) * people.pageSize) + 1}–{Math.min(people.page * people.pageSize, people.total)} of {people.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchPeople(people.page - 1)}
                disabled={people.page <= 1}
                className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(people.totalPages, 5) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchPeople(pageNum)}
                    className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${pageNum === people.page ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => fetchPeople(people.page + 1)}
                disabled={people.page >= people.totalPages}
                className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Person Profile Drawer */}
      {selectedPerson && (
        <PersonProfileDrawer
          employeeId={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onUpdate={() => fetchPeople(people.page)}
          organizationId={organizationId}
        />
      )}

      {/* Lifecycle Status Dialog */}
      {lifecycleDialogPerson && (
        <ChangeLifecycleDialog
          employeeId={lifecycleDialogPerson.id}
          currentStatus={lifecycleDialogPerson.lifecycle_status}
          personName={lifecycleDialogPerson.full_name}
          onClose={() => setLifecycleDialogPerson(null)}
          onUpdate={() => fetchPeople(people.page)}
        />
      )}

      {/* Create Person Dialog */}
      {showCreateDialog && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Add New Person</h2>
                <button onClick={() => setShowCreateDialog(false)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name *</label>
                  <input type="text" value={newPerson.full_name} onChange={(e) => setNewPerson({ ...newPerson, full_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="John Smith" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Email *</label>
                  <input type="email" value={newPerson.email} onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
                  <input type="text" value={newPerson.phone} onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Employment Type</label>
                  <select value={newPerson.employment_type} onChange={(e) => setNewPerson({ ...newPerson, employment_type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="permanent">Permanent</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="consultant">Consultant</option>
                    <option value="vendor">Vendor</option>
                    <option value="probation">Probation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Department</label>
                  <input type="text" value={newPerson.department} onChange={(e) => setNewPerson({ ...newPerson, department: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Engineering" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Designation</label>
                  <input type="text" value={newPerson.designation} onChange={(e) => setNewPerson({ ...newPerson, designation: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Senior Engineer" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowCreateDialog(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newPerson.full_name || !newPerson.email || isPending}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Creating...' : 'Create Person'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
