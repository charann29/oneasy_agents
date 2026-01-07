-- Migration: Add additional_notes column to questionnaire_sessions
-- This supports the new Review page where users can add extra context before document generation

-- Add additional_notes column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questionnaire_sessions' 
        AND column_name = 'additional_notes'
    ) THEN
        ALTER TABLE questionnaire_sessions 
        ADD COLUMN additional_notes TEXT DEFAULT NULL;
        
        COMMENT ON COLUMN questionnaire_sessions.additional_notes IS 
            'User-provided additional context or notes added during review before document generation';
    END IF;
END
$$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'questionnaire_sessions' 
AND column_name = 'additional_notes';
