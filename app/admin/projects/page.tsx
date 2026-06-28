import React from 'react'
import { cookies } from 'next/headers'
import { ProjectService } from '@/lib/services/project.service'
import { ProjectDashboard } from './project-dashboard'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const cookieStore = await cookies()
  const currentOrgId = cookieStore.get('soms_current_org')?.value

  const projectService = new ProjectService()
  const projectsRes = currentOrgId 
    ? await projectService.getOrganizationProjects(currentOrgId) 
    : await projectService.getAllProjects()
  
  const projects = projectsRes?.success ? projectsRes.data || [] : []

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">

      <ProjectDashboard initialProjects={projects} orgId={currentOrgId || ''} />
    </div>
  )
}
