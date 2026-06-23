-- 20240101000011_leaves_redesign.sql

-- Add new columns for the redesigned leave policy
ALTER TABLE leaves
ADD COLUMN is_paid BOOLEAN DEFAULT true,
ADD COLUMN documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
ADD COLUMN payroll_processed BOOLEAN DEFAULT false,
ADD COLUMN salary_deducted BOOLEAN DEFAULT false,
ADD COLUMN emergency_category TEXT,
ADD COLUMN doctor_name TEXT,
ADD COLUMN hospital_name TEXT,
ADD COLUMN medical_document_urls JSONB DEFAULT '[]'::jsonb;
