-- 20260624000000_employee_profile_updates.sql (Master Record Upgrades)

-- ==========================================
-- 1. EXTEND EMPLOYMENT DETAILS & EMERGENCY CONTACTS
-- ==========================================
ALTER TABLE employment_details 
ADD COLUMN IF NOT EXISTS confirmation_date DATE,
ADD COLUMN IF NOT EXISTS shift TEXT,
ADD COLUMN IF NOT EXISTS office_location TEXT,
ADD COLUMN IF NOT EXISTS employee_grade TEXT,
ADD COLUMN IF NOT EXISTS employment_category TEXT,
ADD COLUMN IF NOT EXISTS cost_center TEXT,
ADD COLUMN IF NOT EXISTS payroll_group TEXT;

ALTER TABLE emergency_contacts 
ADD COLUMN IF NOT EXISTS alternate_phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- ==========================================
-- 2. MASTER RECORD: EXTEND EMPLOYEES (PERSONAL INFO)
-- ==========================================
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS blood_group TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS personal_email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_nid TEXT,
ADD COLUMN IF NOT EXISTS passport_no TEXT,
ADD COLUMN IF NOT EXISTS visa_status TEXT,
ADD COLUMN IF NOT EXISTS driving_license TEXT;

-- ==========================================
-- 3. SKILLS & CATEGORIES (SAFE MIGRATION)
-- ==========================================
CREATE TABLE IF NOT EXISTS skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to select skill_categories" ON skill_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert skill_categories" ON skill_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert default categories
INSERT INTO skill_categories (name) VALUES 
('Technical'), ('Programming'), ('Database'), ('Cloud'), ('DevOps'), 
('Security'), ('Networking'), ('Design'), ('Soft Skills'), 
('Communication'), ('Leadership'), ('Management'), ('Language'), 
('Certification'), ('Office Tools'), ('Sales'), ('Marketing'), 
('Finance'), ('HR'), ('Legal'), ('Operations'), ('Research'), ('Other')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES skill_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to select skills" ON skills FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert skills" ON skills FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Normalize employee_skills
ALTER TABLE employee_skills 
ADD COLUMN IF NOT EXISTS skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
ADD COLUMN IF NOT EXISTS certification TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Migrate existing data (Safe Migration)
-- We fetch the 'Technical' category ID to use as a fallback for existing skills
DO $$ 
DECLARE
  tech_cat_id UUID;
BEGIN
  SELECT id INTO tech_cat_id FROM skill_categories WHERE name = 'Technical' LIMIT 1;

  INSERT INTO skills (name, category_id)
  SELECT DISTINCT skill_name, tech_cat_id 
  FROM employee_skills 
  WHERE skill_name IS NOT NULL
  ON CONFLICT (name) DO NOTHING;

  UPDATE employee_skills es
  SET skill_id = s.id
  FROM skills s
  WHERE es.skill_name = s.name AND es.skill_id IS NULL;
END $$;

-- Note: We are explicitly NOT dropping the `skill_name` column yet to preserve data safety!
-- ALTER TABLE employee_skills DROP COLUMN IF EXISTS skill_name;

-- ==========================================
-- 4. MASTER RECORD: NEW NORMALIZED TABLES
-- ==========================================

-- Documents
CREATE TABLE IF NOT EXISTS employee_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL, -- 'resume', 'contract', 'pan', 'aadhaar', 'passport', 'certificates', 'offer_letter'
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own documents" ON employee_documents FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR 
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'super_admin', 'hr_manager'))
);

-- Certifications
CREATE TABLE IF NOT EXISTS employee_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    credential_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE employee_certifications ENABLE ROW LEVEL SECURITY;

-- Education
CREATE TABLE IF NOT EXISTS employee_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    school TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT,
    start_date DATE,
    end_date DATE,
    cgpa TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE employee_education ENABLE ROW LEVEL SECURITY;

-- Experience
CREATE TABLE IF NOT EXISTS employee_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    title TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    location TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE employee_experience ENABLE ROW LEVEL SECURITY;

-- Preferences
CREATE TABLE IF NOT EXISTS employee_preferences (
    employee_id UUID PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system',
    language TEXT DEFAULT 'en',
    timezone TEXT,
    dashboard_widgets JSONB DEFAULT '[]'::jsonb,
    notification_settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE employee_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own preferences" ON employee_preferences FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own preferences" ON employee_preferences FOR ALL USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

-- Fallback RLS for read on new tables (HR/Admins can read all, employees read their own)
-- Since we will implement granular RBAC in the application layer, DB RLS is a secondary safety net.
CREATE POLICY "Employees can view own certifications" ON employee_certifications FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id));
CREATE POLICY "Employees can view own education" ON employee_education FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id));
CREATE POLICY "Employees can view own experience" ON employee_experience FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id));

-- To keep it simple for the demo, we grant read access to authenticated users and enforce granular RBAC in Next.js Server Actions.
CREATE POLICY "Auth users can read employee_certifications" ON employee_certifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can read employee_education" ON employee_education FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can read employee_experience" ON employee_experience FOR SELECT USING (auth.role() = 'authenticated');

-- ==========================================
-- 5. INITIALIZE PREFERENCES FOR EXISTING EMPLOYEES
-- ==========================================
INSERT INTO employee_preferences (employee_id)
SELECT id FROM employees
ON CONFLICT (employee_id) DO NOTHING;
