// @ts-nocheck
"use client"

import { useLocalCache } from "@/hooks/use-local-cache"

import React, { useState, useEffect, useCallback } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  Kanban, 
  Briefcase, 
  Timer, 
  Calendar, 
  Banknote, 
  LineChart,
  Plus
} from "lucide-react"
import { OverviewDashboard } from "./OverviewDashboard"
import { TaskBoard } from "./TaskBoard"
import { ProjectList } from "./ProjectList"
import { WorkSessionTracker } from "./WorkSessionTracker"
import { MyTasksList } from "./MyTasksList"
import { TeamTasksView } from "./TeamTasksView"
import { TaskCreateDialog } from "./TaskCreateDialog"
import { ProjectCreateDialog } from "./ProjectCreateDialog"
import { ProjectDetailPage } from "./ProjectDetailPage"
import { TaskDetailSheet } from "./TaskDetailSheet"
import { useOrganizationStore } from "@/store/use-organization-store"
import { useAuthStore } from "@/store/use-auth-store"
import { getOrganizationTasksAction, deleteTaskAction } from "@/app/actions/task.actions"
import { Task } from "@/lib/repositories/task.repository"

export function WorkManagementShell() {
  const [activeTab, setActiveTab] = useState("overview")
  const [tasks, setTasks] = useLocalCache<Task[]>("soms_cached_tasks", [])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  
  const { activeOrganizationId } = useOrganizationStore()
  const { user } = useAuthStore()

  const loadTasks = useCallback(async () => {
    if (!activeOrganizationId) return
    const res = await getOrganizationTasksAction(activeOrganizationId, { limit: 500 })
    if (res.success && res.data) {
      setTasks(res.data)
    }
  }, [activeOrganizationId])

  useEffect(() => {
     
    loadTasks()
  }, [activeOrganizationId, loadTasks])

  const handleDelete = async (task: Task) => {
    if (!activeOrganizationId || !user?.id) return
    if (!confirm("Are you sure you want to delete this task?")) return
    
    // Optimistic remove
    setTasks(prev => prev.filter(t => t.id !== task.id))
    setSelectedTask(null)
    
    const res = await deleteTaskAction(task.id, activeOrganizationId, user.id)
    if (!res.success) {
      // Revert if failed
      loadTasks()
      alert("Failed to delete task: " + res.error?.message)
    }
  }

  const myTasks = tasks.filter(t => (t as any).task_assignments?.some((a: any) => a.employee_id === user?.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Work Management</h1>
          <p className="text-muted-foreground">Manage tasks, projects, budgets, and sessions across the organization.</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "projects" ? (
            <ProjectCreateDialog onSuccess={() => window.dispatchEvent(new CustomEvent('refresh-projects'))} />
          ) : (
            <TaskCreateDialog onSuccess={loadTasks} />
          )}
        </div>
      </div>

      <TaskDetailSheet 
        task={selectedTask} 
        open={!!selectedTask} 
        onOpenChange={(open) => !open && setSelectedTask(null)} 
        onDelete={handleDelete}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border/40 overflow-x-auto pb-px scrollbar-hide">
          <TabsList className="h-10 w-max bg-transparent p-0 flex space-x-6 justify-start">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none px-1 pb-2 h-10 transition-all font-medium text-muted-foreground data-[state=active]:text-foreground"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="my-tasks" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none px-1 pb-2 h-10 transition-all font-medium text-muted-foreground data-[state=active]:text-foreground"
            >
              <ListTodo className="w-4 h-4 mr-2" />
              My Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="team-tasks" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none px-1 pb-2 h-10 transition-all font-medium text-muted-foreground data-[state=active]:text-foreground"
            >
              <Users className="w-4 h-4 mr-2" />
              Team Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="board" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none px-1 pb-2 h-10 transition-all font-medium text-muted-foreground data-[state=active]:text-foreground"
            >
              <Kanban className="w-4 h-4 mr-2" />
              Board
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none px-1 pb-2 h-10 transition-all font-medium text-muted-foreground data-[state=active]:text-foreground"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger 
              value="sessions" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none px-1 pb-2 h-10 transition-all font-medium text-muted-foreground data-[state=active]:text-foreground"
            >
              <Timer className="w-4 h-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger 
              value="calendar" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none px-1 pb-2 h-10 transition-all font-medium text-muted-foreground data-[state=active]:text-foreground"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger 
              value="budgets" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none px-1 pb-2 h-10 transition-all font-medium text-muted-foreground data-[state=active]:text-foreground"
            >
              <Banknote className="w-4 h-4 mr-2" />
              Budgets
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none px-1 pb-2 h-10 transition-all font-medium text-muted-foreground data-[state=active]:text-foreground"
            >
              <LineChart className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="overview" className="m-0">
            <OverviewDashboard />
          </TabsContent>
          
          <TabsContent value="my-tasks" className="m-0">
            <MyTasksList tasks={myTasks} onTaskSelect={setSelectedTask} />
          </TabsContent>

          <TabsContent value="team-tasks" className="m-0">
            <TeamTasksView tasks={tasks} onTaskSelect={setSelectedTask} />
          </TabsContent>

          <TabsContent value="board" className="m-0">
            <TaskBoard tasks={tasks} onTaskSelect={setSelectedTask} onTasksUpdate={loadTasks} />
          </TabsContent>

          <TabsContent value="projects" className="m-0">
            {selectedProjectId ? (
              <ProjectDetailPage 
                projectId={selectedProjectId} 
                onBack={() => setSelectedProjectId(null)} 
              />
            ) : (
              <ProjectList onSelectProject={setSelectedProjectId} />
            )}
          </TabsContent>

          <TabsContent value="sessions" className="m-0">
            <WorkSessionTracker />
          </TabsContent>

          <TabsContent value="calendar" className="m-0">
            <div className="flex items-center justify-center min-h-[400px] border border-dashed border-border/60 rounded-2xl bg-muted/5">
              <p className="text-muted-foreground">Calendar View (Phase 4)</p>
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="m-0">
            <div className="flex items-center justify-center min-h-[400px] border border-dashed border-border/60 rounded-2xl bg-muted/5">
              <p className="text-muted-foreground">Budget Overview (Phase 3)</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="m-0">
            <div className="flex items-center justify-center min-h-[400px] border border-dashed border-border/60 rounded-2xl bg-muted/5">
              <p className="text-muted-foreground">Analytics Dashboard (Phase 4)</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
