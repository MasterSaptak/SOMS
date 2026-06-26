// @ts-nocheck
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getProjectsAction } from "@/app/actions/project.actions"
import { useOrganizationStore } from "@/store/use-organization-store"
import { ProjectWithDetails } from "@/lib/repositories/project.repository"
import { Briefcase, Calendar, Users, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function ProjectList({ onSelectProject }: { onSelectProject: (id: string) => void }) {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectWithDetails[]>([])
  const { activeOrganizationId } = useOrganizationStore()

  const fetchProjects = useCallback(async () => {
    if (!activeOrganizationId) return
    const res = await getProjectsAction(activeOrganizationId)
    if (res.success) {
      setProjects(res.data)
    }
  }, [activeOrganizationId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects()

    const handleRefresh = () => fetchProjects()
    window.addEventListener('refresh-projects', handleRefresh)
    return () => window.removeEventListener('refresh-projects', handleRefresh)
  }, [activeOrganizationId, fetchProjects])

  const getHealthColor = (score: string) => {
    switch (score) {
      case 'On Track': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'Warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'At Risk': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'Critical': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
  }

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'Active': return 'default'
      case 'Completed': return 'secondary'
      case 'Planning': return 'outline'
      default: return 'destructive'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <Card key={project.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onSelectProject(project.id)}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  {project.department?.name || 'No Department'}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs px-2 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/employee/calendar?project_id=${project.id}`);
                  }}
                >
                  <Calendar className="w-3 h-3 mr-1" /> View Timeline
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getHealthColor(project.health_score)}>
                <AlertCircle className="w-3 h-3 mr-1" />
                {project.health_score}
              </Badge>
              {project.end_date && (
                <div className="flex items-center text-xs text-muted-foreground ml-auto">
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(new Date(project.end_date), 'MMM d, yyyy')}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{project.completion_percentage}%</span>
              </div>
              <Progress value={project.completion_percentage} className="h-2" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex -space-x-2">
                {(project.project_members || []).slice(0, 3).map((member, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[10px] font-bold">
                    {member.employees?.full_name?.charAt(0) || '?'}
                  </div>
                ))}
                {(project.project_members?.length || 0) > 3 && (
                  <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                    +{project.project_members!.length - 3}
                  </div>
                )}
              </div>
              <div className="text-sm font-medium">
                ${Number(project.total_budget).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {projects.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Briefcase className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No Projects Found</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            There are currently no projects in this organization. Create one to get started.
          </p>
        </div>
      )}
    </div>
  )
}
