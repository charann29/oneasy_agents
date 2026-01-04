-- =============================================================================
-- COMPLETE SUPABASE SCHEMA for CA Business Planner
-- =============================================================================
-- Run this ENTIRE script in Supabase SQL Editor to create all required tables
-- This includes: sessions, conversation history, agent activity logs
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- DROP EXISTING POLICIES (to avoid conflicts on re-run)
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own sessions" ON questionnaire_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON questionnaire_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON questionnaire_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON questionnaire_sessions;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversation_history;
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversation_history;
DROP POLICY IF EXISTS "Users can view own agent logs" ON agent_activity_log;
DROP POLICY IF EXISTS "Users can insert own agent logs" ON agent_activity_log;

-- =============================================================================
-- 1. QUESTIONNAIRE SESSIONS TABLE
-- Main session state - stores answers, messages, progress
-- =============================================================================
CREATE TABLE IF NOT EXISTS questionnaire_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  
  -- Session State
  current_phase INTEGER DEFAULT 0,
  current_question_index INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_phases INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  
  -- Stored Data (JSONB for flexibility)
  answers JSONB DEFAULT '{}',
  messages JSONB DEFAULT '[]',
  accumulated_context JSONB DEFAULT '{}',
  
  -- Metadata
  language VARCHAR(10) DEFAULT 'en-US',
  channel TEXT DEFAULT 'web',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist (for migrations)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionnaire_sessions' AND column_name = 'language') THEN
        ALTER TABLE questionnaire_sessions ADD COLUMN language VARCHAR(10) DEFAULT 'en-US';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionnaire_sessions' AND column_name = 'messages') THEN
        ALTER TABLE questionnaire_sessions ADD COLUMN messages JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionnaire_sessions' AND column_name = 'accumulated_context') THEN
        ALTER TABLE questionnaire_sessions ADD COLUMN accumulated_context JSONB DEFAULT '{}';
    END IF;
END $$;

-- =============================================================================
-- 2. CONVERSATION HISTORY TABLE
-- Stores each message with its context and agent outputs
-- =============================================================================
CREATE TABLE IF NOT EXISTS conversation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,
    
    -- Message Content
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    
    -- Context
    question_id TEXT,
    phase_name TEXT,
    
    -- Agent outputs attached to this message (for assistant messages)
    agent_outputs JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. AGENT ACTIVITY LOG TABLE  
-- Detailed tracking of each agent execution
-- =============================================================================
CREATE TABLE IF NOT EXISTS agent_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,
    
    -- Agent Info
    agent_id TEXT NOT NULL,
    agent_name TEXT,
    skill_used TEXT[],
    
    -- Execution details
    input_message TEXT,
    output_response TEXT,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES for performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON questionnaire_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_completed ON questionnaire_sessions(completed);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON questionnaire_sessions(updated_at);
CREATE INDEX IF NOT EXISTS idx_conversation_session ON conversation_history(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_created ON conversation_history(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_log_session ON agent_activity_log(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_log_agent_id ON agent_activity_log(agent_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE questionnaire_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity_log ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON questionnaire_sessions
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can create own sessions" ON questionnaire_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own sessions" ON questionnaire_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON questionnaire_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Conversation history policies (linked through session)
CREATE POLICY "Users can view own conversations" ON conversation_history
    FOR SELECT USING (
        session_id IN (SELECT id FROM questionnaire_sessions WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own conversations" ON conversation_history
    FOR INSERT WITH CHECK (
        session_id IN (SELECT id FROM questionnaire_sessions WHERE user_id = auth.uid())
    );

-- Agent activity log policies
CREATE POLICY "Users can view own agent logs" ON agent_activity_log
    FOR SELECT USING (
        session_id IN (SELECT id FROM questionnaire_sessions WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own agent logs" ON agent_activity_log
    FOR INSERT WITH CHECK (
        session_id IN (SELECT id FROM questionnaire_sessions WHERE user_id = auth.uid())
    );

-- =============================================================================
-- TRIGGERS for auto-updating timestamps
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sessions_updated_at ON questionnaire_sessions;
CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON questionnaire_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VERIFICATION
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Schema created/updated successfully!';
END $$;

-- Show all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('questionnaire_sessions', 'conversation_history', 'agent_activity_log');

-- Show questionnaire_sessions columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'questionnaire_sessions'
ORDER BY ordinal_position;
