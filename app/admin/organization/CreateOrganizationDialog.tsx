"use client"

import React, { useState, useTransition } from 'react'
import { X, Building } from 'lucide-react'
import { toast } from 'sonner'
import { createOrganizationAction } from '@/app/actions/organization.actions'
import type { Organization } from '@/types/organizations'

interface Props {
  onClose: () => void
  onCreated: (org: Organization) => void
}

export function CreateOrganizationDialog({ onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [industry, setIndustry] = useState('')
  const [size, setSize] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Organization name is required')
      return
    }

    const finalSlug = slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    startTransition(async () => {
      const result = await createOrganizationAction({ 
        name: name.trim(), 
        slug: finalSlug,
        industry: industry || undefined,
        size: size || undefined
      })
      if (result.success) {
        toast.success('Organization created successfully!')
        onCreated(result.data as Organization)
      } else {
        toast.error(result.error?.message || 'Failed to create organization')
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
                <h2 className="text-lg font-bold text-foreground leading-none">New Organization</h2>
                <p className="text-sm text-muted-foreground mt-1">Create a new workspace for a company.</p>
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
              <label className="block text-sm font-medium text-foreground mb-1.5">URL Slug (Optional)</label>
              <input 
                type="text" 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)} 
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono" 
                placeholder="acme-corp" 
              />
              <p className="text-xs text-muted-foreground mt-1.5">Leave blank to auto-generate from the name.</p>
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
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none" 
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

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isPending}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
