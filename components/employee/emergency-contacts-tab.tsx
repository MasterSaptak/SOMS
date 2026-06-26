import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, HeartPulse } from 'lucide-react'
import { addEmergencyContactAction, deleteEmergencyContactAction } from '@/app/actions/employee.actions'

import { useRouter } from 'next/navigation'

export function EmergencyContactsTab({ employeeId, canEdit, initialData }: { employeeId: string, canEdit: boolean, initialData: any[] }) {
  const router = useRouter()
  const [contacts, setContacts] = useState<any[]>(initialData || [])
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    alternatePhone: '',
    address: '',
    bloodGroup: '',
    knownAllergies: '',
    medicalNotes: '',
    isPrimary: false,
    isSecondary: false
  })

  const handleAdd = async () => {
    if (!formData.name || !formData.phone || !formData.relationship) {
      alert('Name, Phone, and Relationship are required.')
      return
    }
    setIsSaving(true)
    try {
      const res = await addEmergencyContactAction({
        employeeId,
        ...formData
      })
      if (!res.success) throw new Error('Failed to add contact')
      
      setIsAdding(false)
      setFormData({ name: '', relationship: '', phone: '', email: '', alternatePhone: '', address: '', bloodGroup: '', knownAllergies: '', medicalNotes: '', isPrimary: false, isSecondary: false })
    } catch (e: any) {
      alert(`Error adding contact: ${e.message}`)
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return
    try {
      const res = await deleteEmergencyContactAction(employeeId, id)
      if (!res.success) throw new Error('Failed to delete contact')
      
      setContacts(contacts.filter(c => c.id !== id))
    } catch (e: any) {
      alert(`Error deleting contact: ${e.message}`)
    }
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-red-500" />
          Emergency Contacts
        </h3>
        {canEdit && !isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Contact
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-sm mb-4">Add New Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Name</Label>
              <Input className="mt-1 h-8" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <Label className="text-xs">Relationship</Label>
              <Input className="mt-1 h-8" value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})} />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input className="mt-1 h-8" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <Label className="text-xs">Alternate Phone (Optional)</Label>
              <Input className="mt-1 h-8" value={formData.alternatePhone} onChange={e => setFormData({...formData, alternatePhone: e.target.value})} />
            </div>
            <div>
              <Label className="text-xs">Email (Optional)</Label>
              <Input className="mt-1 h-8" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <Label className="text-xs">Address (Optional)</Label>
              <Input className="mt-1 h-8" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <div>
              <Label className="text-xs">Blood Group (Optional)</Label>
              <Input className="mt-1 h-8" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} placeholder="e.g. O+" />
            </div>
            <div>
              <Label className="text-xs">Known Allergies (Optional)</Label>
              <Input className="mt-1 h-8" value={formData.knownAllergies} onChange={e => setFormData({...formData, knownAllergies: e.target.value})} placeholder="e.g. Peanuts" />
            </div>
            <div className="col-span-full">
              <Label className="text-xs">Medical Notes (Optional)</Label>
              <Input className="mt-1 h-8" value={formData.medicalNotes} onChange={e => setFormData({...formData, medicalNotes: e.target.value})} />
            </div>
            <div className="col-span-full flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_primary" checked={formData.isPrimary} onChange={e => setFormData({...formData, isPrimary: e.target.checked})} className="rounded border-input" />
                <Label htmlFor="is_primary" className="text-xs">Set as Primary Contact</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_secondary" checked={formData.isSecondary} onChange={e => setFormData({...formData, isSecondary: e.target.checked})} className="rounded border-input" />
                <Label htmlFor="is_secondary" className="text-xs">Set as Secondary Contact</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={isSaving}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map(c => (
          <div key={c.id} className="border border-border/50 rounded-lg p-4 flex flex-col relative group">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{c.name}</span>
                {c.is_primary && <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20">Primary</Badge>}
              </div>
              {canEdit && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 hover:text-red-500" onClick={() => handleDelete(c.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
            <span className="text-xs text-muted-foreground mb-2">{c.relationship}</span>
            <div className="text-sm mt-1">
              <span className="font-medium">Phone:</span> {c.phone}
            </div>
            {c.alternate_phone && (
              <div className="text-sm">
                <span className="font-medium">Alt Phone:</span> {c.alternate_phone}
              </div>
            )}
            {c.email && (
              <div className="text-sm">
                <span className="font-medium">Email:</span> {c.email}
              </div>
            )}
            {c.address && (
              <div className="text-sm">
                <span className="font-medium">Address:</span> {c.address}
              </div>
            )}
            
            {(c.blood_group || c.known_allergies || c.medical_notes) && (
              <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-1 text-sm bg-muted/10 p-2 rounded">
                <span className="font-semibold text-xs text-muted-foreground uppercase">Medical Info</span>
                {c.blood_group && <div><span className="font-medium">Blood Group:</span> {c.blood_group}</div>}
                {c.known_allergies && <div><span className="font-medium">Allergies:</span> <span className="text-red-500/80">{c.known_allergies}</span></div>}
                {c.medical_notes && <div><span className="font-medium">Notes:</span> {c.medical_notes}</div>}
              </div>
            )}
          </div>
        ))}
        {contacts.length === 0 && !isAdding && (
          <div className="col-span-full py-8 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
            No emergency contacts found.
          </div>
        )}
      </div>
    </div>
  )
}
