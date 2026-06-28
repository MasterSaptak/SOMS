-- ==========================================================================
-- ENTERPRISE PROJECT SYSTEM
-- ==========================================================================

-- 1. Extend `projects` table
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS planning_date DATE,
    ADD COLUMN IF NOT EXISTS initiation_date DATE,
    ADD COLUMN IF NOT EXISTS actual_start_date DATE,
    ADD COLUMN IF NOT EXISTS completion_date DATE,
    
    ADD COLUMN IF NOT EXISTS estimated_budget NUMERIC(14,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS actual_cost NUMERIC(14,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'USD',
    
    ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'Low' 
        CHECK (risk_level IN ('Critical', 'High', 'Medium', 'Low')),
    
    ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium'
        CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    
    ADD COLUMN IF NOT EXISTS expected_outcome TEXT,
    ADD COLUMN IF NOT EXISTS actual_outcome TEXT,
    ADD COLUMN IF NOT EXISTS success_metrics TEXT;

-- Safely alter health_score constraint
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'projects'::regclass AND conname LIKE '%health_score%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE projects DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

ALTER TABLE projects
    ADD CONSTRAINT projects_health_score_check 
    CHECK (health_score IN ('On Track', 'At Risk', 'Critical', 'Warning', 'Delayed', 'Blocked', 'Completed'));

-- 2. Create `project_teams` table
CREATE TABLE IF NOT EXISTS project_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, team_id)
);

ALTER TABLE project_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_access_project_teams" ON project_teams FOR ALL USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- 3. Extend `project_members`
ALTER TABLE project_members
    ADD COLUMN IF NOT EXISTS allocation_percent INTEGER DEFAULT 100 CHECK (allocation_percent BETWEEN 0 AND 100),
    ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS left_at TIMESTAMPTZ;

-- 4. Create `project_milestones` table
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    completed_date DATE,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Delayed', 'Cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- In case project_milestones was previously created with different columns in older migration, add these IF NOT EXISTS
DO $$
BEGIN
    BEGIN
        ALTER TABLE project_milestones ADD COLUMN target_date DATE;
    EXCEPTION WHEN duplicate_column THEN END;
    
    BEGIN
        ALTER TABLE project_milestones ADD COLUMN completed_date DATE;
    EXCEPTION WHEN duplicate_column THEN END;

    -- Update existing status column if needed or rely on app level
END $$;

ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'project_milestones' AND policyname = 'org_access_project_milestones'
    ) THEN
        CREATE POLICY "org_access_project_milestones" ON project_milestones FOR ALL USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));
    END IF;
END $$;
