"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, Activity, CheckCircle, Clock, AlertTriangle, Briefcase, Filter } from "lucide-react"
import { ProjectWithDetails } from '@/lib/repositories/project.repository'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProjectDashboardProps {
  initialProjects: ProjectWithDetails[]
  orgId: string
}

export function ProjectDashboard({ initialProjects, orgId }: ProjectDashboardProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectWithDetails[]>(initialProjects)
  const [search, setSearch] = useState('')

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const activeProjects = projects.filter(p => p.status === 'Active')
  const completedProjects = projects.filter(p => p.status === 'Completed')
  const delayedProjects = projects.filter(p => p.status === 'On Hold' || p.health_score === 'Critical')

  const totalBudget = projects.reduce((acc, p) => acc + (p.total_budget || 0), 0)
  const usedBudget = projects.reduce((acc, p) => acc + (p.actual_cost || 0), 0)
  const budgetUtilization = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0

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

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'On Track': return 'text-green-500'
      case 'At Risk': return 'text-orange-500'
      case 'Critical': return 'text-red-600'
      case 'Warning': return 'text-yellow-500'
      case 'Delayed': return 'text-orange-600'
      case 'Blocked': return 'text-red-700'
      case 'Completed': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Project Portfolio</h2>
          <p className="text-muted-foreground">Manage enterprise projects, workforce allocations, and budgets.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
          <Button onClick={() => router.push('/admin/projects/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk / Delayed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{delayedProjects.length}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <Briefcase className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetUtilization.toFixed(1)}%</div>
            <Progress value={budgetUtilization} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>All Projects</CardTitle>
              <CardDescription>A detailed list of all projects across the organization.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No projects found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow 
                      key={project.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => router.push(`/admin/projects/${project.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{project.name}</span>
                          {project.project_code && (
                            <span className="text-xs text-muted-foreground">{project.project_code}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(project.status) as any}>{project.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full bg-current ${getHealthColor(project.health_score)}`} />
                          <span className="text-sm">{project.health_score}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 w-full max-w-[150px]">
                          <Progress value={project.completion_percentage || 0} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-8 text-right">{project.completion_percentage || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {project.owner ? project.owner.full_name : <span className="text-muted-foreground italic">Unassigned</span>}
                      </TableCell>
                      <TableCell>
                        {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
