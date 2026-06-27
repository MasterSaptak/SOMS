-- Fix infinite recursion in organization_members RLS policy
-- Run this in your Supabase SQL Editor

DROP POLICY IF EXISTS "members_can_read_org_members" ON organization_members;

CREATE POLICY "members_can_read_org_members" ON organization_members
  FOR SELECT USING (
    organization_id IN (SELECT get_active_user_orgs()) OR
    user_id = auth.uid()
  );
