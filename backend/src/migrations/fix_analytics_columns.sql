-- Fix missing columns for analytics queries
-- This addresses the "Unknown column" errors in analytics routes

-- Add session_duration column to counseling_sessions if it doesn't exist
ALTER TABLE counseling_sessions 
ADD COLUMN IF NOT EXISTS session_duration INT DEFAULT 45 COMMENT 'Duration in minutes';

-- Update existing records with default duration
UPDATE counseling_sessions 
SET session_duration = 45 
WHERE session_duration IS NULL OR session_duration = 0;

-- Add counselor_name column if it doesn't exist
ALTER TABLE counseling_sessions 
ADD COLUMN IF NOT EXISTS counselor_name VARCHAR(255);

-- Add indexes for better performance on analytics queries
CREATE INDEX IF NOT EXISTS idx_session_duration ON counseling_sessions(session_duration);
CREATE INDEX IF NOT EXISTS idx_counselor_name ON counseling_sessions(counselor_name);
CREATE INDEX IF NOT EXISTS idx_session_date ON counseling_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_student_id ON counseling_sessions(student_id);

-- Ensure all required columns exist
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'All required columns exist'
    ELSE 'Missing required columns'
  END as status
FROM information_schema.columns 
WHERE table_schema = 'career_guidance' 
  AND table_name = 'counseling_sessions'
  AND column_name IN ('session_duration', 'counselor_name', 'session_date', 'student_id');
