"use client"

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Building2, Users, Edit, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  getDepartmentEmployees,
  getEmployeeById,
  getFullName,
  MOCK_TEAMS,
} from '@/lib/demo/generators/legacy-mock-data'
import type { Department } from '@/lib/types'

const BORDER_COLORS = [
  'border-l-blue-500',
  'border-l-purple-500',
  'border-l-emerald-500',
  'border-l-amber-500',
  'border-l-rose-500',
]

interface DepartmentCardProps {
  department: Department
  index?: number
  onEdit?: () => void
}

export function DepartmentCard({ department, index = 0, onEdit }: DepartmentCardProps) {
  const [expanded, setExpanded] = useState(false)

  const head        = department.headId ? getEmployeeById(department.headId) : null
  const members     = getDepartmentEmployees(department.id)
  const teams       = MOCK_TEAMS.filter(t => t.departmentId === department.id)
  const borderColor = BORDER_COLORS[index % BORDER_COLORS.length]

  return (
    <div className={`rounded-xl border border-border/50 bg-card border-l-4 ${borderColor} hover:border-l-[5px] transition-all hover:shadow-sm`}>
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-base truncate">{department.name}</h3>
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
                  <Edit className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          {/* Head */}
          {head ? (
            <div className="flex items-center gap-1.5 mt-1">
              <Avatar className="w-4 h-4">
                <AvatarFallback className="text-[7px]">
                  {head.firstName[0]}{head.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">{getFullName(head)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1">
              <User className="w-3.5 h-3.5 text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground/40 italic">No head assigned</span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{members.length} members</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{teams.length} teams</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded: Teams */}
      {expanded && teams.length > 0 && (
        <div className="px-4 pb-4 border-t border-border/30 pt-3 flex flex-col gap-2">
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">Teams</p>
          {teams.map(team => {
            const lead         = team.leadId ? getEmployeeById(team.leadId) : null
            const teamMembers  = getDepartmentEmployees(department.id).filter(e => e.teamId === team.id)
            return (
              <div key={team.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{team.name}</p>
                  {lead && (
                    <p className="text-xs text-muted-foreground">Lead: {getFullName(lead)}</p>
                  )}
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {teamMembers.length} members
                </Badge>
              </div>
            )
          })}
        </div>
      )}

      {expanded && teams.length === 0 && (
        <div className="px-4 pb-4 border-t border-border/30 pt-3 text-center text-xs text-muted-foreground/60 italic">
          No teams in this department
        </div>
      )}
    </div>
  )
}
