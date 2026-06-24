import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, FileText, Download } from 'lucide-react'
import { addEmployeeDocumentAction, deleteEmployeeDocumentAction } from '@/app/actions/employee.actions'
import { useRouter } from 'next/navigation'

export function DocumentsTab({ employeeId, canEdit, initialData }: { employeeId: string, canEdit: boolean, initialData: any[] }) {
  const router = useRouter()
  const [documents, setDocuments] = useState<any[]>(initialData || [])
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    documentType: '',
    fileUrl: ''
  })

  const handleAdd = async () => {
    if (!formData.documentType || !formData.fileUrl) {
      alert('Document Type and File URL are required.')
      return
    }
    setIsSaving(true)
    try {
      const res = await addEmployeeDocumentAction({
        employeeId,
        documentType: formData.documentType,
        fileUrl: formData.fileUrl
      })
      if (!res.success) throw new Error('Failed to add document')
      
      setIsAdding(false)
      setFormData({ documentType: '', fileUrl: '' })
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
              <Label className="text-xs">Document Type *</Label>
              <Input className="mt-1 h-8" value={formData.documentType} onChange={e => setFormData({...formData, documentType: e.target.value})} placeholder="e.g. Resume, ID Card, Offer Letter" />
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
        {initialData?.map(d => (
          <div key={d.id} className="border border-border/50 rounded-lg p-4 flex flex-col justify-between group bg-background">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <span className="font-semibold block text-sm">{d.documentType}</span>
                  <span className="text-xs text-muted-foreground">{new Date(d.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
              {canEdit && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500" onClick={() => handleDelete(d.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-border/50">
              <a href={d.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 p-2 rounded-md">
                <Download className="w-3 h-3" /> View / Download
              </a>
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
