"use client"

import React from "react"
import { LayoutDashboard } from "lucide-react"

export function OverviewDashboard() {
  return (
    <div className="flex items-center justify-center min-h-[400px] border border-dashed border-border/60 rounded-2xl bg-muted/5">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 flex items-center justify-center mx-auto">
          <LayoutDashboard className="w-8 h-8 text-indigo-500/60" />
        </div>
        <h3 className="font-semibold text-lg">Overview Dashboard</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Executive view of tasks, projects, and active work sessions. (Phase 2)
        </p>
      </div>
    </div>
  )
}
