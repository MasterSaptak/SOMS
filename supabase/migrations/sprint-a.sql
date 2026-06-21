-- ==========================================================================
-- SOMS Enterprise — Sprint A Migration
-- Identity, Organizations, RBAC, Feature Flags, User Preferences
-- ==========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================================
-- 1. ORGANIZATIONS
-- ==========================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  logo_url      TEXT,
  website       TEXT,
  industry      TEXT,
  size          TEXT,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- Organization Members
CREATE TABLE IF NOT EXISTS organization_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'employee'
                  CHECK (role IN ('owner', 'admin', 'manager', 'employee', 'guest')),
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'invited', 'suspended', 'left')),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);

-- Organization Invitations
CREATE TABLE IF NOT EXISTS organization_invitations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by_user_id  UUID NOT NULL REFERENCES auth.users(id),
  email               TEXT NOT NULL,
  role                TEXT NOT NULL DEFAULT 'employee'
                      CHECK (role IN ('admin', 'manager', 'employee', 'guest')),
  token               TEXT NOT NULL UNIQUE,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at          TIMESTAMPTZ NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON organization_invitations(email);

-- Organization Domains (for SSO/auto-join)
CREATE TABLE IF NOT EXISTS organization_domains (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  domain              TEXT NOT NULL UNIQUE,
  is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  verification_token  TEXT,
  verified_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization Settings (key-value store)
CREATE TABLE IF NOT EXISTS organization_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key             TEXT NOT NULL,
  value           JSONB NOT NULL DEFAULT '{}',
  updated_by      UUID REFERENCES auth.users(id),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, key)
);

-- ==========================================================================
-- 2. ROLES & PERMISSIONS (RBAC)
-- ==========================================================================

-- Roles (system + custom per-org)
CREATE TABLE IF NOT EXISTS roles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, organization_id)
);

-- Role Permissions (permission keys assigned to a role)
CREATE TABLE IF NOT EXISTS role_permissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_key  TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role_id, permission_key)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);

-- User Roles (which roles a user has in an org)
CREATE TABLE IF NOT EXISTS user_roles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by     UUID REFERENCES auth.users(id),
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, organization_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_org ON user_roles(user_id, organization_id);

-- ==========================================================================
-- 3. FEATURE FLAGS
-- ==========================================================================

