-- Supabase Database Schema for CA Business Planner
-- Project ID: sqleasycmnykqsywnbtk

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- QUESTIONNAIRE SESSIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS questionnaire_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_phase INTEGER DEFAULT 1,
  current_question_index INTEGER DEFAULT 0,
  answers JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed, abandoned
  completed_phases INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- QUESTIONNAIRE RESPONSES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,
  question_id VARCHAR(100) NOT NULL,
  answer JSONB NOT NULL,
  auto_populated JSONB DEFAULT '{}',
  agent_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

-- ==========================================
-- BUSINESS MODELS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS business_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,
  model_data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'draft', -- draft, final, exported
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- MCP ANALYSIS LOGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS mcp_analysis_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,
  question_id VARCHAR(100) NOT NULL,
  agents_triggered TEXT[] DEFAULT ARRAY[]::TEXT[],
  skills_executed TEXT[] DEFAULT ARRAY[]::TEXT[],
  thinking_log TEXT[] DEFAULT ARRAY[]::TEXT[],
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON questionnaire_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON questionnaire_sessions(status);
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON questionnaire_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON questionnaire_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_business_models_session_id ON business_models(session_id);
CREATE INDEX IF NOT EXISTS idx_mcp_logs_session_id ON mcp_analysis_logs(session_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_analysis_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON questionnaire_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON questionnaire_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON questionnaire_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Responses policies
CREATE POLICY "Users can view own responses" ON questionnaire_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questionnaire_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own responses" ON questionnaire_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM questionnaire_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own responses" ON questionnaire_responses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM questionnaire_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Business models policies
CREATE POLICY "Users can view own business models" ON business_models
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questionnaire_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own business models" ON business_models
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM questionnaire_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- MCP logs policies (read-only for users)
CREATE POLICY "Users can view own MCP logs" ON mcp_analysis_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questionnaire_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON questionnaire_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_models_updated_at BEFORE UPDATE ON business_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SAMPLE DATA (Optional - for testing)
-- ==========================================
-- Uncomment to insert sample data
/*
INSERT INTO users (id, email, name, location) VALUES
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User', 'India');

INSERT INTO questionnaire_sessions (id, user_id, current_phase, answers) VALUES
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 1, '{}');
*/
