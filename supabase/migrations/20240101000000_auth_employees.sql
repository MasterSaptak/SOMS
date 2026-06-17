-- 20240101000000_auth_employees.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (extends auth.users)
-- Manages basic identity and roles
CREATE TYPE user_role AS ENUM ('admin', 'employee');

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'employee',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Employees Table
-- Stores detailed employee information
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    employee_id_string TEXT UNIQUE, -- e.g., "EMP-001"
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    department TEXT,
    designation TEXT,
    joining_date DATE DEFAULT CURRENT_DATE,
    profile_photo TEXT, -- URL to avatar
    address TEXT,
    emergency_contact TEXT,
    employment_status TEXT DEFAULT 'active', -- active, inactive, terminated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
$$;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (auth.is_admin());

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" 
ON profiles FOR UPDATE 
USING (auth.is_admin());

-- Employees Policies
CREATE POLICY "Users can view their own employee record" 
ON employees FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all employee records" 
ON employees FOR SELECT 
USING (auth.is_admin());

CREATE POLICY "Users can update non-critical info on their own record" 
ON employees FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all employee records" 
ON employees FOR ALL 
USING (auth.is_admin());


-- Trigger: Auto-create profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee'::user_role)
    );

    -- Auto-create an employee record placeholder
    INSERT INTO public.employees (user_id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Employee'),
        NEW.email
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
