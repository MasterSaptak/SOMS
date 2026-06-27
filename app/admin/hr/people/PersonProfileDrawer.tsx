// @ts-nocheck
'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { X, User, Briefcase, Building2, Users, FolderKanban, GraduationCap, Award, FileText, Activity, Shield, Save, Loader2, ChevronRight, Clock, CalendarRange, Banknote, Package, Trophy, Edit } from 'lucide-react'
import { getPersonProfileAction, updatePersonAction } from '@/app/actions/people.actions'
import { toast } from 'sonner'

interface Props {
  employeeId: string
  onClose: () => void
  onUpdate: () => void
  organizationId: string | null
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'leave', label: 'Leave', icon: CalendarRange },
  { id: 'payroll', label: 'Payroll', icon: Banknote },
  { id: 'assets', label: 'Assets', icon: Package },
  { id: 'performance', label: 'Performance', icon: Trophy },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'timeline', label: 'Timeline', icon: Activity },
]

export default function PersonProfileDrawer({ employeeId, onClose, onUpdate, organizationId }: Props) {
  const [person, setPerson] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    startTransition(async () => {
      const result = await getPersonProfileAction(employeeId)
      if (result.success) {
        setPerson(result.data)
        setEditData(result.data)
      }
      setLoading(false)
    })
  }, [employeeId])

  const handleSave = () => {
    startTransition(async () => {
      // Only send changed fields
      const changes: Record<string, any> = {}
      Object.keys(editData).forEach(key => {
        if (editData[key] !== person[key]) {
          changes[key] = editData[key]
        }
      })
      if (Object.keys(changes).length > 0) {
        const result = await updatePersonAction(employeeId, changes)
        if (result.success) {
          toast.success('Profile updated successfully')
          setPerson({ ...person, ...changes })
          onUpdate()
          setIsEditing(false)
        } else {
          toast.error(result.error || 'Failed to update profile')
        }
      } else {
        setIsEditing(false)
      }
    })
  }

  const updateField = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }))
  }

  const renderField = ({ label, field, type = 'text', options }: { label: string; field: string; type?: string; options?: { value: string; label: string }[] }) => {
    const value = isEditing ? (editData?.[field] ?? '') : (person?.[field] ?? '')
    
    if (!isEditing) {
      return (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">{label}</p>
          <p className="text-sm text-foreground">{value || <span className="text-muted-foreground italic">Not set</span>}</p>
        </div>
      )
    }

    if (type === 'select' && options) {
      return (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
          <select value={value} onChange={(e) => updateField(field, e.target.value)} className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">Select...</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )
    }

    return (
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => updateField(field, e.target.value)}
          className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    )
  }

  const renderTabContent = () => {
    if (!person) return null

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
              {renderField({ label: "Full Name", field: "full_name" })}
              {renderField({ label: "Email", field: "email", type: "email" })}
              {renderField({ label: "Phone", field: "phone" })}
              {renderField({ label: "Personal Email", field: "personal_email", type: "email" })}
              {renderField({ label: "Date of Birth", field: "date_of_birth", type: "date" })}
              {renderField({ label: "Gender", field: "gender", type: "select", options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }] })}
              {renderField({ label: "Blood Group", field: "blood_group", type: "select", options: ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(v => ({ value: v, label: v })) })}
              {renderField({ label: "Nationality", field: "nationality" })}
              {renderField({ label: "Marital Status", field: "marital_status", type: "select", options: [{ value: 'single', label: 'Single' }, { value: 'married', label: 'Married' }, { value: 'divorced', label: 'Divorced' }, { value: 'widowed', label: 'Widowed' }] })}
              <div className="col-span-2">{renderField({ label: "Address", field: "address" })}</div>
              {renderField({ label: "Emergency Contact", field: "emergency_contact" })}
            </div>
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
              {renderField({ label: "Aadhaar/NID", field: "aadhaar_nid" })}
              {renderField({ label: "Passport No", field: "passport_no" })}
              {renderField({ label: "Visa Status", field: "visa_status" })}
              {renderField({ label: "Driving License", field: "driving_license" })}
            </div>
          </div>
        )
      case 'employment':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
              {renderField({ label: "Employee ID", field: "employee_id_string" })}
              {renderField({ label: "Status", field: "employment_status", type: "select", options: ['active','inactive','probation','on_leave','suspended','terminated','pending'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1).replace('_', ' ') })) })}
              {renderField({ label: "Employment Type", field: "employment_type", type: "select", options: ['permanent','contract','intern','freelancer','consultant','vendor','probation'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })) })}
              {renderField({ label: "Lifecycle Status", field: "lifecycle_status", type: "select", options: ['invited','pending','active','onboarding','confirmed','transferred','resigned','terminated','archived'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })) })}
              {renderField({ label: "Department", field: "department" })}
              {renderField({ label: "Designation", field: "designation" })}
              {renderField({ label: "Joining Date", field: "joining_date", type: "date" })}
            </div>
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Organization</p>
                <p className="text-sm text-foreground">{person.organization_name || <span className="text-muted-foreground italic">Not assigned</span>}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Reports To</p>
                <p className="text-sm text-foreground">{person.manager_name || <span className="text-muted-foreground italic">No manager</span>}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">System Role</p>
                <p className="text-sm text-foreground capitalize">{person.profile_role || <span className="text-muted-foreground italic">Not set</span>}</p>
              </div>
            </div>
          </div>
        )
      case 'attendance':
      case 'leave':
      case 'payroll':
      case 'assets':
      case 'performance':
      case 'documents':
      case 'timeline':
        return (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/10 rounded-xl border border-border/50 border-dashed">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              {React.createElement(tabs.find(t => t.id === activeTab)!.icon, { size: 28, className: 'text-muted-foreground' })}
            </div>
            <p className="text-base font-semibold text-foreground">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Data
            </p>
            <p className="text-sm text-muted-foreground/80 mt-1">
              This module will display related records from the {activeTab} system.
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-3xl bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Notion-style Header Banner */}
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent shrink-0 relative flex justify-end p-4">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-background/50 hover:bg-background text-muted-foreground transition-colors absolute top-4 right-4 shadow-sm backdrop-blur-sm">
            <X size={18} />
          </button>
        </div>

        {/* Profile Info Header */}
        <div className="px-8 -mt-12 mb-6 shrink-0 relative z-10">
          {loading ? (
            <div className="flex items-end gap-5">
              <div className="w-24 h-24 rounded-full bg-muted animate-pulse border-4 border-card shadow-sm" />
              <div className="pb-2 space-y-2">
                <div className="w-48 h-6 bg-muted animate-pulse rounded" />
                <div className="w-32 h-4 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ) : person ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-end justify-between">
                <div className="flex items-end gap-5">
                  {person.profile_photo ? (
                    <img src={person.profile_photo} alt="" className="w-24 h-24 rounded-full object-cover ring-4 ring-card bg-card shadow-sm" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold ring-4 ring-card shadow-sm">
                      {person.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  <div className="pb-1">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">{person.full_name}</h2>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-primary/70" /> {person.designation || 'No designation'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5"><Building2 size={14} className="text-primary/70" /> {person.department || 'No department'}</span>
                      {person.manager_name && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1.5">Reports to {person.manager_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pb-1 flex items-center gap-2">
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors bg-card shadow-sm">
                      <Edit size={14} /> Edit Profile
                    </button>
                  ) : (
                    <>
                      <button onClick={() => { setIsEditing(false); setEditData(person) }} className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-card">
                        Cancel
                      </button>
                      <button onClick={handleSave} disabled={isPending} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
                        {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Info Bar */}
              <div className="flex items-center gap-6 text-sm ml-[116px] py-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize tracking-wide ${person.employment_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                  {person.employment_status?.replace('_', ' ') || 'active'}
                </span>
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Activity size={14} /> {person.employment_type ? person.employment_type.charAt(0).toUpperCase() + person.employment_type.slice(1) : 'Permanent'}
                </span>
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CalendarRange size={14} /> Joined {person.joining_date ? new Date(person.joining_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : '—'}
                </span>
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <User size={14} /> {person.employee_id_string || 'No ID'}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Horizontal Tabs */}
        <div className="px-8 border-b border-border shrink-0">
          <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    active 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-surface-base/30">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </>
  )
}
