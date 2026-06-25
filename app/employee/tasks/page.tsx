"use client"

import React, { useEffect, useState, useCallback } from "react"
import { WidgetShell } from "@/components/enterprise/widget-shell"
import { MyTasksList } from "@/components/work/MyTasksList"
import { TaskDetailSheet } from "@/components/work/TaskDetailSheet"
import { Task } from "@/lib/repositories/task.repository"
import { useAuthStore } from "@/store/use-auth-store"
import { useOrganizationStore } from "@/store/use-organization-store"
import { getOrganizationTasksAction } from "@/app/actions/task.actions"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ListTodo, Building2 } from "lucide-react"

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const { user } = useAuthStore()
  const { activeOrganizationId } = useOrganizationStore()

  const loadTasks = useCallback(async () => {
    if (!activeOrganizationId) return
    const res = await getOrganizationTasksAction(activeOrganizationId, { limit: 500 })
    if (res.success && res.data) {
      setTasks(res.data)
    }
  }, [activeOrganizationId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const myTasks = tasks.filter(t => (t as any).task_assignments?.some((a: any) => a.employee_id === user?.id))
  const orgTasks = tasks.filter(t => t.category === "Organization Task")

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <ListTodo className="w-8 h-8 text-primary" />
            My Tasks
          </h1>
          <p className="text-muted-foreground">Manage your assignments and track organizational tasks.</p>
        </div>
      </div>

      <TaskDetailSheet 
        task={selectedTask} 
        open={!!selectedTask} 
        onOpenChange={(open) => !open && setSelectedTask(null)} 
      />

      <Tabs defaultValue="my-tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="my-tasks"><ListTodo className="w-4 h-4 mr-2" /> My Tasks</TabsTrigger>
          <TabsTrigger value="org-tasks"><Building2 className="w-4 h-4 mr-2" /> Org Tasks</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="my-tasks" className="m-0">
            <WidgetShell>
              <MyTasksList tasks={myTasks} onTaskSelect={setSelectedTask} />
            </WidgetShell>
          </TabsContent>

          <TabsContent value="org-tasks" className="m-0">
            <WidgetShell>
              <MyTasksList tasks={orgTasks} onTaskSelect={setSelectedTask} />
            </WidgetShell>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
