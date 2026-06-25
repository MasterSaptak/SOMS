"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { WidgetShell } from "@/components/enterprise/widget-shell"
import { ProjectList } from "@/components/work/ProjectList"
import { FolderKanban } from "lucide-react"

export default function EmployeeProjectsPage() {
  const router = useRouter()

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <FolderKanban className="w-8 h-8 text-primary" />
            Project Portfolio
          </h1>
          <p className="text-muted-foreground">Manage organizational initiatives, budgets, and milestones.</p>
        </div>
      </div>

      <WidgetShell>
        <ProjectList onSelectProject={(id) => router.push(`/employee/projects/${id}`)} />
      </WidgetShell>
    </div>
  )
}
