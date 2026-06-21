-- Create Employment Details Table
CREATE TABLE IF NOT EXISTS employment_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employment_type TEXT DEFAULT 'full_time',
    probation_end_date DATE,
    notice_period_days INTEGER DEFAULT 30,
    work_schedule TEXT DEFAULT 'Standard 9-5',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Employee Skills Table
CREATE TABLE IF NOT EXISTS employee_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    proficiency TEXT DEFAULT 'intermediate', -- beginner, intermediate, expert
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skills ENABLE ROW LEVEL SECURITY;

-- Note: We are relying on backend bypass or Super Admin role overrides for permission in the frontend right now,
-- but adding basic policies to prevent completely silent blocks.
CREATE POLICY "Allow authenticated users to select employment details" ON employment_details FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert employment details" ON employment_details FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update employment details" ON employment_details FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to select emergency contacts" ON emergency_contacts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert emergency contacts" ON emergency_contacts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update emergency contacts" ON emergency_contacts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete emergency contacts" ON emergency_contacts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to select employee skills" ON employee_skills FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert employee skills" ON employee_skills FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update employee skills" ON employee_skills FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete employee skills" ON employee_skills FOR DELETE USING (auth.role() = 'authenticated');
