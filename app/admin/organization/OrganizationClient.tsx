"use client"

import React, { useState } from 'react'
import { Plus, Building, MapPin, Globe, Check, Settings2, Pencil } from 'lucide-react'
import { CreateOrganizationDialog } from './CreateOrganizationDialog'
import { EditOrganizationDialog } from './EditOrganizationDialog'
import type { Organization, OrganizationMember } from '@/types/organizations'


interface Props {
  initialMembers: OrganizationMember[]
  initialCurrentOrgId?: string | null
}

export default function OrganizationClient({ initialMembers, initialCurrentOrgId }: Props) {
  const [members, setMembers] = useState<OrganizationMember[]>(initialMembers)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [currentOrgId, setCurrentOrgId] = useState(initialCurrentOrgId)

  const handleSwitchOrganization = (org: Organization) => {
    document.cookie = `soms_current_org=${org.id}; path=/; max-age=31536000; SameSite=Lax`
    setCurrentOrgId(org.id)
    window.location.reload()
  }

  const organizations = members.map(m => m.organization || (m as any).organizations).filter(Boolean) as Organization[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Organizations</h1>
          <p className="text-muted-foreground">Manage companies, subsidiaries, and top-level business entities.</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create Organization
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map(org => {
          const isCurrent = currentOrgId === org.id
          
          return (
            <div 
              key={org.id} 
              className={`bg-surface-primary border rounded-xl overflow-hidden transition-all shadow-sm ${isCurrent ? 'border-primary ring-1 ring-primary/20' : 'border-border hover:border-primary/50'}`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 flex items-center justify-center border border-indigo-500/20 text-indigo-600">
                    <Building className="w-6 h-6" />
                  </div>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                  <button 
                    onClick={() => setEditingOrg(org)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors ml-auto"
                    title="Edit Organization"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="font-semibold text-lg text-foreground mb-1">{org.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">slug: {org.slug}</p>

                <div className="space-y-2 mb-6">
                  {org.industry && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Settings2 className="w-4 h-4 mr-2 opacity-70" />
                      {org.industry}
                    </div>
                  )}
                  {org.size && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building className="w-4 h-4 mr-2 opacity-70" />
                      {org.size}
                    </div>
                  )}
                  {org.website && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="w-4 h-4 mr-2 opacity-70" />
                      {org.website}
                    </div>
                  )}
                </div>

                {!isCurrent && (
                  <button 
                    onClick={() => handleSwitchOrganization(org)}
                    className="w-full py-2 px-4 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/80 transition-colors"
                  >
                    Switch to {org.name}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showCreateDialog && (
        <CreateOrganizationDialog 
          onClose={() => setShowCreateDialog(false)}
          onCreated={(newOrg) => {
            window.location.reload()
          }}
        />
      )}

      {editingOrg && (
        <EditOrganizationDialog
          organization={editingOrg}
          onClose={() => setEditingOrg(null)}
          onUpdated={(updatedOrg) => {
            setEditingOrg(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
