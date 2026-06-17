"use client"

import React, { useEffect, useState } from 'react'
import { hasPermission, Role, Resource, Action } from '@/lib/rbac'
import { useAuthStore } from '@/store/use-auth-store'

interface RequirePermissionProps {
  resource: Resource
  action: Action
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RequirePermission({ resource, action, children, fallback = null }: RequirePermissionProps) {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // In our simplified setup, `user.role` from the mock store acts as the current role
  // In a real Supabase setup, this would be fetched from the `organization_members` table
  const userRole = (user?.role || 'employee') as Role

  if (hasPermission(userRole, resource, action)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
