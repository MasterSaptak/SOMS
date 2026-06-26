-- ==========================================================================
-- SOMS Enterprise Calendar Platform Schema
-- Migration: 20260626000002_enterprise_calendar_platform.sql
-- ==========================================================================

-- 1. ORGANIZATION CALENDAR SETTINGS (Working days, timezone, global defaults)
CREATE TABLE IF NOT EXISTS organization_calendar_settings (
    organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    working_days JSONB DEFAULT '["Monday", "Tuesday", "Thursday", "Friday", "Saturday"]'::jsonb, -- Sunday and Wednesday off by default
    week_start TEXT DEFAULT 'Monday',
    default_timezone TEXT DEFAULT 'Asia/Kolkata',
    calendar_country TEXT DEFAULT 'India',
    holiday_policy JSONB DEFAULT '{}'::jsonb,
    work_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00"}'::jsonb,
    shift_policy JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE organization_calendar_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_org_cal_settings" ON organization_calendar_settings;
CREATE POLICY "service_role_org_cal_settings" ON organization_calendar_settings FOR ALL USING (true);

-- 2. CALENDAR EVENT CATEGORIES (e.g. Meeting, Holiday, Training, Custom)
CREATE TABLE IF NOT EXISTS calendar_event_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL, -- Hex code or preset name
    icon TEXT, -- Lucide icon name
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE calendar_event_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_cal_categories" ON calendar_event_categories;
CREATE POLICY "service_role_cal_categories" ON calendar_event_categories FOR ALL USING (true);

-- 3. COMPANY HOLIDAYS (Database-driven custom holidays)
CREATE TABLE IF NOT EXISTS company_holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    is_working_holiday BOOLEAN DEFAULT FALSE,
    is_mandatory BOOLEAN DEFAULT TRUE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL, -- Null implies global across org
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE company_holidays ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_comp_holidays" ON company_holidays;
CREATE POLICY "service_role_comp_holidays" ON company_holidays FOR ALL USING (true);

-- 4. COMPANY EVENTS (Hackathons, Board Meetings, Training Weeks)
CREATE TABLE IF NOT EXISTS company_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES calendar_event_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    meeting_link TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE company_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_comp_events" ON company_events;
CREATE POLICY "service_role_comp_events" ON company_events FOR ALL USING (true);

-- 5. CALENDAR EVENT ATTENDEES
CREATE TABLE IF NOT EXISTS calendar_event_attendees (
    event_id UUID NOT NULL REFERENCES company_events(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    rsvp_status TEXT DEFAULT 'pending', -- pending, accepted, declined, tentative
    PRIMARY KEY(event_id, employee_id)
);
ALTER TABLE calendar_event_attendees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_cal_attendees" ON calendar_event_attendees;
CREATE POLICY "service_role_cal_attendees" ON calendar_event_attendees FOR ALL USING (true);

-- 6. CALENDAR EVENT REMINDERS
CREATE TABLE IF NOT EXISTS calendar_event_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES company_events(id) ON DELETE CASCADE,
    minutes_before INTEGER NOT NULL,
    method TEXT DEFAULT 'notification', -- email, notification, sms
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE calendar_event_reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_cal_reminders" ON calendar_event_reminders;
CREATE POLICY "service_role_cal_reminders" ON calendar_event_reminders FOR ALL USING (true);

-- 7. CALENDAR SYNC ACCOUNTS (Google Calendar, Outlook)
CREATE TABLE IF NOT EXISTS calendar_sync_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- google, outlook, apple
    provider_account_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE calendar_sync_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_cal_sync" ON calendar_sync_accounts;
CREATE POLICY "service_role_cal_sync" ON calendar_sync_accounts FOR ALL USING (true);

-- 8. CALENDAR SUBSCRIPTIONS (ICS feeds)
CREATE TABLE IF NOT EXISTS calendar_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    feed_url TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE calendar_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_cal_subs" ON calendar_subscriptions;
CREATE POLICY "service_role_cal_subs" ON calendar_subscriptions FOR ALL USING (true);

-- 9. CALENDAR PREFERENCES (User-level overrides)
CREATE TABLE IF NOT EXISTS calendar_preferences (
    employee_id UUID PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
    default_view TEXT DEFAULT 'month',
    active_layers JSONB DEFAULT '["attendance", "leaves", "holidays", "meetings"]'::jsonb,
    country_override TEXT,
    state_override TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE calendar_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_cal_prefs" ON calendar_preferences;
CREATE POLICY "service_role_cal_prefs" ON calendar_preferences FOR ALL USING (true);

-- 10. CALENDAR VIEWS (Saved custom views)
CREATE TABLE IF NOT EXISTS calendar_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filters JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE calendar_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_cal_views" ON calendar_views;
CREATE POLICY "service_role_cal_views" ON calendar_views FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_comp_holidays_date ON company_holidays(date);
CREATE INDEX IF NOT EXISTS idx_comp_events_time ON company_events(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_comp_events_org ON company_events(organization_id);
