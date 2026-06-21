import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentCategory = Database['public']['Tables']['document_categories']['Row']
export type DocumentVersion = Database['public']['Tables']['document_versions']['Row']

export async function fetchDocumentCategories() {
  const supabase = createClient()
  const { data, error } = await supabase.from('document_categories').select('*').order('name')
  if (error) throw error
  return data
}

export async function fetchDocuments(employeeId?: string) {
  const supabase = createClient()
  let query = supabase.from('documents').select('*, document_categories(name, slug)')
  
  if (employeeId) {
    query = query.eq('employee_id', employeeId)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function uploadDocument(file: File, categoryId: string, employeeId: string, uploaderId: string, status: string = 'pending') {
  const supabase = createClient()
  
  // 1. Upload to Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
  const filePath = `${employeeId}/${categoryId}/${fileName}`
  
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, { upsert: true })
    
  if (uploadError) throw uploadError

  // 2. Insert into DB
  const { data: docData, error: dbError } = await supabase.from('documents').insert({
    category_id: categoryId,
    employee_id: employeeId,
    uploader_id: uploaderId,
    title: file.name,
    file_path: filePath,
    file_type: file.type || 'application/octet-stream',
    file_size: file.size,
    status
  }).select().single()
  
  if (dbError) throw dbError

  // 3. Insert Version
  const { error: versionError } = await supabase.from('document_versions').insert({
    document_id: docData.id,
    version_number: 1,
    file_path: filePath,
    file_size: file.size,
    uploaded_by: uploaderId
  })
  
  if (versionError) throw versionError

  return docData
}

export async function getDocumentUrl(filePath: string) {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(filePath, 60 * 60) // 1 hour
  if (error) throw error
  return data.signedUrl
}

export async function deleteDocument(documentId: string, filePath: string) {
  const supabase = createClient()
  
  // 1. Delete from Storage
  const { error: storageError } = await supabase.storage.from('documents').remove([filePath])
  if (storageError) throw storageError
  
  // 2. Delete from DB (cascade should handle versions)
  const { error: dbError } = await supabase.from('documents').delete().eq('id', documentId)
  if (dbError) throw dbError
}
