-- ==========================================================================
-- PHASE 4.2: ENTERPRISE PROFILE IMPROVEMENTS (HISTORY, CATALOG, DOCUMENTS)
-- ==========================================================================

-- 1. DROP OLD TRIGGERS
-- The application service layer will handle verification state resets now, 
-- ensuring full control and accurate auditing.
DROP TRIGGER IF EXISTS trg_reset_verification_skills ON employee_skills;
DROP TRIGGER IF EXISTS trg_reset_verification_certifications ON employee_certifications;
DROP TRIGGER IF EXISTS trg_reset_verification_education ON employee_education;
DROP TRIGGER IF EXISTS trg_reset_verification_experience ON employee_experience;
DROP TRIGGER IF EXISTS trg_reset_verification_documents ON employee_documents;
DROP FUNCTION IF EXISTS reset_professional_verification_status();

-- 2. VERIFICATION HISTORY
CREATE TABLE IF NOT EXISTS employee_verification_history (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    entity_type       TEXT NOT NULL, -- e.g., 'skill', 'certification', 'education', 'experience'
    entity_id         UUID NOT NULL,
    old_status        TEXT,
    new_status        TEXT NOT NULL,
    performed_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who verified, rejected, or reset it
    performed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes             TEXT
);

ALTER TABLE employee_verification_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_employee_verification_history" ON employee_verification_history FOR ALL 
USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- 3. DOCUMENTS TABLE REDESIGN
-- Drop verification columns as documents are evidence, not verifiable entities
ALTER TABLE employee_documents
DROP COLUMN IF EXISTS verification_status,
DROP COLUMN IF EXISTS is_verified,
DROP COLUMN IF EXISTS verified_by,
DROP COLUMN IF EXISTS verified_at,
DROP COLUMN IF EXISTS verification_notes;

-- Ensure category and visibility exist
ALTER TABLE employee_documents
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'hr_only';

-- Map existing document_type to category if category is null
UPDATE employee_documents SET category = document_type WHERE category IS NULL;
ALTER TABLE employee_documents DROP COLUMN IF EXISTS document_type;

-- 4. SKILLS CATALOG UPGRADE
ALTER TABLE skills
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Normalize proficiency level column on employee_skills to ensure standard ENUM
-- We'll allow it as TEXT but check constraint could be added. 
-- Assuming existing CHECK constraint exists from 20260625000003_enterprise_hr_schema.sql