-- Global feature flags
CREATE TABLE IF NOT EXISTS features (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key                 TEXT NOT NULL UNIQUE,
  name                TEXT NOT NULL,
  description         TEXT,
  is_enabled          BOOLEAN NOT NULL DEFAULT FALSE,
  rollout_percentage  INTEGER NOT NULL DEFAULT 100 CHECK (rollout_percentage BETWEEN 0 AND 100),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization-level feature overrides
CREATE TABLE IF NOT EXISTS organization_features (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature_key     TEXT NOT NULL,
  is_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
  config          JSONB,
  enabled_at      TIMESTAMPTZ,
  enabled_by      UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_org_features_org ON organization_features(organization_id);

-- ==========================================================================
-- 4. USER PREFERENCES (extend existing table)
-- ==========================================================================

-- Create the base table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id     UUID NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
  theme           TEXT DEFAULT 'system',
  widget_order    JSONB DEFAULT '[]',
  quick_actions   JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- User Preferences: users can read and update their own preferences
CREATE POLICY "users_read_own_preferences" ON user_preferences
  FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "users_update_own_preferences" ON user_preferences
  FOR UPDATE USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "users_insert_own_preferences" ON user_preferences
  FOR INSERT WITH CHECK (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

-- Alter user_preferences to add sprint-A columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'accent'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN accent TEXT DEFAULT 'violet';
    ALTER TABLE user_preferences ADD COLUMN language TEXT DEFAULT 'en';
    ALTER TABLE user_preferences ADD COLUMN density TEXT DEFAULT 'comfortable';
    ALTER TABLE user_preferences ADD COLUMN timezone TEXT DEFAULT 'UTC';
    ALTER TABLE user_preferences ADD COLUMN currency TEXT DEFAULT 'USD';
    ALTER TABLE user_preferences ADD COLUMN date_format TEXT DEFAULT 'MM/DD/YYYY';
    ALTER TABLE user_preferences ADD COLUMN sidebar_collapsed BOOLEAN DEFAULT FALSE;
    ALTER TABLE user_preferences ADD COLUMN calendar_view TEXT DEFAULT 'month';
    ALTER TABLE user_preferences ADD COLUMN animations_enabled BOOLEAN DEFAULT TRUE;
    ALTER TABLE user_preferences ADD COLUMN high_contrast BOOLEAN DEFAULT FALSE;
    ALTER TABLE user_preferences ADD COLUMN font_size TEXT DEFAULT 'md';
    ALTER TABLE user_preferences ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE;
    ALTER TABLE user_preferences ADD COLUMN desktop_notifications BOOLEAN DEFAULT TRUE;
    ALTER TABLE user_preferences ADD COLUMN keyboard_shortcuts BOOLEAN DEFAULT TRUE;
    ALTER TABLE user_preferences ADD COLUMN working_hours JSONB DEFAULT '{"start":"09:00","end":"18:00","timezone":"UTC"}';
  END IF;
END $$;


-- ==========================================================================
-- 5. SEED SYSTEM ROLES
-- ==========================================================================

INSERT INTO roles (name, display_name, is_system) VALUES
  ('super_admin',   'Super Administrator', TRUE),
  ('org_owner',     'Organization Owner',  TRUE),
  ('hr_manager',    'HR Manager',          TRUE),
  ('team_manager',  'Team Manager',        TRUE),
  ('employee',      'Employee',            TRUE),
  ('guest',         'Guest',               TRUE),
  ('receptionist',  'Receptionist',        TRUE)
ON CONFLICT (name, organization_id) DO NOTHING;

-- Seed system permissions for each role
-- Super Admin gets wildcard
WITH super AS (SELECT id FROM roles WHERE name = 'super_admin' AND is_system = TRUE)
INSERT INTO role_permissions (role_id, permission_key)
SELECT super.id, '*' FROM super
ON CONFLICT DO NOTHING;

-- Employee permissions
WITH emp AS (SELECT id FROM roles WHERE name = 'employee' AND is_system = TRUE)
INSERT INTO role_permissions (role_id, permission_key)
SELECT emp.id, pkey FROM emp, (VALUES
  ('attendance.read'),
  ('task.read'), ('task.create'), ('task.update'),
  ('leave.read'), ('leave.create'),
  ('asset.read'),
  ('room.read'), ('room.book'),
  ('meeting.read'), ('meeting.create'),
  ('announcement.read'),
  ('document.read'),
  ('analytics.read'),
  ('organization.read')
) AS perms(pkey)
ON CONFLICT DO NOTHING;

-- HR Manager permissions
WITH hr AS (SELECT id FROM roles WHERE name = 'hr_manager' AND is_system = TRUE)
INSERT INTO role_permissions (role_id, permission_key)
SELECT hr.id, pkey FROM hr, (VALUES
  ('employee.create'), ('employee.read'), ('employee.update'),
  ('attendance.read'), ('attendance.update'),
  ('leave.read'), ('leave.approve'), ('leave.reject'),
  ('task.read'),
  ('asset.read'), ('asset.create'), ('asset.update'), ('asset.assign'),
  ('meeting.read'), ('meeting.create'), ('meeting.manage'),
  ('room.read'), ('room.book'), ('room.manage'),
  ('announcement.create'), ('announcement.read'), ('announcement.update'),
  ('document.read'), ('document.create'), ('document.approve'),
  ('analytics.read'), ('analytics.export'),
  ('payroll.read'),
  ('audit.read'),
  ('organization.read'),
  ('user.invite'),
  ('settings.read')
) AS perms(pkey)
ON CONFLICT DO NOTHING;

-- Admin permissions (org_owner)
WITH admin AS (SELECT id FROM roles WHERE name = 'org_owner' AND is_system = TRUE)
INSERT INTO role_permissions (role_id, permission_key)
SELECT admin.id, pkey FROM admin, (VALUES
  ('*')
) AS perms(pkey)
ON CONFLICT DO NOTHING;

-- ==========================================================================
-- 6. SEED DEFAULT FEATURE FLAGS
-- ==========================================================================

INSERT INTO features (key, name, description, is_enabled, rollout_percentage) VALUES
  ('ai_assistant',       'AI Assistant',         'Gemini-powered AI copilot',          TRUE, 100),
  ('payroll',            'Payroll',               'Payroll management module',           TRUE, 100),
  ('crm',                'CRM',                   'Customer relationship management',    FALSE, 0),
  ('meetings',           'Meetings',              'Video meetings and scheduling',       TRUE, 100),
  ('assets',             'Assets',                'Asset management module',             TRUE, 100),
  ('reports',            'Reports',               'Advanced reporting and exports',      TRUE, 100),
  ('knowledge_base',     'Knowledge Base',        'Internal wiki and docs',             TRUE, 100),
  ('surveys',            'Surveys',               'Employee surveys and pulse checks',   FALSE, 0),
  ('goals',              'Goals & OKRs',          'OKR and goal tracking',               TRUE, 100),
  ('chat',               'Chat',                  'Internal team messaging',             FALSE, 0),
  ('video_calls',        'Video Calls',           'Direct video call capability',        FALSE, 0),
  ('documents',          'Documents Center',      'Document storage and management',     TRUE, 100),
  ('recruitment',        'Recruitment',           'Applicant tracking system',           FALSE, 0),
  ('performance_review', 'Performance Reviews',   'Employee performance review cycles',  FALSE, 0)
ON CONFLICT (key) DO NOTHING;

-- ==========================================================================
-- 7. ROW LEVEL SECURITY
-- ==========================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_features ENABLE ROW LEVEL SECURITY;

-- Organizations: member can read their orgs
CREATE POLICY "org_members_can_read" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Organization Members: members can see other members of their org
CREATE POLICY "members_can_read_org_members" ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- User Roles: users can read their own roles
CREATE POLICY "users_can_read_own_roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Role Permissions: all authenticated users can read (cached server-side)
CREATE POLICY "authenticated_read_role_permissions" ON role_permissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Roles: all authenticated users can read
CREATE POLICY "authenticated_read_roles" ON roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Features: all authenticated users can read
CREATE POLICY "authenticated_read_features" ON features
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Organization Features: org members can read
CREATE POLICY "org_members_read_features" ON organization_features
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ==========================================================================
-- 8. UPDATED_AT TRIGGER
-- ==========================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_features_updated_at
  BEFORE UPDATE ON features
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
