-- 20240101000012_leave_policies.sql

CREATE TABLE leave_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL, -- references organizations(id) in a full setup
  name TEXT NOT NULL,
  leave_type TEXT NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT true,
  max_days INTEGER NOT NULL DEFAULT 0,
  requires_documents BOOLEAN NOT NULL DEFAULT false,
  half_day_allowed BOOLEAN NOT NULL DEFAULT false,
  carry_forward_days INTEGER NOT NULL DEFAULT 0,
  approval_workflow_type TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update leaves table to reference policy
ALTER TABLE leaves
ADD COLUMN policy_id UUID REFERENCES leave_policies(id),
ADD COLUMN workflow_state TEXT DEFAULT 'submitted'; -- submitted, hr_verification, manager_approval, payroll_processing, completed

-- Backfill or handle existing data carefully in production
