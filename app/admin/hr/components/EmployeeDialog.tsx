"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Building2, User, Mail, Briefcase, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createEmployeeAction } from '@/app/actions/hr.actions'

export function EmployeeDialog({ 
  organizationId,
  onClose,
  onSuccess
}: { 
  organizationId: string
  onClose: () => void
  onSuccess?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    employee_id_string: '',
    status: 'active'
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Default user_id generation for employees created manually by admin
    // If we wanted to invite them, we'd use auth admin api. 
    // Here we're just creating an employee record placeholder.
    // They won't be able to log in until invited, but they exist for HR purposes.
    const tempUserId = crypto.randomUUID()

    const result = await createEmployeeAction(organizationId, {
      ...formData,
      user_id: tempUserId,
    }, 'system') // In a real app, actorId comes from session

    setLoading(false)

    if (!result.success) {
      setError(result.error?.message || 'Failed to create employee')
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
            <h2 className="font-semibold text-lg">Add New Employee</h2>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input required id="full_name" className="pl-9" placeholder="John Doe" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input required type="email" id="email" className="pl-9" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" className="pl-9" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emp_id">Employee ID</Label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="emp_id" className="pl-9" placeholder="EMP-001" value={formData.employee_id_string} onChange={e => setFormData({...formData, employee_id_string: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <select 
                  id="status" 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="probation">Probation</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Employee'}</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  )
}
