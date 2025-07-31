-- Step 2: Update Safety Incident Questions to Use Smart Dropdown
-- Run this AFTER running the schema update script

-- Update all safety incident description questions to use smart-incident-select
UPDATE pillar_questions 
SET 
  question_type = 'smart-incident-select',
  question_text = CASE 
    WHEN question_id = 'safety-incident-1-description' THEN 'Incident #1:'
    WHEN question_id = 'safety-incident-2-description' THEN 'Incident #2:'
    WHEN question_id = 'safety-incident-3-description' THEN 'Incident #3:'
    WHEN question_id = 'safety-incident-4-description' THEN 'Incident #4:'
    WHEN question_id = 'safety-incident-5-description' THEN 'Incident #5:'
    WHEN question_id = 'safety-incident-6-description' THEN 'Incident #6:'
    WHEN question_id = 'safety-incident-7-description' THEN 'Incident #7:'
    WHEN question_id = 'safety-incident-8-description' THEN 'Incident #8:'
    WHEN question_id = 'safety-incident-9-description' THEN 'Incident #9:'
    WHEN question_id = 'safety-incident-10-description' THEN 'Incident #10:'
    ELSE question_text
  END,
  updated_at = TIMEZONE('utc'::text, NOW())
WHERE 
  pillar = 'safety' 
  AND question_id LIKE 'safety-incident-%-description'
  AND question_type = 'textarea';

-- Verify the changes
SELECT 
  question_id,
  question_text,
  question_type,
  required,
  conditional_depends_on,
  conditional_show_when
FROM pillar_questions 
WHERE pillar = 'safety' 
ORDER BY order_index;