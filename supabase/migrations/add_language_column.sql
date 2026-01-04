-- Migration to add language column to questionnaire_sessions table
-- Run this in Supabase SQL editor

-- Add language column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'questionnaire_sessions' 
        AND column_name = 'language'
    ) THEN
        ALTER TABLE questionnaire_sessions 
        ADD COLUMN language VARCHAR(10) DEFAULT 'en-US';
    END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'questionnaire_sessions';
