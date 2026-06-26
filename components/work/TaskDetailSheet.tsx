// @ts-nocheck
"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Task } from "@/lib/repositories/task.repository"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Clock, Calendar, AlertCircle, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onDelete
}: {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: (task: Task) => void
}) {
  const router = useRouter()
  if (!task) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] flex flex-col p-0">
        <div className="p-6 pb-4">
          <SheetHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant={task.status === "Completed" ? "default" : "secondary"}>
                  {task.status}
                </Badge>
                <Badge variant="outline">{task.priority}</Badge>
                <Badge variant="outline">{task.category}</Badge>
              </div>
              {onDelete && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); router.push('/employee/calendar'); }}>
                    <Calendar className="w-4 h-4 mr-1" /> View Timeline
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(task)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {!onDelete && (
                <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); router.push('/employee/calendar'); }}>
                  <Calendar className="w-4 h-4 mr-1" /> View Timeline
                </Button>
              )}
            </div>
            <SheetTitle className="text-2xl">{task.title}</SheetTitle>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="space-y-6">
            <div className="prose prose-sm dark:prose-invert">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Due Date
                </span>
                <p className="font-medium">
                  {task.due_date ? format(new Date(task.due_date), "PPP") : "Not set"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Estimated Hours
                </span>
                <p className="font-medium">{task.estimated_hours || 0}h</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Actual Hours
                </span>
                <p className="font-medium">{task.actual_hours || 0}h</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> Completion
                </span>
                <p className="font-medium">{task.completion_percentage || 0}%</p>
              </div>
            </div>

            <Separator />
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Assignees</h4>
              </div>
              {task.task_assignments && task.task_assignments.length > 0 ? (
                <div className="space-y-2">
                  {task.task_assignments.map((assignment: any) => (
                    <div key={assignment.employee_id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center text-xs font-bold">
                        {assignment.employees?.full_name?.charAt(0) || <Users className="w-3 h-3" />}
                      </div>
                      <span className="text-sm">{assignment.employees?.full_name || "Unknown Employee"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground p-3 border border-dashed rounded-md bg-muted/10">
                  No one is currently assigned to this task.
                </div>
              )}
            </div>

            <Separator />
            
            <div>
              <h4 className="font-semibold mb-3">Activity & Comments</h4>
              <div className="text-center text-muted-foreground text-sm py-8 bg-muted/20 rounded-lg border border-dashed">
                Activity tracking coming soon.
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
