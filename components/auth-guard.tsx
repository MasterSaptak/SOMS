"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setIsAuthenticated(false)
        router.replace('/login')
        return
      }

      setIsAuthenticated(true)

      // If we require admin, check the role
      if (requireAdmin) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profile?.role !== 'admin') {
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
