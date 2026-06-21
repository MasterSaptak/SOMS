"use client"

import React, { useState } from 'react'
import { Building2, ChevronsUpDown, Plus, Check } from 'lucide-react'
import { useOrganizationStore } from '@/store/use-organization-store'
import { usePermissionStore } from '@/store/use-permission-store'
import { useFeatureStore } from '@/store/use-feature-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { OrganizationMember } from '@/types/organizations'

interface OrgSwitcherProps {
  collapsed?: boolean
}

const ROLE_BADGES: Record<string, string> = {
  owner: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  admin: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  employee: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  guest: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
}

export function OrgSwitcher({ collapsed = false }: OrgSwitcherProps) {
  const {
    activeOrganization,
    activeOrganizationId,
    memberships,
    switchOrganization,
  } = useOrganizationStore()

  const permissionStore = usePermissionStore()
  const featureStore = useFeatureStore()

  const currentMembership = memberships.find((m) => m.organizationId === activeOrganizationId)

  const handleSwitch = (orgId: string) => {
    if (orgId === activeOrganizationId) return
    switchOrganization(orgId)
    // Invalidate caches so they reload for new org
    permissionStore.invalidate()
    featureStore.invalidate()
  }

  if (!activeOrganization) {
    return null
  }

  const initials = activeOrganization.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`w-full h-auto py-2 px-2 flex items-center gap-2 hover:bg-muted/50 transition-colors ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6 rounded-md shrink-0 bg-primary/10">
              <AvatarFallback className="rounded-md text-[10px] font-bold text-primary bg-transparent">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col items-start min-w-0">
                <span className="text-xs font-semibold truncate max-w-[120px]">
                  {activeOrganization.name}
                </span>
                <span className={`text-[10px] capitalize px-1.5 py-0 rounded-full border font-medium ${ROLE_BADGES[currentMembership?.role ?? 'employee']}`}>
                  {currentMembership?.role ?? 'employee'}
                </span>
              </div>
            )}
          </div>
          {!collapsed && <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="right"
        sideOffset={8}
        className="w-64 bg-card border border-border shadow-xl rounded-xl p-1"
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-2 py-1.5">
          Your Organizations
        </DropdownMenuLabel>

        {memberships.map((membership) => {
          const org = membership.organization
          if (!org) return null
          const isActive = org.id === activeOrganizationId
          const orgInitials = org.name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase()

          return (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitch(org.id)}
              className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                isActive ? 'bg-primary/10 text-foreground' : 'hover:bg-muted/50'
              }`}
            >
              <Avatar className="h-6 w-6 rounded-md bg-primary/10 shrink-0">
                <AvatarFallback className="rounded-md text-[10px] font-bold text-primary bg-transparent">
                  {orgInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium truncate">{org.name}</span>
                <span className={`text-[10px] capitalize font-medium ${ROLE_BADGES[membership.role ?? 'employee'].split(' ')[1]}`}>
                  {membership.role}
                </span>
              </div>
              {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator className="my-1 bg-border/50" />

        <DropdownMenuItem
          className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          onClick={() => {
            // Navigate to org creation page
            window.location.href = '/setup/organization'
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs font-medium">Create Organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
