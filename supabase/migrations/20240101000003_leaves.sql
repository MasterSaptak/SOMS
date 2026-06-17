-- 20240101000003_leaves.sql

CREATE TABLE leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL, -- casual, sick, paid
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_leaves_employee_id ON leaves(employee_id);

-- Enable RLS
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

-- Leaves Policies
CREATE POLICY "Employees can view their own leaves" 
ON leaves FOR SELECT 
USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all leaves" 
ON leaves FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Employees can create their own leaves" 
ON leaves FOR INSERT 
WITH CHECK (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Employees can cancel their pending leaves" 
ON leaves FOR DELETE 
USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) AND
    status = 'pending'
);

CREATE POLICY "Admins can manage all leaves" 
ON leaves FOR ALL 
USING (public.is_admin());
