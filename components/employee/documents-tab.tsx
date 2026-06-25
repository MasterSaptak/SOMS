import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, FileText, Download, Eye, EyeOff } from 'lucide-react'
import { addEmployeeDocumentAction, deleteEmployeeDocumentAction } from '@/app/actions/employee.actions'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/use-auth-store'

export function DocumentsTab({ employeeId, canEdit, isAdmin, initialData }: { employeeId: string, canEdit: boolean, isAdmin: boolean, initialData: any[] }) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [documents, setDocuments] = useState<any[]>(initialData || [])
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    category: '',
    visibility: 'hr_only',
    fileUrl: '',
    fileName: ''
  })

  const handleAdd = async () => {
    if (!formData.category || !formData.fileUrl) {
      alert('Category and File URL are required.')
      return
    }
    setIsSaving(true)
    try {
      const res = await addEmployeeDocumentAction({
        employeeId,
        category: formData.category,
        visibility: formData.visibility,
        fileUrl: formData.fileUrl,
        fileName: formData.fileName || 'document',
        uploadedBy: user?.id
      })
      if (!res.success) throw new Error('Failed to add document')
      
      setIsAdding(false)
      setFormData({ category: '', visibility: 'hr_only', fileUrl: '', fileName: '' })
      router.refresh()
    } catch (e: any) {
      alert(`Error adding document: ${e.message}`)
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    try {
      const res = await deleteEmployeeDocumentAction(employeeId, id)
      if (!res.success) throw new Error('Failed to delete document')
      
      setDocuments(documents.filter(d => d.id !== id))
      router.refresh()
    } catch (e: any) {
      alert(`Error deleting document: ${e.message}`)
    }
  }



  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Documents
        </h3>
        {canEdit && !isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Document
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-sm mb-4">Add Document</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Category *</Label>
              <select 
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select Category</option>
                <option value="Resume/CV">Resume/CV</option>
                <option value="Government ID">Government ID</option>
                <option value="Passport">Passport</option>
                <option value="Offer Letter">Offer Letter</option>
                <option value="Contract">Contract</option>
                <option value="Tax Form">Tax Form</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Visibility</Label>
              <select 
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                value={formData.visibility} 
                onChange={e => setFormData({...formData, visibility: e.target.value})}
              >
                <option value="hr_only">HR & Admin Only</option>
                <option value="employee">Employee Visible</option>
                <option value="public">Public (Everyone)</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">File Name (Optional)</Label>
              <Input className="mt-1 h-8" value={formData.fileName} onChange={e => setFormData({...formData, fileName: e.target.value})} placeholder="e.g. John Doe Resume 2026" />
            </div>
            <div>
              <Label className="text-xs">File URL *</Label>
              <Input className="mt-1 h-8" value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} placeholder="https://..." />
              <p className="text-[10px] text-muted-foreground mt-1">Direct upload coming soon. Please paste a valid URL for now.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={isSaving}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(documents.length > 0 ? documents : initialData)?.map(d => (
          <div key={d.id} className="border border-border/50 rounded-lg p-4 flex flex-col justify-between group bg-background relative">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 overflow-hidden">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0 mt-1">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex flex-col gap-1 items-start mb-1">
                    <span className="font-semibold text-sm truncate w-full" title={d.category}>{d.category}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${d.visibility === 'hr_only' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                      {d.visibility === 'hr_only' ? 'HR Only' : 'Visible'}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block truncate">{d.fileName || d.category}</span>
                  <span className="text-[10px] text-muted-foreground block">{new Date(d.uploadedAt || d.uploaded_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <a href={d.fileUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 h-8 rounded-md">
                  <Download className="w-3 h-3" /> View / Download
                </a>
                {canEdit && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(d.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {(!initialData || initialData.length === 0) && !isAdding && (
          <div className="col-span-full py-8 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
            No documents found.
          </div>
        )}
      </div>
    </div>
  )
}
