"use server"

import { ProjectService } from '@/lib/services/project.service'
import { revalidatePath } from 'next/cache'

export async function createProjectAction(orgId: string, projectData: any) {
  try {
    const service = new ProjectService()
    const result = await service.createProject(orgId, projectData)
    
    if (!result.success) {
      throw result.error
    }
    
    revalidatePath('/admin/projects')
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error('Create project error:', error)
    return { success: false, error: error.message || 'Failed to create project' }
  }
}
