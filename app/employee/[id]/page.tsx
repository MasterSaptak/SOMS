"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/use-auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ChevronLeft, Save, Edit2, AlertCircle, Briefcase, 
  Zap, HeartPulse, PieChart, Mail, Phone, Calendar, 
  Hash, Building2, UserCircle2 
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmploymentDetailsTab } from '@/components/employee/employment-details-tab'
import { EmergencyContactsTab } from '@/components/employee/emergency-contacts-tab'
import { SkillsTab } from '@/components/employee/skills-tab'
import { SummariesTab } from '@/components/employee/summaries-tab'
import { OrgPositionTrail } from '@/components/employee/org-position-trail'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

export default function ModernEmployeeProfilePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuthStore()
  
  const employeeId = params.id as string
  const isAdmin = user?.role === 'super_admin'

  const [employee, setEmployee] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    profile_photo: '',
    date_of_birth: '',
    designation: '',
    department: '',
    manager_id: ''
  })

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', employeeId)
          .single()

        if (error) throw error
        
        setEmployee(data)
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          email: data.email || '',
          profile_photo: data.profile_photo || '',
          date_of_birth: data.date_of_birth || '',
          designation: data.designation || '',
          department: data.department || '',
          manager_id: data.manager_id || ''
        })
      } catch (err: any) {
        console.error('Failed to load employee', err)
        setErrorMsg(err.message || 'Employee not found')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [employeeId, supabase])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('employees')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
          profile_photo: formData.profile_photo,
          ...(isAdmin && {
            date_of_birth: formData.date_of_birth || null,
            designation: formData.designation,
            department: formData.department,
            manager_id: formData.manager_id || null
          })
        })
        .eq('id', employeeId)

      if (error) throw error
      setIsEditing(false)
      setEmployee({ ...employee, ...formData })
    } catch (err: any) {
      alert(`Error saving: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading Employee Profile...</p>
      </div>
    )
  }

  if (errorMsg || !employee) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-2">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Profile Unavailable</h2>
        <p className="text-muted-foreground max-w-md text-center">{errorMsg}</p>
        <Button onClick={() => router.back()} className="mt-4 px-8 rounded-full">Return to Directory</Button>
      </motion.div>
    )
  }

  const isSelf = employee.user_id === user?.id
  const canEditSelfBasic = isSelf || isAdmin
  const canEditAll = isAdmin

  const Field = ({ icon: Icon, label, value, field, type = 'text', canEdit }: any) => {
    const isEditable = isEditing && canEdit
    return (
      <motion.div variants={itemVars} className="flex flex-col gap-1.5 group">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity text-primary" /> 
          {label}
        </Label>
        {isEditable ? (
          <Input 
            type={type} 
            className="h-10 transition-all border-primary/20 focus-visible:ring-primary/30" 
            value={formData[field as keyof typeof formData]} 
            onChange={e => setFormData({...formData, [field]: e.target.value})} 
          />
        ) : (
          <div className="font-medium text-base p-2 -ml-2 rounded-md transition-colors hover:bg-muted/50">
            {value || <span className="text-muted-foreground/50 italic">Not provided</span>}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div className="max-w-4xl mx-auto py-8 px-4 flex flex-col gap-8 pb-20" variants={containerVars} initial="hidden" animate="show">
      {/* Header Actions */}
      <motion.div variants={itemVars} className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3 hover:bg-muted/50 rounded-full pr-4 transition-all hover:pr-5">
          <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" /> Directory
        </Button>
        {canEditSelfBasic && !isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 rounded-full shadow-sm hover:shadow-md transition-all border-primary/20 hover:border-primary/40 hover:bg-primary/5">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </Button>
        )}
      </motion.div>

      {/* Main Profile Card */}
      <motion.div variants={itemVars} className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-3xl opacity-50 pointer-events-none" />
        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-10 shadow-sm transition-all hover:shadow-md hover:border-border overflow-hidden">
          
          <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
            {/* Avatar Section */}
            <motion.div variants={itemVars} className="flex flex-col items-center gap-5 shrink-0 group w-full md:w-auto">
              <div className="relative">
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl transition-transform duration-500 group-hover:scale-105">
                  <AvatarImage src={isEditing ? formData.profile_photo : employee.profile_photo} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary font-bold">
                    {formData.full_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && canEditSelfBasic && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-2 -right-2">
                    <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
                      <Edit2 className="w-4 h-4" />
                    </div>
                  </motion.div>
                )}
              </div>
              
              {isEditing && canEditSelfBasic && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="w-full max-w-[200px]">
                  <Label className="text-xs mb-1 block text-center text-muted-foreground">Profile Image URL</Label>
                  <Input 
                    value={formData.profile_photo} 
                    onChange={e => setFormData({...formData, profile_photo: e.target.value})} 
                    placeholder="https://..."
                    className="text-xs h-9 text-center bg-background/50"
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Details Section */}
            <div className="flex-1 w-full flex flex-col gap-8">
              
              <motion.div variants={itemVars} className="flex flex-col gap-2 p-4 bg-muted/30 rounded-2xl border border-border/50">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" /> Organization Hierarchy
                </Label>
                <OrgPositionTrail employeeId={employeeId} />
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <Field icon={UserCircle2} label="Full Name" value={employee.full_name} field="full_name" canEdit={canEditSelfBasic} />
                <Field icon={Mail} label="Email Address" value={employee.email} field="email" type="email" canEdit={canEditSelfBasic} />
                <Field icon={Phone} label="Phone Number" value={employee.phone} field="phone" canEdit={canEditSelfBasic} />
                <Field icon={Calendar} label="Date of Birth" value={employee.date_of_birth} field="date_of_birth" type="date" canEdit={canEditAll} />
                <Field icon={Briefcase} label="Department" value={employee.department} field="department" canEdit={canEditAll} />
                <Field icon={Zap} label="Position" value={employee.designation} field="designation" canEdit={canEditAll} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-border/40">
                <Field icon={Hash} label="Database UUID" value={<span className="font-mono text-sm bg-muted/50 px-2 py-1 rounded">{employee.id}</span>} field="id" canEdit={false} />
                <Field icon={UserCircle2} label="Manager UUID" value={employee.manager_id ? <span className="font-mono text-sm bg-muted/50 px-2 py-1 rounded">{employee.manager_id}</span> : 'None'} field="manager_id" canEdit={canEditAll} />
              </div>

            </div>
          </div>

          <AnimatePresence>
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }} 
                animate={{ opacity: 1, y: 0, height: 'auto' }} 
                exit={{ opacity: 0, y: 10, height: 0 }}
                className="mt-8 flex justify-end gap-3 pt-6 border-t border-border/50"
              >
                <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving} className="rounded-full px-6">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2 rounded-full px-8 shadow-lg hover:shadow-xl transition-all bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving Changes...' : 'Save Profile'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tabs Section */}
      <motion.div variants={itemVars} className="mt-4">
        <Tabs defaultValue="employment" className="w-full">
          <TabsList className="mb-6 bg-transparent border-b border-border/50 rounded-none w-full justify-start h-auto p-0 gap-6 overflow-x-auto no-scrollbar flex-nowrap">
            {[
              { id: 'employment', icon: Briefcase, label: 'Employment Details' },
              { id: 'emergency', icon: HeartPulse, label: 'Emergency Contacts' },
              { id: 'skills', icon: Zap, label: 'Skills' },
              { id: 'summaries', icon: PieChart, label: 'Summaries' },
            ].map(tab => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-3 pt-2 gap-2 whitespace-nowrap transition-colors"
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="employment" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                <EmploymentDetailsTab employeeId={employeeId} isAdmin={isAdmin} />
              </TabsContent>

              <TabsContent value="emergency" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                <EmergencyContactsTab employeeId={employeeId} canEdit={canEditSelfBasic} />
              </TabsContent>

              <TabsContent value="skills" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                <SkillsTab employeeId={employeeId} canEdit={canEditSelfBasic} isAdmin={isAdmin} />
              </TabsContent>

              <TabsContent value="summaries" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                <SummariesTab employeeId={employeeId} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>

    </motion.div>
  )
}
