import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Edit2 } from 'lucide-react'
import { updateEmploymentDetailsAction } from '@/app/actions/employee.actions'

export function EmploymentDetailsTab({ employeeId, isAdmin, initialData }: { employeeId: string, isAdmin: boolean, initialData: any }) {
  const [data, setData] = useState<any>(initialData || {})
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    employmentType: data.employmentType || 'full_time',
    probationEndDate: data.probationEndDate || '',
    noticePeriodDays: data.noticePeriodDays || 30,
    workSchedule: data.workSchedule || '',
    confirmationDate: data.confirmationDate || '',
    shift: data.shift || '',
    officeLocation: data.officeLocation || '',
    employeeGrade: data.employeeGrade || '',
    employmentCategory: data.employmentCategory || '',
    costCenter: data.costCenter || '',
    payrollGroup: data.payrollGroup || ''
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await updateEmploymentDetailsAction(employeeId, formData)
      if (!res.success) throw new Error('Failed to update employment details')
      
      setData({ ...data, ...formData })
      setIsEditing(false)
    } catch (e: any) {
      alert(`Error saving: ${e.message}`)
    }
    setIsSaving(false)
  }



  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg">Employment Details</h3>
        {isAdmin && !isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="w-4 h-4" /> Edit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Employment Type</Label>
          {isEditing ? (
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              value={formData.employmentType} 
              onChange={e => setFormData({...formData, employmentType: e.target.value})}
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
          ) : (
            <div className="font-medium mt-1 capitalize text-base">{data?.employmentType?.replace('_', ' ') || 'N/A'}</div>
          )}
        </div>

        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Work Schedule</Label>
          {isEditing ? (
            <Input className="mt-1" value={formData.workSchedule} onChange={e => setFormData({...formData, workSchedule: e.target.value})} />
          ) : (
            <div className="font-medium mt-1 text-base">{data?.workSchedule || 'N/A'}</div>
          )}
        </div>

        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Shift</Label>
          {isEditing ? (
            <Input className="mt-1" value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})} />
          ) : (
            <div className="font-medium mt-1 text-base">{data?.shift || 'N/A'}</div>
          )}
        </div>

        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Office Location</Label>
          {isEditing ? (
            <Input className="mt-1" value={formData.officeLocation} onChange={e => setFormData({...formData, officeLocation: e.target.value})} />
          ) : (
            <div className="font-medium mt-1 text-base">{data?.officeLocation || 'N/A'}</div>
          )}
        </div>

        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Employee Grade</Label>
          {isEditing ? (
            <Input className="mt-1" value={formData.employeeGrade} onChange={e => setFormData({...formData, employeeGrade: e.target.value})} />
          ) : (
            <div className="font-medium mt-1 text-base">{data?.employeeGrade || 'N/A'}</div>
          )}
        </div>

        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Employment Category</Label>
          {isEditing ? (
            <Input className="mt-1" value={formData.employmentCategory} onChange={e => setFormData({...formData, employmentCategory: e.target.value})} />
          ) : (
            <div className="font-medium mt-1 text-base">{data?.employmentCategory || 'N/A'}</div>
          )}
        </div>

        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Cost Center</Label>
          {isEditing ? (
            <Input className="mt-1" value={formData.costCenter} onChange={e => setFormData({...formData, costCenter: e.target.value})} />
          ) : (
            <div className="font-medium mt-1 text-base">{data?.costCenter || 'N/A'}</div>
          )}
        </div>

        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Payroll Group</Label>
          {isEditing ? (
            <Input className="mt-1" value={formData.payrollGroup} onChange={e => setFormData({...formData, payrollGroup: e.target.value})} />
          ) : (
            <div className="font-medium mt-1 text-base">{data?.payrollGroup || 'N/A'}</div>
          )}
        </div>

        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Notice Period (Days)</Label>
          {isEditing ? (
            <Input type="number" className="mt-1" value={formData.noticePeriodDays} onChange={e => setFormData({...formData, noticePeriodDays: parseInt(e.target.value)})} />
          ) : (
            <div className="font-medium mt-1 text-base">{data?.noticePeriodDays || 0}</div>
          )}
        </div>

        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Confirmation Date</Label>
          {isEditing ? (
            <Input type="date" className="mt-1" value={formData.confirmationDate} onChange={e => setFormData({...formData, confirmationDate: e.target.value})} />
          ) : (
            <div className="font-medium mt-1 text-base">{data?.confirmationDate || 'N/A'}</div>
          )}
        </div>

        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Probation End Date</Label>
          {isEditing ? (
            <Input type="date" className="mt-1" value={formData.probationEndDate} onChange={e => setFormData({...formData, probationEndDate: e.target.value})} />
          ) : (
            <div className="font-medium mt-1 text-base">{data?.probationEndDate || 'N/A'}</div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mt-6 flex justify-end gap-3 border-t border-border/50 pt-4">
          <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      )}
    </div>
  )
}
