// @ts-nocheck
'use client'

import React, { useState, useCallback, useTransition } from 'react'
import { 
  Search, Filter, Plus, MoreHorizontal, ChevronLeft, ChevronRight,
  Download, Upload, Trash2, UserCheck, UserX, CheckSquare, Square,
  X, Eye, Edit, ShieldAlert, ArrowRightLeft, Briefcase, FolderKanban,
  User, Activity, Users, Building2, Package, CalendarRange, Banknote,
  LayoutGrid, List, SlidersHorizontal, Loader2, FileDown, CheckCircle2, XCircle, UserPlus
} from 'lucide-react'
import { toast } from 'sonner'
import { getPeopleAction, updatePersonAction, createPersonAction, bulkUpdateStatusAction, deletePersonAction } from '@/app/actions/people.actions'
import { assignToOrganization } from '@/app/actions/identity.actions'
import PersonProfileDrawer from './PersonProfileDrawer'
import ChangeLifecycleDialog from './ChangeLifecycleDialog'
import AssignOrganizationDialog from './AssignOrganizationDialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/use-auth-store'

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
  searchQuery?: string
  unassignedUsers?: any[]
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

export default function PeopleDirectoryClient({ initialData, filterOptions, organizationId, searchQuery = '', unassignedUsers = [] }: Props) {
  const [activeTab, setActiveTab] = useState<'directory' | 'unassigned'>('directory')
  const [people, setPeople] = useState<PaginatedPeople>(initialData)
  const { currentOrganization } = useAuthStore()
  const [search, setSearch] = useState(searchQuery)
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
  const [assignOrgPerson, setAssignOrgPerson] = useState<PersonSummary | null>(null)

  // Sync global search
  React.useEffect(() => {
    setSearch(searchQuery)
  }, [searchQuery])

  React.useEffect(() => {
    const handler = setTimeout(() => {
      fetchPeople(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

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

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this person? This action cannot be undone.')) {
      startTransition(async () => {
        const result = await deletePersonAction(id)
        if (result.success) {
          toast.success('Person deleted successfully')
          fetchPeople(people.page)
        } else {
          toast.error('Failed to delete person')
        }
      })
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleAssign = (userId: string) => {
    const orgId = currentOrganization?.id || organizationId
    if (!orgId) {
      toast.error('No organization selected')
      return
    }
    startTransition(async () => {
      const res = await assignToOrganization(userId, orgId, 'employee')
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("User assigned successfully.")
        // Refresh by reloading page since we need unassignedUsers refreshed
        window.location.reload()
      }
    })
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
          {activeTab === 'directory' ? (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={16} />
              Add Person
            </button>
          ) : (
            <a
              href="/admin/settings/organization"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm"
            >
              <Building2 size={16} />
              Create Organization
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'directory' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          Directory
        </button>
        <button
          onClick={() => setActiveTab('unassigned')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'unassigned' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Unassigned Users
          {unassignedUsers.length > 0 && (
            <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-2 py-0.5 rounded-full text-xs">
              {unassignedUsers.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Sticky Toolbar */}
          <div className="sticky top-14 z-10 bg-surface-base py-3 border-b border-border/50 flex flex-col sm:flex-row gap-3 shadow-sm -mx-2 px-2">
        <div className="relative flex-1 max-w-sm hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search within people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all shadow-sm ${showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}
        >
          <Filter size={15} />
          Filters
        </button>

        <button
          onClick={() => fetchPeople(1)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground transition-all shadow-sm ml-auto"
        >
          <Download size={15} />
          Export
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 rounded-xl border border-border bg-card shadow-sm mt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); }}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Statuses</option>
              {filterOptions.statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); }}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Departments</option>
              {filterOptions.departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Employment Type</label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); }}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Types</option>
              {filterOptions.employmentTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => fetchPeople(1)} className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 mt-4 rounded-xl bg-primary/5 border border-primary/20 shadow-sm animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-primary px-2">{selected.size} employees selected</span>
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
      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="w-10 px-4 py-2.5 text-left">
                  <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                    {selected.size === people.data.length && people.data.length > 0 ? <CheckSquare size={15} /> : <Square size={15} />}
                  </button>
                </th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">Person</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground text-[11px] uppercase tracking-wider hidden lg:table-cell">Department</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground text-[11px] uppercase tracking-wider hidden lg:table-cell">Role</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground text-[11px] uppercase tracking-wider hidden xl:table-cell">Manager</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground text-[11px] uppercase tracking-wider hidden xl:table-cell">Location</th>
                <th className="w-10 px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {people.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-20 text-center text-muted-foreground">
                    <div className="max-w-xs mx-auto">
                      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4 border border-border/50 shadow-sm">
                        <Users size={28} className="text-muted-foreground/60" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">No employees found</h3>
                      <p className="text-sm mb-6">Your workforce directory is empty. Get started by adding your first employee or importing a CSV file.</p>
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => setShowCreateDialog(true)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                          Create Employee
                        </button>
                        <button className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent transition-colors shadow-sm">
                          Import CSV
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                people.data.map((person) => (
                  <tr
                    key={person.id}
                    className={`hover:bg-accent/40 transition-colors cursor-pointer group h-[46px] ${selected.has(person.id) ? 'bg-primary/5' : ''}`}
                    onClick={() => setSelectedPerson(person.id)}
                  >
                    <td className="px-4 py-1.5" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleSelect(person.id)} className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                        {selected.has(person.id) ? <CheckSquare size={15} className="text-primary" /> : <Square size={15} className="opacity-40 group-hover:opacity-100" />}
                      </button>
                    </td>
                    <td className="px-4 py-1.5">
                      <div className="flex items-center gap-3">
                        {person.profile_photo ? (
                          <img src={person.profile_photo} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-border shadow-sm" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shadow-sm ring-1 ring-primary/20">
                            {getInitials(person.full_name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{person.full_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-1.5 text-muted-foreground hidden lg:table-cell text-sm">
                      {person.department || '—'}
                    </td>
                    <td className="px-4 py-1.5 text-muted-foreground hidden lg:table-cell text-sm">
                      {person.designation || '—'}
                    </td>
                    <td className="px-4 py-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize tracking-wide ${statusColors[person.employment_status] || statusColors.active}`}>
                        {person.employment_status?.replace('_', ' ') || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-1.5 text-muted-foreground hidden xl:table-cell text-sm">
                      {person.manager_name || '—'}
                    </td>
                    <td className="px-4 py-1.5 text-muted-foreground hidden xl:table-cell text-sm">
                      {person.organization_name || 'HQ'}
                    </td>
                    <td className="px-4 py-1.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100">
                              <MoreHorizontal size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl border border-border bg-card shadow-lg py-1.5 z-50">
                            <DropdownMenuItem onClick={() => setSelectedPerson(person.id)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium cursor-pointer">
                              <Edit size={14} className="text-muted-foreground" /> Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/50 my-1" />
                            <DropdownMenuItem onClick={() => toast.info('Feature coming soon')} className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer">
                              <ArrowRightLeft size={14} className="text-muted-foreground" /> Transfer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info('Feature coming soon')} className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer">
                              <Users size={14} className="text-muted-foreground" /> Assign Team
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info('Feature coming soon')} className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer">
                              <FolderKanban size={14} className="text-muted-foreground" /> Assign Project
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setAssignOrgPerson(person)} className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer">
                              <Building2 size={14} className="text-muted-foreground" /> Assign Organization
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info('Feature coming soon')} className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer">
                              <Package size={14} className="text-muted-foreground" /> Assign Asset
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/50 my-1" />
                            <DropdownMenuItem onClick={() => toast.info('Feature coming soon')} className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer">
                              <ShieldAlert size={14} className="text-muted-foreground" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info('Feature coming soon')} className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer">
                              <CalendarRange size={14} className="text-muted-foreground" /> Leave
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info('Feature coming soon')} className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer">
                              <Banknote size={14} className="text-muted-foreground" /> Payroll
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/50 my-1" />
                            <DropdownMenuItem onClick={() => handleDelete(person.id)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                              <Trash2 size={14} /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 bg-muted/10">
            <p className="text-xs text-muted-foreground font-medium">
              Showing {((people.page - 1) * people.pageSize) + 1}–{Math.min(people.page * people.pageSize, people.total)} of {people.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchPeople(people.page - 1)}
                disabled={people.page <= 1}
                className="p-1 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none bg-card shadow-sm"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(people.totalPages, 5) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchPeople(pageNum)}
                    className={`w-7 h-7 rounded text-xs font-semibold transition-colors shadow-sm ${pageNum === people.page ? 'bg-primary text-primary-foreground border border-primary' : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => fetchPeople(people.page + 1)}
                disabled={people.page >= people.totalPages}
                className="p-1 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none bg-card shadow-sm"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
        </>
      ) : (
        <div className="bg-surface-primary border border-border rounded-xl overflow-hidden mt-6">
          {unassignedUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
              <UserCheck size={32} className="mb-2 text-primary/40" />
              <p>No unassigned users found.</p>
              <p className="text-sm">All registered users are assigned to an organization.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">User Email</th>
                  <th className="px-4 py-3 font-medium">Joined Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {unassignedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">{user.id}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                        Unassigned
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleAssign(user.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Assign to Organization
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
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

      {/* Assign Organization Dialog */}
      {assignOrgPerson && (
        <AssignOrganizationDialog
          employee={assignOrgPerson}
          onClose={() => setAssignOrgPerson(null)}
          onAssigned={() => {
            setAssignOrgPerson(null)
            fetchPeople(people.page)
          }}
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
