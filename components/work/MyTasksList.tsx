"use client"

import React from "react"
import { Task } from "@/lib/repositories/task.repository"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"

export function MyTasksList({ 
  tasks,
  onTaskSelect
}: { 
  tasks: Task[]
  onTaskSelect: (task: Task) => void
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border rounded-lg bg-muted/20 border-dashed">
        <p className="text-muted-foreground">No tasks found.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => onTaskSelect(task)}>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <Badge variant={task.status === "Completed" ? "default" : "secondary"}>
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{task.priority}</Badge>
              </TableCell>
              <TableCell>{task.category}</TableCell>
              <TableCell>
                {task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "-"}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation()
                  onTaskSelect(task)
                }}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
