-- ==========================================================================
-- SOMS Enterprise — Phase 2.1 Migration
-- Organization & Employee Foundation
-- ==========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================================
-- 1. STRUCTURAL ENTITIES
-- ==========================================================================

-- Work Locations
CREATE TABLE IF NOT EXISTS work_locations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  address         TEXT,
  timezone        TEXT NOT NULL DEFAULT 'UTC',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Designations (Job Titles)
CREATE TABLE IF NOT EXISTS designations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  level           INTEGER NOT NULL DEFAULT 1, -- For sorting/hierarchy (e.g., 100 for exec, 10 for entry)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  head_id         UUID, -- Cannot enforce FK to employees yet to avoid circular dependency
  parent_id       UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id   UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  lead_id         UUID, -- Cannot enforce FK to employees yet
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================================
-- 2. EXTEND EMPLOYEES TABLE
-- ==========================================================================

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'organization_id') THEN
    ALTER TABLE employees ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'department_id') THEN
    ALTER TABLE employees ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'team_id') THEN
    ALTER TABLE employees ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'designation_id') THEN
    ALTER TABLE employees ADD COLUMN designation_id UUID REFERENCES designations(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'work_location_id') THEN
    ALTER TABLE employees ADD COLUMN work_location_id UUID REFERENCES work_locations(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'manager_id') THEN
    ALTER TABLE employees ADD COLUMN manager_id UUID REFERENCES employees(id) ON DELETE SET NULL;
  END IF;
  
  -- Remove the old text fields for department and designation?
  -- We'll keep them for backward compatibility for now, but nullable.
END $$;

-- Add FKs to departments and teams now that employees table is ready
ALTER TABLE departments ADD CONSTRAINT fk_departments_head FOREIGN KEY (head_id) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE teams ADD CONSTRAINT fk_teams_lead FOREIGN KEY (lead_id) REFERENCES employees(id) ON DELETE SET NULL;

-- ==========================================================================
-- 3. EMPLOYEE 360 ENTITIES
-- ==========================================================================

-- Employment Details
CREATE TABLE IF NOT EXISTS employment_details (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id         UUID NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
  employment_type     TEXT NOT NULL DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
  probation_end_date  DATE,
  notice_period_days  INTEGER DEFAULT 30,
  work_schedule       TEXT DEFAULT 'standard', -- could reference a schedules table later
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  relationship    TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT,
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employee Skills
CREATE TABLE IF NOT EXISTS employee_skills (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  skill_name      TEXT NOT NULL,
  proficiency     TEXT NOT NULL DEFAULT 'intermediate' CHECK (proficiency IN ('beginner', 'intermediate', 'expert')),
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, skill_name)
);

-- ==========================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================================================

ALTER TABLE work_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skills ENABLE ROW LEVEL SECURITY;

-- Read policies: Org members can read structure
CREATE POLICY "org_members_read_work_locations" ON work_locations FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
CREATE POLICY "org_members_read_designations" ON designations FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
CREATE POLICY "org_members_read_departments" ON departments FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
CREATE POLICY "org_members_read_teams" ON teams FOR SELECT USING (department_id IN (SELECT id FROM departments WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())));

-- Read policies: 360 data
-- Employees can read their own
CREATE POLICY "users_read_own_emp_details" ON employment_details FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));
CREATE POLICY "users_read_own_emergency" ON emergency_contacts FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));
CREATE POLICY "users_read_own_skills" ON employee_skills FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

-- HR/Admins can read all in their org
CREATE POLICY "hr_read_all_emp_details" ON employment_details FOR SELECT USING (
  employee_id IN (SELECT id FROM employees WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY "hr_read_all_emergency" ON emergency_contacts FOR SELECT USING (
  employee_id IN (SELECT id FROM employees WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY "hr_read_all_skills" ON employee_skills FOR SELECT USING (
  employee_id IN (SELECT id FROM employees WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);

-- Update Triggers
CREATE TRIGGER update_work_locations_updated_at BEFORE UPDATE ON work_locations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_designations_updated_at BEFORE UPDATE ON designations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_employment_details_updated_at BEFORE UPDATE ON employment_details FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_employee_skills_updated_at BEFORE UPDATE ON employee_skills FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
