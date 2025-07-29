-- Migration: Update Safety Questions with Expanded Options  
-- This updates the incident count dropdown to go up to 10 and adds individual incident descriptions

-- Remove the old generic incident description question if it exists
DELETE FROM pillar_questions 
WHERE pillar = 'safety' AND question_id = 'safety-incident-description';

-- First, update the safety incidents count question with expanded options (0 through 10, plus "10 or more")
INSERT INTO pillar_questions (
  pillar,
  question_id,
  question_text,
  question_type,
  required,
  options,
  order_index
) VALUES (
  'safety',
  'safety-incidents-count',
  'How many safety incidents occurred yesterday?',
  'select',
  true,
  '["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10 or more"]'::jsonb,
  1
)
ON CONFLICT (pillar, question_id) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  question_type = EXCLUDED.question_type,
  required = EXCLUDED.required,
  options = EXCLUDED.options,
  order_index = EXCLUDED.order_index,
  updated_at = TIMEZONE('utc'::text, NOW());

-- Create individual description questions for each incident number (1-10)
-- Each question shows based on the incident count selected

-- Incident #1 description (shows when count >= 1)
INSERT INTO pillar_questions (pillar, question_id, question_text, question_type, required, options, order_index, conditional_depends_on, conditional_show_when) 
VALUES ('safety', 'safety-incident-1-description', 'Describe incident #1 in detail:', 'textarea', true, NULL, 2, 'safety-incidents-count', '["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10 or more"]'::jsonb)
ON CONFLICT (pillar, question_id) DO UPDATE SET question_text = EXCLUDED.question_text, conditional_show_when = EXCLUDED.conditional_show_when, updated_at = TIMEZONE('utc'::text, NOW());

-- Incident #2 description (shows when count >= 2)
INSERT INTO pillar_questions (pillar, question_id, question_text, question_type, required, options, order_index, conditional_depends_on, conditional_show_when) 
VALUES ('safety', 'safety-incident-2-description', 'Describe incident #2 in detail:', 'textarea', true, NULL, 3, 'safety-incidents-count', '["2", "3", "4", "5", "6", "7", "8", "9", "10", "10 or more"]'::jsonb)
ON CONFLICT (pillar, question_id) DO UPDATE SET question_text = EXCLUDED.question_text, conditional_show_when = EXCLUDED.conditional_show_when, updated_at = TIMEZONE('utc'::text, NOW());

-- Incident #3 description (shows when count >= 3)
INSERT INTO pillar_questions (pillar, question_id, question_text, question_type, required, options, order_index, conditional_depends_on, conditional_show_when) 
VALUES ('safety', 'safety-incident-3-description', 'Describe incident #3 in detail:', 'textarea', true, NULL, 4, 'safety-incidents-count', '["3", "4", "5", "6", "7", "8", "9", "10", "10 or more"]'::jsonb)
ON CONFLICT (pillar, question_id) DO UPDATE SET question_text = EXCLUDED.question_text, conditional_show_when = EXCLUDED.conditional_show_when, updated_at = TIMEZONE('utc'::text, NOW());

-- Incident #4 description (shows when count >= 4)
INSERT INTO pillar_questions (pillar, question_id, question_text, question_type, required, options, order_index, conditional_depends_on, conditional_show_when) 
VALUES ('safety', 'safety-incident-4-description', 'Describe incident #4 in detail:', 'textarea', true, NULL, 5, 'safety-incidents-count', '["4", "5", "6", "7", "8", "9", "10", "10 or more"]'::jsonb)
ON CONFLICT (pillar, question_id) DO UPDATE SET question_text = EXCLUDED.question_text, conditional_show_when = EXCLUDED.conditional_show_when, updated_at = TIMEZONE('utc'::text, NOW());

-- Incident #5 description (shows when count >= 5)
INSERT INTO pillar_questions (pillar, question_id, question_text, question_type, required, options, order_index, conditional_depends_on, conditional_show_when) 
VALUES ('safety', 'safety-incident-5-description', 'Describe incident #5 in detail:', 'textarea', true, NULL, 6, 'safety-incidents-count', '["5", "6", "7", "8", "9", "10", "10 or more"]'::jsonb)
ON CONFLICT (pillar, question_id) DO UPDATE SET question_text = EXCLUDED.question_text, conditional_show_when = EXCLUDED.conditional_show_when, updated_at = TIMEZONE('utc'::text, NOW());

-- Incident #6 description (shows when count >= 6)
INSERT INTO pillar_questions (pillar, question_id, question_text, question_type, required, options, order_index, conditional_depends_on, conditional_show_when) 
VALUES ('safety', 'safety-incident-6-description', 'Describe incident #6 in detail:', 'textarea', true, NULL, 7, 'safety-incidents-count', '["6", "7", "8", "9", "10", "10 or more"]'::jsonb)
ON CONFLICT (pillar, question_id) DO UPDATE SET question_text = EXCLUDED.question_text, conditional_show_when = EXCLUDED.conditional_show_when, updated_at = TIMEZONE('utc'::text, NOW());

-- Incident #7 description (shows when count >= 7)
INSERT INTO pillar_questions (pillar, question_id, question_text, question_type, required, options, order_index, conditional_depends_on, conditional_show_when) 
VALUES ('safety', 'safety-incident-7-description', 'Describe incident #7 in detail:', 'textarea', true, NULL, 8, 'safety-incidents-count', '["7", "8", "9", "10", "10 or more"]'::jsonb)
ON CONFLICT (pillar, question_id) DO UPDATE SET question_text = EXCLUDED.question_text, conditional_show_when = EXCLUDED.conditional_show_when, updated_at = TIMEZONE('utc'::text, NOW());

-- Incident #8 description (shows when count >= 8)
INSERT INTO pillar_questions (pillar, question_id, question_text, question_type, required, options, order_index, conditional_depends_on, conditional_show_when) 
VALUES ('safety', 'safety-incident-8-description', 'Describe incident #8 in detail:', 'textarea', true, NULL, 9, 'safety-incidents-count', '["8", "9", "10", "10 or more"]'::jsonb)
ON CONFLICT (pillar, question_id) DO UPDATE SET question_text = EXCLUDED.question_text, conditional_show_when = EXCLUDED.conditional_show_when, updated_at = TIMEZONE('utc'::text, NOW());

-- Incident #9 description (shows when count >= 9)
INSERT INTO pillar_questions (pillar, question_id, question_text, question_type, required, options, order_index, conditional_depends_on, conditional_show_when) 
VALUES ('safety', 'safety-incident-9-description', 'Describe incident #9 in detail:', 'textarea', true, NULL, 10, 'safety-incidents-count', '["9", "10", "10 or more"]'::jsonb)
ON CONFLICT (pillar, question_id) DO UPDATE SET question_text = EXCLUDED.question_text, conditional_show_when = EXCLUDED.conditional_show_when, updated_at = TIMEZONE('utc'::text, NOW());

-- Incident #10 description (shows when count >= 10)
INSERT INTO pillar_questions (pillar, question_id, question_text, question_type, required, options, order_index, conditional_depends_on, conditional_show_when) 
VALUES ('safety', 'safety-incident-10-description', 'Describe incident #10 in detail:', 'textarea', true, NULL, 11, 'safety-incidents-count', '["10", "10 or more"]'::jsonb)
ON CONFLICT (pillar, question_id) DO UPDATE SET question_text = EXCLUDED.question_text, conditional_show_when = EXCLUDED.conditional_show_when, updated_at = TIMEZONE('utc'::text, NOW());