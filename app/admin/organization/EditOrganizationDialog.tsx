"use client"

import React, { useState, useTransition } from 'react'
import { X, Building } from 'lucide-react'
import { toast } from 'sonner'
import { updateOrganizationAction } from '@/app/actions/organization.actions'
import type { Organization } from '@/types/organizations'

interface Props {
  organization: Organization
  onClose: () => void
  onUpdated: (org: Organization) => void
}

export function EditOrganizationDialog({ organization, onClose, onUpdated }: Props) {
  const [name, setName] = useState(organization.name)
  const [slug, setSlug] = useState(organization.slug)
  const [industry, setIndustry] = useState(organization.industry || '')
  const [size, setSize] = useState(organization.size || '')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Organization name is required')
      return
    }
    if (!slug.trim()) {
      toast.error('Organization slug is required')
      return
    }

    startTransition(async () => {
      const result = await updateOrganizationAction({ 
        id: organization.id,
        name: name.trim(), 
        slug: slug.trim(),
        industry: industry || undefined,
        size: (size as any) || undefined
      })
      if (result.success) {
        toast.success('Organization updated successfully!')
        onUpdated(result.data as Organization)
      } else {
        toast.error(result.error?.message || 'Failed to update organization')
      }
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground leading-none">Edit Organization</h2>
                <p className="text-sm text-muted-foreground mt-1">Update company details.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Organization Name <span className="text-destructive">*</span></label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                placeholder="Acme Corp" 
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">URL Slug <span className="text-destructive">*</span></label>
              <input 
                type="text" 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)} 
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono" 
                placeholder="acme-corp" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Industry</label>
                <input 
                  type="text" 
                  value={industry} 
                  onChange={(e) => setIndustry(e.target.value)} 
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  placeholder="Technology" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Company Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">Select size...</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
