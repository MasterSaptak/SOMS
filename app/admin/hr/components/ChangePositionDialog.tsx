"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { X, Building2, Briefcase, FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changeEmployeePositionAction } from '@/app/actions/hr.actions'

export function ChangePositionDialog({ 
  organizationId,
  employeeId,
  currentDeptId,
  currentDesigId,
  onClose,
  onSuccess
}: { 
  organizationId: string
  employeeId: string
  currentDeptId?: string
  currentDesigId?: string
  onClose: () => void
  onSuccess?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    department_id: currentDeptId || '',
    designation_id: currentDesigId || '',
    title: '',
    change_reason: 'Promotion',
    start_date: new Date().toISOString().split('T')[0]
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const result = await changeEmployeePositionAction(organizationId, employeeId, formData, 'system')

    setLoading(false)

    if (!result.success) {
      setError(result.error?.message || 'Failed to update position')
    } else {
      if (onSuccess) onSuccess()
      onClose()
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-background border border-border shadow-2xl rounded-xl w-full max-w-md flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <h2 className="font-semibold text-lg">Change Position</h2>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="title">New Job Title</Label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input required id="title" className="pl-9" placeholder="Senior Developer" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dept">New Department ID</Label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="dept" className="pl-9" placeholder="uuid..." value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="change_reason">Reason</Label>
                <select 
                  id="change_reason" 
                  value={formData.change_reason} 
                  onChange={e => setFormData({...formData, change_reason: e.target.value})}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Promotion">Promotion</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Reorganization">Reorganization</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Effective Date</Label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input type="date" required id="start_date" className="pl-9" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Confirm Change'}</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  )
}
