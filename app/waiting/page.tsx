"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/use-auth-store'
import { LogOut, RefreshCw, Clock } from 'lucide-react'

export default function WaitingPage() {
  const router = useRouter()
  const { logout } = useAuthStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const supabase = createClient()

  const checkStatus = async () => {
    setIsRefreshing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }

      const { data: member } = await supabase
        .from('organization_members')
        .select('id, status')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .limit(1)

      if (member && member.length > 0) {
        // Now assigned, redirect to dashboard
        router.replace('/admin/dashboard')
      }
    } catch (error) {
      console.error("Error checking status:", error)
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Welcome to SOMS</h1>
            <p className="text-sm text-muted-foreground">Your account has been created successfully.</p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
            Your organization administrator hasn't assigned you to an organization yet. Once assigned, your dashboard and workspace will become available automatically.
          </div>

          <div className="flex items-center justify-center gap-2 py-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
              Pending Approval
            </span>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
            <button
              onClick={checkStatus}
              disabled={isRefreshing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Status
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-all font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
