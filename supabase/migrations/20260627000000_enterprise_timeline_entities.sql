-- ==========================================================================
-- SOMS Enterprise Timeline Entities
-- Migration: 20260627000000_enterprise_timeline_entities.sql
-- ==========================================================================

-- 1. MISSIONS
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES employees(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'planned', -- planned, in_progress, completed, on_hold
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_missions" ON missions;
CREATE POLICY "service_role_missions" ON missions FOR ALL USING (true);

-- 2. GOALS / OKRS
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES employees(id),
    department_id UUID REFERENCES departments(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'on_track', -- on_track, at_risk, off_track, completed
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_goals" ON goals;
CREATE POLICY "service_role_goals" ON goals FOR ALL USING (true);

-- 3. TRAINING SESSIONS
CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    trainer_id UUID REFERENCES employees(id),
    department_id UUID REFERENCES departments(id),
    is_mandatory BOOLEAN DEFAULT FALSE,
    capacity INTEGER,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    meeting_link TEXT,
    status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_training" ON training_sessions;
CREATE POLICY "service_role_training" ON training_sessions FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS training_attendees (
    training_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'registered', -- registered, attended, completed, no_show
    certificate_url TEXT,
    PRIMARY KEY(training_id, employee_id)
);
ALTER TABLE training_attendees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_training_att" ON training_attendees;
CREATE POLICY "service_role_training_att" ON training_attendees FOR ALL USING (true);

-- 4. REMINDERS
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium', -- low, medium, high
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_reminders" ON reminders;
CREATE POLICY "service_role_reminders" ON reminders FOR ALL USING (true);

-- 5. ASSET RESERVATIONS
CREATE TABLE IF NOT EXISTS asset_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    purpose TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, active, completed, cancelled
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE asset_reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_asset_res" ON asset_reservations;
CREATE POLICY "service_role_asset_res" ON asset_reservations FOR ALL USING (true);
