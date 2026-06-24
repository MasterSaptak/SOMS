import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Briefcase } from 'lucide-react'
import { addEmployeeExperienceAction, deleteEmployeeExperienceAction } from '@/app/actions/employee.actions'
import { useRouter } from 'next/navigation'

export function ExperienceTab({ employeeId, canEdit, initialData }: { employeeId: string, canEdit: boolean, initialData: any[] }) {
  const router = useRouter()
  const [experience, setExperience] = useState<any[]>(initialData || [])
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    companyName: '',
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    description: ''
  })

  const handleAdd = async () => {
    if (!formData.companyName || !formData.title) {
      alert('Company Name and Title are required.')
      return
    }
    setIsSaving(true)
    try {
      const res = await addEmployeeExperienceAction({
        employeeId,
        companyName: formData.companyName,
        title: formData.title,
        location: formData.location || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        description: formData.description || null
      })
      if (!res.success) throw new Error('Failed to add experience')
      
      setIsAdding(false)
      setFormData({ companyName: '', title: '', location: '', startDate: '', endDate: '', description: '' })
      router.refresh()
    } catch (e: any) {
      alert(`Error adding experience: ${e.message}`)
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    try {
      const res = await deleteEmployeeExperienceAction(employeeId, id)
      if (!res.success) throw new Error('Failed to delete experience')
      
      setExperience(experience.filter(e => e.id !== id))
      router.refresh()
    } catch (e: any) {
      alert(`Error deleting experience: ${e.message}`)
    }
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          Work Experience
        </h3>
        {canEdit && !isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Experience
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-sm mb-4">Add Experience Record</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Company Name *</Label>
              <Input className="mt-1 h-8" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="e.g. Google" />
            </div>
            <div>
              <Label className="text-xs">Job Title *</Label>
              <Input className="mt-1 h-8" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Software Engineer" />
            </div>
            <div>
              <Label className="text-xs">Location</Label>
              <Input className="mt-1 h-8" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Mountain View, CA" />
            </div>
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input type="date" className="mt-1 h-8" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div>
              <Label className="text-xs">End Date (leave empty if current)</Label>
              <Input type="date" className="mt-1 h-8" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
            </div>
            <div className="col-span-full">
              <Label className="text-xs">Description / Roles</Label>
              <Textarea className="mt-1" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Briefly describe your responsibilities..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={isSaving}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {initialData?.map(e => (
          <div key={e.id} className="border border-border/50 rounded-lg p-4 flex justify-between items-start group">
            <div className="flex flex-col gap-1 w-full">
              <span className="font-semibold text-lg">{e.title}</span>
              <span className="text-muted-foreground">{e.companyName}{e.location ? ` - ${e.location}` : ''}</span>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {(e.startDate || e.endDate) && (
                  <span>
                    {e.startDate ? new Date(e.startDate).getFullYear() : 'N/A'} - {e.endDate ? new Date(e.endDate).getFullYear() : 'Present'}
                  </span>
                )}
              </div>
              {e.description && (
                <p className="mt-3 text-sm">{e.description}</p>
              )}
            </div>
            {canEdit && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 shrink-0 ml-4" onClick={() => handleDelete(e.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        {(!initialData || initialData.length === 0) && !isAdding && (
          <div className="col-span-full py-8 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
            No experience records found.
          </div>
        )}
      </div>
    </div>
  )
}
