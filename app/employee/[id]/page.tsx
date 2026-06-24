import { getEmployee360Action, getAllSkillsAction } from '@/app/actions/employee.actions'
import EmployeeProfileClient from './client'
import { redirect } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Employee Profile | SOMS',
}

export default async function EmployeeProfilePage({ params }: { params: { id: string } }) {
  const [res, skillsRes] = await Promise.all([
    getEmployee360Action(params.id),
    getAllSkillsAction()
  ])

  if (!res.success) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-2">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Profile Unavailable</h2>
        <p className="text-muted-foreground max-w-md text-center">{res.error?.message}</p>
      </div>
    )
  }

  const initialData = {
    ...res.data,
    availableSkills: skillsRes.success ? skillsRes.data : []
  }

  return <EmployeeProfileClient initialData={initialData} employeeId={params.id} />
}
