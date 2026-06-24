import React from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Zap, Plus } from 'lucide-react'
import type { EmployeeSkill } from '@/lib/types'

interface SkillBadgesProps {
  skills: EmployeeSkill[]
  isEditable?: boolean
}

export function SkillBadges({ skills, isEditable }: SkillBadgesProps) {
  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border/50 rounded-xl text-muted-foreground">
        <Zap className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm">No skills recorded yet</p>
        {isEditable && (
          <button className="mt-4 text-xs font-medium text-primary hover:underline" onClick={() => console.log('Add skill clicked')}>
            + Add a skill
          </button>
        )}
      </div>
    )
  }

  const expert = skills.filter(s => s.proficiency === 'expert')
  const intermediate = skills.filter(s => s.proficiency === 'intermediate')
  const beginner = skills.filter(s => s.proficiency === 'beginner')

  const renderSection = (title: string, list: EmployeeSkill[], colorClass: string) => {
    if (list.length === 0) return null
    return (
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{title}</span>
        <div className="flex flex-wrap gap-2">
          {list.map(skill => (
            <Badge key={skill.id} variant="secondary" className="px-2.5 py-1 text-xs font-medium bg-muted/50 hover:bg-muted transition-colors flex items-center gap-1.5 border border-border/50">
              <span className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
              {skill.skill?.name || 'Unknown Skill'}
              {skill.isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-0.5" />}
            </Badge>
          ))}
          {isEditable && (
            <button 
              onClick={() => console.log('Add', title, 'skill')}
              className="flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-border hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {renderSection('Expert', expert, 'bg-emerald-500')}
      {renderSection('Intermediate', intermediate, 'bg-blue-500')}
      {renderSection('Beginner', beginner, 'bg-amber-500')}
    </div>
  )
}
