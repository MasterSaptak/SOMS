import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Edit2 } from 'lucide-react'

export function EmploymentDetailsTab({ employeeId, isAdmin }: { employeeId: string, isAdmin: boolean }) {
  const supabase = createClient()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    employment_type: '',
    probation_end_date: '',
    notice_period_days: 30,
    work_schedule: ''
  })

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const { data: ed } = await (supabase as any).from('employment_details').select('*').eq('employee_id', employeeId).single()
      if (ed) {
        setData(ed)
        setFormData({
          employment_type: ed.employment_type || '',
          probation_end_date: ed.probation_end_date || '',
          notice_period_days: ed.notice_period_days || 30,
          work_schedule: ed.work_schedule || ''
        })
      }
      setIsLoading(false)
    }
    load()
  }, [employeeId, supabase])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (data) {
        // Update
        const { error } = await (supabase as any).from('employment_details').update({
          ...formData,
          probation_end_date: formData.probation_end_date || null
        }).eq('id', data.id)
        if (error) throw error
      } else {
        // Insert
        const { error } = await (supabase as any).from('employment_details').insert({
          employee_id: employeeId,
          ...formData,
          probation_end_date: formData.probation_end_date || null
        })
        if (error) throw error
      }
      // Reload
      const { data: ed } = await (supabase as any).from('employment_details').select('*').eq('employee_id', employeeId).single()
      setData(ed)
      setIsEditing(false)
    } catch (e: any) {
      alert(`Error saving: ${e.message}`)
    }
    setIsSaving(false)
  }

  if (isLoading) return <div className="p-4 text-sm animate-pulse">Loading employment details...</div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Employment Type</Label>
          {isEditing ? (
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              value={formData.employment_type} 
              onChange={e => setFormData({...formData, employment_type: e.target.value})}
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
          ) : (
            <div className="font-medium mt-1 capitalize text-base">{data?.employment_type?.replace('_', ' ') || 'N/A'}</div>
          )}
        </div>

        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Work Schedule</Label>
          {isEditing ? (
            <Input className="mt-1" value={formData.work_schedule} onChange={e => setFormData({...formData, work_schedule: e.target.value})} />
          ) : (
            <div className="font-medium mt-1 text-base">{data?.work_schedule || 'N/A'}</div>
          )}
        </div>

        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Notice Period (Days)</Label>
          {isEditing ? (
            <Input type="number" className="mt-1" value={formData.notice_period_days} onChange={e => setFormData({...formData, notice_period_days: parseInt(e.target.value)})} />
          ) : (
            <div className="font-medium mt-1 text-base">{data?.notice_period_days || 0}</div>
          )}
        </div>

        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Probation End Date</Label>
          {isEditing ? (
            <Input type="date" className="mt-1" value={formData.probation_end_date} onChange={e => setFormData({...formData, probation_end_date: e.target.value})} />
          ) : (
            <div className="font-medium mt-1 text-base">{data?.probation_end_date || 'N/A'}</div>
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
