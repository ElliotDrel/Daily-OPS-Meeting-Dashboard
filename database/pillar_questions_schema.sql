-- Pillar Data Collection System Database Schema
-- Run this in Supabase SQL Editor to create the required tables

-- Table 1: pillar_questions
-- Stores dynamic questions for each pillar with conditional logic support
CREATE TABLE pillar_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar TEXT NOT NULL CHECK (pillar IN ('safety', 'quality', 'cost', 'delivery', 'inventory', 'production')),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('boolean', 'number', 'select', 'text', 'textarea', 'multi_select')),
  question_key TEXT NOT NULL,
  options JSONB, -- for select/multi_select questions, stores array of options
  conditional_parent TEXT, -- references another question_key for conditional display
  conditional_value JSONB, -- value that parent must have to show this question
  is_required BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pillar, question_key)
);

-- Table 2: pillar_responses
-- Stores user responses to questions for each pillar and date
CREATE TABLE pillar_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar TEXT NOT NULL,
  date DATE NOT NULL,
  user_name TEXT NOT NULL,
  question_id UUID REFERENCES pillar_questions(id) ON DELETE CASCADE,
  answer JSONB NOT NULL, -- flexible storage for any answer type
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pillar, date, user_name, question_id)
);

-- Add indexes for better performance
CREATE INDEX idx_pillar_questions_pillar ON pillar_questions(pillar);
CREATE INDEX idx_pillar_questions_active ON pillar_questions(pillar, is_active) WHERE is_active = true;
CREATE INDEX idx_pillar_questions_conditional ON pillar_questions(conditional_parent) WHERE conditional_parent IS NOT NULL;

CREATE INDEX idx_pillar_responses_pillar_date ON pillar_responses(pillar, date);
CREATE INDEX idx_pillar_responses_question_id ON pillar_responses(question_id);
CREATE INDEX idx_pillar_responses_user_date ON pillar_responses(user_name, date);

-- Add updated_at trigger for pillar_questions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pillar_questions_updated_at BEFORE UPDATE ON pillar_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pillar_responses_updated_at BEFORE UPDATE ON pillar_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for production use
ALTER TABLE pillar_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillar_responses ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your authentication needs)
CREATE POLICY "Enable read access for all users" ON pillar_questions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON pillar_responses FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON pillar_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON pillar_responses FOR UPDATE USING (true);