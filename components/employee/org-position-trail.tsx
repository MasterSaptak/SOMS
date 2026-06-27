import React from 'react'
import { ChevronRight, Building2, Users, Briefcase, UserCircle2, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function OrgPositionTrail({ employee, hierarchyContext }: { employee: any, hierarchyContext?: any }) {
  const router = useRouter()

  const orgName = hierarchyContext?.organization?.name || 'Organization'
  const branchName = hierarchyContext?.branch?.name
  const departmentName = hierarchyContext?.department?.name || (typeof employee.department === 'string' ? employee.department : employee.department?.name)
  const teamName = hierarchyContext?.primaryTeam?.teams?.name || (typeof employee.team === 'string' ? employee.team : employee.team?.name)
  const positionTitle = typeof employee.designation === 'string' ? employee.designation : employee.designation?.title
  const managerName = hierarchyContext?.manager ? hierarchyContext.manager.full_name : (employee.manager ? (typeof employee.manager === 'string' ? employee.manager : `${employee.manager.firstName || ''} ${employee.manager.lastName || ''}`.trim() || employee.manager.full_name) : null)
  const managerId = hierarchyContext?.manager?.id || (employee.manager ? (employee.manager.id || employee.manager_id) : employee.manager_id)

  const parts = []
  
  if (branchName) parts.push({ label: branchName, icon: Building2, type: 'branch' })
  if (departmentName) parts.push({ label: departmentName, icon: Building2, type: 'department' })
  if (teamName) parts.push({ label: teamName, icon: Users, type: 'team' })
  if (positionTitle) parts.push({ label: positionTitle, icon: Zap, type: 'position' })

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors bg-muted/50 text-muted-foreground">
        <Building2 className="w-3.5 h-3.5" />
        <span>{orgName}</span>
      </div>
      
      {parts.map((part, index) => (
        <React.Fragment key={part.type}>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
            index === parts.length - 1 && !managerName
              ? 'bg-primary/10 text-primary font-medium'
              : 'bg-muted/50 text-muted-foreground'
          }`}>
            <part.icon className="w-3.5 h-3.5" />
            <span>{part.label}</span>
          </div>
        </React.Fragment>
      ))}

      {managerName && (
        <>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          <div 
            onClick={() => managerId && router.push(`/employee/${managerId}`)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors bg-primary/10 text-primary font-medium ${managerId ? 'cursor-pointer hover:bg-primary/20' : ''}`}
            title="Reports To"
          >
            <UserCircle2 className="w-3.5 h-3.5" />
            <span>{managerName}</span>
          </div>
        </>
      )}
    </div>
  )
}
