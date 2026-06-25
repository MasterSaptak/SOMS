ALTER TABLE employee_skills DROP CONSTRAINT IF EXISTS employee_skills_proficiency_check;
ALTER TABLE employee_skills ADD CONSTRAINT employee_skills_proficiency_check CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert'));
