"use client"

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

interface Breadcrumb {
  label: string
  href: string
  isCurrentPage: boolean
}

const LABEL_MAP: Record<string, string> = {
  employee: 'Employee Portal',
  admin: 'Admin',
  reception: 'Reception',
  session: 'Work Session',
  recovery: 'Debt Recovery',
  tasks: 'Tasks',
  leaves: 'Leaves',
  assets: 'Assets',
  rooms: 'Meeting Rooms',
  announcements: 'Announcements',
  rewards: 'Credits & Rewards',
  achievements: 'Achievements',
  hr: 'HR Management',
  payroll: 'Payroll',
}

export function useBreadcrumbs(): Breadcrumb[] {
  const pathname = usePathname()

  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return []

    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const isCurrentPage = index === segments.length - 1
      const label = LABEL_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

      return { label, href, isCurrentPage }
    })
  }, [pathname])
}
