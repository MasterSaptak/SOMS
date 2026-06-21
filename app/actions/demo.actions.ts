'use server'

import { seedService } from '@/lib/demo/seed.service'
import { revalidatePath } from 'next/cache'

export async function createDemoOrganizationAction() {
  const result = await seedService.seedDemoOrganization()
  if (result.success) {
    revalidatePath('/', 'layout')
  }
  return result
}

export async function deleteDemoOrganizationAction() {
  const result = await seedService.deleteDemoOrganization()
  if (result.success) {
    revalidatePath('/', 'layout')
  }
  return result
}

export async function resetDemoOrganizationAction() {
  const result = await seedService.resetDemoOrganization()
  if (result.success) {
    revalidatePath('/', 'layout')
  }
  return result
}
