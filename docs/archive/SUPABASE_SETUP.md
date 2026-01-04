# Supabase Setup Guide

## Project Information
- **Project ID**: `sqleasycmnykqsywnbtk`
- **Project URL**: `https://sqleasycmnykqsywnbtk.supabase.co`

---

## 🚀 Quick Setup Steps

### 1. Get Your Supabase API Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/sqleasycmnykqsywnbtk/settings/api)
2. Copy your **anon/public** key
3. Copy your **service_role** key (keep this secret!)

### 2. Update Environment Variables

Replace the placeholder values in `.env.local.new`:

```bash
# Copy the new env file
cp .env.local.new .env.local

# Then edit .env.local and add your actual keys:
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

### 3. Run Database Schema

1. Go to [SQL Editor](https://supabase.com/dashboard/project/sqleasycmnykqsywnbtk/sql/new)
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL

This will create:
- ✅ `users` table
- ✅ `questionnaire_sessions` table
- ✅ `questionnaire_responses` table
- ✅ `business_models` table
- ✅ `mcp_analysis_logs` table
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Automatic timestamp triggers

### 4. Restart Development Server

```bash
# Kill the current dev server
# Then restart:
npm run dev
```

---

## 📊 Database Schema Overview

### Tables

#### `users`
- Stores user profile information
- Fields: id, email, name, phone, location

#### `questionnaire_sessions`
- Tracks questionnaire progress
- Fields: id, user_id, current_phase, current_question_index, answers (JSONB), status

#### `questionnaire_responses`
- Individual question responses
- Fields: id, session_id, question_id, answer (JSONB), auto_populated, agent_analysis

#### `business_models`
- Generated business model documents
- Fields: id, session_id, model_data (JSONB), version, status

#### `mcp_analysis_logs`
- MCP engine execution logs
- Fields: id, session_id, question_id, agents_triggered, skills_executed, thinking_log

---

## 🔐 Security Features

**Row Level Security (RLS)** is enabled on all tables:
- Users can only access their own data
- Automatic user_id filtering
- Secure by default

---

## 🧪 Testing the Connection

After setup, test the connection:

```bash
# In your browser console at localhost:3000
fetch('/api/test-supabase')
  .then(r => r.json())
  .then(console.log)
```

---

## 📝 Next Steps

1. ✅ Install Supabase package: `npm install @supabase/supabase-js`
2. ⏳ Get API keys from Supabase dashboard
3. ⏳ Update `.env.local` with your keys
4. ⏳ Run `supabase/schema.sql` in SQL Editor
5. ⏳ Restart dev server
6. ⏳ Test the questionnaire at `/questionnaire`

---

## 🔗 Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/sqleasycmnykqsywnbtk)
- [SQL Editor](https://supabase.com/dashboard/project/sqleasycmnykqsywnbtk/sql/new)
- [API Settings](https://supabase.com/dashboard/project/sqleasycmnykqsywnbtk/settings/api)
- [Table Editor](https://supabase.com/dashboard/project/sqleasycmnykqsywnbtk/editor)
