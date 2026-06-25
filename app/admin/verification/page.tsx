import React from 'react'
import VerificationCenterClient from './client'
import { getPendingVerificationsAction } from '@/app/actions/employee.actions'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function VerificationCenterPage() {
  const res = await getPendingVerificationsAction()
  
  if (!res.success) {
    if (res.error?.message === 'Unauthorized') {
      redirect('/')
    }
    return <div className="p-8 text-destructive">Error loading pending verifications: {res.error?.message}</div>
  }

  return <VerificationCenterClient pendingData={res.data} />
}
