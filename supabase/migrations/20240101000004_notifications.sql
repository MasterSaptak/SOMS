-- 20240101000004_notifications.sql

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- task_assigned, leave_approved, leave_rejected, etc.
    reference_id UUID, -- ID of the task or leave
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_notifications_employee_id ON notifications(employee_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications Policies
CREATE POLICY "Employees can view their own notifications" 
ON notifications FOR SELECT 
USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Employees can update their own notifications" 
ON notifications FOR UPDATE 
USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

-- We allow the system (triggers) to insert notifications, but no direct user inserts
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Trigger: When a task is assigned to an employee
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
        INSERT INTO notifications (employee_id, title, message, type, reference_id)
        VALUES (
            NEW.assigned_to,
            'New Task Assigned',
            'You have been assigned: ' || NEW.title,
            'task_assigned',
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_assigned
    AFTER INSERT OR UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_assignment();

-- Trigger: When a leave status changes
CREATE OR REPLACE FUNCTION notify_leave_status()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
        INSERT INTO notifications (employee_id, title, message, type, reference_id)
        VALUES (
            NEW.employee_id,
            'Leave Request ' || INITCAP(NEW.status),
            'Your ' || NEW.leave_type || ' leave request has been ' || NEW.status,
            'leave_' || NEW.status,
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_leave_status_change
    AFTER UPDATE ON leaves
    FOR EACH ROW
    EXECUTE FUNCTION notify_leave_status();
