-- Migration: Add Safety Incident Description Question
-- This adds a conditional textarea for when safety incidents > 0

-- Insert the new safety incident description question
INSERT INTO pillar_questions (
  pillar, 
  question_id, 
  question_text, 
  question_type, 
  required, 
  options, 
  order_index,
  conditional_depends_on,
  conditional_show_when
) VALUES (
  'safety',
  'safety-incident-description', 
  'Please describe the safety incident(s):',
  'textarea',
  true,
  NULL,
  2,
  'safety-incidents-count',
  '["1", "2 or more"]'::jsonb
)
ON CONFLICT (pillar, question_id) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  question_type = EXCLUDED.question_type,
  required = EXCLUDED.required,
  options = EXCLUDED.options,
  order_index = EXCLUDED.order_index,
  conditional_depends_on = EXCLUDED.conditional_depends_on,
  conditional_show_when = EXCLUDED.conditional_show_when,
  updated_at = TIMEZONE('utc'::text, NOW());