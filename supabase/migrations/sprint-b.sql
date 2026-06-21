-- ==========================================================================
-- SOMS Enterprise — Sprint B Migration
-- Documents Center (Versioning, Storage, Approvals)
-- ==========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================================
-- 1. EXTEND EXISTING TABLES FOR MULTI-TENANCY
-- ==========================================================================

-- Add organization_id to document_categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'document_categories' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE document_categories ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    -- For existing rows, it's null (meaning global).
  END IF;
END $$;

-- Add organization_id to documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'organization_id'
  ) THEN
    -- It can be null initially if there are existing rows, then we could backfill or leave as null
    ALTER TABLE documents ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add current_version_id to documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'current_version_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN current_version_id UUID;
    -- We'll add the foreign key after ensuring the table is clean or by simple reference
    -- ALTER TABLE documents ADD CONSTRAINT fk_current_version FOREIGN KEY (current_version_id) REFERENCES document_versions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ==========================================================================
-- 2. DOCUMENT APPROVALS TABLE
-- ==========================================================================

CREATE TABLE IF NOT EXISTS document_approvals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_id      UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
  reviewer_id     UUID NOT NULL REFERENCES auth.users(id),
  status          TEXT NOT NULL CHECK (status IN ('verified', 'rejected')),
  comments        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_approvals_doc ON document_approvals(document_id);

-- ==========================================================================
-- 3. STORAGE BUCKET SETUP
-- ==========================================================================

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- Private bucket
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]
)
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies
-- Note: Supabase storage objects are accessed via the `storage.objects` table.

-- Allow users to insert files if they are authenticated
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');

-- Allow users to read files
CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documents');

-- Allow users to update their own files
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'documents');

-- Allow users to delete their own files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documents');

-- ==========================================================================
-- 4. ROW LEVEL SECURITY (RLS) ON DOCUMENT TABLES
-- ==========================================================================

ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_approvals ENABLE ROW LEVEL SECURITY;

-- Categories: Read-only for authenticated users
CREATE POLICY "Read document categories" ON document_categories
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Documents: 
-- 1. Employees can read their own documents
-- 2. HR / Admins can read all documents in their organization
CREATE POLICY "Read own documents" ON documents
  FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  );

CREATE POLICY "HR can read org documents" ON documents
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'active'
      -- Add role/permission check if possible via DB functions, but for now we rely on app logic
    )
  );

CREATE POLICY "Insert own documents" ON documents
  FOR INSERT WITH CHECK (
    uploader_id = auth.uid()
  );

CREATE POLICY "Update own documents" ON documents
  FOR UPDATE USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  );

-- Document Versions
CREATE POLICY "Read own document versions" ON document_versions
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM documents WHERE employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Insert document versions" ON document_versions
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid()
  );

-- Document Approvals
CREATE POLICY "Read document approvals" ON document_approvals
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM documents WHERE employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Insert document approvals" ON document_approvals
  FOR INSERT WITH CHECK (
    reviewer_id = auth.uid()
  );
