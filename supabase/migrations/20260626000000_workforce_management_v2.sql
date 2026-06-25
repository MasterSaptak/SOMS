-- ==========================================================================
-- SOMS Enterprise Workforce Management — Schema Upgrade
-- Migration: 20260626000000_workforce_management_v2.sql
-- 
-- This migration upgrades the SOMS database from the basic HR schema
-- to a full ERP-grade Workforce Management architecture.
--
-- It is SAFE to run multiple times (all statements use IF NOT EXISTS / IF EXISTS).
-- ==========================================================================

-- ==========================================================================
-- 0. PREREQUISITES
-- ==========================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================================
-- 1. BRANCHES (Organization -> Branch -> Department hierarchy)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS branches (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    code            TEXT,
    address         TEXT,
    city            TEXT,
    state           TEXT,
    country         TEXT,
    timezone        TEXT DEFAULT 'Asia/Kolkata',
    is_headquarters BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_branches" ON branches;
CREATE POLICY "service_role_branches" ON branches FOR ALL USING (true);

-- ==========================================================================
-- 2. COST CENTERS
-- ==========================================================================
CREATE TABLE IF NOT EXISTS cost_centers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    code            TEXT,
    description     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_cost_centers" ON cost_centers;
CREATE POLICY "service_role_cost_centers" ON cost_centers FOR ALL USING (true);

-- ==========================================================================
-- 3. DESIGNATIONS (Job Titles — missing from live DB)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS designations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    level           INTEGER NOT NULL DEFAULT 1,
    description     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_designations" ON designations;
CREATE POLICY "service_role_designations" ON designations FOR ALL USING (true);

-- ==========================================================================
-- 4. WORK LOCATIONS (missing from live DB)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS work_locations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id       UUID REFERENCES branches(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    address         TEXT,
    timezone        TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE work_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_work_locations" ON work_locations;
CREATE POLICY "service_role_work_locations" ON work_locations FOR ALL USING (true);

-- ==========================================================================
-- 5. ADD BRANCH_ID TO DEPARTMENTS (Department belongs to a Branch)
-- ==========================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'branch_id') THEN
    ALTER TABLE departments ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'description') THEN
    ALTER TABLE departments ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'is_active') THEN
    ALTER TABLE departments ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'cost_center_id') THEN
    ALTER TABLE departments ADD COLUMN cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ==========================================================================
-- 6. TEAMS (missing from live DB — owned by departments)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS teams (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    description     TEXT,
    lead_id         UUID,  -- Will reference employees(id), added as FK below
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_teams" ON teams;
CREATE POLICY "service_role_teams" ON teams FOR ALL USING (true);

-- ==========================================================================
-- 7. EXTEND EMPLOYEES TABLE
-- ==========================================================================
DO $$ BEGIN
  -- Reporting hierarchy
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'reports_to_employee_id') THEN
    ALTER TABLE employees ADD COLUMN reports_to_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL;
  END IF;

  -- Employment type (Permanent, Contract, Intern, Freelancer, Consultant, Vendor, Probation)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'employment_type') THEN
    ALTER TABLE employees ADD COLUMN employment_type TEXT DEFAULT 'permanent';
  END IF;

  -- Lifecycle status (replaces simple active/inactive)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'lifecycle_status') THEN
    ALTER TABLE employees ADD COLUMN lifecycle_status TEXT DEFAULT 'active';
  END IF;

  -- Branch
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'branch_id') THEN
    ALTER TABLE employees ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
  END IF;

  -- Department (relational FK — already exists for some deployments)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'department_id') THEN
    ALTER TABLE employees ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
  END IF;

  -- Designation (relational FK)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'designation_id') THEN
    ALTER TABLE employees ADD COLUMN designation_id UUID REFERENCES designations(id) ON DELETE SET NULL;
  END IF;

  -- Team (primary team for quick access — employee can be in multiple teams via employee_team_members)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'team_id') THEN
    ALTER TABLE employees ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
  END IF;

  -- Work location
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'work_location_id') THEN
    ALTER TABLE employees ADD COLUMN work_location_id UUID REFERENCES work_locations(id) ON DELETE SET NULL;
  END IF;

  -- Manager (legacy, prefer reports_to_employee_id)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'manager_id') THEN
    ALTER TABLE employees ADD COLUMN manager_id UUID REFERENCES employees(id) ON DELETE SET NULL;
  END IF;

  -- Cost center
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'cost_center_id') THEN
    ALTER TABLE employees ADD COLUMN cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ==========================================================================
