import { createClient } from '@/lib/supabase/client'
import { config } from '@/lib/config'
import { StorageError } from '@/lib/errors'
import { Result, success, failure } from '@/lib/utils/result'

/**
 * Domain Service for interacting with Document Storage.
 * Abstracts the Supabase Storage layer so the UI doesn't call it directly.
 */
export class DocumentStorageService {
  private get bucket() {
    return config.storage.documents.bucketName
  }

  /**
   * Uploads a document to the bucket.
   * Client-side only (uses supabase/client).
   */
  async uploadDocument(file: File, pathPrefix: string = 'general'): Promise<Result<{ path: string }>> {
    try {
      // Validate file size
      if (file.size > config.storage.documents.maxSizeBytes) {
        return failure(new StorageError(`File size exceeds the ${config.storage.documents.maxSizeBytes / 1024 / 1024}MB limit.`))
      }

      // Validate mime type
      if (!(config.storage.documents.allowedMimeTypes as readonly string[]).includes(file.type)) {
        return failure(new StorageError('File type not allowed for documents.'))
      }

      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const uniqueFileName = `${pathPrefix}/${Date.now()}-${crypto.randomUUID()}.${ext}`

      const { data, error } = await supabase.storage
        .from(this.bucket)
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw new StorageError(error.message)
      }

      return success({ path: data.path })
    } catch (error: any) {
      return failure(error instanceof StorageError ? error : new StorageError(error.message || 'Unknown storage error'))
    }
  }

  /**
   * Generates a signed URL for a private document
   */
  async getSignedUrl(filePath: string, expiresInSecs = 3600): Promise<Result<{ url: string }>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .createSignedUrl(filePath, expiresInSecs)

      if (error) {
        throw new StorageError(error.message)
      }

      return success({ url: data.signedUrl })
    } catch (error: any) {
      return failure(error instanceof StorageError ? error : new StorageError(error.message || 'Failed to generate signed url'))
    }
  }

  /**
   * Deletes a document from the bucket
   */
  async deleteDocument(filePath: string): Promise<Result<boolean>> {
    try {
      const supabase = createClient()
      const { error } = await supabase.storage
        .from(this.bucket)
        .remove([filePath])

      if (error) {
        throw new StorageError(error.message)
      }

      return success(true)
    } catch (error: any) {
      return failure(error instanceof StorageError ? error : new StorageError(error.message || 'Failed to delete file'))
    }
  }
}

export const documentStorageService = new DocumentStorageService()
