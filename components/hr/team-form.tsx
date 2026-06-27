"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmployeePicker } from './employee-picker'
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'

export function TeamForm({ orgId, onSubmit, onCancel, branches = [], departments = [] }: any) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    team_type: 'Functional',
    status: 'Draft',
    branch_id: '',
    department_id: '',
    manager_employee_id: null,
    deputy_employee_id: null,
    max_members: '',
    color: '#3b82f6',
    icon: 'Briefcase'
  })

  const nextStep = () => setStep(s => Math.min(4, s + 1))
  const prevStep = () => setStep(s => Math.max(1, s - 1))

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      max_members: formData.max_members ? parseInt(formData.max_members) : null
    })
  }

  const StepIndicator = ({ current, target, label }: any) => (
    <div className={`flex flex-col items-center gap-2 ${current >= target ? 'text-primary' : 'text-muted-foreground opacity-50'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-semibold ${
        current > target ? 'bg-primary border-primary text-primary-foreground' :
        current === target ? 'border-primary text-primary' : 'border-muted-foreground'
      }`}>
        {current > target ? <CheckCircle2 size={16} /> : target}
      </div>
      <span className="text-[10px] uppercase tracking-wider font-semibold hidden sm:block">{label}</span>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border shadow-sm">
      <div className="p-6 border-b flex justify-between items-center bg-muted/20">
        <StepIndicator current={step} target={1} label="Basics" />
        <div className="flex-1 h-px bg-border mx-4"></div>
        <StepIndicator current={step} target={2} label="Structure" />
        <div className="flex-1 h-px bg-border mx-4"></div>
        <StepIndicator current={step} target={3} label="Leadership" />
        <div className="flex-1 h-px bg-border mx-4"></div>
        <StepIndicator current={step} target={4} label="Review" />
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <Label>Team Name *</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="e.g. Frontend Platform"
              />
            </div>
            <div className="space-y-2">
              <Label>Team Code</Label>
              <Input 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value})} 
                placeholder="Leave blank to auto-generate (e.g. DEV-FE)"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="What does this team do?"
                rows={4}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={formData.branch_id} onValueChange={v => setFormData({...formData, branch_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>
                  {branches.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={formData.department_id} onValueChange={v => setFormData({...formData, department_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments
                    .filter((d: any) => !formData.branch_id || d.branch_id === formData.branch_id)
                    .map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Team Type</Label>
                <Select value={formData.team_type} onValueChange={v => setFormData({...formData, team_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Functional">Functional</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                    <SelectItem value="Committee">Committee</SelectItem>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Max Members Capacity (Optional)</Label>
              <Input 
                type="number" 
                value={formData.max_members} 
                onChange={e => setFormData({...formData, max_members: e.target.value})} 
                placeholder="e.g. 10"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <Label>Team Lead / Manager</Label>
              <EmployeePicker 
                orgId={orgId} 
                value={formData.manager_employee_id}
                onChange={(id) => setFormData({...formData, manager_employee_id: id as any})}
              />
              <p className="text-xs text-muted-foreground mt-1">They will have management capabilities over this team.</p>
            </div>
            <div className="space-y-2">
              <Label>Deputy Lead (Optional)</Label>
              <EmployeePicker 
                orgId={orgId} 
                value={formData.deputy_employee_id}
                onChange={(id) => setFormData({...formData, deputy_employee_id: id as any})}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="rounded-lg bg-muted/30 p-4 border space-y-3">
              <h3 className="font-semibold">{formData.name || 'Unnamed Team'}</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span>{formData.team_type}</span>
                <span className="text-muted-foreground">Status:</span>
                <span>{formData.status}</span>
                <span className="text-muted-foreground">Capacity:</span>
                <span>{formData.max_members || 'Unlimited'}</span>
                <span className="text-muted-foreground">Code:</span>
                <span>{formData.code || 'Auto-generated'}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Once created, you can add members and assign projects directly from the Team Dashboard.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t flex justify-between bg-muted/10">
        <Button variant="ghost" onClick={step === 1 ? onCancel : prevStep}>
          {step === 1 ? 'Cancel' : <><ChevronLeft size={16} className="mr-2" /> Back</>}
        </Button>
        {step < 4 ? (
          <Button onClick={nextStep} disabled={step === 1 && !formData.name}>
            Next <ChevronRight size={16} className="ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            Create Team <CheckCircle2 size={16} className="ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
