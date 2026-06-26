"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Building2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

export function OrgChartCanvas() {
  const router = useRouter()
  // Data will be fetched from Supabase in the future
  const chartData: any[] = []

  return (
    <div className="w-full h-full p-4">
      <EmptyState 
        title="No Organization Data"
        description="The organization chart is currently empty. Add departments and teams to see them here."
        icon={<Building2 className="w-8 h-8" />}
      />
    </div>
  )
}
