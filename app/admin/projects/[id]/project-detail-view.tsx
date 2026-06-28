"use client"

import React from 'react'
import { ProjectWithDetails } from '@/lib/repositories/project.repository'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, Users, Briefcase, Activity, CheckCircle, AlertTriangle } from 'lucide-react'

export function ProjectDetailView({ project, orgId }: { project: ProjectWithDetails, orgId: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'default'
      case 'Completed': return 'success'
      case 'On Hold': return 'warning'
      case 'Cancelled': return 'destructive'
      case 'Planning': return 'secondary'
      default: return 'outline'
    }
  }

  const budgetUtilization = project.total_budget > 0 
    ? ((project.actual_cost || 0) / project.total_budget) * 100 
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
            <Badge variant={getStatusColor(project.status) as any} className="text-sm">
              {project.status}
            </Badge>
          </div>
          {project.project_code && (
            <p className="text-muted-foreground mt-1">Project Code: {project.project_code}</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap justify-start border-b rounded-none bg-transparent h-auto p-0">
          <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-2">Overview</TabsTrigger>
          <TabsTrigger value="teams" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-2">Teams</TabsTrigger>
          <TabsTrigger value="members" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-2">Members</TabsTrigger>
          <TabsTrigger value="milestones" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-2">Milestones</TabsTrigger>
          <TabsTrigger value="budget" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-2">Budget</TabsTrigger>
          <TabsTrigger value="outcomes" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-2">Outcomes</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Project Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{project.description || 'No description provided.'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Health</span>
                    <Badge variant="outline">{project.health_score}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Priority</span>
                    <Badge variant="outline">{project.priority || 'Medium'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Leader</span>
                    <span className="text-sm font-medium">{project.owner?.full_name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Target Deadline</span>
                    <span className="text-sm font-medium">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-3">
                <CardHeader>
                  <CardTitle>Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completion</span>
                    <span className="text-sm text-muted-foreground">{project.completion_percentage || 0}%</span>
                  </div>
                  <Progress value={project.completion_percentage || 0} className="h-2" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Teams</CardTitle>
                <CardDescription>Teams responsible for delivering this project.</CardDescription>
              </CardHeader>
              <CardContent>
                {project.project_teams && project.project_teams.length > 0 ? (
                  <ul className="space-y-2">
                    {project.project_teams.map(t => (
                      <li key={t.team_id} className="p-3 bg-muted rounded-md border flex justify-between items-center">
                        <div className="font-medium">{t.teams?.name}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No teams assigned yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Project Members</CardTitle>
                <CardDescription>Individual employees assigned to this project.</CardDescription>
              </CardHeader>
              <CardContent>
                {project.project_members && project.project_members.length > 0 ? (
                  <ul className="space-y-2">
                    {project.project_members.map(m => (
                      <li key={m.employee_id} className="p-3 bg-muted rounded-md border flex justify-between items-center">
                        <div>
                          <div className="font-medium">{m.employees?.full_name}</div>
                          <div className="text-xs text-muted-foreground">Role: {m.role}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No members assigned yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones">
            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                {project.project_milestones && project.project_milestones.length > 0 ? (
                  <div className="space-y-4">
                    {project.project_milestones.map(ms => (
                      <div key={ms.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{ms.title || ms.name}</h4>
                            <p className="text-sm text-muted-foreground">{ms.description}</p>
                          </div>
                          <Badge variant="outline">{ms.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No milestones defined.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget">
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Estimated Budget</h4>
                    <p className="text-3xl font-bold">${project.estimated_budget?.toLocaleString() || project.total_budget?.toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Actual Cost</h4>
                    <p className="text-3xl font-bold">${project.actual_cost?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Budget Utilization</span>
                      <span>{budgetUtilization.toFixed(1)}%</span>
                    </div>
                    <Progress value={budgetUtilization} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outcomes">
            <Card>
              <CardHeader>
                <CardTitle>Project Outcomes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Expected Outcome</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{project.expected_outcome || 'Not specified.'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Success Metrics</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{project.success_metrics || 'Not specified.'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Actual Outcome</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{project.actual_outcome || 'Not specified.'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
