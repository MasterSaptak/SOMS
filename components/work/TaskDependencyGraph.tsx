// @ts-nocheck
"use client"

import { useState, useEffect, useCallback } from "react"
import { useOrganizationStore } from "@/store/use-organization-store"
import { useAuthStore } from "@/store/use-auth-store"
import { getOrganizationTasksAction, addDependencyAction, removeDependencyAction } from "@/app/actions/task.actions"
import { ProjectWithDetails } from "@/lib/repositories/project.repository"
import { TaskWithAssignees } from "@/lib/repositories/task.repository"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, GitMerge, Link2, Unlink2, CheckCircle2, Circle } from "lucide-react"

export function TaskDependencyGraph({ project }: { project: ProjectWithDetails }) {
  const [tasks, setTasks] = useState<TaskWithAssignees[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { activeOrganizationId } = useOrganizationStore()
  const { user } = useAuthStore()

  const [selectedTask, setSelectedTask] = useState<string>("")
  const [selectedDependency, setSelectedDependency] = useState<string>("")

  const loadTasks = useCallback(async () => {
    if (!activeOrganizationId) return
    setLoading(true)
    const res = await getOrganizationTasksAction(activeOrganizationId, { projectId: project.id })
    if (res.success) {
      setTasks(res.data)
    }
    setLoading(false)
  }, [activeOrganizationId, project.id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTasks()
  }, [project.id, activeOrganizationId, loadTasks])

  const handleAddDependency = async () => {
    if (!activeOrganizationId || !user?.id || !selectedTask || !selectedDependency) return
    if (selectedTask === selectedDependency) {
      alert("A task cannot depend on itself.")
      return
    }

    setActionLoading('add')
    const res = await addDependencyAction(activeOrganizationId, selectedTask, selectedDependency, user.id)
    if (res.success) {
      setSelectedTask("")
      setSelectedDependency("")
      loadTasks()
    } else {
      alert("Failed to add dependency: " + res.error?.message)
    }
    setActionLoading(null)
  }

  const handleRemoveDependency = async (taskId: string, dependsOnId: string) => {
    if (!activeOrganizationId || !user?.id) return
    if (!confirm("Remove this dependency?")) return

    setActionLoading(`remove-${taskId}-${dependsOnId}`)
    const res = await removeDependencyAction(activeOrganizationId, taskId, dependsOnId, user.id)
    if (res.success) {
      loadTasks()
    } else {
      alert("Failed to remove dependency: " + res.error?.message)
    }
    setActionLoading(null)
  }

  const getTaskStatusIcon = (status: string) => {
    return status === 'Completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-muted-foreground" />
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
  }

  // Calculate dependency chains (simple topological display)
  const tasksWithDeps = tasks.filter(t => t.dependencies && t.dependencies.length > 0)
  
  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-indigo-500" /> Task Dependencies
          </h3>
          <p className="text-sm text-muted-foreground">Define which tasks must be completed before others can begin.</p>
        </div>
      </div>

      <div className="flex items-end gap-4 p-4 border rounded-lg bg-card">
        <div className="space-y-2 flex-1">
          <label className="text-sm font-medium">This Task</label>
          <Select value={selectedTask} onValueChange={setSelectedTask}>
            <SelectTrigger>
              <SelectValue placeholder="Select blocked task..." />
            </SelectTrigger>
            <SelectContent>
              {tasks.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
              ))}
              {tasks.length === 0 && <SelectItem value="none" disabled>No tasks found</SelectItem>}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center pb-2 px-2 text-muted-foreground">
          <span className="text-sm font-medium">is blocked by</span>
        </div>
        <div className="space-y-2 flex-1">
          <label className="text-sm font-medium">Depends On (Blocker)</label>
          <Select value={selectedDependency} onValueChange={setSelectedDependency}>
            <SelectTrigger>
              <SelectValue placeholder="Select blocker task..." />
            </SelectTrigger>
            <SelectContent>
              {tasks.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddDependency} disabled={!selectedTask || !selectedDependency || actionLoading === 'add'}>
          {actionLoading === 'add' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Link2 className="w-4 h-4 mr-2" />}
          Link
        </Button>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Dependency Graph</h4>
        {tasksWithDeps.map(task => (
          <div key={task.id} className="border rounded-lg p-4 bg-card shadow-sm">
            <div className="flex items-center gap-3 font-medium">
              {getTaskStatusIcon(task.status)}
              <span className={task.status === 'Completed' ? 'line-through text-muted-foreground' : ''}>{task.title}</span>
              <span className="text-xs text-muted-foreground ml-2">is blocked by:</span>
            </div>
            <div className="mt-3 space-y-2 pl-7">
              {task.dependencies?.map(dep => {
                const blocker = tasks.find(t => t.id === dep.depends_on_id)
                if (!blocker) return null
                return (
                  <div key={dep.depends_on_id} className="flex items-center justify-between border border-dashed rounded-md p-2 bg-muted/20">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-6 w-px bg-muted-foreground absolute -ml-5 -mt-8" />
                      <div className="w-4 h-px bg-muted-foreground absolute -ml-5" />
                      {getTaskStatusIcon(blocker.status)}
                      <span className={blocker.status === 'Completed' ? 'line-through text-muted-foreground' : ''}>{blocker.title}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-6 w-6"
                      onClick={() => handleRemoveDependency(task.id, blocker.id)}
                      disabled={actionLoading === `remove-${task.id}-${blocker.id}`}
                    >
                      {actionLoading === `remove-${task.id}-${blocker.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink2 className="w-3 h-3" />}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {tasksWithDeps.length === 0 && (
          <div className="text-center py-12 border rounded-lg border-dashed bg-muted/5">
            <GitMerge className="w-8 h-8 mx-auto text-muted-foreground mb-3 opacity-50" />
            <h4 className="text-sm font-medium">No Dependencies</h4>
            <p className="text-xs text-muted-foreground mt-1">Use the form above to define task blockers.</p>
          </div>
        )}
      </div>
    </div>
  )
}
