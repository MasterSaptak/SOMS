-- Add Date of Birth column to the employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS date_of_birth DATE;
