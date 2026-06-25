"use client"

import { useState, useEffect, useCallback } from "react"
import { getProjectAction } from "@/app/actions/project.actions"
import { useOrganizationStore } from "@/store/use-organization-store"
import { ProjectWithDetails } from "@/lib/repositories/project.repository"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, LayoutDashboard, Flag, Users, Banknote, GitMerge } from "lucide-react"
import { ProjectMemberManager } from "./ProjectMemberManager"
import { MilestoneTimeline } from "./MilestoneTimeline"
import { BudgetOverview } from "./BudgetOverview"
import { TaskDependencyGraph } from "./TaskDependencyGraph"
import { WorkloadHeatmap } from "./WorkloadHeatmap"

export function ProjectDetailPage({ projectId, onBack }: { projectId: string, onBack: () => void }) {
  const [project, setProject] = useState<ProjectWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const { activeOrganizationId } = useOrganizationStore()

  const fetchProject = useCallback(async () => {
    if (!activeOrganizationId) return
    setLoading(true)
    const res = await getProjectAction(projectId, activeOrganizationId)
    if (res.success) {
      setProject(res.data)
    }
    setLoading(false)
  }, [activeOrganizationId, projectId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProject()
  }, [projectId, activeOrganizationId, fetchProject])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground mb-4">Project not found or you don&apos;t have access.</p>
        <Button onClick={onBack} variant="outline">Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
          <p className="text-muted-foreground text-sm">{project.description || "No description provided."}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-10 p-0 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2 h-10">
            <LayoutDashboard className="w-4 h-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="milestones" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2 h-10">
            <Flag className="w-4 h-4 mr-2" /> Milestones
          </TabsTrigger>
          <TabsTrigger value="budget" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2 h-10">
            <Banknote className="w-4 h-4 mr-2" /> Budget
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2 h-10">
            <Users className="w-4 h-4 mr-2" /> Team & Roles
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2 h-10">
            <GitMerge className="w-4 h-4 mr-2" /> Tasks & Dependencies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 border border-dashed rounded-lg p-6 flex items-center justify-center bg-muted/10 h-64">
              Project Overview Cards (Health, Progress, Deadlines)
            </div>
            <div className="col-span-1 border border-dashed rounded-lg p-6 flex items-center justify-center bg-muted/10 h-64">
              Activity Feed
            </div>
          </div>
        </TabsContent>
        <TabsContent value="milestones" className="mt-6">
          <MilestoneTimeline project={project} onUpdate={fetchProject} />
        </TabsContent>
        <TabsContent value="budget" className="mt-6">
          <BudgetOverview project={project} onUpdate={fetchProject} />
        </TabsContent>
        <TabsContent value="team" className="mt-6 space-y-12">
          <ProjectMemberManager project={project} onUpdate={fetchProject} />
          <WorkloadHeatmap project={project} />
        </TabsContent>
        <TabsContent value="tasks" className="mt-6">
          <TaskDependencyGraph project={project} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
