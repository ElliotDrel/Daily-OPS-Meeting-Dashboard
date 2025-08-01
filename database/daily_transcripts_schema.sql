-- Daily Transcripts Storage Schema for Supabase
-- This schema creates a table for storing daily meeting transcripts with additional notes

-- Table for storing daily transcripts (one per date)
CREATE TABLE IF NOT EXISTS daily_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE, -- One transcript per date
  transcript TEXT NOT NULL CHECK (length(transcript) >= 1000), -- Minimum 1000 characters required
  additional_notes TEXT DEFAULT NULL, -- Optional additional notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_transcripts_date ON daily_transcripts(date);
CREATE INDEX IF NOT EXISTS idx_daily_transcripts_created_at ON daily_transcripts(created_at);

-- Row Level Security (RLS) - Enable and allow all operations for now
ALTER TABLE daily_transcripts ENABLE ROW LEVEL SECURITY;

-- Policies for daily_transcripts (allow full access following existing pattern)
CREATE POLICY "Allow full access to daily_transcripts" ON daily_transcripts
  FOR ALL USING (true);

-- Trigger to automatically update updated_at (using existing function)
CREATE TRIGGER update_daily_transcripts_updated_at BEFORE UPDATE ON daily_transcripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();