-- Supabase Migration: Create Questionnaire Tables
-- Run this in your Supabase SQL Editor

-- 1. Questionnaire Sessions Table
CREATE TABLE IF NOT EXISTS questionnaire_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Session State
    current_phase INTEGER DEFAULT 0,
    current_question_index INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_phases INTEGER[] DEFAULT '{}',
    
    -- Stored Data
    answers JSONB DEFAULT '{}',
    messages JSONB DEFAULT '[]',
    
    -- Metadata
    channel TEXT DEFAULT 'web',
    language TEXT DEFAULT 'en-US',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Conversation History Table (for detailed tracking)
CREATE TABLE IF NOT EXISTS conversation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,
    
    -- Message Content
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    
    -- Optional metadata
    question_id TEXT,
    phase_name TEXT,
    agent_outputs JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Agent Activity Log (track agent executions)
CREATE TABLE IF NOT EXISTS agent_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 4. Business Plans (generated outputs)
CREATE TABLE IF NOT EXISTS business_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Plan Content
    plan_type TEXT NOT NULL, -- 'executive_summary', 'financial_model', 'market_analysis', etc.
    content JSONB NOT NULL,
    markdown_content TEXT,
    
    -- Metadata
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'draft', -- 'draft', 'final', 'exported'
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON questionnaire_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_completed ON questionnaire_sessions(completed);
CREATE INDEX IF NOT EXISTS idx_conversation_session ON conversation_history(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_log_session ON agent_activity_log(session_id);
CREATE INDEX IF NOT EXISTS idx_plans_session ON business_plans(session_id);

-- Enable Row Level Security
ALTER TABLE questionnaire_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own sessions" ON questionnaire_sessions
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own sessions" ON questionnaire_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own sessions" ON questionnaire_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations" ON conversation_history
    FOR SELECT USING (
        session_id IN (SELECT id FROM questionnaire_sessions WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own conversations" ON conversation_history
    FOR INSERT WITH CHECK (
        session_id IN (SELECT id FROM questionnaire_sessions WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view own agent logs" ON agent_activity_log
    FOR SELECT USING (
        session_id IN (SELECT id FROM questionnaire_sessions WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own agent logs" ON agent_activity_log
    FOR INSERT WITH CHECK (
        session_id IN (SELECT id FROM questionnaire_sessions WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view own plans" ON business_plans
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own plans" ON business_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own plans" ON business_plans
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating timestamps
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON questionnaire_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON business_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant access to authenticated users
GRANT ALL ON questionnaire_sessions TO authenticated;
GRANT ALL ON conversation_history TO authenticated;
GRANT ALL ON agent_activity_log TO authenticated;
GRANT ALL ON business_plans TO authenticated;