-- 8. EMPLOYEE TEAM MEMBERS (Many-to-Many)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS employee_team_members (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    role_in_team    TEXT DEFAULT 'Member',
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, team_id)
);

ALTER TABLE employee_team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_employee_team_members" ON employee_team_members;
CREATE POLICY "service_role_employee_team_members" ON employee_team_members FOR ALL USING (true);

-- ==========================================================================
-- 9. EMPLOYEE POSITION HISTORY
-- ==========================================================================
CREATE TABLE IF NOT EXISTS employee_position_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
    designation_id  UUID REFERENCES designations(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date        DATE,
    change_reason   TEXT,
    recorded_by     UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE employee_position_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_employee_position_history" ON employee_position_history;
CREATE POLICY "service_role_employee_position_history" ON employee_position_history FOR ALL USING (true);

-- ==========================================================================
-- 10. EMPLOYEE PREFERENCES
-- ==========================================================================
CREATE TABLE IF NOT EXISTS employee_preferences (
    employee_id         UUID PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
    theme               TEXT DEFAULT 'system',
    language            TEXT DEFAULT 'en',
    timezone            TEXT,
    dashboard_widgets   JSONB DEFAULT '[]'::jsonb,
    notification_settings JSONB DEFAULT '{}'::jsonb,
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE employee_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_employee_preferences" ON employee_preferences;
CREATE POLICY "service_role_employee_preferences" ON employee_preferences FOR ALL USING (true);

-- Initialize preferences for existing employees
INSERT INTO employee_preferences (employee_id)
SELECT id FROM employees
ON CONFLICT (employee_id) DO NOTHING;

-- ==========================================================================
-- 11. EMPLOYEE AUDIT LOGS
-- ==========================================================================
CREATE TABLE IF NOT EXISTS employee_audit_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id     UUID REFERENCES employees(id) ON DELETE SET NULL,
    actor_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,  -- assigned, transferred, promoted, role_changed, department_changed, manager_changed, deleted, status_changed, invited, etc.
    entity_type     TEXT,           -- employee, team, department, project, etc.
    entity_id       UUID,
    old_value       JSONB,
    new_value       JSONB,
    description     TEXT,
    ip_address      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE employee_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_employee_audit_logs" ON employee_audit_logs;
CREATE POLICY "service_role_employee_audit_logs" ON employee_audit_logs FOR ALL USING (true);

-- ==========================================================================
-- 12. INDEXES FOR PERFORMANCE
-- ==========================================================================
CREATE INDEX IF NOT EXISTS idx_employees_org ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_reports_to ON employees(reports_to_employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_designation ON employees(designation_id);
CREATE INDEX IF NOT EXISTS idx_employees_branch ON employees(branch_id);
CREATE INDEX IF NOT EXISTS idx_employees_lifecycle ON employees(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_employees_employment_type ON employees(employment_type);
CREATE INDEX IF NOT EXISTS idx_departments_org ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_branch ON departments(branch_id);
CREATE INDEX IF NOT EXISTS idx_teams_org ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_dept ON teams(department_id);
CREATE INDEX IF NOT EXISTS idx_branches_org ON branches(organization_id);
CREATE INDEX IF NOT EXISTS idx_designations_org ON designations(organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_team_members_emp ON employee_team_members(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_team_members_team ON employee_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_project_members_emp ON project_members(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_members_proj ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_emp ON employee_audit_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON employee_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON employee_audit_logs(created_at);

-- ==========================================================================
-- MIGRATION COMPLETE
-- ==========================================================================
