'use server'

import { revalidateTag, revalidatePath } from 'next/cache'

export async function revalidateAppCacheAction() {
  try {
    // Revalidate core app tags
    revalidateTag('dashboard')
    revalidateTag('employees')
    revalidateTag('attendance')
    revalidateTag('tasks')
    revalidateTag('leaves')
    revalidateTag('payroll')
    
    // Also revalidate the root layout just in case
    revalidatePath('/', 'layout')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to revalidate cache:', error)
    return { success: false, error: 'Failed to revalidate cache' }
  }
}
