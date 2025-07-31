-- Step 1: Update Database Schema to Support Smart Incident Select
-- This adds the new question type to the existing check constraint

-- First, let's see the current constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'pillar_questions'::regclass 
AND contype = 'c';

-- Drop the existing check constraint for question_type
ALTER TABLE pillar_questions 
DROP CONSTRAINT IF EXISTS pillar_questions_question_type_check;

-- Add the new check constraint including 'smart-incident-select'
ALTER TABLE pillar_questions 
ADD CONSTRAINT pillar_questions_question_type_check 
CHECK (question_type IN ('text', 'number', 'select', 'boolean', 'textarea', 'multiselect', 'smart-incident-select'));

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'pillar_questions'::regclass 
AND contype = 'c';