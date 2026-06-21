-- ==========================================================================
-- SOMS Enterprise — Phase 1: Database Auditor Engine
-- Exposes database metadata securely to the Service Role for QA auditing.
-- ==========================================================================

-- 1. Database General Audit
CREATE OR REPLACE FUNCTION audit_database_engine()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  pg_version TEXT;
  db_size TEXT;
  active_conns INT;
  extensions JSONB;
BEGIN
  -- Get Postgres version
  SELECT version() INTO pg_version;
  
  -- Get Database size (approximate)
  SELECT pg_size_pretty(pg_database_size(current_database())) INTO db_size;

  -- Active connections
  SELECT count(*) INTO active_conns FROM pg_stat_activity;

  -- Extensions
  SELECT jsonb_agg(jsonb_build_object('name', extname, 'version', extversion))
  INTO extensions
  FROM pg_extension;

  result := jsonb_build_object(
    'status', 'success',
    'postgres_version', pg_version,
    'database_size', db_size,
    'active_connections', active_conns,
    'extensions', coalesce(extensions, '[]'::jsonb)
  );

  RETURN result;
END;
$$;

-- 2. Schema Audit
CREATE OR REPLACE FUNCTION audit_schema_engine()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tables_without_pk JSONB;
  total_tables INT;
  total_indexes INT;
  result JSONB;
BEGIN
  -- Tables in public schema
  SELECT count(*) INTO total_tables 
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

  -- Total indexes
  SELECT count(*) INTO total_indexes
  FROM pg_indexes
  WHERE schemaname = 'public';

  -- Find tables without Primary Keys
  SELECT coalesce(jsonb_agg(t.table_name), '[]'::jsonb)
  INTO tables_without_pk
  FROM information_schema.tables t
  LEFT JOIN information_schema.table_constraints tc
    ON t.table_name = tc.table_name 
    AND t.table_schema = tc.table_schema 
    AND tc.constraint_type = 'PRIMARY KEY'
  WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    AND tc.constraint_name IS NULL;

  result := jsonb_build_object(
    'total_tables', total_tables,
    'total_indexes', total_indexes,
    'tables_missing_pk', tables_without_pk,
    'warnings', jsonb_array_length(tables_without_pk)
  );

  RETURN result;
END;
$$;

-- 3. RLS Audit
CREATE OR REPLACE FUNCTION audit_rls_engine()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tables_missing_rls JSONB;
  total_policies INT;
  result JSONB;
BEGIN
  -- Find tables missing RLS
  SELECT coalesce(jsonb_agg(relname), '[]'::jsonb)
  INTO tables_missing_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r' -- regular table
    AND c.relrowsecurity = false;

  -- Total policies
  SELECT count(*) INTO total_policies
  FROM pg_policies
  WHERE schemaname = 'public';

  result := jsonb_build_object(
    'total_policies', total_policies,
    'tables_missing_rls', tables_missing_rls,
    'critical', jsonb_array_length(tables_missing_rls)
  );

  RETURN result;
END;
$$;

-- 4. Integrity Audit (Domain-specific checks)
CREATE OR REPLACE FUNCTION audit_integrity_engine()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  duplicate_org_slugs INT := 0;
  duplicate_emails INT := 0;
  result JSONB;
BEGIN
  -- Check for duplicate organization slugs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
    SELECT count(*) INTO duplicate_org_slugs
    FROM (
      SELECT slug FROM organizations GROUP BY slug HAVING count(*) > 1
    ) dup;
  END IF;

  -- Example: duplicate auth emails (requires auth.users access, which service role has, 
  -- but SECURITY DEFINER functions created by a superuser or the dashboard can access it)
  -- Because this script might run as postgres, it should have access.
  BEGIN
    SELECT count(*) INTO duplicate_emails
    FROM (
      SELECT email FROM auth.users GROUP BY email HAVING count(*) > 1
    ) dup;
  EXCEPTION WHEN OTHERS THEN
    duplicate_emails := -1; -- Unable to access auth.users
  END;

  result := jsonb_build_object(
    'duplicate_org_slugs', duplicate_org_slugs,
    'duplicate_emails', duplicate_emails,
    'errors', (duplicate_org_slugs + CASE WHEN duplicate_emails > 0 THEN duplicate_emails ELSE 0 END)
  );

  RETURN result;
END;
$$;

-- Ensure service_role can execute these
GRANT EXECUTE ON FUNCTION audit_database_engine TO service_role;
GRANT EXECUTE ON FUNCTION audit_schema_engine TO service_role;
GRANT EXECUTE ON FUNCTION audit_rls_engine TO service_role;
GRANT EXECUTE ON FUNCTION audit_integrity_engine TO service_role;
