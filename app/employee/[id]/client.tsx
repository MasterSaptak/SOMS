"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useAuthStore } from '@/store/use-auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ChevronLeft, Save, Edit2, AlertCircle, Briefcase, 
  Zap, HeartPulse, PieChart, Mail, Phone, Calendar, 
  Hash, Building2, UserCircle2, GraduationCap, Award, FileText 
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmploymentDetailsTab } from '@/components/employee/employment-details-tab'
import { EmergencyContactsTab } from '@/components/employee/emergency-contacts-tab'
import { SkillsTab } from '@/components/employee/skills-tab'
import { SummariesTab } from '@/components/employee/summaries-tab'
import { OrgPositionTrail } from '@/components/employee/org-position-trail'
import { EducationTab } from '@/components/employee/education-tab'
import { ExperienceTab } from '@/components/employee/experience-tab'
import { CertificationsTab } from '@/components/employee/certifications-tab'
import { DocumentsTab } from '@/components/employee/documents-tab'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

const Field = ({ icon: Icon, label, value, field, type = 'text', canEdit, isEditing, formData, setFormData }: any) => {
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
          value={formData[field as keyof typeof formData] || ''} 
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

export default function EmployeeProfileClient({ initialData, employeeId }: { initialData: any, employeeId: string }) {
  const router = useRouter()
  const { user } = useAuthStore()
  
  const isAdmin = user?.role === 'super_admin'

  const [employee, setEmployee] = useState<any>(initialData.employee)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    full_name: initialData.employee.firstName + ' ' + initialData.employee.lastName,
    phone: initialData.employee.phone || '',
    email: initialData.employee.email || '',
    profile_photo: initialData.employee.avatarUrl || '',
    date_of_birth: initialData.employee.date_of_birth || '',
    // Department and designation are plain text strings in the DB, not relation objects
    designation: (typeof initialData.employee.designation === 'string' ? initialData.employee.designation : initialData.employee.designation?.title) || '',
    department: (typeof initialData.employee.department === 'string' ? initialData.employee.department : initialData.employee.department?.name) || '',
    manager_id: initialData.employee.managerId || ''
  })

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const payload = {
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
      }

      // Use Server Action instead of direct Supabase query
      const { updateEmployeeBasicInfoAction } = await import('@/app/actions/employee.actions')
      const res = await updateEmployeeBasicInfoAction(employeeId, payload)

      if (!res.success) throw new Error(res.error?.message || 'Failed to update')
      
      // Re-fetch fresh data from server
      const { getEmployee360Action } = await import('@/app/actions/employee.actions')
      const freshData = await getEmployee360Action(employeeId)
      if (freshData.success && freshData.data) {
        const emp = freshData.data.employee
        setEmployee(emp)
        // Re-sync form data from fresh server data
        setFormData({
          full_name: `${emp.firstName} ${emp.lastName}`.trim(),
          phone: emp.phone || '',
          email: emp.email || '',
          profile_photo: emp.avatarUrl || '',
          date_of_birth: (emp as any).date_of_birth || '',
          designation: (typeof emp.designation === 'string' ? emp.designation : emp.designation?.title) || '',
          department: (typeof emp.department === 'string' ? emp.department : emp.department?.name) || '',
          manager_id: emp.managerId || ''
        })
      }
      
      setIsEditing(false)
    } catch (err: any) {
      alert(`Error saving: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const isSelf = employee.userId === user?.id
  const canEditSelfBasic = isSelf || isAdmin
  const canEditAll = isAdmin



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
                  <AvatarImage src={isEditing ? formData.profile_photo : (employee.avatarUrl || employee.profile_photo)} className="object-cover" />
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
                <Field icon={UserCircle2} label="Full Name" value={employee.full_name || `${employee.firstName} ${employee.lastName}`.trim()} field="full_name" canEdit={canEditSelfBasic} isEditing={isEditing} formData={formData} setFormData={setFormData} />
                <Field icon={Mail} label="Email Address" value={employee.email} field="email" type="email" canEdit={canEditSelfBasic} isEditing={isEditing} formData={formData} setFormData={setFormData} />
                <Field icon={Phone} label="Phone Number" value={employee.phone} field="phone" canEdit={canEditSelfBasic} isEditing={isEditing} formData={formData} setFormData={setFormData} />
                <Field icon={Calendar} label="Date of Birth" value={employee.date_of_birth} field="date_of_birth" type="date" canEdit={canEditAll} isEditing={isEditing} formData={formData} setFormData={setFormData} />
                <Field icon={Briefcase} label="Department" value={typeof employee.department === 'string' ? employee.department : employee.department?.name} field="department" canEdit={canEditAll} isEditing={isEditing} formData={formData} setFormData={setFormData} />
                <Field icon={Zap} label="Position" value={typeof employee.designation === 'string' ? employee.designation : employee.designation?.title} field="designation" canEdit={canEditAll} isEditing={isEditing} formData={formData} setFormData={setFormData} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-border/40">
                <Field icon={Hash} label="Database UUID" value={<span className="font-mono text-sm bg-muted/50 px-2 py-1 rounded">{employee.id}</span>} field="id" canEdit={false} isEditing={isEditing} formData={formData} setFormData={setFormData} />
                <Field icon={UserCircle2} label="Manager UUID" value={employee.manager_id ? <span className="font-mono text-sm bg-muted/50 px-2 py-1 rounded">{employee.manager_id}</span> : 'None'} field="manager_id" canEdit={canEditAll} isEditing={isEditing} formData={formData} setFormData={setFormData} />
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
              { id: 'education', icon: GraduationCap, label: 'Education' },
              { id: 'experience', icon: Briefcase, label: 'Experience' },
              { id: 'certifications', icon: Award, label: 'Certifications' },
              { id: 'documents', icon: FileText, label: 'Documents' },
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
                <EmploymentDetailsTab employeeId={employeeId} isAdmin={isAdmin} initialData={initialData.employmentDetails} />
              </TabsContent>

              <TabsContent value="emergency" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                <EmergencyContactsTab employeeId={employeeId} canEdit={canEditSelfBasic} initialData={initialData.emergencyContacts} />
              </TabsContent>

              <TabsContent value="skills" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                <SkillsTab employeeId={employeeId} canEdit={canEditSelfBasic} isAdmin={isAdmin} initialData={initialData.skills} availableSkillsData={initialData.availableSkills} />
              </TabsContent>

              <TabsContent value="education" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="p-8 text-center text-muted-foreground border rounded-2xl bg-muted/20">Education integration coming soon.</div>
              </TabsContent>

              <TabsContent value="experience" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="p-8 text-center text-muted-foreground border rounded-2xl bg-muted/20">Experience integration coming soon.</div>
              </TabsContent>

              <TabsContent value="certifications" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="p-8 text-center text-muted-foreground border rounded-2xl bg-muted/20">Certifications integration coming soon.</div>
              </TabsContent>

              <TabsContent value="documents" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="p-8 text-center text-muted-foreground border rounded-2xl bg-muted/20">Documents integration coming soon.</div>
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
