-- ==========================================================================
-- SOMS Enterprise Work Management Module
-- Complete Migration — Drops legacy, creates ERP-grade schema
-- ==========================================================================

-- ==========================================================================
-- 0. DROP LEGACY TABLES & TRIGGERS
-- ==========================================================================

-- Drop the old notification trigger that references legacy tasks.assigned_to
DROP TRIGGER IF EXISTS on_task_assigned ON tasks;
DROP FUNCTION IF EXISTS notify_task_assignment();

-- Drop legacy tables
DROP TABLE IF EXISTS task_updates CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- ==========================================================================
-- 0.5 DEPARTMENTS (Foundation for Projects & Tasks)
-- ==========================================================================

CREATE TABLE departments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    head_id         UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE department_members (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id   UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(department_id, employee_id)
);

CREATE TABLE department_managers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id   UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(department_id, employee_id)
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access_departments" ON departments FOR ALL USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));
CREATE POLICY "org_access_department_members" ON department_members FOR ALL USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));
CREATE POLICY "org_access_department_managers" ON department_managers FOR ALL USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- ==========================================================================
-- 1. PROJECTS
-- ==========================================================================

CREATE TABLE projects (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_code          TEXT,
    name                  TEXT NOT NULL,
    description           TEXT,
    client                TEXT,
    department_id         UUID REFERENCES departments(id) ON DELETE SET NULL,
    status                TEXT NOT NULL DEFAULT 'Planning'
                          CHECK (status IN ('Planning','Active','On Hold','Completed','Cancelled')),
    start_date            DATE,
    end_date              DATE,
    total_budget          NUMERIC(14,2) DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    health_score          TEXT DEFAULT 'On Track'
                          CHECK (health_score IN ('On Track','At Risk','Critical')),
    owner_id              UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_by            UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================================
-- 2. PROJECT MEMBERS
-- ==========================================================================

CREATE TABLE project_members (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    role              TEXT DEFAULT 'Member',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, employee_id)
);

-- ==========================================================================
-- 3. PROJECT MILESTONES
-- ==========================================================================

