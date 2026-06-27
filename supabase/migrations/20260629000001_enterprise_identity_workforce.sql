-- 1. Create member_activity table to track member events
CREATE TABLE IF NOT EXISTS member_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_member_id UUID REFERENCES organization_members(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    login_at TIMESTAMPTZ,
    logout_at TIMESTAMPTZ,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    device TEXT,
    browser TEXT,
    operating_system TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on member_activity
ALTER TABLE member_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Member Activity Isolation" ON member_activity;
CREATE POLICY "Member Activity Isolation" ON member_activity
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.id = member_activity.organization_member_id
    AND om.organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);

-- 2. Add status column to organization_members if not exists (in case it was missed)
ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
-- If it exists but has old values, we might want to standardize.
-- We will just ensure the column is there.

-- Create member_roles junction table for supporting multiple roles per member
CREATE TABLE IF NOT EXISTS member_roles (
    organization_member_id UUID REFERENCES organization_members(id) ON DELETE CASCADE,
    role_id UUID,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (organization_member_id, role_id)
);

ALTER TABLE member_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Member Roles Isolation" ON member_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.id = member_roles.organization_member_id
    AND om.organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);

-- 3. Seed Roles Table
-- Create the table just in case it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert built-in system roles
INSERT INTO roles (name, display_name, is_system) 
VALUES 
('owner', 'Owner', TRUE),
('ceo', 'CEO', TRUE),
('admin', 'Admin', TRUE),
('hr', 'HR', TRUE),
('manager', 'Manager', TRUE),
('employee', 'Employee', TRUE),
('guest', 'Guest', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 4. Enable RLS on roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Roles tenant isolation" ON roles;
CREATE POLICY "Roles tenant isolation" ON roles
FOR ALL USING (
  organization_id IS NULL OR 
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);
