import React from 'react'
import { cookies } from 'next/headers'
import { ProjectService } from '@/lib/services/project.service'
import { ProjectDetailView } from './project-detail-view'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const cookieStore = await cookies()
  const currentOrgId = cookieStore.get('soms_current_org')?.value

  if (!currentOrgId) {
    return <div>No active organization selected.</div>
  }

  const projectService = new ProjectService()
  const res = await projectService.getProject(id, currentOrgId)
  
  if (!res.success || !res.data) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 max-w-7xl mx-auto">
      <ProjectDetailView project={res.data} orgId={currentOrgId} />
    </div>
  )
}
