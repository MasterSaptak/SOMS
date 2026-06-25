-- ==========================================================================
-- PHASE 3: PROJECT ENHANCEMENTS & DEPENDENCIES
-- ==========================================================================

-- 1. ADD "Blocked" STATUS TO TASKS
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN (
    'Draft','Scheduled','Active','Blocked','In Progress',
    'Review','Completed','Archived','Cancelled'
  ));

-- 2. CREATE TASK DEPENDENCIES (Visualization & Enforcement)
DROP TABLE IF EXISTS task_dependencies CASCADE;

CREATE TABLE task_dependencies (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_id           UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, -- The task that is blocked
    depends_on_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, -- The task it depends on
    type              TEXT NOT NULL DEFAULT 'Finish-to-Start'
                      CHECK (type IN ('Finish-to-Start','Start-to-Start','Finish-to-Finish','Start-to-Finish')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by        UUID REFERENCES auth.users(id),
    UNIQUE(task_id, depends_on_id)
);

-- Index for fast lookups
CREATE INDEX idx_task_dependencies_task ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_id);

-- Attach Audit Trigger
DROP TRIGGER IF EXISTS audit_task_dependencies_trigger ON task_dependencies;
CREATE TRIGGER audit_task_dependencies_trigger
AFTER INSERT OR UPDATE OR DELETE ON task_dependencies
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

-- RLS for Task Dependencies
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_dependencies" ON task_dependencies FOR ALL USING (is_org_admin(organization_id));
CREATE POLICY "manager_all_dependencies" ON task_dependencies FOR ALL USING (is_org_manager(organization_id));
CREATE POLICY "employee_read_dependencies" ON task_dependencies FOR SELECT USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- 3. PROJECT BUDGET TABLES (Preparation)
CREATE TABLE IF NOT EXISTS project_budget_entries (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    amount            DECIMAL(12, 2) NOT NULL,
    category          TEXT NOT NULL,
    description       TEXT,
    date              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by       UUID REFERENCES auth.users(id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_requests (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    requested_by      UUID NOT NULL REFERENCES auth.users(id),
    amount            DECIMAL(12, 2) NOT NULL,
    category          TEXT NOT NULL,
    description       TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    approved_by       UUID REFERENCES auth.users(id),
    decision_note     TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ENFORCE BUDGET CATEGORIES IN PROJECTS
ALTER TABLE project_budget_entries DROP CONSTRAINT IF EXISTS project_budget_entries_category_check;
ALTER TABLE project_budget_entries ADD CONSTRAINT project_budget_entries_category_check
  CHECK (category IN (
    'Labor', 'Software', 'Hardware', 'Travel', 'Training', 'Operations', 'Other'
  ));

ALTER TABLE budget_requests DROP CONSTRAINT IF EXISTS budget_requests_category_check;
ALTER TABLE budget_requests ADD CONSTRAINT budget_requests_category_check
  CHECK (category IN (
    'Labor', 'Software', 'Hardware', 'Travel', 'Training', 'Operations', 'Other'
  ));

-- 5. TRIGGER FOR TASK DEPENDENCY ENFORCEMENT
-- Prevent marking a task 'In Progress', 'Review', or 'Completed' if its dependencies are not 'Completed'
CREATE OR REPLACE FUNCTION enforce_task_dependencies()
RETURNS TRIGGER AS $$
DECLARE
    unmet_dependencies_count INT;
BEGIN
    IF NEW.status IN ('In Progress', 'Review', 'Completed') THEN
        SELECT COUNT(*)
        INTO unmet_dependencies_count
        FROM task_dependencies td
        JOIN tasks t ON t.id = td.depends_on_id
        WHERE td.task_id = NEW.id
          AND t.status != 'Completed';

        IF unmet_dependencies_count > 0 THEN
            RAISE EXCEPTION 'Task cannot be moved to % because it has % unmet dependencies.', NEW.status, unmet_dependencies_count;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5b. TRIGGER FOR DEPENDENCY CYCLE DETECTION
CREATE OR REPLACE FUNCTION prevent_task_dependency_cycles()
RETURNS TRIGGER AS $$
DECLARE
    cycle_detected BOOLEAN;
    v_task UUID := NEW.task_id;
    v_depends_on UUID := NEW.depends_on_id;
BEGIN
    WITH RECURSIVE dependency_graph(t_id, d_id) AS (
        -- Base case
        SELECT v_task, v_depends_on
        UNION ALL
        -- Recursive step
        SELECT dg.t_id, td.depends_on_id
        FROM dependency_graph dg
        JOIN task_dependencies td ON dg.d_id = td.task_id
    )
    SELECT EXISTS (
        SELECT 1 FROM dependency_graph WHERE d_id = v_task
    ) INTO cycle_detected;

    IF cycle_detected THEN
        RAISE EXCEPTION 'Cannot add dependency: It would create a circular dependency cycle.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_dependency_cycles ON task_dependencies;
CREATE TRIGGER check_dependency_cycles
BEFORE INSERT OR UPDATE ON task_dependencies
FOR EACH ROW
EXECUTE FUNCTION prevent_task_dependency_cycles();

DROP TRIGGER IF EXISTS check_task_dependencies ON tasks;
CREATE TRIGGER check_task_dependencies
BEFORE UPDATE OF status ON tasks
FOR EACH ROW
WHEN (NEW.status IN ('In Progress', 'Review', 'Completed'))
EXECUTE FUNCTION enforce_task_dependencies();

-- 6. HEALTH SCORE IN PROJECTS
-- Health score calculation is best done either through a view or periodic update or in code.
-- We will update the application code to calculate and store the health score dynamically 
-- but let's make sure the column exists and supports an additional 'Warning' state.
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_health_score_check;
ALTER TABLE projects ADD CONSTRAINT projects_health_score_check 
  CHECK (health_score IN ('On Track', 'At Risk', 'Critical', 'Warning'));

-- End Phase 3 SQL
