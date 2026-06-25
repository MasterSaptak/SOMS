"use client"

import { useState, useEffect } from "react"
import { useOrganizationStore } from "@/store/use-organization-store"
import { getOrganizationTasksAction } from "@/app/actions/task.actions"
import { ProjectWithDetails } from "@/lib/repositories/project.repository"
import { TaskWithAssignees } from "@/lib/repositories/task.repository"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Users } from "lucide-react"

export function WorkloadHeatmap({ project }: { project: ProjectWithDetails }) {
  const [tasks, setTasks] = useState<TaskWithAssignees[]>([])
  const [loading, setLoading] = useState(true)
  const { activeOrganizationId } = useOrganizationStore()

  useEffect(() => {
    if (!activeOrganizationId) return
    const fetchTasks = async () => {
      setLoading(true)
      const res = await getOrganizationTasksAction(activeOrganizationId, { projectId: project.id })
      if (res.success) {
        setTasks(res.data)
      }
      setLoading(false)
    }
    fetchTasks()
  }, [project.id, activeOrganizationId])

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
  }

  // Aggregate workloads per member
  const workloads = new Map<string, { 
    name: string, 
    assignedTasks: number, 
    estimatedHours: number, 
    completedHours: number 
  }>()

  // Initialize with project members
  project.project_members?.forEach(m => {
    workloads.set(m.employee_id, {
      name: m.employees?.full_name || 'Unknown',
      assignedTasks: 0,
      estimatedHours: 0,
      completedHours: 0
    })
  })

  // Aggregate from tasks
  tasks.forEach(task => {
    task.task_assignments?.forEach(assignee => {
      if (!workloads.has(assignee.employee_id)) return
      
      const wl = workloads.get(assignee.employee_id)!
      wl.assignedTasks += 1
      
      // Calculate hours
      const est = Number(task.estimated_hours) || 0
      const act = Number(task.actual_hours) || 0
      
      wl.estimatedHours += est
      
      if (task.status === 'Completed') {
        wl.completedHours += est // Use estimated for completed to show progress against total
      } else {
        // If not completed, maybe they partially worked on it
        wl.completedHours += act > est ? est : act
      }
    })
  })

  // Convert to array and sort
  const workloadList = Array.from(workloads.values()).sort((a, b) => b.estimatedHours - a.estimatedHours)

  const DEFAULT_WEEKLY_CAPACITY = 40 // Assuming 40 hours standard capacity per week per member
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-semibold">Team Workload Heatmap</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workloadList.map((wl, i) => {
          const capacityPercent = (wl.estimatedHours / DEFAULT_WEEKLY_CAPACITY) * 100
          
          let capacityColor = "bg-emerald-500"
          if (capacityPercent > 100) capacityColor = "bg-red-500"
          else if (capacityPercent > 80) capacityColor = "bg-orange-500"
          else if (capacityPercent > 50) capacityColor = "bg-indigo-500"

          const progressPercent = wl.estimatedHours > 0 ? (wl.completedHours / wl.estimatedHours) * 100 : 0

          return (
            <Card key={i} className={capacityPercent > 100 ? "border-red-500/50" : ""}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                    {wl.name.charAt(0)}
                  </div>
                  {wl.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Assigned Tasks</div>
                    <div className="font-semibold text-lg">{wl.assignedTasks}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Total Hours</div>
                    <div className="font-semibold text-lg">{wl.estimatedHours.toFixed(1)}h</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Weekly Capacity Utilized</span>
                    <span className={`font-medium ${capacityPercent > 100 ? 'text-red-500' : ''}`}>
                      {capacityPercent.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={capacityPercent > 100 ? 100 : capacityPercent} className="h-2" indicatorClassName={capacityColor} />
                  {capacityPercent > 100 && (
                    <p className="text-[10px] text-red-500 mt-1">Overallocated by {(wl.estimatedHours - DEFAULT_WEEKLY_CAPACITY).toFixed(1)}h</p>
                  )}
                </div>

                <div className="space-y-1 pt-2 border-t border-dashed">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Work Completed</span>
                    <span className="font-medium">
                      {wl.completedHours.toFixed(1)}h / {wl.estimatedHours.toFixed(1)}h
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" indicatorClassName="bg-emerald-500" />
                </div>
              </CardContent>
            </Card>
          )
        })}

        {workloadList.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground text-sm border rounded-lg border-dashed">
            No team members found for this project.
          </div>
        )}
      </div>
    </div>
  )
}
