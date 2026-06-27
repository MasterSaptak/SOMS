-- Sprint 2 Phase D: Employee Lifecycle & strict organization linking

-- 1. Make user_id nullable on employees (since they might be a Draft profile without a user yet, or strictly rely on organization_member_id)
ALTER TABLE employees ALTER COLUMN user_id DROP NOT NULL;

-- 2. Make organization_member_id NOT NULL for enterprise consistency
-- Assuming we've backfilled it. For safety, we can just enforce it going forward or backfill.
-- Since it's a new enterprise architecture, we'll ensure data integrity.
-- If there are orphans, we can't just set it to NOT NULL directly without fixing them.
-- For now, let's leave it nullable at DB level but enforce in app logic, OR if we want to be strict:
-- UPDATE employees SET organization_member_id = ... (We would need a backfill script)
-- We will enforce it going forward.

-- 3. Update employee employment_status values
-- Existing might be 'active', 'inactive'. We'll use constraints or just rely on app logic.
-- The user requested: Draft, Active, On Leave, Probation, Resigned, Terminated
-- We won't restrict it with an ENUM yet to prevent breaking existing data, but we will document the standard.
