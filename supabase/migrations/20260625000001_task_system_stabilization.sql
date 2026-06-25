-- ==========================================================================
-- SPRINT A & B: TASK SYSTEM STABILIZATION & AUDIT TRIGGERS
-- ==========================================================================

-- 1. SCHEMA UPDATES: Soft Delete & Concurrency Locking
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- 2. AUDIT LOGGING INFRASTRUCTURE (Sprint B)
-- We use a generic audit table and trigger function to track changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_table_record 
ON audit_logs(organization_id, table_name, record_id);

CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
    user_id UUID;
BEGIN
    -- Try to extract organization_id from NEW or OLD record
    IF TG_OP = 'DELETE' THEN
        org_id := OLD.organization_id;
    ELSE
        org_id := NEW.organization_id;
    END IF;

    -- Default user_id from auth.uid() if in supabase context
    user_id := auth.uid();

    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (organization_id, table_name, record_id, action, new_data, changed_by)
        VALUES (org_id, TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW)::jsonb, user_id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only log if row actually changed (excluding updated_at/version changes if they are the only changes, but we keep it simple here)
        IF row_to_json(OLD)::jsonb IS DISTINCT FROM row_to_json(NEW)::jsonb THEN
            INSERT INTO audit_logs (organization_id, table_name, record_id, action, old_data, new_data, changed_by)
            VALUES (org_id, TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, user_id);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (organization_id, table_name, record_id, action, old_data, changed_by)
        VALUES (org_id, TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD)::jsonb, user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to target tables
DROP TRIGGER IF EXISTS audit_tasks_trigger ON tasks;
CREATE TRIGGER audit_tasks_trigger
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS audit_task_assignments_trigger ON task_assignments;
CREATE TRIGGER audit_task_assignments_trigger
AFTER INSERT OR UPDATE OR DELETE ON task_assignments
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS audit_projects_trigger ON projects;
CREATE TRIGGER audit_projects_trigger
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS audit_project_members_trigger ON project_members;
CREATE TRIGGER audit_project_members_trigger
AFTER INSERT OR UPDATE OR DELETE ON project_members
FOR EACH ROW EXECUTE FUNCTION process_audit_log();


-- 3. ROLE-BASED ACCESS CONTROL (RBAC) RLS POLICIES FOR TASKS (Sprint A)
-- Drop existing blanket policies
DROP POLICY IF EXISTS "org_access_tasks" ON tasks;

-- Helper functions for Role checking
CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM employees 
    WHERE user_id = auth.uid() 
      AND organization_id = org_id 
      AND role IN ('Super Admin', 'Admin')
      AND status = 'Active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_org_manager(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM employees 
    WHERE user_id = auth.uid() 
      AND organization_id = org_id 
      AND role = 'Manager'
      AND status = 'Active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_task_assignee_or_creator(t_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tasks t
    LEFT JOIN task_assignments ta ON t.id = ta.task_id
    WHERE t.id = t_id
      AND (
        t.created_by = auth.uid() 
        OR 
        ta.employee_id = (SELECT id FROM employees WHERE user_id = auth.uid() AND organization_id = t.organization_id)
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy 1: Admins get full read/write to everything in org
CREATE POLICY "admin_all_tasks" ON tasks
FOR ALL USING (is_org_admin(organization_id));

-- Policy 2: Managers get full read/write to everything in org (or could scope to department later)
CREATE POLICY "manager_all_tasks" ON tasks
FOR ALL USING (is_org_manager(organization_id));

-- Policy 3: Employees can read all tasks in their org (Visibility)
CREATE POLICY "employee_read_tasks" ON tasks
FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);

-- Policy 4: Employees can UPDATE tasks they are assigned to or created
CREATE POLICY "employee_update_tasks" ON tasks
FOR UPDATE USING (
  organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
  AND is_task_assignee_or_creator(id)
) WITH CHECK (
  organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
  AND is_task_assignee_or_creator(id)
);

-- Policy 5: Employees can INSERT tasks in their org
CREATE POLICY "employee_insert_tasks" ON tasks
FOR INSERT WITH CHECK (
  organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);

-- Note: Employees CANNOT DELETE tasks since there is no DELETE policy for them.

-- RLS for task_assignments
DROP POLICY IF EXISTS "org_access_task_assignments" ON task_assignments;

CREATE POLICY "admin_all_assignments" ON task_assignments
FOR ALL USING (is_org_admin(organization_id));

CREATE POLICY "manager_all_assignments" ON task_assignments
FOR ALL USING (is_org_manager(organization_id));

CREATE POLICY "employee_read_assignments" ON task_assignments
FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);

-- Employees can assign/unassign themselves or if they created the task
CREATE POLICY "employee_manage_assignments" ON task_assignments
FOR ALL USING (
  organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
  AND is_task_assignee_or_creator(task_id)
) WITH CHECK (
  organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
  AND is_task_assignee_or_creator(task_id)
);

-- 4. CONCURRENCY CONTROL (Optimistic Locking Trigger)
CREATE OR REPLACE FUNCTION increment_task_version()
RETURNS TRIGGER AS $$
BEGIN
    -- If the incoming version is NOT the current version, reject
    -- The client should pass the current version they have in the UPDATE statement
    -- e.g., UPDATE tasks SET version = version + 1 WHERE id = x AND version = expected_version
    -- Actually, a trigger is easier: Just increment version automatically. 
    -- The optimism check happens at the query level (e.g., .eq('version', expectedVersion))
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_version_trigger ON tasks;
CREATE TRIGGER tasks_version_trigger
BEFORE UPDATE ON tasks
FOR EACH ROW
WHEN (OLD.* IS DISTINCT FROM NEW.*)
EXECUTE FUNCTION increment_task_version();
