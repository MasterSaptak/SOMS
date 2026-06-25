'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createOrganizationAction } from '@/app/actions/organization.actions'
import { Loader2 } from 'lucide-react'

export function CreateOrganizationForm() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    try {
      const res = await createOrganizationAction({ name, slug })
      if (!res.success) {
        setError(res.error?.message || 'Failed to create organization')
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">Welcome to SOMS HR</CardTitle>
            <CardDescription>
              To get started, you need to create your first organization workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                placeholder="e.g. Acme Corp"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  // auto-generate a simple slug
                  if (!slug || slug === name.slice(0, -1).toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
                  }
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Organization Slug</Label>
              <Input
                id="slug"
                placeholder="e.g. acme-corp"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                required
              />
            </div>
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full transition-all" disabled={isSubmitting || !name || !slug}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Workspace...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
