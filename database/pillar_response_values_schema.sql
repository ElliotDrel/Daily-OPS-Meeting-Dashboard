-- Pillar Response Values - Normalized Storage Schema
-- This schema creates a normalized table for storing pillar response values
-- alongside the existing JSONB structure for gradual migration

-- Create the new normalized response values table
CREATE TABLE IF NOT EXISTS pillar_response_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID NOT NULL REFERENCES pillar_responses(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  
  -- Type-specific value columns (only one should be populated per row)
  value_text TEXT,
  value_number NUMERIC,
  value_boolean BOOLEAN,
  value_array TEXT[], -- For multiselect responses
  
  -- Metadata for validation and queries
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'number', 'select', 'boolean', 'textarea', 'multiselect')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  UNIQUE(response_id, question_id),
  
  -- Ensure only one value type is populated per row
  CONSTRAINT single_value_type CHECK (
    (value_text IS NOT NULL)::int + 
    (value_number IS NOT NULL)::int + 
    (value_boolean IS NOT NULL)::int + 
    (value_array IS NOT NULL)::int = 1
  ),
  
  -- Ensure value type matches question type
  CONSTRAINT value_type_match CHECK (
    (question_type IN ('text', 'textarea', 'select') AND value_text IS NOT NULL) OR
    (question_type = 'number' AND value_number IS NOT NULL) OR
    (question_type = 'boolean' AND value_boolean IS NOT NULL) OR
    (question_type = 'multiselect' AND value_array IS NOT NULL)
  )
);

-- Create performance-optimized indexes
-- Primary lookup by response_id for getting all values for a response
CREATE INDEX IF NOT EXISTS idx_response_values_response_id 
ON pillar_response_values(response_id);

-- Primary lookup by question_id for chart generation
CREATE INDEX IF NOT EXISTS idx_response_values_question_id 
ON pillar_response_values(question_id);

-- Composite index for chart queries (question + response relationship)
CREATE INDEX IF NOT EXISTS idx_response_values_question_response 
ON pillar_response_values(question_id, response_id);

-- Specialized index for numeric value aggregations (chart performance)
CREATE INDEX IF NOT EXISTS idx_response_values_numeric_analysis 
ON pillar_response_values(question_id, value_number, created_at) 
WHERE value_number IS NOT NULL;

-- Index for text/categorical value analysis
CREATE INDEX IF NOT EXISTS idx_response_values_text_analysis 
ON pillar_response_values(question_id, value_text, created_at) 
WHERE value_text IS NOT NULL;

-- Index for array value analysis (multiselect questions)
CREATE INDEX IF NOT EXISTS idx_response_values_array_analysis 
ON pillar_response_values USING GIN(value_array) 
WHERE value_array IS NOT NULL;

-- Time-series analysis index (for trend charts)
CREATE INDEX IF NOT EXISTS idx_response_values_time_series 
ON pillar_response_values(question_id, created_at, value_number) 
WHERE value_number IS NOT NULL;

-- Add foreign key constraint to pillar_questions table
-- This ensures referential integrity and enables query optimization
ALTER TABLE pillar_response_values 
ADD CONSTRAINT IF NOT EXISTS fk_response_values_question 
FOREIGN KEY (question_id) REFERENCES pillar_questions(question_id) 
ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_pillar_response_values_updated_at 
BEFORE UPDATE ON pillar_response_values
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE pillar_response_values ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (match existing pillar_responses policies)
CREATE POLICY IF NOT EXISTS "Allow full access to pillar_response_values" 
ON pillar_response_values FOR ALL USING (true);

-- Add helpful comments for documentation
COMMENT ON TABLE pillar_response_values IS 'Normalized storage for pillar response values, optimized for analytics and chart generation';
COMMENT ON COLUMN pillar_response_values.response_id IS 'Foreign key to pillar_responses table';
COMMENT ON COLUMN pillar_response_values.question_id IS 'Foreign key to pillar_questions table';
COMMENT ON COLUMN pillar_response_values.value_text IS 'Text values for text, textarea, and select questions';
COMMENT ON COLUMN pillar_response_values.value_number IS 'Numeric values for number questions';
COMMENT ON COLUMN pillar_response_values.value_boolean IS 'Boolean values for boolean questions';
COMMENT ON COLUMN pillar_response_values.value_array IS 'Array values for multiselect questions';
COMMENT ON COLUMN pillar_response_values.question_type IS 'Type of question for validation and query optimization';

-- Create a view for easier querying that joins with response metadata
CREATE OR REPLACE VIEW pillar_response_values_with_metadata AS
SELECT 
  prv.*,
  pr.pillar,
  pr.response_date,
  pr.user_id,
  pq.question_text,
  pq.required,
  pq.options
FROM pillar_response_values prv
JOIN pillar_responses pr ON prv.response_id = pr.id
JOIN pillar_questions pq ON prv.question_id = pq.question_id AND pr.pillar = pq.pillar;

COMMENT ON VIEW pillar_response_values_with_metadata IS 'Convenient view combining response values with pillar and question metadata';

-- Grant necessary permissions (adjust as needed for your security model)
-- These permissions should match your existing pillar_responses table permissions
GRANT ALL ON pillar_response_values TO authenticated;
GRANT ALL ON pillar_response_values TO service_role;
GRANT SELECT ON pillar_response_values_with_metadata TO authenticated;
GRANT SELECT ON pillar_response_values_with_metadata TO service_role;