"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

export function EmployeePicker({
  orgId,
  value,
  onChange,
  disabled = false,
  placeholder = "Select employee..."
}: {
  orgId: string
  value: string | null
  onChange: (id: string | null, employee: any) => void
  disabled?: boolean
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (open && employees.length === 0) {
      fetchEmployees()
    }
  }, [open, orgId])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, email, profile_photo, department')
        .eq('organization_id', orgId)
        .order('full_name')

      if (!error && data) {
        setEmployees(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const selectedEmployee = employees.find(e => e.id === value)

  const filtered = employees.filter(e => 
    e.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    e.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between h-12"
        >
          {selectedEmployee ? (
            <div className="flex items-center gap-2 truncate">
              <Avatar className="w-6 h-6">
                <AvatarImage src={selectedEmployee.profile_photo || ''} />
                <AvatarFallback>{selectedEmployee.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start truncate text-sm">
                <span className="font-medium truncate">{selectedEmployee.full_name}</span>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground font-normal">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No employees found.</div>
          ) : (
            filtered.map((employee) => (
              <div
                key={employee.id}
                className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                  value === employee.id ? 'bg-accent/50' : ''
                }`}
                onClick={() => {
                  onChange(employee.id === value ? null : employee.id, employee)
                  setOpen(false)
                }}
              >
                <Avatar className="w-8 h-8 mr-3">
                  <AvatarImage src={employee.profile_photo || ''} />
                  <AvatarFallback>{employee.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium truncate">{employee.full_name}</span>
                  <span className="text-xs text-muted-foreground truncate">{employee.email}</span>
                </div>
                {value === employee.id && (
                  <Check className="ml-auto h-4 w-4 text-primary" />
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
