-- Migration: Remove 1000 character minimum constraint from daily_transcripts
-- This migration removes the minimum character requirement and replaces it with a simple non-empty check

-- Remove the existing constraint
ALTER TABLE daily_transcripts DROP CONSTRAINT IF EXISTS daily_transcripts_transcript_check;

-- Add new constraint for non-empty transcript (handles whitespace-only cases)
ALTER TABLE daily_transcripts ADD CONSTRAINT daily_transcripts_transcript_check 
  CHECK (length(trim(transcript)) > 0);

-- Rollback migration (if needed):
-- ALTER TABLE daily_transcripts DROP CONSTRAINT IF EXISTS daily_transcripts_transcript_check;
-- ALTER TABLE daily_transcripts ADD CONSTRAINT daily_transcripts_transcript_check 
--   CHECK (length(transcript) >= 1000); 