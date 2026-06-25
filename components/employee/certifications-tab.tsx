import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Award, ExternalLink } from 'lucide-react'
import { addEmployeeCertificationAction, deleteEmployeeCertificationAction, verifyCertificationAction } from '@/app/actions/employee.actions'
import { VerificationBadge } from '@/components/profile/VerificationBadge'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

export function CertificationsTab({ employeeId, canEdit, isAdmin, initialData }: { employeeId: string, canEdit: boolean, isAdmin: boolean, initialData: any[] }) {
  const router = useRouter()
  const [certifications, setCertifications] = useState<any[]>(initialData || [])
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialUrl: ''
  })

  const handleAdd = async () => {
    if (!formData.name || !formData.issuer) {
      alert('Name and Issuer are required.')
      return
    }
    setIsSaving(true)
    try {
      const res = await addEmployeeCertificationAction({
        employeeId,
        name: formData.name,
        issuer: formData.issuer,
        issueDate: formData.issueDate || null,
        expiryDate: formData.expiryDate || null,
        credentialUrl: formData.credentialUrl || null
      })
      if (!res.success) throw new Error('Failed to add certification')
      
      setIsAdding(false)
      setFormData({ name: '', issuer: '', issueDate: '', expiryDate: '', credentialUrl: '' })
      router.refresh()
    } catch (e: any) {
      alert(`Error adding certification: ${e.message}`)
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return
    try {
      const res = await deleteEmployeeCertificationAction(employeeId, id)
      if (!res.success) throw new Error('Failed to delete certification')
      
      setCertifications(certifications.filter(c => c.id !== id))
      router.refresh()
    } catch (e: any) {
      alert(`Error deleting certification: ${e.message}`)
    }
  }

  const handleVerify = async (id: string, status: 'verified' | 'rejected') => {
    if (!isAdmin) return
    try {
      const res = await verifyCertificationAction(employeeId, id, status)
      if (!res.success) throw new Error(`Failed to mark as ${status}`)
      
      const updated = certifications.map(c => c.id === id ? { ...c, verificationStatus: status, isVerified: status === 'verified' } : c)
      setCertifications(updated)
      router.refresh()
    } catch (e: any) {
      alert(`Error verifying certification: ${e.message}`)
    }
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Certifications
        </h3>
        {canEdit && !isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Certification
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-sm mb-4">Add Certification</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Certification Name *</Label>
              <Input className="mt-1 h-8" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. AWS Certified Solutions Architect" />
            </div>
            <div>
              <Label className="text-xs">Issuing Organization *</Label>
              <Input className="mt-1 h-8" value={formData.issuer} onChange={e => setFormData({...formData, issuer: e.target.value})} placeholder="e.g. Amazon Web Services" />
            </div>
            <div>
              <Label className="text-xs">Issue Date</Label>
              <Input type="date" className="mt-1 h-8" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} />
            </div>
            <div>
              <Label className="text-xs">Expiry Date</Label>
              <Input type="date" className="mt-1 h-8" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
            </div>
            <div className="col-span-full">
              <Label className="text-xs">Credential URL</Label>
              <Input className="mt-1 h-8" value={formData.credentialUrl} onChange={e => setFormData({...formData, credentialUrl: e.target.value})} placeholder="https://..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={isSaving}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(certifications.length > 0 ? certifications : initialData)?.map(c => (
          <div key={c.id} className="border border-border/50 rounded-lg p-4 flex flex-col justify-between items-start group gap-3 relative">
            <div className="flex flex-col gap-1 w-full overflow-hidden">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{c.name}</span>
                  {c.expiryDate && new Date(c.expiryDate) < new Date() && (
                    <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 leading-none">Expired</Badge>
                  )}
                </div>
                <VerificationBadge status={c.verificationStatus || c.verification_status} notes={c.verificationNotes || c.verification_notes} showText={false} className="scale-90 origin-right" />
              </div>
              <span className="text-sm text-muted-foreground">{c.issuer}</span>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                {(c.issueDate || c.expiryDate) && (
                  <span>
                    {c.issueDate ? new Date(c.issueDate).toLocaleDateString() : 'N/A'} - {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'No Expiry'}
                  </span>
                )}
              </div>
              {c.credentialUrl && (
                <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline w-fit">
                  View Credential <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            
            <div className="flex items-center justify-between w-full mt-2 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                {isAdmin && (c.verificationStatus || c.verification_status) === 'pending' && (
                  <>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200" onClick={() => handleVerify(c.id, 'verified')}>
                      Verify
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs bg-red-50 text-red-700 hover:bg-red-100 border-red-200" onClick={() => handleVerify(c.id, 'rejected')}>
                      Reject
                    </Button>
                  </>
                )}
              </div>
              {canEdit && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(c.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
        {(!initialData || initialData.length === 0) && !isAdding && (
          <div className="col-span-full py-8 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
            No certifications found.
          </div>
        )}
      </div>
    </div>
  )
}
