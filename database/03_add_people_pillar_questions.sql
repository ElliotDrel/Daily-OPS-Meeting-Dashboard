-- Add People pillar questions to the pillar_questions table
-- This script adds the two questions requested for the People pillar:
-- 1. How many no shows did we have
-- 2. How many employees do we have in training

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
) VALUES 
-- People pillar questions
(
  'people',
  'no-shows-count',
  'How many no shows did we have?',
  'number',
  true,
  NULL,
  1,
  NULL,
  NULL
),
(
  'people',
  'employees-in-training',
  'How many employees do we have in training?',
  'number',
  true,
  NULL,
  2,
  NULL,
  NULL
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