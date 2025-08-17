-- Migration: Add email column to students table if it doesn't exist
-- This fixes the ER_BAD_FIELD_ERROR for missing email column

-- Check if email column exists and add it if missing
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE AFTER last_name;

-- Update existing records to have a default email if needed
-- This is optional and can be removed if not needed
UPDATE students 
SET email = CONCAT(first_name, '.', last_name, '@example.com') 
WHERE email IS NULL AND first_name IS NOT NULL AND last_name IS NOT NULL;

-- Ensure the column is properly indexed
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_email ON students(email);
