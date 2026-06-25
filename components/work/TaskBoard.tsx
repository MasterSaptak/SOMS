"use client"

import React, { useState, useEffect } from "react"
import { Task, TaskStatus } from "@/lib/repositories/task.repository"
import { 
  DndContext, 
  DragEndEvent, 
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { updateTaskAction } from "@/app/actions/task.actions"
import { useOrganizationStore } from "@/store/use-organization-store"
import { useAuthStore } from "@/store/use-auth-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

const COLUMNS: TaskStatus[] = ["Draft", "Active", "In Progress", "Review", "Completed"]

export function TaskBoard({ 
  tasks, 
  onTaskSelect,
  onTasksUpdate // callback to refresh parent
}: { 
  tasks: Task[]
  onTaskSelect: (task: Task) => void
  onTasksUpdate: () => void
}) {
  const [boardTasks, setBoardTasks] = useState<Task[]>(tasks)
  const { activeOrganizationId } = useOrganizationStore()
  const { user } = useAuthStore()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBoardTasks(tasks)
  }, [tasks])

  useEffect(() => {
    if (!activeOrganizationId) return

    const supabase = createClient()
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `organization_id=eq.${activeOrganizationId}`,
        },
        (payload) => {
          onTasksUpdate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeOrganizationId, onTasksUpdate])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || !activeOrganizationId || !user?.id) return

    const taskId = active.id as string
    const overId = over.id as string

    // If dropped on a column container, overId is the column name
    const overColumn = COLUMNS.includes(overId as TaskStatus) ? overId : null
    const droppedOnTask = boardTasks.find(t => t.id === overId)
    
    const newStatus = (overColumn || droppedOnTask?.status) as TaskStatus
    if (!newStatus) return

    const activeTask = boardTasks.find(t => t.id === taskId)
    if (!activeTask || activeTask.status === newStatus) return

    // Optimistic update
    setBoardTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

    try {
      await updateTaskAction(taskId, activeOrganizationId, user.id, { status: newStatus })
      onTasksUpdate()
    } catch (err) {
      console.error(err)
      // Revert on failure
      setBoardTasks(tasks)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-[calc(100vh-250px)]">
        {COLUMNS.map(column => (
          <BoardColumn 
            key={column} 
            status={column} 
            tasks={boardTasks.filter(t => t.status === column)} 
            onTaskSelect={onTaskSelect}
          />
        ))}
      </div>
    </DndContext>
  )
}

function BoardColumn({ 
  status, 
  tasks,
  onTaskSelect 
}: { 
  status: TaskStatus
  tasks: Task[]
  onTaskSelect: (task: Task) => void
}) {
  return (
    <div className="flex flex-col bg-muted/30 rounded-lg p-4 h-full border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">{status}</h3>
        <Badge variant="secondary" className="rounded-full">{tasks.length}</Badge>
      </div>
      
      <ScrollArea className="flex-1 -mx-2 px-2">
        {/* We use SortableContext to define the drop zone, the id is the column status itself to allow dropping on empty columns */}
        <SortableContext id={status} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[150px]">
            {tasks.map(task => (
              <SortableTaskCard key={task.id} task={task} onSelect={() => onTaskSelect(task)} />
            ))}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  )
}

function SortableTaskCard({ task, onSelect }: { task: Task, onSelect: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card 
        className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
        onClick={(e) => {
          // Prevent drag from triggering click if it was a drag
          if (!isDragging) {
            onSelect()
          }
        }}
      >
        <CardContent className="p-3">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start gap-2">
              <p className="text-sm font-medium leading-tight">{task.title}</p>
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                {task.priority.charAt(0)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">{task.category}</span>
              {task.estimated_hours ? (
                <span className="text-xs text-muted-foreground">{task.estimated_hours}h</span>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
