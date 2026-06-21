-- ==========================================================================
-- SOMS Enterprise — Documents Schema
-- ==========================================================================

-- 1. Document Categories
CREATE TABLE IF NOT EXISTS document_categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_cat_slug ON document_categories(slug);

-- 2. Documents
CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id     UUID NOT NULL REFERENCES document_categories(id) ON DELETE RESTRICT,
  employee_id     UUID REFERENCES employees(id) ON DELETE CASCADE,
  uploader_id     UUID NOT NULL REFERENCES auth.users(id),
  title           TEXT NOT NULL,
  file_path       TEXT NOT NULL,
  file_type       TEXT NOT NULL,
  file_size       BIGINT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('verified', 'pending', 'expired', 'requires_update', 'rejected')),
  expires_at      TIMESTAMPTZ,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  current_version_id UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Document Versions
CREATE TABLE IF NOT EXISTS document_versions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL,
  file_path       TEXT NOT NULL,
  file_size       BIGINT NOT NULL,
  uploaded_by     UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Add foreign key to documents for current_version_id
ALTER TABLE documents
ADD CONSTRAINT fk_current_version FOREIGN KEY (current_version_id) REFERENCES document_versions(id) ON DELETE SET NULL;

-- 5. Insert default categories
INSERT INTO document_categories (name, slug, description) VALUES
  ('Resume / CV', 'resume', 'Employee resumes and curriculum vitae'),
  ('Offer Letter', 'offer_letter', 'Official offer letters'),
  ('PAN Card', 'pan', 'Permanent Account Number card'),
  ('Aadhaar Card', 'aadhaar', 'Aadhaar identification card'),
  ('Passport', 'passport', 'Passport pages'),
  ('Visa', 'visa', 'Visa and work permits'),
  ('Certificates', 'certificate', 'Educational and professional certificates'),
  ('Contracts', 'contract', 'Employment contracts and agreements'),
  ('NDA', 'nda', 'Non-disclosure agreements')
ON CONFLICT (slug) DO NOTHING;

-- 6. Document Permissions (RBAC Extension)
CREATE TABLE IF NOT EXISTS document_permissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  role            TEXT,
  employee_id     UUID REFERENCES employees(id) ON DELETE CASCADE,
  can_view        BOOLEAN NOT NULL DEFAULT TRUE,
  can_edit        BOOLEAN NOT NULL DEFAULT FALSE,
  can_download    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: RLS Policies for these tables were already defined in sprint-b.sql
