import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state';
// TODO: Fetch real data instead of mock data

interface AddEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddEmployeeDialog({ open, onOpenChange }: AddEmployeeDialogProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    designationId: '',
    workLocationId: '',
    managerId: '',
    employmentType: 'full_time',
    joinDate: '',
    noticePeriodDays: '30'
  })

  const updateForm = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleNext = () => setStep(s => Math.min(s + 1, 3))
  const handleBack = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = () => {
    console.log('[AddEmployeeDialog] Submitted:', formData)
    // Show success state briefly then close
    onOpenChange(false)
    setStep(1)
    setFormData({
      firstName: '', lastName: '', email: '', phone: '',
      departmentId: '', designationId: '', workLocationId: '', managerId: '',
      employmentType: 'full_time', joinDate: '', noticePeriodDays: '30'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map(s => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                  ${step === s ? 'bg-primary text-primary-foreground' : step > s ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-1 transition-colors ${step > s ? 'bg-primary/50' : 'bg-muted'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={formData.firstName} onChange={e => updateForm('firstName', e.target.value)} placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={formData.lastName} onChange={e => updateForm('lastName', e.target.value)} placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} placeholder="john.doe@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+1 234 567 890" />
            </div>
          </div>
        )}

        {/* Step 2: Org Assignment */}
        {step === 2 && (
          <div className="flex flex-col gap-4 py-2">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={formData.departmentId} onValueChange={v => updateForm('departmentId', v)}>
                <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                <SelectContent>
                  {([] as any[]).map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Select value={formData.designationId} onValueChange={v => updateForm('designationId', v)}>
                <SelectTrigger><SelectValue placeholder="Select Designation" /></SelectTrigger>
                <SelectContent>
                  {([] as any[]).map(d => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Work Location</Label>
              <Select value={formData.workLocationId} onValueChange={v => updateForm('workLocationId', v)}>
                <SelectTrigger><SelectValue placeholder="Select Location" /></SelectTrigger>
                <SelectContent>
                  {([] as any[]).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reports To (Manager)</Label>
              <Select value={formData.managerId} onValueChange={v => updateForm('managerId', v)}>
                <SelectTrigger><SelectValue placeholder="Select Manager" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Manager</SelectItem>
                  {([] as any[]).map(e => <SelectItem key={e.id} value={e.id}>{(e ? `${e.firstName} ${e.lastName}` : "Unknown")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 3: Employment Details */}
        {step === 3 && (
          <div className="flex flex-col gap-4 py-2">
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select value={formData.employmentType} onValueChange={v => updateForm('employmentType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full-Time</SelectItem>
                  <SelectItem value="part_time">Part-Time</SelectItem>
                  <SelectItem value="contract">Contractor</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Join Date</Label>
              <Input type="date" value={formData.joinDate} onChange={e => updateForm('joinDate', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notice Period (Days)</Label>
              <Input type="number" value={formData.noticePeriodDays} onChange={e => updateForm('noticePeriodDays', e.target.value)} />
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          {step > 1 && <Button variant="outline" onClick={handleBack}>Back</Button>}
          {step < 3 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit}>Complete</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
