-- Migration: Add session_duration column to counseling_sessions table
-- This fixes the "Unknown column 'cs.session_duration'" error

ALTER TABLE counseling_sessions 
ADD COLUMN session_duration INT DEFAULT 0 COMMENT 'Duration in minutes';

-- Update existing records with a default duration
UPDATE counseling_sessions 
SET session_duration = 45 
WHERE session_duration = 0;

-- Add index for better performance on analytics queries
CREATE INDEX idx_session_duration ON counseling_sessions(session_duration);
