-- 0. ENSURE CORE ROOT TABLES EXIST
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID,
    name TEXT NOT NULL,
    lead_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT,
    priority TEXT,
    assigned_to UUID,
    created_by UUID,
    deadline DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TIMESTAMPTZ NOT NULL,
    clock_out TIMESTAMPTZ,
    total_working_hours NUMERIC,
    is_late BOOLEAN,
    is_early_leave BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    updated_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. ADD MISSING ORGANIZATION_ID TO ROOT TABLES
ALTER TABLE teams ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE document_categories ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add new relationship columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS organization_member_id UUID REFERENCES organization_members(id) ON DELETE SET NULL;

-- 2. CREATE NEW JUNCTION TABLES FOR MANY-TO-MANY RELATIONSHIPS
CREATE TABLE IF NOT EXISTS team_members (
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (team_id, employee_id)
);

CREATE TABLE IF NOT EXISTS task_assignments (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, employee_id)
);

CREATE TABLE IF NOT EXISTS member_roles (
    member_id UUID REFERENCES organization_members(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (member_id, role_id)
);

-- Note: We are leaving the old columns (employees.team_id, tasks.assigned_to) 
-- temporarily to avoid breaking existing UI until Phase F cleanup.

-- 3. ENABLE RLS ON NEW TABLES
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_roles ENABLE ROW LEVEL SECURITY;

-- 4. RLS CERTIFICATION (APPLYING STRICT ISOLATION)

-- ROOT TABLES ISOLATION
CREATE OR REPLACE FUNCTION get_active_user_orgs()
RETURNS TABLE (organization_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT om.organization_id FROM organization_members om 
  WHERE om.user_id = auth.uid() AND om.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Employees
DROP POLICY IF EXISTS "Root Tenant Isolation" ON employees;
CREATE POLICY "Root Tenant Isolation" ON employees
FOR ALL USING (organization_id IN (SELECT get_active_user_orgs()));

-- Teams
DROP POLICY IF EXISTS "Root Tenant Isolation" ON teams;
CREATE POLICY "Root Tenant Isolation" ON teams
FOR ALL USING (organization_id IN (SELECT get_active_user_orgs()));

-- Projects
DROP POLICY IF EXISTS "Root Tenant Isolation" ON projects;
CREATE POLICY "Root Tenant Isolation" ON projects
FOR ALL USING (organization_id IN (SELECT get_active_user_orgs()));

-- Tasks
DROP POLICY IF EXISTS "Root Tenant Isolation" ON tasks;
CREATE POLICY "Root Tenant Isolation" ON tasks
FOR ALL USING (organization_id IN (SELECT get_active_user_orgs()));

-- CHILD TABLES ISOLATION (Join through parent)

-- Attendance (Child of Employees)
DROP POLICY IF EXISTS "Attendance Tenant Isolation" ON attendance;
CREATE POLICY "Attendance Tenant Isolation" ON attendance
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM employees e
    JOIN organization_members om ON e.organization_id = om.organization_id
    WHERE e.id = attendance.employee_id
    AND om.user_id = auth.uid()
    AND om.status = 'active'
  )
);

-- Task Updates (Child of Tasks)
DROP POLICY IF EXISTS "Task Updates Tenant Isolation" ON task_updates;
CREATE POLICY "Task Updates Tenant Isolation" ON task_updates
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN organization_members om ON t.organization_id = om.organization_id
    WHERE t.id = task_updates.task_id
    AND om.user_id = auth.uid()
    AND om.status = 'active'
  )
);

-- Team Members
DROP POLICY IF EXISTS "Team Members Isolation" ON team_members;
CREATE POLICY "Team Members Isolation" ON team_members
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM teams t
    JOIN organization_members om ON t.organization_id = om.organization_id
    WHERE t.id = team_members.team_id
    AND om.user_id = auth.uid()
    AND om.status = 'active'
  )
);

-- Task Assignments
DROP POLICY IF EXISTS "Task Assignments Isolation" ON task_assignments;
CREATE POLICY "Task Assignments Isolation" ON task_assignments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN organization_members om ON t.organization_id = om.organization_id
    WHERE t.id = task_assignments.task_id
    AND om.user_id = auth.uid()
    AND om.status = 'active'
  )
);
