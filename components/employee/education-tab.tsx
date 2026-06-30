import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, GraduationCap, Loader2 } from 'lucide-react'
import { addEmployeeEducationAction, deleteEmployeeEducationAction, verifyEducationAction } from '@/app/actions/employee.actions'
import { VerificationBadge } from '@/components/profile/VerificationBadge'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function EducationTab({ employeeId, canEdit, isAdmin, initialData }: { employeeId: string, canEdit: boolean, isAdmin: boolean, initialData: any[] }) {
  const router = useRouter()
  // Ensure we have an array to iterate over
  const [education, setEducation] = useState<any[]>(initialData || [])
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    school: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    cgpa: ''
  })

  const handleAdd = async () => {
    if (!formData.school || !formData.degree) {
      toast.error('School and Degree are required.')
      return
    }
    setIsSaving(true)
    try {
      const res = await addEmployeeEducationAction({
        employeeId,
        school: formData.school,
        degree: formData.degree,
        fieldOfStudy: formData.fieldOfStudy || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        cgpa: formData.cgpa || null
      })
      if (!res.success) throw new Error('Failed to add education')
      
      setIsAdding(false)
      setFormData({ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', cgpa: '' })
      toast.success('Education record added successfully')
      router.refresh()
    } catch (e: any) {
      toast.error(`Error adding education: ${e.message}`)
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    try {
      const res = await deleteEmployeeEducationAction(employeeId, id)
      if (!res.success) throw new Error('Failed to delete education')
      
      setEducation(education.filter(e => e.id !== id))
      toast.success('Education record deleted')
      router.refresh()
    } catch (e: any) {
      toast.error(`Error deleting education: ${e.message}`)
    }
  }

  const handleVerify = async (id: string, status: 'verified' | 'rejected') => {
    if (!isAdmin) return
    try {
      const res = await verifyEducationAction(employeeId, id, status)
      if (!res.success) throw new Error(`Failed to mark as ${status}`)
      
      const updated = education.map(e => e.id === id ? { ...e, verificationStatus: status, isVerified: status === 'verified' } : e)
      setEducation(updated)
      toast.success(`Education record ${status}`)
      router.refresh()
    } catch (e: any) {
      toast.error(`Error verifying education: ${e.message}`)
    }
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          Education
        </h3>
        {canEdit && !isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Education
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-sm mb-4">Add Education Record</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">School / University *</Label>
              <Input className="mt-1 h-8" value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} placeholder="e.g. Stanford University" />
            </div>
            <div>
              <Label className="text-xs">Degree *</Label>
              <Input className="mt-1 h-8" value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} placeholder="e.g. Bachelor of Science" />
            </div>
            <div>
              <Label className="text-xs">Field of Study</Label>
              <Input className="mt-1 h-8" value={formData.fieldOfStudy} onChange={e => setFormData({...formData, fieldOfStudy: e.target.value})} placeholder="e.g. Computer Science" />
            </div>
            <div>
              <Label className="text-xs">CGPA / Grade</Label>
              <Input className="mt-1 h-8" value={formData.cgpa} onChange={e => setFormData({...formData, cgpa: e.target.value})} placeholder="e.g. 3.8/4.0" />
            </div>
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input type="date" className="mt-1 h-8" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div>
              <Label className="text-xs">End Date (or expected)</Label>
              <Input type="date" className="mt-1 h-8" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={isSaving}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {(education.length > 0 ? education : initialData)?.map(e => (
          <div key={e.id} className="border border-border/50 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start group gap-4 relative">
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-lg">{e.degree}{e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ''}</span>
                <VerificationBadge status={e.verificationStatus || e.verification_status} notes={e.verificationNotes || e.verification_notes} />
              </div>
              <span className="text-muted-foreground">{e.school}</span>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {(e.startDate || e.endDate) && (
                  <span>
                    {e.startDate ? new Date(e.startDate).getFullYear() : 'N/A'} - {e.endDate ? new Date(e.endDate).getFullYear() : 'Present'}
                  </span>
                )}
                {e.cgpa && (
                  <span>CGPA: {e.cgpa}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:self-start shrink-0">
              {isAdmin && (e.verificationStatus || e.verification_status) === 'pending' && (
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-8 text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200" onClick={() => handleVerify(e.id, 'verified')}>
                    Verify
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs bg-red-50 text-red-700 hover:bg-red-100 border-red-200" onClick={() => handleVerify(e.id, 'rejected')}>
                    Reject
                  </Button>
                </div>
              )}
              {canEdit && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(e.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
        {(!initialData || initialData.length === 0) && !isAdding && (
          <div className="col-span-full py-8 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
            No education records found.
          </div>
        )}
      </div>
    </div>
  )
}
