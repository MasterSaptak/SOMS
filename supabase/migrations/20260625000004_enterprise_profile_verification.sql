-- ==========================================================================
-- PHASE 4.1: ENTERPRISE PROFILE VERIFICATION & EMERGENCY CONTACTS
-- ==========================================================================

-- 1. VERIFICATION STATUS ENUM
DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. ADD VERIFICATION COLUMNS TO PROFESSIONAL TABLES
-- Employee Skills
ALTER TABLE employee_skills
ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Employee Certifications
ALTER TABLE employee_certifications
ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Employee Education
ALTER TABLE employee_education
ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Employee Experience
ALTER TABLE employee_experience
ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Employee Documents
ALTER TABLE employee_documents
ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- 3. EXPAND EMERGENCY CONTACTS
ALTER TABLE emergency_contacts
ADD COLUMN IF NOT EXISTS blood_group TEXT,
ADD COLUMN IF NOT EXISTS known_allergies TEXT,
ADD COLUMN IF NOT EXISTS medical_notes TEXT,
ADD COLUMN IF NOT EXISTS is_secondary BOOLEAN DEFAULT false;

-- 4. AUTO-RESET TRIGGERS ON RECORD EDIT
CREATE OR REPLACE FUNCTION reset_professional_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Only reset if the actual content of the record changed, not if it's just being verified
    IF (TG_OP = 'UPDATE') THEN
        IF (NEW.verification_status = OLD.verification_status AND 
            NEW.is_verified = OLD.is_verified) THEN
            
            -- Content was updated, so reset verification
            NEW.verification_status = 'pending'::verification_status;
            NEW.is_verified = false;
            NEW.verified_by = NULL;
            NEW.verified_at = NULL;
            -- Keep verification_notes as they might be useful history, or clear them? We will clear them.
            NEW.verification_notes = NULL;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to skills
DROP TRIGGER IF EXISTS trg_reset_verification_skills ON employee_skills;
CREATE TRIGGER trg_reset_verification_skills
    BEFORE UPDATE ON employee_skills
    FOR EACH ROW
    EXECUTE FUNCTION reset_professional_verification_status();

-- Attach trigger to certifications
DROP TRIGGER IF EXISTS trg_reset_verification_certifications ON employee_certifications;
CREATE TRIGGER trg_reset_verification_certifications
    BEFORE UPDATE ON employee_certifications
    FOR EACH ROW
    EXECUTE FUNCTION reset_professional_verification_status();

-- Attach trigger to education
DROP TRIGGER IF EXISTS trg_reset_verification_education ON employee_education;
CREATE TRIGGER trg_reset_verification_education
    BEFORE UPDATE ON employee_education
    FOR EACH ROW
    EXECUTE FUNCTION reset_professional_verification_status();

-- Attach trigger to experience
DROP TRIGGER IF EXISTS trg_reset_verification_experience ON employee_experience;
CREATE TRIGGER trg_reset_verification_experience
    BEFORE UPDATE ON employee_experience
    FOR EACH ROW
    EXECUTE FUNCTION reset_professional_verification_status();

-- Attach trigger to documents
DROP TRIGGER IF EXISTS trg_reset_verification_documents ON employee_documents;
CREATE TRIGGER trg_reset_verification_documents
    BEFORE UPDATE ON employee_documents
    FOR EACH ROW
    EXECUTE FUNCTION reset_professional_verification_status();
