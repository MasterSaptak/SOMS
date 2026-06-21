"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/use-auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronLeft, Save, Edit2, AlertCircle, Briefcase, Zap, HeartPulse, PieChart } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmploymentDetailsTab } from '@/components/employee/employment-details-tab'
import { EmergencyContactsTab } from '@/components/employee/emergency-contacts-tab'
import { SkillsTab } from '@/components/employee/skills-tab'
import { SummariesTab } from '@/components/employee/summaries-tab'
import { OrgPositionTrail } from '@/components/employee/org-position-trail'

export default function SimpleEmployeeProfilePage() {
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
          // Only save these if admin
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
      
      // Update local state
      setEmployee({ ...employee, ...formData })
    } catch (err: any) {
      alert(`Error saving: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center animate-pulse">Loading Profile...</div>
  }

  if (errorMsg || !employee) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">Could not load profile</h2>
        <p className="text-muted-foreground">{errorMsg}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const isSelf = employee.user_id === user?.id
  const canEditSelfBasic = isSelf || isAdmin
  const canEditAll = isAdmin

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        {canEditSelfBasic && !isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </Button>
        )}
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          <div className="flex flex-col items-center gap-4 shrink-0">
            <Avatar className="w-32 h-32 border-4 border-background shadow-md">
              <AvatarImage src={isEditing ? formData.profile_photo : employee.profile_photo} />
              <AvatarFallback className="text-3xl">{formData.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isEditing && canEditSelfBasic && (
              <div className="w-full">
                <Label className="text-xs mb-1 block text-center">Image URL</Label>
                <Input 
                  value={formData.profile_photo} 
                  onChange={e => setFormData({...formData, profile_photo: e.target.value})} 
                  placeholder="https://..."
                  className="text-xs h-8"
                />
              </div>
            )}
          </div>

          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="col-span-full mb-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Organization Hierarchy</Label>
              <OrgPositionTrail employeeId={employeeId} />
            </div>

            <div className="col-span-full">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Database UUID</Label>
              <div className="font-mono text-sm mt-1 bg-muted/50 p-2 rounded-md">{employee.id}</div>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Full Name</Label>
              {isEditing && canEditSelfBasic ? (
                <Input className="mt-1" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              ) : (
                <div className="font-medium mt-1 text-lg">{employee.full_name || 'N/A'}</div>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email Address</Label>
              {isEditing && canEditSelfBasic ? (
                <Input type="email" className="mt-1" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              ) : (
                <div className="font-medium mt-1 text-lg">{employee.email || 'N/A'}</div>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Phone Number</Label>
              {isEditing && canEditSelfBasic ? (
                <Input className="mt-1" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              ) : (
                <div className="font-medium mt-1 text-lg">{employee.phone || 'N/A'}</div>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Date of Birth</Label>
              {isEditing && canEditAll ? (
                <Input type="date" className="mt-1" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
              ) : (
                <div className="font-medium mt-1 text-lg">{employee.date_of_birth || 'N/A'}</div>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Department</Label>
              {isEditing && canEditAll ? (
                <Input className="mt-1" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              ) : (
                <div className="font-medium mt-1 text-lg">{employee.department || 'N/A'}</div>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Position</Label>
              {isEditing && canEditAll ? (
                <Input className="mt-1" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
              ) : (
                <div className="font-medium mt-1 text-lg">{employee.designation || 'N/A'}</div>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Manager UUID</Label>
              {isEditing && canEditAll ? (
                <Input className="mt-1" placeholder="Paste Manager's UUID here" value={formData.manager_id} onChange={e => setFormData({...formData, manager_id: e.target.value})} />
              ) : (
                <div className="font-medium mt-1 text-lg">{employee.manager_id ? 'Assigned' : 'None'}</div>
              )}
            </div>

          </div>
        </div>

        {isEditing && (
          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-border/50">
            <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Tabs defaultValue="employment" className="w-full">
          <TabsList className="mb-4 bg-transparent border-b border-border/50 rounded-none w-full justify-start h-auto p-0 gap-6">
            <TabsTrigger value="employment" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 pt-2 gap-2">
              <Briefcase className="w-4 h-4" /> Employment Details
            </TabsTrigger>
            <TabsTrigger value="emergency" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 pt-2 gap-2">
              <HeartPulse className="w-4 h-4" /> Emergency Contacts
            </TabsTrigger>
            <TabsTrigger value="skills" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 pt-2 gap-2">
              <Zap className="w-4 h-4" /> Skills
            </TabsTrigger>
            <TabsTrigger value="summaries" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 pt-2 gap-2">
              <PieChart className="w-4 h-4" /> Summaries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employment">
            <EmploymentDetailsTab employeeId={employeeId} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="emergency">
            <EmergencyContactsTab employeeId={employeeId} canEdit={canEditSelfBasic} />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsTab employeeId={employeeId} canEdit={canEditSelfBasic} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="summaries">
            <SummariesTab employeeId={employeeId} />
          </TabsContent>
        </Tabs>
      </div>

    </div>
  )
}
