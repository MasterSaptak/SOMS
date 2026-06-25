"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, User, Briefcase, FileText, Settings, Shield, Plus, Save, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getEmployeeDetailAction, getEmployeeHistoryAction } from '@/app/actions/hr.actions'
import { EmployeeDetail, EmployeePositionHistory } from '@/lib/repositories/hr.repository'
import { ChangePositionDialog } from './ChangePositionDialog'
import { AssignTeamsDialog } from './AssignTeamsDialog'

// Example tabs: Overview, Employment, Projects, Tasks, Attendance, Leave, Documents, Skills, Certifications, Audit
const TABS = [
  { id: 'profile', label: 'Profile', icon: Edit2 },
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: FileText },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'audit', label: 'Audit Log', icon: Shield },
]

export function EmployeeDetailDrawer({ 
  organizationId,
  employeeId, 
  onClose 
}: { 
  organizationId: string
  employeeId: string 
  onClose: () => void 
}) {
  const [activeTab, setActiveTab] = useState('profile')
  const [detail, setDetail] = useState<EmployeeDetail | null>(null)
  const [history, setHistory] = useState<EmployeePositionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showChangePosition, setShowChangePosition] = useState(false)
  const [showAssignTeams, setShowAssignTeams] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    department: '',
    designation: '',
    date_of_birth: '',
    profile_photo: '',
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [res, histRes] = await Promise.all([
        getEmployeeDetailAction(organizationId, employeeId),
        getEmployeeHistoryAction(organizationId, employeeId)
      ])
      
      if (res.success && res.data) {
        setDetail(res.data)
        setProfileForm({
          full_name: res.data.full_name || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          department: (typeof res.data.department === 'string' ? res.data.department : res.data.department?.name) || '',
          designation: (typeof res.data.designation === 'string' ? res.data.designation : res.data.designation?.title) || '',
          date_of_birth: res.data.date_of_birth || '',
          profile_photo: res.data.profile_photo || '',
        })
      }
      if (histRes.success && histRes.data) {
        setHistory(histRes.data)
      }
      setLoading(false)
    }
    load()
  }, [employeeId, organizationId])

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true)
      const { updateEmployeeBasicInfoAction } = await import('@/app/actions/employee.actions')
      const res = await updateEmployeeBasicInfoAction(employeeId, profileForm)
      if (!res.success) throw new Error(res.error?.message || 'Failed to save')
      
      // Refresh data
      const [freshRes] = await Promise.all([
        getEmployeeDetailAction(organizationId, employeeId)
      ])
      if (freshRes.success && freshRes.data) {
        setDetail(freshRes.data)
        setProfileForm({
          full_name: freshRes.data.full_name || '',
          phone: freshRes.data.phone || '',
          email: freshRes.data.email || '',
          department: (typeof freshRes.data.department === 'string' ? freshRes.data.department : freshRes.data.department?.name) || '',
          designation: (typeof freshRes.data.designation === 'string' ? freshRes.data.designation : freshRes.data.designation?.title) || '',
          date_of_birth: freshRes.data.date_of_birth || '',
          profile_photo: freshRes.data.profile_photo || '',
        })
      }
      setIsEditingProfile(false)
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setIsSavingProfile(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-background border-l border-border shadow-2xl z-50 flex items-center justify-center p-6">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!detail) return null

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <>
      <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-background border-l border-border shadow-2xl z-50 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-lg">Employee Profile</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="px-6 py-6 border-b border-border bg-muted/20">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 shrink-0 border border-border/50 shadow-sm">
              {detail.profile_photo ? (
                <img src={detail.profile_photo} alt={detail.full_name} className="object-cover w-full h-full" />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                  {getInitials(detail.full_name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-xl font-bold truncate">{detail.full_name}</h1>
                <Badge variant={detail.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                  {detail.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-1">{detail.designation?.title || 'No Title'} • {detail.department?.name || 'No Department'}</p>
              <div className="flex gap-4 mt-3">
                <div className="text-xs">
                  <p className="text-muted-foreground mb-0.5">Employee ID</p>
                  <p className="font-medium">{detail.employee_id_string || '—'}</p>
                </div>
                <div className="text-xs">
                  <p className="text-muted-foreground mb-0.5">Email</p>
                  <p className="font-medium">{detail.email}</p>
                </div>
                <div className="text-xs">
                  <p className="text-muted-foreground mb-0.5">Phone</p>
                  <p className="font-medium">{detail.phone || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex px-4 border-b border-border overflow-x-auto scrollbar-hide">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Edit Profile</h3>
                {!isEditingProfile ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)} className="gap-1.5">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(false)} disabled={isSavingProfile}>Cancel</Button>
                    <Button size="sm" onClick={handleSaveProfile} disabled={isSavingProfile} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                      {isSavingProfile ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      {isSavingProfile ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </div>
              <div className="bg-muted/30 rounded-lg p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Full Name</Label>
                    {isEditingProfile ? (
                      <Input value={profileForm.full_name} onChange={e => setProfileForm({...profileForm, full_name: e.target.value})} className="h-9" />
                    ) : (
                      <p className="text-sm font-medium py-1">{detail.full_name || '—'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Email</Label>
                    {isEditingProfile ? (
                      <Input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="h-9" />
                    ) : (
                      <p className="text-sm font-medium py-1">{detail.email || '—'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Phone</Label>
                    {isEditingProfile ? (
                      <Input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="h-9" />
                    ) : (
                      <p className="text-sm font-medium py-1">{detail.phone || '—'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Date of Birth</Label>
                    {isEditingProfile ? (
                      <Input type="date" value={profileForm.date_of_birth} onChange={e => setProfileForm({...profileForm, date_of_birth: e.target.value})} className="h-9" />
                    ) : (
                      <p className="text-sm font-medium py-1">{detail.date_of_birth || '—'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Department</Label>
                    {isEditingProfile ? (
                      <Input value={profileForm.department} onChange={e => setProfileForm({...profileForm, department: e.target.value})} className="h-9" />
                    ) : (
                      <p className="text-sm font-medium py-1">{(typeof detail.department === 'string' ? detail.department : detail.department?.name) || '—'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Designation / Position</Label>
                    {isEditingProfile ? (
                      <Input value={profileForm.designation} onChange={e => setProfileForm({...profileForm, designation: e.target.value})} className="h-9" />
                    ) : (
                      <p className="text-sm font-medium py-1">{(typeof detail.designation === 'string' ? detail.designation : detail.designation?.title) || '—'}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Profile Photo URL</Label>
                  {isEditingProfile ? (
                    <Input value={profileForm.profile_photo} onChange={e => setProfileForm({...profileForm, profile_photo: e.target.value})} placeholder="https://..." className="h-9" />
                  ) : (
                    <p className="text-sm font-medium py-1 truncate">{detail.profile_photo || '—'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm mb-3">Address & Contact</h3>
                <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground block mb-1">Residential Address</span>
                      <span>{detail.address || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Emergency Contact</span>
                      <span>{detail.emergency_contact || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employment' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Employment Details</h3>
                  <Button variant="outline" size="sm" onClick={() => setShowChangePosition(true)}>
                    Change Position
                  </Button>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground block mb-1">Joining Date</span>
                      <span>{detail.joining_date ? new Date(detail.joining_date).toLocaleDateString() : '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Manager</span>
                      <span>{detail.manager?.full_name || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Teams ({detail.teams.length})</h3>
                  <Button variant="outline" size="sm" onClick={() => setShowAssignTeams(true)}>
                    Assign Teams
                  </Button>
                </div>
                <div className="space-y-2">
                  {detail.teams.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Not assigned to any teams.</p>
                  ) : (
                    detail.teams.map(t => (
                      <div key={t.id} className="flex justify-between items-center p-3 rounded border border-border/50 text-sm">
                        <span>{t.name}</span>
                        <Badge variant="outline">{t.role_in_team}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Project Assignments ({detail.projects.length})</h3>
              </div>
              <div className="space-y-3">
                {detail.projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Not assigned to any active projects.</p>
                ) : (
                  detail.projects.map(p => (
                    <div key={p.id} className="p-4 rounded-lg border border-border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{p.name}</span>
                        <Badge variant="secondary">{p.role}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.start_date).toLocaleDateString()} - {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'Present'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-sm">Position History & Audit</h3>
              <div className="relative border-l border-border ml-3 space-y-6">
                {history.length === 0 ? (
                  <p className="pl-6 text-sm text-muted-foreground">No position history recorded.</p>
                ) : (
                  history.map((item, idx) => (
                    <div key={item.id} className="relative pl-6">
                      <div className="absolute -left-[5px] top-1 w-[9px] h-[9px] rounded-full bg-primary ring-4 ring-background" />
                      <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold">{item.title}</span>
                          <span className="text-xs text-muted-foreground">{new Date(item.start_date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-muted-foreground">{item.department_name || 'No Department'}</p>
                        <p className="text-xs mt-2 italic opacity-70">Reason: {item.change_reason || 'Not specified'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showChangePosition && (
          <ChangePositionDialog
            organizationId={organizationId}
            employeeId={employeeId}
            currentDeptId={detail.department?.id}
            currentDesigId={detail.designation?.id}
            onClose={() => setShowChangePosition(false)}
            onSuccess={() => {
              // Reload details
              getEmployeeDetailAction(organizationId, employeeId).then(res => {
                if (res.success && res.data) setDetail(res.data)
              })
              getEmployeeHistoryAction(organizationId, employeeId).then(res => {
                if (res.success && res.data) setHistory(res.data)
              })
            }}
          />
        )}
        {showAssignTeams && (
          <AssignTeamsDialog
            organizationId={organizationId}
            employeeId={employeeId}
            currentTeams={detail.teams}
            onClose={() => setShowAssignTeams(false)}
            onSuccess={() => {
              getEmployeeDetailAction(organizationId, employeeId).then(res => {
                if (res.success && res.data) setDetail(res.data)
              })
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
