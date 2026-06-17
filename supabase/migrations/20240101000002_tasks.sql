-- 20240101000002_tasks.sql

-- 1. Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, overdue
    priority TEXT DEFAULT 'medium', -- low, medium, high
    assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Task Updates Table (for history/comments on tasks)
CREATE TABLE task_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    updated_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_task_updates_task_id ON task_updates(task_id);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_updates ENABLE ROW LEVEL SECURITY;

-- Tasks Policies
CREATE POLICY "Anyone can view tasks" 
ON tasks FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create tasks" 
ON tasks FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Employees can update tasks assigned to them" 
ON tasks FOR UPDATE 
USING (assigned_to IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Admins can update all tasks" 
ON tasks FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete tasks" 
ON tasks FOR DELETE 
USING (public.is_admin());

-- Task Updates Policies
CREATE POLICY "Anyone can view task updates" 
ON task_updates FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create task updates" 
ON task_updates FOR INSERT 
WITH CHECK (true);
