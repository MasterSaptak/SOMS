import React from 'react'
import { cookies } from 'next/headers'
import { NewProjectForm } from './new-project-form'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function NewProjectPage() {
  const cookieStore = await cookies()
  const currentOrgId = cookieStore.get('soms_current_org')?.value

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  let userOrgs: { id: string; name: string }[] = []
  if (userData?.user?.id) {
    const { data } = await (supabase as any)
      .from('organization_members')
      .select('organization_id, organizations(id, name)')
      .eq('user_id', userData.user.id)
      .eq('status', 'active')
      
    if (data) {
      userOrgs = data.map((d: any) => ({
        id: d.organization_id,
        name: d.organizations?.name || d.organization_id
      }))
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Enterprise Project</h2>
        <p className="text-muted-foreground">Initialize a new project with resource allocation, budget, and outcomes.</p>
      </div>
      <NewProjectForm initialOrgId={currentOrgId || ''} userOrgs={userOrgs} />
    </div>
  )
}
