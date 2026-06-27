"use client"

import React, { useState } from 'react'
import { ChevronRight, ChevronDown, Building2, Briefcase, Users, FolderTree } from 'lucide-react'

export function DepartmentTree({ treeData }: { treeData: any }) {
  if (!treeData) return null

  return (
    <div className="space-y-4">
      {treeData.branches?.map((branch: any) => (
        <BranchNode key={branch.id} branch={branch} />
      ))}
      {treeData.unassignedDepartments?.length > 0 && (
        <div className="pt-4 border-t">
          <div className="text-sm font-semibold text-muted-foreground mb-3 px-2">Unassigned (Corporate)</div>
          <div className="space-y-2">
            {treeData.unassignedDepartments.map((dept: any) => (
              <DepartmentNode key={dept.id} department={dept} level={0} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BranchNode({ branch }: { branch: any }) {
  const [expanded, setExpanded] = useState(true)
  
  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <div 
        className="flex items-center p-3 hover:bg-muted/50 cursor-pointer select-none transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-6 h-6 flex items-center justify-center mr-2 text-muted-foreground">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        <Building2 size={18} className="text-primary mr-3" />
        <div className="flex-1 font-semibold">{branch.name}</div>
        <div className="text-xs text-muted-foreground mr-2">
          {branch.departments?.length || 0} Departments
        </div>
      </div>
      
      {expanded && branch.departments?.length > 0 && (
        <div className="border-t bg-muted/10 p-3 space-y-2">
          {branch.departments.map((dept: any) => (
            <DepartmentNode key={dept.id} department={dept} level={1} />
          ))}
        </div>
      )}
      {expanded && (!branch.departments || branch.departments.length === 0) && (
        <div className="border-t p-6 text-center text-sm text-muted-foreground italic bg-muted/10">
          No departments configured for this branch.
        </div>
      )}
    </div>
  )
}

function DepartmentNode({ department, level }: { department: any, level: number }) {
  const [expanded, setExpanded] = useState(false)
  const hasTeams = department.teams && department.teams.length > 0

  return (
    <div className={`ml-${level > 0 ? '4' : '0'}`}>
      <div 
        className={`flex items-center p-3 rounded-lg border bg-card hover:border-primary/50 cursor-pointer transition-all ${expanded ? 'border-primary/30 shadow-sm' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-6 h-6 flex items-center justify-center mr-1 text-muted-foreground">
          {hasTeams ? (expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <span className="w-4 h-4" />}
        </div>
        <FolderTree size={16} className="text-amber-500 mr-3" />
        <div className="flex-1 font-medium">{department.name}</div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {department.head_employee && (
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-muted rounded">
              <span className="opacity-70">Head:</span>
              <span className="font-medium text-foreground">{department.head_employee.full_name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Briefcase size={14} className="opacity-70" />
            <span>{department.teams?.length || 0} Teams</span>
          </div>
        </div>
      </div>

      {expanded && hasTeams && (
        <div className="pl-12 pr-2 py-3 space-y-2 relative">
          <div className="absolute left-6 top-0 bottom-4 w-px bg-border"></div>
          {department.teams.map((team: any) => (
            <div key={team.id} className="relative flex items-center p-2 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-colors cursor-pointer group">
              <div className="absolute left-[-24px] top-1/2 w-4 h-px bg-border"></div>
              <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center mr-3">
                <Users size={12} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium group-hover:text-primary transition-colors">{team.name}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{team.team_type || 'Functional'}</div>
              </div>
              <div className="text-xs text-muted-foreground">
                {team.manager ? team.manager.full_name : 'No manager'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
