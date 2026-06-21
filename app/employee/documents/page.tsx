"use client"

import React, { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  FileText, Upload, Eye, Download, Trash2, Search, FolderOpen,
  FileCheck, Clock, AlertCircle, Shield, Plus, File, Image, FileType,
} from 'lucide-react'

import { useAuthStore } from '@/store/use-auth-store'
import { fetchDocuments, fetchDocumentCategories, uploadDocument, getDocumentUrl } from '@/lib/api/documents'
import { useEffect } from 'react'

type DocCategory = 'resume' | 'offer_letter' | 'pan' | 'aadhaar' | 'passport' | 'visa' | 'certificate' | 'contract' | 'nda' | string

interface Document {
  id: string
  name: string
  category: DocCategory
  fileType: string
  fileSize: string
  uploadedAt: string
  expiresAt: string | null
  status: 'verified' | 'pending' | 'expired' | 'requires_update'
  version: number
}

const DOC_CATEGORIES: Record<DocCategory, { label: string; icon: React.ReactNode; color: string }> = {
  resume: { label: 'Resume / CV', icon: <FileText className="w-4 h-4" />, color: 'text-blue-500 bg-blue-500/10' },
  offer_letter: { label: 'Offer Letter', icon: <FileCheck className="w-4 h-4" />, color: 'text-emerald-500 bg-emerald-500/10' },
  pan: { label: 'PAN Card', icon: <FileType className="w-4 h-4" />, color: 'text-amber-500 bg-amber-500/10' },
  aadhaar: { label: 'Aadhaar Card', icon: <Shield className="w-4 h-4" />, color: 'text-purple-500 bg-purple-500/10' },
  passport: { label: 'Passport', icon: <FileType className="w-4 h-4" />, color: 'text-red-500 bg-red-500/10' },
  visa: { label: 'Visa', icon: <FileType className="w-4 h-4" />, color: 'text-cyan-500 bg-cyan-500/10' },
  certificate: { label: 'Certificates', icon: <FileCheck className="w-4 h-4" />, color: 'text-yellow-500 bg-yellow-500/10' },
  contract: { label: 'Contracts', icon: <File className="w-4 h-4" />, color: 'text-orange-500 bg-orange-500/10' },
  nda: { label: 'NDA', icon: <Shield className="w-4 h-4" />, color: 'text-pink-500 bg-pink-500/10' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  verified: { label: 'Verified', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  pending: { label: 'Pending Review', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  expired: { label: 'Expired', color: 'bg-red-500/10 text-red-600 border-red-200' },
  requires_update: { label: 'Update Required', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
}

const MOCK_DOCUMENTS: Document[] = [
  { id: 'doc1', name: 'Resume_JohnDoe_2025.pdf', category: 'resume', fileType: 'PDF', fileSize: '245 KB', uploadedAt: '2025-03-15', expiresAt: null, status: 'verified', version: 2 },
  { id: 'doc2', name: 'OfferLetter_SOMS_2025.pdf', category: 'offer_letter', fileType: 'PDF', fileSize: '180 KB', uploadedAt: '2025-03-01', expiresAt: null, status: 'verified', version: 1 },
  { id: 'doc3', name: 'PAN_Card.jpg', category: 'pan', fileType: 'Image', fileSize: '1.2 MB', uploadedAt: '2025-03-16', expiresAt: null, status: 'verified', version: 1 },
  { id: 'doc4', name: 'Aadhaar_Card.pdf', category: 'aadhaar', fileType: 'PDF', fileSize: '890 KB', uploadedAt: '2025-03-16', expiresAt: null, status: 'verified', version: 1 },
  { id: 'doc5', name: 'Passport.pdf', category: 'passport', fileType: 'PDF', fileSize: '2.1 MB', uploadedAt: '2025-04-01', expiresAt: '2030-12-31', status: 'verified', version: 1 },
  { id: 'doc6', name: 'AWS_Certification.pdf', category: 'certificate', fileType: 'PDF', fileSize: '320 KB', uploadedAt: '2025-08-15', expiresAt: '2028-08-15', status: 'verified', version: 1 },
  { id: 'doc7', name: 'Employment_Contract.pdf', category: 'contract', fileType: 'PDF', fileSize: '450 KB', uploadedAt: '2025-03-01', expiresAt: null, status: 'verified', version: 1 },
  { id: 'doc8', name: 'NDA_Signed.pdf', category: 'nda', fileType: 'PDF', fileSize: '120 KB', uploadedAt: '2025-03-01', expiresAt: null, status: 'verified', version: 1 },
]

export default function DocumentsPage() {
  const { employee, user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadData() {
      if (!employee?.id) return
      try {
        const [docsData, catsData] = await Promise.all([
          fetchDocuments(employee.id),
          fetchDocumentCategories()
        ])
        setDocuments(docsData || [])
        setCategories(catsData || [])
      } catch (err) {
        console.error("Failed to load documents", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [employee?.id])

  const handleFileUpload = async (file: File) => {
    if (!employee?.id || !user?.id) return
    if (!categories.length) return // Need categories to upload
    
    // For now, default to the first category if none selected or 'all' is selected
    const categoryId = selectedCategory === 'all' ? categories[0].id : selectedCategory
    
    setIsUploading(true)
    try {
      await uploadDocument(file, categoryId, employee.id, user.id)
      // Refresh documents
      const docsData = await fetchDocuments(employee.id)
      setDocuments(docsData || [])
    } catch (err) {
      console.error("Upload failed", err)
    } finally {
      setIsUploading(false)
    }
  }

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory !== 'all' && doc.category_id !== selectedCategory) return false
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const categoryCounts = categories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat.id] = documents.filter((d) => d.category_id === cat.id).length
    return acc
  }, {})

  return (
    <motion.div
      className="flex flex-col gap-6 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1">Manage your personal and employment documents</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
        <input 
          ref={fileInputRef} 
          type="file" 
          className="hidden" 
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" 
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileUpload(e.target.files[0])
              // Reset value so same file can be uploaded again if needed
              e.target.value = ''
            }
          }}
        />
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { 
          e.preventDefault(); 
          setIsDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0])
          }
        }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragOver
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border hover:border-primary/30'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragOver ? 'text-primary' : 'text-muted-foreground/40'}`} />
        <p className="text-sm text-muted-foreground">
          {isUploading ? (
            <span className="font-medium text-foreground">Uploading...</span>
          ) : (
            <><span className="font-medium text-foreground">Drag & drop files here</span> or click to browse</>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                selectedCategory === 'all' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                All Documents
              </div>
              <Badge variant="secondary" className="text-[10px]">{MOCK_DOCUMENTS.length}</Badge>
            </button>
            {categories.map((cat) => {
              // Try to map to local icons if slug matches, otherwise default
              const config = DOC_CATEGORIES[cat.slug as DocCategory] || DOC_CATEGORIES['certificate']
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    selectedCategory === cat.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {config.icon}
                    {cat.name}
                  </div>
                  {categoryCounts[cat.id] > 0 && (
                    <Badge variant="secondary" className="text-[10px]">{categoryCounts[cat.id]}</Badge>
                  )}
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Document Grid */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDocs.map((doc) => {
              const catSlug = doc.document_categories?.slug as DocCategory
              const catConfig = DOC_CATEGORIES[catSlug] || DOC_CATEGORIES['certificate']
              const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG['pending']
              
              const sizeInKB = Math.round(doc.file_size / 1024)
              const sizeDisplay = sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="hover:shadow-md transition-shadow group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${catConfig.color}`}>
                          {doc.file_type.includes('image') ? <Image className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{doc.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {doc.document_categories?.name || 'Document'} • {sizeDisplay} • v1
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={`text-[10px] ${statusConfig.color}`}>
                              {statusConfig.label}
                            </Badge>
                            {doc.expires_at && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Expires {new Date(doc.expires_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={async () => {
                              try {
                                const url = await getDocumentUrl(doc.file_path)
                                window.open(url, '_blank')
                              } catch(e) { console.error(e) }
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" 
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {filteredDocs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No documents found</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
