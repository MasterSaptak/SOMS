-- ==========================================================================
-- PHASE 1: QUICK WINS (TIMELINE, NOTIFICATIONS)
-- ==========================================================================

-- 1. EMPLOYEE TIMELINE EVENTS
CREATE TABLE IF NOT EXISTS employee_timeline_events (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    event_type        TEXT NOT NULL, -- e.g., 'joined', 'verified', 'promoted', 'transferred', 'award'
    title             TEXT NOT NULL,
    description       TEXT,
    event_date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE employee_timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_employee_timeline" ON employee_timeline_events FOR ALL 
USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));

-- 2. NOTIFICATIONS
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title             TEXT NOT NULL,
    message           TEXT NOT NULL,
    type              TEXT DEFAULT 'info', -- 'success', 'warning', 'info', 'error'
    is_read           BOOLEAN DEFAULT false,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_notifications" ON notifications FOR ALL 
USING (user_id = auth.uid());
