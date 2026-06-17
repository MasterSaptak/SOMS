-- 20240101000001_attendance_breaks.sql

-- 1. Attendance Table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    total_working_hours NUMERIC(5,2), -- e.g., 8.50
    is_late BOOLEAN DEFAULT FALSE,
    is_early_leave BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, date) -- One attendance record per employee per day
);

-- 2. Breaks Table
CREATE TABLE breaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_id UUID REFERENCES attendance(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;

-- Attendance Policies
CREATE POLICY "Employees can view their own attendance" 
ON attendance FOR SELECT 
USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all attendance" 
ON attendance FOR SELECT 
USING (auth.is_admin());

CREATE POLICY "Employees can create their own attendance" 
ON attendance FOR INSERT 
WITH CHECK (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Employees can update their own attendance" 
ON attendance FOR UPDATE 
USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all attendance" 
ON attendance FOR ALL 
USING (auth.is_admin());

-- Breaks Policies
CREATE POLICY "Employees can view their own breaks" 
ON breaks FOR SELECT 
USING (
    attendance_id IN (
        SELECT id FROM attendance WHERE employee_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Admins can view all breaks" 
ON breaks FOR SELECT 
USING (auth.is_admin());

CREATE POLICY "Employees can manage their own breaks" 
ON breaks FOR ALL 
USING (
    attendance_id IN (
        SELECT id FROM attendance WHERE employee_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid()
        )
    )
);
