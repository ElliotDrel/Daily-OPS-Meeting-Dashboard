-- Data Collection System Schema for Supabase
-- This schema creates tables for storing pillar questions and responses

-- Table for storing pillar questions configuration
CREATE TABLE IF NOT EXISTS pillar_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pillar TEXT NOT NULL,
  question_id TEXT NOT NULL, -- e.g., 'containers-expected', 'safety-incidents-count'  
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'number', 'select', 'boolean', 'textarea', 'multiselect')),
  required BOOLEAN DEFAULT false,
  options JSONB DEFAULT NULL, -- Array of options for select/multiselect
  order_index INTEGER NOT NULL DEFAULT 0,
  conditional_depends_on TEXT DEFAULT NULL, -- Question ID this depends on
  conditional_show_when JSONB DEFAULT NULL, -- Value(s) that trigger showing this question
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  UNIQUE(pillar, question_id)
);

-- Table for storing pillar responses
CREATE TABLE IF NOT EXISTS pillar_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT DEFAULT 'default-user' NOT NULL, -- For future user management  
  pillar TEXT NOT NULL,
  response_date DATE NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}', -- Question ID -> Answer value mapping
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  UNIQUE(user_id, pillar, response_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pillar_questions_pillar ON pillar_questions(pillar);
CREATE INDEX IF NOT EXISTS idx_pillar_questions_order ON pillar_questions(pillar, order_index);
CREATE INDEX IF NOT EXISTS idx_pillar_responses_pillar_date ON pillar_responses(pillar, response_date);
CREATE INDEX IF NOT EXISTS idx_pillar_responses_user ON pillar_responses(user_id, response_date);

-- Row Level Security (RLS) - Enable but allow all operations for now
ALTER TABLE pillar_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillar_responses ENABLE ROW LEVEL SECURITY;

-- Policies for pillar_questions (read-only for most users)
CREATE POLICY "Allow read access to pillar_questions" ON pillar_questions
  FOR SELECT USING (true);

CREATE POLICY "Allow insert access to pillar_questions" ON pillar_questions  
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to pillar_questions" ON pillar_questions
  FOR UPDATE USING (true);

-- Policies for pillar_responses  
CREATE POLICY "Allow full access to pillar_responses" ON pillar_responses
  FOR ALL USING (true);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_pillar_questions_updated_at BEFORE UPDATE ON pillar_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pillar_responses_updated_at BEFORE UPDATE ON pillar_responses  
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default questions for all pillars
INSERT INTO pillar_questions (pillar, question_id, question_text, question_type, required, options, order_index) VALUES
-- Delivery pillar
('delivery', 'containers-expected', 'How many containers are expected today?', 'number', true, NULL, 1),

-- Inventory pillar  
('inventory', 'models-in-backlog', 'What models are currently in backlog?', 'multiselect', true, 
 '["14 inch", "16 inch", "20 inch small", "20 inch large", "24 inch", "26 inch", "adult small", "adult large"]'::jsonb, 1),
('inventory', 'quantity-14-inch', 'How many 14 inch units are in backlog?', 'number', true, NULL, 2),
('inventory', 'quantity-16-inch', 'How many 16 inch units are in backlog?', 'number', true, NULL, 3),
('inventory', 'quantity-20-inch-small', 'How many 20 inch small units are in backlog?', 'number', true, NULL, 4),
('inventory', 'quantity-20-inch-large', 'How many 20 inch large units are in backlog?', 'number', true, NULL, 5),
('inventory', 'quantity-24-inch', 'How many 24 inch units are in backlog?', 'number', true, NULL, 6),
('inventory', 'quantity-26-inch', 'How many 26 inch units are in backlog?', 'number', true, NULL, 7),
('inventory', 'quantity-adult-small', 'How many adult small units are in backlog?', 'number', true, NULL, 8),
('inventory', 'quantity-adult-large', 'How many adult large units are in backlog?', 'number', true, NULL, 9),

-- Production pillar
('production', 'planned-output', 'What is the planned output for today?', 'number', true, NULL, 1),
('production', 'actual-output-yesterday', 'What was the actual output yesterday?', 'number', true, NULL, 2),

-- Quality pillar
('quality', 'quality-issues-yesterday', 'Were there any major quality issues yesterday?', 'select', true, '["Yes", "No"]'::jsonb, 1),
('quality', 'quality-issue-types', 'What type of quality issues occurred?', 'multiselect', true,
 '["Customer complaints", "Defective products", "Supplier issues", "Process failures", "Testing failures", "Specification deviations", "Equipment malfunctions"]'::jsonb, 2),
('quality', 'customer-complaints-details', 'Customer complaints, describe the details:', 'textarea', true, NULL, 3),
('quality', 'defective-products-details', 'Defective products, describe the details:', 'textarea', true, NULL, 4),
('quality', 'supplier-issues-details', 'Supplier issues, describe the details:', 'textarea', true, NULL, 5),
('quality', 'process-failures-details', 'Process failures, describe the details:', 'textarea', true, NULL, 6),
('quality', 'testing-failures-details', 'Testing failures, describe the details:', 'textarea', true, NULL, 7),
('quality', 'specification-deviations-details', 'Specification deviations, describe the details:', 'textarea', true, NULL, 8),
('quality', 'equipment-malfunctions-details', 'Equipment malfunctions, describe the details:', 'textarea', true, NULL, 9),

-- Safety pillar
('safety', 'safety-incidents-count', 'How many safety incidents occurred yesterday?', 'select', true, '["0", "1", "2 or more"]'::jsonb, 1)


ON CONFLICT (pillar, question_id) DO NOTHING;

-- Update conditional dependencies for inventory questions
UPDATE pillar_questions SET 
  conditional_depends_on = 'models-in-backlog',
  conditional_show_when = '"14 inch"'::jsonb
WHERE question_id = 'quantity-14-inch';

UPDATE pillar_questions SET
  conditional_depends_on = 'models-in-backlog', 
  conditional_show_when = '"16 inch"'::jsonb
WHERE question_id = 'quantity-16-inch';

UPDATE pillar_questions SET
  conditional_depends_on = 'models-in-backlog',
  conditional_show_when = '"20 inch small"'::jsonb  
WHERE question_id = 'quantity-20-inch-small';

UPDATE pillar_questions SET
  conditional_depends_on = 'models-in-backlog',
  conditional_show_when = '"20 inch large"'::jsonb
WHERE question_id = 'quantity-20-inch-large';

UPDATE pillar_questions SET
  conditional_depends_on = 'models-in-backlog',
  conditional_show_when = '"24 inch"'::jsonb
WHERE question_id = 'quantity-24-inch';

UPDATE pillar_questions SET
  conditional_depends_on = 'models-in-backlog', 
  conditional_show_when = '"26 inch"'::jsonb
WHERE question_id = 'quantity-26-inch';

UPDATE pillar_questions SET
  conditional_depends_on = 'models-in-backlog',
  conditional_show_when = '"adult small"'::jsonb
WHERE question_id = 'quantity-adult-small';

UPDATE pillar_questions SET
  conditional_depends_on = 'models-in-backlog',
  conditional_show_when = '"adult large"'::jsonb  
WHERE question_id = 'quantity-adult-large';

-- Update conditional dependencies for quality questions
UPDATE pillar_questions SET
  conditional_depends_on = 'quality-issues-yesterday',
  conditional_show_when = '"Yes"'::jsonb
WHERE question_id = 'quality-issue-types';

UPDATE pillar_questions SET
  conditional_depends_on = 'quality-issue-types',
  conditional_show_when = '"Customer complaints"'::jsonb
WHERE question_id = 'customer-complaints-details';

UPDATE pillar_questions SET
  conditional_depends_on = 'quality-issue-types', 
  conditional_show_when = '"Defective products"'::jsonb
WHERE question_id = 'defective-products-details';

UPDATE pillar_questions SET
  conditional_depends_on = 'quality-issue-types',
  conditional_show_when = '"Supplier issues"'::jsonb
WHERE question_id = 'supplier-issues-details';

UPDATE pillar_questions SET
  conditional_depends_on = 'quality-issue-types',
  conditional_show_when = '"Process failures"'::jsonb  
WHERE question_id = 'process-failures-details';

UPDATE pillar_questions SET
  conditional_depends_on = 'quality-issue-types',
  conditional_show_when = '"Testing failures"'::jsonb
WHERE question_id = 'testing-failures-details';

UPDATE pillar_questions SET
  conditional_depends_on = 'quality-issue-types',
  conditional_show_when = '"Specification deviations"'::jsonb
WHERE question_id = 'specification-deviations-details';

UPDATE pillar_questions SET
  conditional_depends_on = 'quality-issue-types',
  conditional_show_when = '"Equipment malfunctions"'::jsonb
WHERE question_id = 'equipment-malfunctions-details';