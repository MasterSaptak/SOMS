-- ==========================================================================
-- SOMS Enterprise — Phase 2 Performance Indexes
-- Organization & Employee Foundation Query Optimization
-- ==========================================================================

-- Employees: common query patterns
CREATE INDEX IF NOT EXISTS idx_employees_org_dept     ON employees(organization_id, department_id);
CREATE INDEX IF NOT EXISTS idx_employees_org_status   ON employees(organization_id, employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_manager      ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_team         ON employees(team_id);
CREATE INDEX IF NOT EXISTS idx_employees_designation  ON employees(designation_id);
CREATE INDEX IF NOT EXISTS idx_employees_work_loc     ON employees(work_location_id);

-- Employee 360° related tables
CREATE INDEX IF NOT EXISTS idx_skills_employee        ON employee_skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_emergency_employee     ON emergency_contacts(employee_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_emp_details_employee   ON employment_details(employee_id);

-- Org structure
CREATE INDEX IF NOT EXISTS idx_departments_org        ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent     ON departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_teams_department       ON teams(department_id);

-- Attendance: date-range queries
CREATE INDEX IF NOT EXISTS idx_attendance_emp_date    ON attendance_logs(employee_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_date        ON attendance_logs(date DESC);

-- Tasks: common filters
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_status  ON tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date         ON tasks(due_date) WHERE status != 'completed';

-- Leaves: approval workflow queries
CREATE INDEX IF NOT EXISTS idx_leaves_status          ON leave_requests(status, employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_employee        ON leave_requests(employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaves_manager         ON leave_requests(manager_id, status);
