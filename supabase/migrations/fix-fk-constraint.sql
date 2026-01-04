-- =====================================================
-- FIX: Remove foreign key constraint on user_id
-- =====================================================
-- The old schema has: user_id UUID REFERENCES users(id)
-- This causes inserts to fail because Supabase Auth users
-- are NOT automatically added to the users table.
-- 
-- This migration removes the FK constraint so sessions
-- can be created for any authenticated user.
-- =====================================================

-- Drop the foreign key constraint
ALTER TABLE questionnaire_sessions 
DROP CONSTRAINT IF EXISTS questionnaire_sessions_user_id_fkey;

-- Add missing columns if they don't exist (from schema-complete.sql)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questionnaire_sessions' AND column_name = 'messages') THEN
        ALTER TABLE questionnaire_sessions ADD COLUMN messages JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questionnaire_sessions' AND column_name = 'language') THEN
        ALTER TABLE questionnaire_sessions ADD COLUMN language VARCHAR(10) DEFAULT 'en-US';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questionnaire_sessions' AND column_name = 'accumulated_context') THEN
        ALTER TABLE questionnaire_sessions ADD COLUMN accumulated_context JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questionnaire_sessions' AND column_name = 'completed') THEN
        ALTER TABLE questionnaire_sessions ADD COLUMN completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Verification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'questionnaire_sessions'
ORDER BY ordinal_position;
