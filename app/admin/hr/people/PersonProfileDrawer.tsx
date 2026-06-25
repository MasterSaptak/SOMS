// @ts-nocheck
'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { X, User, Briefcase, Building2, Users, FolderKanban, GraduationCap, Award, FileText, Activity, Shield, Save, Loader2, ChevronRight } from 'lucide-react'
import { getPersonProfileAction, updatePersonAction } from '@/app/actions/people.actions'

interface Props {
  employeeId: string
  onClose: () => void
  onUpdate: () => void
  organizationId: string | null
}

const tabs = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'skills', label: 'Skills', icon: GraduationCap },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'permissions', label: 'Permissions', icon: Shield },
]

export default function PersonProfileDrawer({ employeeId, onClose, onUpdate, organizationId }: Props) {
  const [person, setPerson] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('personal')
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
        await updatePersonAction(employeeId, changes)
        setPerson({ ...person, ...changes })
        onUpdate()
      }
      setIsEditing(false)
    })
  }

  const updateField = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }))
  }

  const Field = ({ label, field, type = 'text', options }: { label: string; field: string; type?: string; options?: { value: string; label: string }[] }) => {
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
      case 'personal':
        return (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" field="full_name" />
            <Field label="Email" field="email" type="email" />
            <Field label="Phone" field="phone" />
            <Field label="Personal Email" field="personal_email" type="email" />
            <Field label="Date of Birth" field="date_of_birth" type="date" />
            <Field label="Gender" field="gender" type="select" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
            <Field label="Blood Group" field="blood_group" type="select" options={['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(v => ({ value: v, label: v }))} />
            <Field label="Nationality" field="nationality" />
            <Field label="Marital Status" field="marital_status" type="select" options={[{ value: 'single', label: 'Single' }, { value: 'married', label: 'Married' }, { value: 'divorced', label: 'Divorced' }, { value: 'widowed', label: 'Widowed' }]} />
            <div className="col-span-2"><Field label="Address" field="address" /></div>
            <Field label="Aadhaar/NID" field="aadhaar_nid" />
            <Field label="Passport No" field="passport_no" />
            <Field label="Visa Status" field="visa_status" />
            <Field label="Driving License" field="driving_license" />
          </div>
        )
      case 'employment':
        return (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Employee ID" field="employee_id_string" />
            <Field label="Status" field="employment_status" type="select" options={['active','inactive','probation','on_leave','suspended','terminated','pending'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1).replace('_', ' ') }))} />
            <Field label="Employment Type" field="employment_type" type="select" options={['permanent','contract','intern','freelancer','consultant','vendor','probation'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))} />
            <Field label="Lifecycle Status" field="lifecycle_status" type="select" options={['invited','pending','active','onboarding','confirmed','transferred','resigned','terminated','archived'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))} />
            <Field label="Department" field="department" />
            <Field label="Designation" field="designation" />
            <Field label="Joining Date" field="joining_date" type="date" />
            <Field label="Emergency Contact" field="emergency_contact" />
          </div>
        )
      case 'organization':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
      case 'teams':
      case 'projects':
      case 'skills':
      case 'certificates':
      case 'documents':
      case 'activity':
      case 'permissions':
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              {React.createElement(tabs.find(t => t.id === activeTab)!.icon, { size: 24, className: 'text-muted-foreground' })}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} module
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              This section will be implemented with the {activeTab} module
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
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          {loading ? (
            <div className="flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading profile...</span>
            </div>
          ) : person ? (
            <div className="flex items-center gap-4">
              {person.profile_photo ? (
                <img src={person.profile_photo} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-border" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-base font-bold">
                  {person.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-foreground">{person.full_name}</h2>
                <p className="text-sm text-muted-foreground">{person.designation || person.department || person.email}</p>
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Edit
              </button>
            ) : (
              <>
                <button onClick={() => { setIsEditing(false); setEditData(person) }} className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isPending} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save
                </button>
              </>
            )}
            <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Tab Navigation */}
          <nav className="w-44 shrink-0 border-r border-border overflow-y-auto bg-muted/20 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 w-full px-4 py-2 text-sm font-medium transition-all ${active ? 'text-primary bg-primary/5 border-r-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
    </>
  )
}
