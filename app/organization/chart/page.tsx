import { OrganizationChartClient } from './client'
import { getOrganizationHierarchyAction } from '@/app/actions/employee.actions'

export default async function OrganizationChartPage() {
  const result = await getOrganizationHierarchyAction()
  const employees = result.success ? result.data : []

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Chart</h1>
        <p className="text-muted-foreground mt-2">
          Interactive view of the company's reporting structure.
        </p>
      </div>

      <OrganizationChartClient initialEmployees={employees} />
    </div>
  )
}
