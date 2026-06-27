-- Sprint 3: Enterprise Team Engine Schema Updates

-- 1. Create team_member_roles lookup table
CREATE TABLE IF NOT EXISTS team_member_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., 'Lead', 'Deputy', 'Senior Member', 'Member', 'Observer'
    level INTEGER DEFAULT 0, -- For sorting (e.g. 100 for Lead, 50 for Deputy, 10 for Member)
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE team_member_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_member_roles_isolation" ON team_member_roles
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.user_id = auth.uid()
        AND om.organization_id = team_member_roles.organization_id
    )
);

-- 2. Update departments table
ALTER TABLE departments ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- 3. Update teams table
-- Rename lead_id to manager_employee_id if it exists, otherwise add it
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'lead_id') THEN
        ALTER TABLE teams RENAME COLUMN lead_id TO manager_employee_id;
    ELSE
        ALTER TABLE teams ADD COLUMN manager_employee_id UUID;
    END IF;
END $$;

ALTER TABLE teams ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_type TEXT DEFAULT 'Functional'; -- Functional, Project, Support, etc.
ALTER TABLE teams ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft'; -- Draft, Active, Archived
ALTER TABLE teams ADD COLUMN IF NOT EXISTS deputy_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS max_members INTEGER;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS icon TEXT;

-- Enforce foreign key for manager_employee_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'teams_manager_employee_id_fkey'
    ) THEN
        ALTER TABLE teams ADD CONSTRAINT teams_manager_employee_id_fkey FOREIGN KEY (manager_employee_id) REFERENCES employees(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Update team_members table
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES team_member_roles(id) ON DELETE SET NULL;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- Add partial unique index to enforce only one primary team per employee
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_primary 
ON team_members (employee_id) 
WHERE is_primary = true;
