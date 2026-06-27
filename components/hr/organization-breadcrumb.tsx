import React from 'react'
import { ChevronRight, Building2, Layers, Briefcase, Users } from 'lucide-react'

export function OrganizationBreadcrumb({ org, branch, department, team }: any) {
  return (
    <div className="flex flex-wrap items-center text-sm text-muted-foreground">
      {org && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-muted/50 cursor-default">
          <Building2 size={14} />
          <span>{org.name}</span>
        </div>
      )}
      
      {branch && (
        <>
          <ChevronRight size={14} className="mx-1 opacity-50" />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-muted/50 cursor-default">
            <Layers size={14} />
            <span>{branch.name}</span>
          </div>
        </>
      )}

      {department && (
        <>
          <ChevronRight size={14} className="mx-1 opacity-50" />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-muted/50 cursor-default">
            <Briefcase size={14} />
            <span>{department.name}</span>
          </div>
        </>
      )}

      {team && (
        <>
          <ChevronRight size={14} className="mx-1 opacity-50" />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50 text-foreground font-medium cursor-default">
            <Users size={14} />
            <span>{team.name}</span>
          </div>
        </>
      )}
    </div>
  )
}