CREATE TABLE project_milestones (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id            UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name                  TEXT NOT NULL,
    description           TEXT,
    due_date              DATE,
    status                TEXT NOT NULL DEFAULT 'Pending'
                          CHECK (status IN ('Pending','In Progress','Completed','Missed')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    created_by            UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================================
-- 4. PROJECT BUDGET ENTRIES
-- ==========================================================================

CREATE TABLE project_budget_entries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    amount          NUMERIC(14,2) NOT NULL,
    category        TEXT NOT NULL
                    CHECK (category IN ('Expense','Salary','Software','Hardware','Travel','Miscellaneous')),
    description     TEXT,
    date            DATE NOT NULL,
    recorded_by     UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================================
-- 5. BUDGET REQUESTS (Approval Workflow)
-- ==========================================================================

CREATE TABLE budget_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    requested_by    UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    approved_by     UUID REFERENCES employees(id) ON DELETE SET NULL,
    amount          NUMERIC(14,2) NOT NULL,
    category        TEXT NOT NULL
                    CHECK (category IN ('Expense','Salary','Software','Hardware','Travel','Miscellaneous')),
    description     TEXT,
    status          TEXT NOT NULL DEFAULT 'Draft'
                    CHECK (status IN ('Draft','Pending','Approved','Rejected','Paid')),
    decision_note   TEXT,
    decided_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================================
-- 6. PROJECT ACTIVITY LOGS
-- ==========================================================================

CREATE TABLE project_activity_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    actor_id        UUID REFERENCES employees(id) ON DELETE SET NULL,
    action_type     TEXT NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================================
-- 7. TASKS (Enterprise)
-- ==========================================================================

CREATE TABLE tasks (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id            UUID REFERENCES projects(id) ON DELETE CASCADE,
    department_id         UUID REFERENCES departments(id) ON DELETE SET NULL,
    title                 TEXT NOT NULL,
    description           TEXT,
    category              TEXT NOT NULL DEFAULT 'Task'
                          CHECK (category IN (
                            'Task','Daily Task','Weekly Task','Monthly Mission',
                            'Quarterly Goal','Organization Task','Team Task','Project Task'
                          )),
    priority              TEXT NOT NULL DEFAULT 'Medium'
                          CHECK (priority IN ('Critical','High','Medium','Low')),
    status                TEXT NOT NULL DEFAULT 'Draft'
                          CHECK (status IN (
                            'Draft','Scheduled','Active','In Progress',
                            'Review','Completed','Archived','Cancelled'
                          )),
    start_date            DATE,
    start_time            TIME,
    due_date              DATE,
    due_time              TIME,
    activate_at           TIMESTAMPTZ,
    estimated_hours       NUMERIC(8,2),
    actual_hours          NUMERIC(8,2) DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    created_by            UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================================
-- 8. TASK ASSIGNMENTS (Many-to-many)
-- ==========================================================================

CREATE TABLE task_assignments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_id         UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_by     UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(task_id, employee_id)
);

-- ==========================================================================
-- 9. TASK DEPENDENCIES (DAG)
-- ==========================================================================

CREATE TABLE task_dependencies (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id    UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_id            UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type    TEXT NOT NULL DEFAULT 'finish_to_start'
                       CHECK (dependency_type IN ('finish_to_start','start_to_start','finish_to_finish')),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(task_id, depends_on_task_id),
    CHECK (task_id != depends_on_task_id)
);

-- ==========================================================================
-- 10. TASK WATCHERS
-- ==========================================================================

CREATE TABLE task_watchers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_id         UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(task_id, employee_id)
);

-- ==========================================================================
-- 11. TASK LABELS
-- ==========================================================================

CREATE TABLE task_labels (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_id         UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    label           TEXT NOT NULL,
    color           TEXT DEFAULT '#6366f1',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================================
-- 12. TASK COMMENTS
-- ==========================================================================

CREATE TABLE task_comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_id         UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================================
-- 13. TASK ATTACHMENTS
-- ==========================================================================

CREATE TABLE task_attachments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_id         UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    uploaded_by     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    file_name       TEXT NOT NULL,
    file_path       TEXT NOT NULL,
    file_size_bytes BIGINT,
    content_type    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================================
-- 14. TASK ACTIVITY LOGS
-- ==========================================================================

CREATE TABLE task_activity_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_id         UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    actor_id        UUID REFERENCES employees(id) ON DELETE SET NULL,
    action_type     TEXT NOT NULL,
    description     TEXT,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================================
-- 15. WORK SESSIONS
-- ==========================================================================

CREATE TABLE work_sessions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_id          UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    employee_id      UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    start_time       TIMESTAMPTZ NOT NULL,
    end_time         TIMESTAMPTZ,
    duration_minutes INTEGER,
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================================
-- 16. CALENDAR EVENTS
-- ==========================================================================

CREATE TABLE calendar_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    is_all_day      BOOLEAN DEFAULT FALSE,
    event_type      TEXT DEFAULT 'Meeting'
                    CHECK (event_type IN ('Meeting','Milestone','Deadline','Event')),
    project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id         UUID REFERENCES tasks(id) ON DELETE CASCADE,
    created_by      UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================================
-- 17. INDEXES
-- ==========================================================================

-- Projects
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(organization_id, status);
CREATE INDEX idx_projects_department ON projects(department_id);

-- Project Members
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_employee ON project_members(employee_id);

-- Project Milestones
CREATE INDEX idx_project_milestones_project ON project_milestones(project_id);

-- Budget
CREATE INDEX idx_budget_entries_project ON project_budget_entries(project_id);
CREATE INDEX idx_budget_requests_project ON budget_requests(project_id);
CREATE INDEX idx_budget_requests_status ON budget_requests(organization_id, status);

-- Tasks
CREATE INDEX idx_tasks_org ON tasks(organization_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_department ON tasks(department_id);
CREATE INDEX idx_tasks_status ON tasks(organization_id, status);
CREATE INDEX idx_tasks_category ON tasks(organization_id, category);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_activate_at ON tasks(activate_at) WHERE activate_at IS NOT NULL;

-- Task Assignments
CREATE INDEX idx_task_assignments_task ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_employee ON task_assignments(employee_id);

-- Task Dependencies
CREATE INDEX idx_task_deps_task ON task_dependencies(task_id);
CREATE INDEX idx_task_deps_depends ON task_dependencies(depends_on_task_id);

-- Task Watchers
CREATE INDEX idx_task_watchers_task ON task_watchers(task_id);
CREATE INDEX idx_task_watchers_employee ON task_watchers(employee_id);

-- Task Comments
CREATE INDEX idx_task_comments_task ON task_comments(task_id);

-- Task Activity
CREATE INDEX idx_task_activity_task ON task_activity_logs(task_id);
CREATE INDEX idx_project_activity_project ON project_activity_logs(project_id);

-- Work Sessions
CREATE INDEX idx_work_sessions_task ON work_sessions(task_id);
CREATE INDEX idx_work_sessions_employee ON work_sessions(employee_id);
CREATE INDEX idx_work_sessions_active ON work_sessions(employee_id) WHERE end_time IS NULL;

-- Calendar
CREATE INDEX idx_calendar_org ON calendar_events(organization_id);
CREATE INDEX idx_calendar_dates ON calendar_events(start_time, end_time);

-- ==========================================================================
-- 18. UPDATED_AT TRIGGERS
-- ==========================================================================

CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_project_milestones_updated_at BEFORE UPDATE ON project_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_budget_requests_updated_at BEFORE UPDATE ON budget_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_task_comments_updated_at BEFORE UPDATE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_work_sessions_updated_at BEFORE UPDATE ON work_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================================
-- 19. ROW LEVEL SECURITY
-- ==========================================================================

-- Ensure employees table has organization_id for multi-tenant isolation
ALTER TABLE employees ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Organization-scoped RLS: all tables use the same pattern
-- SELECT: user must belong to same org
-- ALL (insert/update/delete): user must belong to same org
-- Fine-grained RBAC (admin vs employee) is enforced in the service layer.

-- Projects
CREATE POLICY "org_access_projects" ON projects FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Project Members
CREATE POLICY "org_access_project_members" ON project_members FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Project Milestones
CREATE POLICY "org_access_project_milestones" ON project_milestones FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Project Budget Entries
CREATE POLICY "org_access_budget_entries" ON project_budget_entries FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Budget Requests
CREATE POLICY "org_access_budget_requests" ON budget_requests FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Project Activity Logs
CREATE POLICY "org_access_project_activity" ON project_activity_logs FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Tasks
CREATE POLICY "org_access_tasks" ON tasks FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Task Assignments
CREATE POLICY "org_access_task_assignments" ON task_assignments FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Task Dependencies
CREATE POLICY "org_access_task_dependencies" ON task_dependencies FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Task Watchers
CREATE POLICY "org_access_task_watchers" ON task_watchers FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Task Labels
CREATE POLICY "org_access_task_labels" ON task_labels FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Task Comments
CREATE POLICY "org_access_task_comments" ON task_comments FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Task Attachments
CREATE POLICY "org_access_task_attachments" ON task_attachments FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Task Activity Logs
CREATE POLICY "org_access_task_activity" ON task_activity_logs FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Work Sessions
CREATE POLICY "org_access_work_sessions" ON work_sessions FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- Calendar Events
CREATE POLICY "org_access_calendar_events" ON calendar_events FOR ALL
    USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- ==========================================================================
-- 20. NOTIFICATION TRIGGER (New Schema)
-- ==========================================================================

CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (employee_id, title, message, type, reference_id)
    VALUES (
        NEW.employee_id,
        'New Task Assigned',
        'You have been assigned a new task.',
        'task_assigned',
        NEW.task_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_assigned
    AFTER INSERT ON task_assignments
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_assignment();

-- ==========================================================================
-- 21. EMPLOYEE WORKLOAD METRICS (SQL View)
-- ==========================================================================

CREATE OR REPLACE VIEW employee_workload_metrics AS
SELECT
    e.id AS employee_id,
    e.organization_id,
    e.full_name,
    COALESCE(t.total_tasks, 0)     AS total_tasks,
    COALESCE(t.active_tasks, 0)    AS active_tasks,
    COALESCE(t.overdue_tasks, 0)   AS overdue_tasks,
    COALESCE(t.completed_tasks, 0) AS completed_tasks,
    COALESCE(ws.active_sessions, 0) AS active_sessions,
    CASE
        WHEN COALESCE(t.active_tasks, 0) > 20 THEN 'Overloaded'
        WHEN COALESCE(t.active_tasks, 0) > 10 THEN 'Heavy'
        WHEN COALESCE(t.active_tasks, 0) > 0  THEN 'Normal'
        ELSE 'Idle'
    END AS workload_status
FROM employees e
LEFT JOIN LATERAL (
    SELECT
        COUNT(*)                                                                    AS total_tasks,
        COUNT(*) FILTER (WHERE tk.status IN ('Active','In Progress','Review'))      AS active_tasks,
        COUNT(*) FILTER (WHERE tk.due_date < CURRENT_DATE AND tk.status NOT IN ('Completed','Archived','Cancelled')) AS overdue_tasks,
        COUNT(*) FILTER (WHERE tk.status = 'Completed')                             AS completed_tasks
    FROM task_assignments ta
    JOIN tasks tk ON tk.id = ta.task_id
    WHERE ta.employee_id = e.id
) t ON TRUE
LEFT JOIN LATERAL (
    SELECT COUNT(*) AS active_sessions
    FROM work_sessions ws2
    WHERE ws2.employee_id = e.id AND ws2.end_time IS NULL
) ws ON TRUE;
