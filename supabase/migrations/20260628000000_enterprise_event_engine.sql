-- Migration: Enterprise Event Engine
-- Creates the enterprise_events table and the triggers to keep it synced.

CREATE TABLE IF NOT EXISTS enterprise_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    source TEXT NOT NULL, -- e.g., 'task', 'project', 'leave', 'meeting', 'training', 'mission', 'goal'
    source_id UUID NOT NULL, -- Reference to the original record ID
    
    event_type TEXT NOT NULL DEFAULT 'sync', -- 'created', 'updated', 'deleted', 'sync'
    
    title TEXT NOT NULL,
    description TEXT,
    
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    
    owner_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    participants UUID[] DEFAULT '{}',
    
    priority TEXT NOT NULL DEFAULT 'medium' 
        CHECK (priority IN ('critical', 'high', 'medium', 'low', 'informational')),
    
    status TEXT NOT NULL DEFAULT 'active',
    
    visibility TEXT NOT NULL DEFAULT 'public' 
        CHECK (visibility IN ('private', 'team', 'department', 'public')),
        
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure we only have one synced event per source record
    UNIQUE (source, source_id)
);

-- Enable RLS
ALTER TABLE enterprise_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view events for their organization
CREATE POLICY "Users can view enterprise events for their org"
    ON enterprise_events FOR SELECT
    USING (organization_id = (SELECT organization_id FROM employees WHERE id = auth.uid()));

-- Policy: Allow all for admins, but generally events are managed by triggers
CREATE POLICY "Admins can manage enterprise events"
    ON enterprise_events FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE id = auth.uid() 
            AND role IN ('Admin', 'Super Admin')
        )
    );

-- Trigger Function: Sync Tasks
CREATE OR REPLACE FUNCTION sync_task_to_event()
RETURNS TRIGGER AS $$
DECLARE
    event_priority TEXT;
BEGIN
    -- Only act if not deleting
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM enterprise_events WHERE source = 'task' AND source_id = OLD.id;
        RETURN OLD;
    END IF;

    -- Map priority
    event_priority := CASE NEW.priority
        WHEN 'Critical' THEN 'critical'
        WHEN 'High' THEN 'high'
        WHEN 'Medium' THEN 'medium'
        WHEN 'Low' THEN 'low'
        ELSE 'medium'
    END;

    -- Upsert the event
    INSERT INTO enterprise_events (
        organization_id, source, source_id, title, description, 
        end_at, priority, status
    ) VALUES (
        NEW.organization_id, 'task', NEW.id, NEW.title, NEW.description, 
        NEW.due_date, event_priority, NEW.status
    )
    ON CONFLICT (source, source_id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        end_at = EXCLUDED.end_at,
        priority = EXCLUDED.priority,
        status = EXCLUDED.status,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_task_change
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION sync_task_to_event();


-- Trigger Function: Sync Projects
CREATE OR REPLACE FUNCTION sync_project_to_event()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM enterprise_events WHERE source = 'project' AND source_id = OLD.id;
        RETURN OLD;
    END IF;

    INSERT INTO enterprise_events (
        organization_id, source, source_id, title, description, 
        start_at, end_at, priority, status
    ) VALUES (
        NEW.organization_id, 'project', NEW.id, NEW.name, NEW.description, 
        NEW.start_date, NEW.end_date, 'high', NEW.status
    )
    ON CONFLICT (source, source_id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        start_at = EXCLUDED.start_at,
        end_at = EXCLUDED.end_at,
        status = EXCLUDED.status,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_project_change
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION sync_project_to_event();


-- Trigger Function: Sync Leaves
CREATE OR REPLACE FUNCTION sync_leave_to_event()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM enterprise_events WHERE source = 'leave' AND source_id = OLD.id;
        RETURN OLD;
    END IF;

    -- Only sync approved leaves to the timeline
    IF NEW.status = 'Approved' THEN
        INSERT INTO enterprise_events (
            organization_id, source, source_id, title, description, 
            start_at, end_at, owner_id, priority, status
        ) VALUES (
            NEW.organization_id, 'leave', NEW.id, NEW.leave_type || ' Leave', NEW.reason, 
            NEW.start_date, NEW.end_date, NEW.employee_id, 'informational', NEW.status
        )
        ON CONFLICT (source, source_id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            start_at = EXCLUDED.start_at,
            end_at = EXCLUDED.end_at,
            owner_id = EXCLUDED.owner_id,
            status = EXCLUDED.status,
            updated_at = NOW();
    ELSE
        -- If status changed to rejected/pending, remove from timeline
        DELETE FROM enterprise_events WHERE source = 'leave' AND source_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_leave_change
    AFTER INSERT OR UPDATE OR DELETE ON leaves
    FOR EACH ROW EXECUTE FUNCTION sync_leave_to_event();
