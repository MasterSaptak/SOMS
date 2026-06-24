"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/use-auth-store'
import { createClient } from '@/lib/supabase/client'

export default function ProfileRedirectPage() {
  const router = useRouter()
  const { user, employee } = useAuthStore()

  useEffect(() => {
    async function redirectUser() {
      if (employee) {
        router.replace(`/employee/${employee.id}`)
        return
      }

      // Fallback for demo environment if no employee is in store:
      // Fetch any employee from the demo organization
      const supabase = createClient()
      const { data: demoOrg } = await supabase.from('organizations').select('id').eq('is_demo' as any, true).single()
      
      if (demoOrg) {
        const { data: anyEmployee } = await supabase.from('employees').select('id').eq('organization_id' as any, demoOrg.id).limit(1).single()
        if (anyEmployee) {
          router.replace(`/employee/${anyEmployee.id}`)
          return
        }
      }

      // If absolutely nothing is found, just go to directory
      router.replace('/admin/hr/directory')
    }

    redirectUser()
  }, [employee, router])

  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-muted-foreground">Loading profile...</div>
    </div>
  )
}
