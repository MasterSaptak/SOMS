"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/use-auth-store'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAdmin?: boolean
}

export function AuthGuard({ children, fallback, requireAdmin = false }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { setAuth, logout } = useAuthStore()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setIsAuthenticated(false)
        logout()
        router.replace('/login')
        return
      }

      // Fetch profile and organization member info
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .maybeSingle()
        
      const { data: orgMembersData } = await (supabase as any)
        .from('organization_members')
        .select('id, organization_id, role, status')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .limit(1)
        
      const orgMember = orgMembersData && orgMembersData.length > 0 ? orgMembersData[0] : null

      // Redirect unassigned users to waiting screen (unless they are super admin)
      const isSuperAdmin = session.user.email === 'saptech.online009@gmail.com'
      
      if (!orgMember && !isSuperAdmin) {
        if (pathname !== '/waiting') {
          router.replace('/waiting')
          return
        }
      } else if (orgMember && pathname === '/waiting') {
        router.replace('/admin/dashboard')
        return
      }

      // Fetch employee profile if they are an org member or super admin
      let employeeData = null
      if (orgMember) {
        let { data } = await (supabase as any)
          .from('employees')
          .select('id, user_id, employee_id_string, full_name, department, designation, phone, profile_photo, joining_date, employment_status, created_at, organization_id')
          .eq('organization_member_id', orgMember.id)
          .maybeSingle()
          
        if (!data) {
          const { data: fallbackData } = await (supabase as any)
            .from('employees')
            .select('id, user_id, employee_id_string, full_name, department, designation, phone, profile_photo, joining_date, employment_status, created_at, organization_id')
            .eq('user_id', session.user.id)
            // Fetch any employee record for this user, we will link it up later if needed
            .limit(1)
            .maybeSingle()
          data = fallbackData
        }
        
        employeeData = data
      }
      
      if (!employeeData && isSuperAdmin) {
        const { data } = await (supabase as any)
          .from('employees')
          .select('id, user_id, employee_id_string, full_name, department, designation, phone, profile_photo, joining_date, employment_status, created_at, organization_id')
          .eq('user_id', session.user.id)
          .maybeSingle()
        employeeData = data
      }

      // Use the actual DB role, with Prime Admin override
      let activeRole = orgMember?.role || profile?.role || 'employee';
      if (isSuperAdmin) {
        activeRole = 'super_admin';
      }

      if (profile || isSuperAdmin) {
        setAuth(
          { id: session.user.id, email: session.user.email!, role: activeRole as any, isActive: true, lastLogin: null, createdAt: new Date().toISOString() },
          employeeData ? {
            id: employeeData.id,
            userId: session.user.id,
            employeeCode: employeeData.employee_id_string || '',
            firstName: employeeData.full_name?.split(' ')[0] || '',
            lastName: employeeData.full_name?.split(' ').slice(1).join(' ') || '',
            departmentId: employeeData.department || '',
            designation: employeeData.designation || '',
            phone: employeeData.phone || '',
            avatarUrl: employeeData.profile_photo || '',
            joinDate: employeeData.joining_date || '',
            status: (employeeData.employment_status as any) || 'active',
            createdAt: employeeData.created_at || new Date().toISOString()
          } as any : null
        )
      }

      setIsAuthenticated(true)

      // If we require admin, check the role
      if (requireAdmin) {
        const adminRoles = ['super_admin', 'admin', 'hr_manager']
        if (!adminRoles.includes(activeRole)) {
          setIsAuthorized(false)
          router.replace('/employee') // fallback
        } else {
          setIsAuthorized(true)
        }
      } else {
        setIsAuthorized(true)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false)
        logout()
        router.replace('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, requireAdmin, supabase])

  if (isAuthenticated === null || isAuthorized === null) {
    return fallback ? <>{fallback}</> : (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isAuthorized) {
    return null // Router will redirect
  }

  return <>{children}</>
}
