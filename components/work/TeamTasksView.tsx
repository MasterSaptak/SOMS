"use client"

import React from "react"
import { Task } from "@/lib/repositories/task.repository"
import { MyTasksList } from "./MyTasksList"

export function TeamTasksView({ 
  tasks,
  onTaskSelect
}: { 
  tasks: Task[]
  onTaskSelect: (task: Task) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Organization & Team Tasks</h3>
      </div>
      <MyTasksList tasks={tasks} onTaskSelect={onTaskSelect} />
    </div>
  )
}
