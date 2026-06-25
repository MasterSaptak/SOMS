-- ==========================================================================
-- PHASE 4: ENTERPRISE HR ARCHITECTURE
-- ==========================================================================

-- 1. EMPLOYEE SOFT DELETE & LIFECYCLE
DO $$ BEGIN
    CREATE TYPE employee_status AS ENUM ('pending', 'active', 'probation', 'on_leave', 'suspended', 'terminated', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE employees ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS status employee_status DEFAULT 'pending';

-- Migrate old data
UPDATE employees SET status = 'active' WHERE status = 'pending';
ALTER TABLE employees DROP COLUMN IF EXISTS employment_status;

-- 2. AUTO-CREATION TRIGGER UPDATE
-- We need to replace `handle_new_user` in auth.users to ONLY create profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee'::user_role)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the new trigger on organization_members
CREATE OR REPLACE FUNCTION public.auto_create_employee()
RETURNS TRIGGER AS $$
DECLARE
    v_email TEXT;
    v_full_name TEXT;
BEGIN
    SELECT email, raw_user_meta_data->>'full_name' 
    INTO v_email, v_full_name 
    FROM auth.users 
    WHERE id = NEW.user_id;
    
    INSERT INTO public.employees (
        user_id, 
        organization_id, 
        full_name, 
        email, 
        status
    )
    VALUES (
        NEW.user_id,
        NEW.organization_id,
        COALESCE(v_full_name, 'New Employee'),
        COALESCE(v_email, 'unknown@example.com'),
        'active'
    )
    ON CONFLICT (user_id) DO UPDATE 
    SET organization_id = EXCLUDED.organization_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to organization_members
DROP TRIGGER IF EXISTS on_org_member_created ON organization_members;
CREATE TRIGGER on_org_member_created
    AFTER INSERT ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_create_employee();

-- 3. NEW HR TABLES

-- Employee Teams (Many-to-Many)
CREATE TABLE IF NOT EXISTS employee_teams (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    team_id           UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    role_in_team      TEXT DEFAULT 'Member',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, team_id)
);

-- Employee Position History
CREATE TABLE IF NOT EXISTS employee_position_history (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    department_id     UUID REFERENCES departments(id) ON DELETE SET NULL,
    designation_id    UUID REFERENCES designations(id) ON DELETE SET NULL,
    title             TEXT NOT NULL,
    start_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date          DATE,
    change_reason     TEXT, -- Promotion, Transfer, Reorganization
    recorded_by       UUID REFERENCES auth.users(id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employee Documents
CREATE TABLE IF NOT EXISTS employee_documents (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    document_type     TEXT NOT NULL, -- Resume, Passport, Offer Letter, Contract, etc.
    file_url          TEXT NOT NULL,
    file_name         TEXT NOT NULL,
    uploaded_by       UUID REFERENCES auth.users(id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employee Skills
CREATE TABLE IF NOT EXISTS employee_skills (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    skill_name        TEXT NOT NULL,
    proficiency_level TEXT CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employee Certifications
CREATE TABLE IF NOT EXISTS employee_certifications (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    name              TEXT NOT NULL,
    issuing_authority TEXT NOT NULL,
    issue_date        DATE NOT NULL,
    expiry_date       DATE,
    credential_id     TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. RLS POLICIES
ALTER TABLE employee_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_position_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_employee_teams" ON employee_teams FOR ALL USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));
CREATE POLICY "org_employee_position_history" ON employee_position_history FOR ALL USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));
CREATE POLICY "org_employee_documents" ON employee_documents FOR ALL USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));
CREATE POLICY "org_employee_skills" ON employee_skills FOR ALL USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));
CREATE POLICY "org_employee_certifications" ON employee_certifications FOR ALL USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));
