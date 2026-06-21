import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Zap, CheckCircle2 } from 'lucide-react'

export function SkillsTab({ employeeId, canEdit, isAdmin }: { employeeId: string, canEdit: boolean, isAdmin: boolean }) {
  const supabase = createClient()
  const [skills, setSkills] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    skill_name: '',
    proficiency: 'intermediate',
    is_verified: false
  })

  const load = async () => {
    setIsLoading(true)
    const { data } = await supabase.from('employee_skills').select('*').eq('employee_id', employeeId).order('skill_name')
    if (data) setSkills(data)
    setIsLoading(false)
  }

  useEffect(() => {
    load()
  }, [employeeId, supabase])

  const handleAdd = async () => {
    if (!formData.skill_name) {
      alert('Skill Name is required.')
      return
    }
    setIsSaving(true)
    try {
      const { error } = await supabase.from('employee_skills').insert({
        employee_id: employeeId,
        skill_name: formData.skill_name,
        proficiency: formData.proficiency,
        // Only admins can verify skills
        is_verified: isAdmin ? formData.is_verified : false
      })
      if (error) throw error
      setIsAdding(false)
      setFormData({ skill_name: '', proficiency: 'intermediate', is_verified: false })
      load()
    } catch (e: any) {
      alert(`Error adding skill: ${e.message}`)
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return
    try {
      const { error } = await supabase.from('employee_skills').delete().eq('id', id)
      if (error) throw error
      load()
    } catch (e: any) {
      alert(`Error deleting skill: ${e.message}`)
    }
  }

  if (isLoading) return <div className="p-4 text-sm animate-pulse">Loading skills...</div>

  // Group by proficiency
  const expert = skills.filter(s => s.proficiency === 'expert')
  const intermediate = skills.filter(s => s.proficiency === 'intermediate')
  const beginner = skills.filter(s => s.proficiency === 'beginner')

  const renderSection = (title: string, list: any[], colorClass: string) => {
    if (list.length === 0) return null
    return (
      <div className="mb-4">
        <p className="text-xs text-muted-foreground uppercase font-semibold mb-3 tracking-wider">{title} ({list.length})</p>
        <div className="flex flex-wrap gap-2">
          {list.map(s => (
            <Badge key={s.id} variant="outline" className={`py-1.5 px-3 bg-card relative group shadow-sm ${colorClass}`}>
              {s.skill_name}
              {s.is_verified && <CheckCircle2 className="w-3 h-3 ml-1.5 text-blue-500 inline-block" />}
              {canEdit && (
                <button 
                  onClick={() => handleDelete(s.id)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </Badge>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Skill Name</Label>
              <Input className="mt-1 h-8" value={formData.skill_name} onChange={e => setFormData({...formData, skill_name: e.target.value})} placeholder="e.g. React.js, CPR, Leadership..." />
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
            {isAdmin && (
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="is_verified" checked={formData.is_verified} onChange={e => setFormData({...formData, is_verified: e.target.checked})} className="rounded border-input" />
                <Label htmlFor="is_verified" className="text-xs">Mark as Verified</Label>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={isSaving}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      )}

      {skills.length === 0 && !isAdding ? (
        <div className="py-8 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
          No skills added yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {renderSection('Expert', expert, 'border-emerald-500/20')}
          {renderSection('Intermediate', intermediate, 'border-blue-500/20')}
          {renderSection('Beginner', beginner, 'border-amber-500/20')}
        </div>
      )}
    </div>
  )
}
