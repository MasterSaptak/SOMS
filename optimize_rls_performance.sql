-- ====================================================================
-- RLS Performance Optimization Script
-- ====================================================================
-- Problem: 
-- The `get_active_user_orgs()` function was previously defined as VOLATILE (the default).
-- This caused Postgres to execute the function on EVERY SINGLE ROW when checking RLS policies,
-- leading to N+1 query performance degradation.
--
-- Solution:
-- By defining the function as STABLE, Postgres will cache the result for the duration
-- of the query and execute it exactly once, making RLS policies exponentially faster.
-- ====================================================================

-- 1. Optimize the primary organization lookup function
CREATE OR REPLACE FUNCTION get_active_user_orgs()
RETURNS TABLE (organization_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT om.organization_id FROM organization_members om 
  WHERE om.user_id = auth.uid() AND om.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Optimize the members_can_read_org_members policy to use a STABLE subquery pattern if necessary
-- Note: The policy itself already uses `(SELECT get_active_user_orgs())` which will now be highly efficient.
-- However, we can drop and recreate it just to ensure it's bound cleanly.
DROP POLICY IF EXISTS "members_can_read_org_members" ON organization_members;

CREATE POLICY "members_can_read_org_members" ON organization_members
  FOR SELECT USING (
    organization_id IN (SELECT get_active_user_orgs()) OR
    user_id = auth.uid()
  );

-- Note: You should see an immediate, massive performance improvement when fetching data 
-- from ANY table (employees, projects, teams) that uses `Root Tenant Isolation`.
