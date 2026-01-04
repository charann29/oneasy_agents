-- =====================================================
-- RUN THIS IN SUPABASE PROJECT: xdivsjtvxwgyaxfwhgoe
-- =====================================================
-- Go to: https://supabase.com/dashboard/project/xdivsjtvxwgyaxfwhgoe/sql
-- Paste and run this SQL
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the questionnaire_sessions table with COMPLETE schema
CREATE TABLE IF NOT EXISTS questionnaire_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,  -- No FK constraint to users table!
  
  -- Session State
  current_phase INTEGER DEFAULT 0,
  current_question_index INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_phases INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  status VARCHAR(50) DEFAULT 'in_progress',
  
  -- Stored Data (JSONB for flexibility)
  answers JSONB DEFAULT '{}',
  messages JSONB DEFAULT '[]',
  accumulated_context JSONB DEFAULT '{}',
  
  -- Metadata
  language VARCHAR(10) DEFAULT 'en-US',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON questionnaire_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON questionnaire_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_completed ON questionnaire_sessions(completed);

-- Row Level Security (RLS)
ALTER TABLE questionnaire_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own sessions" ON questionnaire_sessions
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can create own sessions" ON questionnaire_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own sessions" ON questionnaire_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON questionnaire_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Verify table was created
SELECT 'Table created successfully!' as status,
       COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'questionnaire_sessions';
