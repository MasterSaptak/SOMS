-- 20240101000008_demo_flags.sql

-- Add is_demo flag to organizations to support Demo Data environments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'is_demo') THEN
    ALTER TABLE organizations ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;
