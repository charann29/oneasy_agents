-- Multi-Chat History Migration
-- Creates tables for storing multiple conversations per user

-- Conversations table
create table if not exists conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  current_phase integer default 0,
  progress integer default 0,
  language text default 'en',
  is_active boolean default true
);

-- Conversation messages table
create table if not exists conversation_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text check (role in ('user', 'assistant', 'system')),
  content text,
  created_at timestamp with time zone default now()
);

-- Conversation answers table
create table if not exists conversation_answers (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id) on delete cascade,
  question_id text not null,
  answer jsonb,
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists idx_conversations_user_id on conversations(user_id);
create index if not exists idx_conversations_updated_at on conversations(updated_at desc);
create index if not exists idx_conversation_messages_conversation_id on conversation_messages(conversation_id);
create index if not exists idx_conversation_answers_conversation_id on conversation_answers(conversation_id);

-- RLS Policies
alter table conversations enable row level security;
alter table conversation_messages enable row level security;
alter table conversation_answers enable row level security;

-- Conversations policies
create policy "Users can view own conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on conversations for delete
  using (auth.uid() = user_id);

-- Messages policies
create policy "Users can view messages in own conversations"
  on conversation_messages for select
  using (exists (
    select 1 from conversations
    where id = conversation_id and user_id = auth.uid()
  ));

create policy "Users can insert messages in own conversations"
  on conversation_messages for insert
  with check (exists (
    select 1 from conversations
    where id = conversation_id and user_id = auth.uid()
  ));

-- Answers policies
create policy "Users can view answers in own conversations"
  on conversation_answers for select
  using (exists (
    select 1 from conversations
    where id = conversation_id and user_id = auth.uid()
  ));

create policy "Users can insert answers in own conversations"
  on conversation_answers for insert
  with check (exists (
    select 1 from conversations
    where id = conversation_id and user_id = auth.uid()
  ));

create policy "Users can update answers in own conversations"
  on conversation_answers for update
  using (exists (
    select 1 from conversations
    where id = conversation_id and user_id = auth.uid()
  ));
