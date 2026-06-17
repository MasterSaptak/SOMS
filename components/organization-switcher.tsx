"use client"

import React, { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Building, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Organization {
  id: string
  name: string
  slug: string
}

export function OrganizationSwitcher() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadOrganizations() {
      // In a real app, we'd fetch orgs via the organization_members join table
      // Since RLS is enabled and `get_user_orgs()` handles it, we can just query `organizations`
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
      
      if (!error && data) {
        setOrganizations(data as Organization[])
        // In reality, you'd read the last active org from localStorage or a cookie
        if (data.length > 0) {
          setCurrentOrg(data[0] as Organization)
        } else {
          // Redirect to onboarding if no orgs found
          router.push('/onboarding')
        }
      }
      setIsLoading(false)
    }

    loadOrganizations()
  }, [supabase, router])

  if (isLoading) {
    return (
      <Button variant="outline" className="w-[200px] justify-between opacity-50" disabled>
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span>Loading...</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Building className="h-4 w-4" />
            <span className="truncate">{currentOrg?.name || 'Select Workspace'}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] p-0" align="start">
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onSelect={() => {
              setCurrentOrg(org)
              // Optionally trigger a page reload or state update to refresh data scoped to this org
            }}
            className="flex items-center justify-between cursor-pointer p-2"
          >
            <span className="truncate">{org.name}</span>
            <Check
              className={cn(
                "h-4 w-4",
                currentOrg?.id === org.id ? "opacity-100" : "opacity-0"
              )}
            />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            router.push('/onboarding')
          }}
          className="flex items-center cursor-pointer p-2 text-primary"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
