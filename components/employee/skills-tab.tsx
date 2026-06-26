import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Zap, CheckCircle2 } from 'lucide-react'
import { addEmployeeSkillAction, deleteEmployeeSkillAction, verifySkillAction } from '@/app/actions/employee.actions'
import { VerificationBadge } from '@/components/profile/VerificationBadge'

import { useRouter } from 'next/navigation'

export function SkillsTab({ employeeId, canEdit, isAdmin, initialData, availableSkillsData }: { employeeId: string, canEdit: boolean, isAdmin: boolean, initialData: any[], availableSkillsData: any[] }) {
  const router = useRouter()
  const [employeeSkills, setEmployeeSkills] = useState<any[]>(initialData || [])
  const [availableSkills, setAvailableSkills] = useState<any[]>(availableSkillsData || [])
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    skillId: availableSkillsData?.[0]?.id || '',
    proficiency: 'intermediate',
    yearsOfExperience: 0,
    certification: '',
    notes: ''
  })

  const handleAdd = async () => {
    if (!formData.skillId) {
      alert('Skill selection is required.')
      return
    }
    setIsSaving(true)
    try {
      const res = await addEmployeeSkillAction({
        employeeId,
        skillId: formData.skillId,
        proficiency: formData.proficiency,
        yearsOfExperience: formData.yearsOfExperience,
        certification: formData.certification,
        notes: formData.notes
      })
      if (!res.success) throw new Error(res.error?.message || 'Failed to add skill')
      
      setIsAdding(false)
      setFormData({ skillId: availableSkills[0]?.id || '', proficiency: 'intermediate', yearsOfExperience: 0, certification: '', notes: '' })
      
      // Update local state optimistic UI
      const addedSkill = availableSkills.find(s => s.id === formData.skillId)
      if (addedSkill) {
        setEmployeeSkills([...employeeSkills, {
          id: Date.now().toString(), // temporary ID
          skill: addedSkill,
          proficiency: formData.proficiency,
          years_of_experience: formData.yearsOfExperience,
          certification: formData.certification,
          notes: formData.notes
        }])
      }
    } catch (e: any) {
      alert(`Error adding skill: ${e.message}`)
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return
    try {
      const res = await deleteEmployeeSkillAction(employeeId, id)
      if (!res.success) throw new Error('Failed to delete skill')
      
      setEmployeeSkills(employeeSkills.filter(s => s.id !== id))
    } catch (e: any) {
      alert(`Error deleting skill: ${e.message}`)
    }
  }

  const handleVerify = async (id: string, status: 'verified' | 'rejected') => {
    if (!isAdmin) return
    try {
      const res = await verifySkillAction(employeeId, id, status)
      if (!res.success) throw new Error(`Failed to mark as ${status}`)
      
      setEmployeeSkills(employeeSkills.map(s => s.id === id ? { ...s, verification_status: status, is_verified: status === 'verified' } : s))
    } catch (e: any) {
      alert(`Error verifying skill: ${e.message}`)
    }
  }

  const expert = employeeSkills.filter(s => s.proficiency === 'expert')
  const advanced = employeeSkills.filter(s => s.proficiency === 'advanced')
  const intermediate = employeeSkills.filter(s => s.proficiency === 'intermediate')
  const beginner = employeeSkills.filter(s => s.proficiency === 'beginner')

  const renderSection = (title: string, list: any[], colorClass: string) => {
    if (list.length === 0) return null
    return (
      <div className="mb-4">
        <p className="text-xs text-muted-foreground uppercase font-semibold mb-3 tracking-wider">{title} ({list.length})</p>
        <div className="flex flex-col gap-3">
          {list.map(s => (
            <div key={s.id} className={`p-3 rounded-lg border bg-card shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative group ${colorClass}`}>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{s.skill?.name || 'Unknown Skill'}</span>
                  <VerificationBadge status={s.verificationStatus || s.verification_status} notes={s.verificationNotes || s.verification_notes} />
                </div>
                {(s.years_of_experience > 0 || s.certification) && (
                  <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                    {s.years_of_experience ? `${s.years_of_experience} yrs` : ''} 
                    {s.years_of_experience && s.certification ? <span className="opacity-50">•</span> : ''}
                    {s.certification}
                  </div>
                )}
                {s.notes && (
                  <div className="text-[11px] text-muted-foreground italic">
                    Note: {s.notes}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isAdmin && (s.verificationStatus || s.verification_status) === 'pending' && (
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200" onClick={() => handleVerify(s.id, 'verified')}>
                      Verify
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs bg-red-50 text-red-700 hover:bg-red-100 border-red-200" onClick={() => handleVerify(s.id, 'rejected')}>
                      Reject
                    </Button>
                  </div>
                )}
                {canEdit && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(s.id)}
                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Skills & Certifications
        </h3>
        {canEdit && !isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Skill
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-sm mb-4">Add New Skill</h4>
          {availableSkills.length === 0 ? (
            <div className="text-sm text-amber-600">No skills available in the database. Please contact HR to add skills to the catalog.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Skill</Label>
                  <select 
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                    value={formData.skillId} 
                    onChange={e => setFormData({...formData, skillId: e.target.value})}
                  >
                    {availableSkills.map(sk => (
                      <option key={sk.id} value={sk.id}>{sk.name} {sk.category ? `(${sk.category})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Proficiency</Label>
                  <select 
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                    value={formData.proficiency} 
                    onChange={e => setFormData({...formData, proficiency: e.target.value})}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Years of Experience (Optional)</Label>
                  <Input type="number" className="mt-1 h-8" value={formData.yearsOfExperience} onChange={e => setFormData({...formData, yearsOfExperience: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <Label className="text-xs">Certification (Optional)</Label>
                  <Input className="mt-1 h-8" value={formData.certification} onChange={e => setFormData({...formData, certification: e.target.value})} placeholder="e.g. AWS Certified..." />
                </div>
                <div className="col-span-full">
                  <Label className="text-xs">Notes (Optional)</Label>
                  <Input className="mt-1 h-8" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any additional context..." />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={isSaving}>Cancel</Button>
                <Button size="sm" onClick={handleAdd} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
              </div>
            </>
          )}
        </div>
      )}

      {employeeSkills.length === 0 && !isAdding ? (
        <div className="py-8 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
          No skills added yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {renderSection('Expert', expert, 'border-indigo-500/20')}
          {renderSection('Intermediate', intermediate, 'border-blue-500/20')}
          {renderSection('Beginner', beginner, 'border-amber-500/20')}
        </div>
      )}
    </div>
  )
}
