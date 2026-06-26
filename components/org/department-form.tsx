"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state';
// TODO: Fetch real data instead of mock data
import type { Department } from '@/lib/types'

interface DepartmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department?: Department
}

export function DepartmentForm({ open, onOpenChange, department }: DepartmentFormProps) {
  const isEdit = !!department

  const [form, setForm] = useState({
    name:     department?.name     ?? '',
    headId:   department?.headId   ?? '',
    parentId: department?.parentId ?? '',
  })

  const handleSave = () => {
    console.log('[DepartmentForm] Save:', { ...form, isEdit })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Department' : 'Add Department'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Department Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="dept-name">Department Name <span className="text-destructive">*</span></Label>
            <Input
              id="dept-name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Engineering, Product, Finance"
            />
          </div>

          {/* Head */}
          <div className="flex flex-col gap-2">
            <Label>Department Head</Label>
            <Select value={form.headId} onValueChange={v => setForm({ ...form, headId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select department head..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No head assigned</SelectItem>
                {([] as any[]).map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {(emp ? `${emp.firstName} ${emp.lastName}` : "Unknown")} — {emp.employeeCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Parent Department */}
          <div className="flex flex-col gap-2">
            <Label>Parent Department <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Select value={form.parentId} onValueChange={v => setForm({ ...form, parentId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="No parent (top-level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent (top-level)</SelectItem>
                {([] as any[])
                  .filter((d: any) => d.id !== department?.id)
                  .map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Use this to create sub-departments (e.g. &quot;Frontend&quot; under &quot;Engineering&quot;)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>
            {isEdit ? 'Save Changes' : 'Create Department'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
