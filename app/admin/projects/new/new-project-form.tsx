"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import { createProjectAction } from '../actions/project-actions'

export function NewProjectForm({ 
  initialOrgId, 
  userOrgs 
}: { 
  initialOrgId: string,
  userOrgs: { id: string; name: string }[] 
}) {
  const router = useRouter()
  const [selectedOrgId, setSelectedOrgId] = useState(initialOrgId)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    project_code: '',
    description: '',
    status: 'Planning',
    priority: 'Medium',
    risk_level: 'Low',
    planning_date: '',
    initiation_date: '',
    end_date: '',
    estimated_budget: 0,
    expected_outcome: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'estimated_budget' ? Number(value) : value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedOrgId) {
      toast.error('Please select an organization first.')
      return
    }
    
    setLoading(true)
    
    try {
      // Important: Ensure the server knows our context for redirect
      if (typeof document !== 'undefined') {
        document.cookie = `soms_current_org=${selectedOrgId}; path=/; max-age=31536000; SameSite=Lax`
      }

      const result = await createProjectAction(selectedOrgId, formData)
      
      if (!result.success) throw new Error(result.error)
      
      toast.success('Project created successfully')
      router.push(`/admin/projects/${result.data.id}`)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2 mb-6">
            <Label htmlFor="org_id">Organization <span className="text-red-500">*</span></Label>
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                {userOrgs.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. ERP Migration Phase 1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_code">Project Code</Label>
              <Input id="project_code" name="project_code" value={formData.project_code} onChange={handleChange} placeholder="e.g. ERP-001" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Brief description of the project goals..." />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => handleSelectChange('priority', v)}>
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planning_date">Planning Date</Label>
              <Input id="planning_date" name="planning_date" type="date" value={formData.planning_date} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initiation_date">Initiation Date</Label>
              <Input id="initiation_date" name="initiation_date" type="date" value={formData.initiation_date} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">Target Deadline</Label>
              <Input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_budget">Estimated Budget</Label>
              <Input id="estimated_budget" name="estimated_budget" type="number" min="0" step="0.01" value={formData.estimated_budget} onChange={handleChange} />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="expected_outcome">Expected Outcome</Label>
              <Textarea id="expected_outcome" name="expected_outcome" value={formData.expected_outcome} onChange={handleChange} placeholder="What does success look like?" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Project'}</Button>
      </div>
    </form>
  )
}
