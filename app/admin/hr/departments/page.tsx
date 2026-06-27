import React from 'react'
import { Plus } from 'lucide-react'
import { DepartmentTree } from '@/components/hr/department-tree'
import { organizationTreeService } from '@/lib/services/organization/organization-tree.service'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function DepartmentsPage() {
  const cookieStore = await cookies()
  const orgId = cookieStore.get('soms_current_org')?.value

  if (!orgId) return <div>No active organization selected.</div>

  const { data: treeData, error } = await organizationTreeService.getFullTree(orgId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Departments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your organization's branch and department hierarchy</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} />
          Add Department
        </button>
      </div>

      {error ? (
        <div className="p-8 text-center text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
          Failed to load organization tree: {error}
        </div>
      ) : (
        <DepartmentTree treeData={treeData} />
      )}
    </div>
  )
}
