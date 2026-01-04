# 🤖 Abhishek CA - Conversational Business Planning

## Overview

Abhishek CA is a conversational AI interface that transforms the traditional 147-question business planning questionnaire into a natural, flowing conversation. Instead of filling out forms, users chat with Abhishek (a friendly Chartered Accountant persona) who asks thoughtful questions and guides them through building a comprehensive business plan.

## Key Features

### 🗣️ Natural Conversation
- Asks 1-2 questions at a time (never overwhelming)
- Acknowledges and reflects on user answers
- Shows genuine interest and provides encouragement
- Adapts questions based on previous responses
- Uses simple, jargon-free language

### 📊 Intelligent Data Extraction
- Automatically extracts structured data from natural responses
- Maps conversational answers to 147+ business plan fields
- Validates and cross-checks information
- Tracks confidence levels for extracted data

### 🎯 8-Phase Conversation Flow
1. **Getting to Know You** (5-10 min) - Background, experience, motivation
2. **Understanding the Business Idea** (10-15 min) - Problem, solution, customers
3. **Market & Customers** (10-15 min) - Target market, competitors, validation
4. **Business Model & Revenue** (10-15 min) - Monetization, pricing, projections
5. **Operations & Team** (8-10 min) - Team structure, key roles
6. **Go-to-Market Strategy** (8-10 min) - Customer acquisition, marketing
7. **Funding & Resources** (5-8 min) - Capital needs, fundraising
8. **Risks & Strategy** (5-7 min) - Risk mitigation, success factors

### 🚀 Seamless Integration
- Works with existing multi-agent orchestration system
- Triggers appropriate agents and skills in background
- Generates complete business plan upon completion
- Supports pause/resume functionality

## Architecture

```
┌─────────────────────────────────────────────────┐
│         User Interface (React)                  │
│  /app/abhishek/page.tsx                        │
│  Beautiful chat UI with progress tracking       │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         React Hooks Layer                       │
│  /lib/hooks/use-chat.ts                        │
│  useChatWithAbhishek(), useConversationList()  │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         API Endpoint                            │
│  /api/v1/chat/abhishek/route.ts               │
│  POST: Send message, GET: Load conversation     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         Conversation Service                    │
│  /lib/services/conversation-service.ts         │
│  State management, phase tracking, extraction   │
└──────────────────┬──────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌──────────────────┐  ┌─────────────────────┐
│  Orchestrator    │  │  Database Service   │
│  Agent execution │  │  Conversation state │
└──────────────────┘  └─────────────────────┘
```

## Quick Start

### 1. Ensure Prerequisites

```bash
# Make sure server is running
cd ca-business-planner
npm run dev

# Check GROQ_API_KEY is set
cat .env.local | grep GROQ_API_KEY
```

### 2. Visit the Interface

Open your browser to:
```
http://localhost:3000/abhishek
```

### 3. Start Chatting

The conversation starts automatically with Abhishek's greeting. Just type your responses naturally!

## Testing the Conversational Flow

### Manual Testing

#### Test 1: Complete Conversation Flow

**Start conversation:**
```
User: Hi, I'm John. I want to start a business but I'm not sure where to begin.
```

**Expected:** Abhishek asks about your background and experience.

**Continue:**
```
User: I have a degree in marketing and 5 years experience in the tech industry.
```

**Expected:** Abhishek acknowledges and asks about your business idea.

**Continue through all phases** - Abhishek will guide you naturally.

#### Test 2: Data Extraction

Watch the sidebar to see **"Data Collected"** section populate automatically as you chat. Each answer should extract relevant fields.

#### Test 3: Progress Tracking

- Progress bar should update after each phase
- Phase checklist should show completion status
- Current phase should be highlighted

#### Test 4: Pause and Resume

- Refresh the page mid-conversation
- Use the conversation ID to resume (stored automatically)

### API Testing with curl

#### Send a message:
```bash
curl -X POST http://localhost:3000/api/v1/chat/abhishek \
  -H 'Authorization: Bearer demo-api-key-12345' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Hi, I am John and I want to start a business"
  }' | jq
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_1234567890_abc123",
    "message": "Hi John! Great to meet you! Starting a business is exciting...",
    "phase": "getting_to_know",
    "progress": 5,
    "extractedData": {
      "user_name": "John"
    },
    "isComplete": false
  }
}
```

#### Continue the conversation:
```bash
curl -X POST http://localhost:3000/api/v1/chat/abhishek \
  -H 'Authorization: Bearer demo-api-key-12345' \
  -H 'Content-Type: application/json' \
  -d '{
    "conversationId": "conv_1234567890_abc123",
    "message": "I have 5 years experience in tech marketing"
  }' | jq
```

#### Get conversation state:
```bash
curl -X GET 'http://localhost:3000/api/v1/chat/abhishek?conversationId=conv_1234567890_abc123' \
  -H 'Authorization: Bearer demo-api-key-12345' | jq
```

#### List all conversations:
```bash
curl -X GET 'http://localhost:3000/api/v1/chat/abhishek?list=true&limit=10' \
  -H 'Authorization: Bearer demo-api-key-12345' | jq
```

## React Hook Usage

### Basic Usage

```tsx
import { useChatWithAbhishek } from '@/lib/hooks/use-chat';

function MyComponent() {
  const {
    messages,
    phase,
    progress,
    extractedData,
    isComplete,
    loading,
    sendMessage,
    startNewConversation
  } = useChatWithAbhishek();

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>{msg.content}</div>
      ))}

      <input
        onSubmit={(text) => sendMessage(text)}
        disabled={loading || isComplete}
      />

      <div>Progress: {progress}%</div>
      <div>Phase: {phase}</div>
    </div>
  );
}
```

### List Conversations

```tsx
import { useConversationList } from '@/lib/hooks/use-chat';

function ConversationHistory() {
  const { conversations, loading, refresh } = useConversationList();

  return (
    <div>
      {conversations.map(conv => (
        <div key={conv.conversationId}>
          {conv.progress}% complete - {conv.phase}
        </div>
      ))}
    </div>
  );
}
```

## Conversation State Schema

```typescript
interface ConversationState {
  conversationId: string;
  userId: string;
  phase: ConversationPhase;
  messages: ConversationMessage[];
  extractedData: Record<string, any>;
  progress: number; // 0-100
  startedAt: number;
  lastActiveAt: number;
  completedAt?: number;
  linkedPlanId?: string; // Set when business plan is generated
}
```

## Phase Requirements

Each phase has required fields that must be extracted before moving to the next:

| Phase | Required Fields | Approx. Duration |
|-------|----------------|-----------------|
| getting_to_know | user_name, education | 5-10 min |
| business_idea | business_idea, problem_solved | 10-15 min |
| market_customers | target_customer, geography | 10-15 min |
| business_model | revenue_model, pricing | 10-15 min |
| operations_team | team_size | 8-10 min |
| gtm_growth | marketing_channels | 8-10 min |
| funding_resources | funding_needed | 5-8 min |
| risks_strategy | key_risks | 5-7 min |

## Data Extraction Patterns

### Phase 1: Getting to Know You
```
Pattern: "my name is [NAME]" → extracts: user_name
Pattern: "degree in [FIELD]" → extracts: education
Pattern: "work at [COMPANY]" → extracts: current_employment
```

### Phase 2: Business Idea
```
Pattern: mentions "business|startup|company" → extracts: business_idea
Pattern: mentions "problem|challenge" → extracts: problem_solved
```

### Phase 3: Market & Customers
```
Pattern: "customers|users|clients" → extracts: target_customer
Pattern: "local|national|global" → extracts: geography
```

### Phase 4: Business Model
```
Pattern: "subscription|commission|licensing" → extracts: revenue_model
Pattern: "$XX per month/year" → extracts: pricing
```

## Rate Limiting

Chat endpoint has higher rate limits for conversational flow:
- **20 messages per minute** (vs 10 for other endpoints)
- Designed for natural back-and-forth conversation

## Success Metrics

Track these metrics to measure conversation quality:

1. **Completion Rate**: % of users who complete all 8 phases
2. **Average Time to Complete**: Target 30-40 minutes
3. **Data Extraction Accuracy**: % of fields correctly extracted
4. **User Satisfaction**: Post-conversation rating
5. **Drop-off Points**: Where users abandon the conversation

## Troubleshooting

### Issue 1: Abhishek Not Responding

**Check:**
1. Server is running: `npm run dev`
2. GROQ_API_KEY is set in `.env.local`
3. No rate limits hit (check console logs)

### Issue 2: Data Not Extracting

**Reason:** Extraction patterns may not match user input style.

**Solution:**
- Ask users to be more specific
- Update extraction patterns in `conversation-service.ts`

### Issue 3: Conversation State Lost

**Reason:** Conversation ID not being passed correctly.

**Solution:**
- Check localStorage for conversation ID
- Pass `conversationId` in subsequent messages

### Issue 4: Progress Not Updating

**Reason:** Required fields for current phase not extracted.

**Check:**
- View extracted data in sidebar
- Ensure user provided all required information

## Best Practices

### For Developers

1. **Always pass conversationId** after first message
2. **Save conversation state** after each exchange
3. **Handle errors gracefully** - conversation context is precious
4. **Test extraction patterns** with real user inputs
5. **Monitor agent execution time** - keep under 10 seconds per response

### For Users

1. **Be specific** in your answers
2. **One topic at a time** - don't try to answer multiple questions at once
3. **Ask for clarification** if unsure what Abhishek wants
4. **Take breaks** - conversation is saved automatically
5. **Review extracted data** in sidebar to ensure accuracy

## Customization

### Change Abhishek's Personality

Edit `/backend/agents/abhishek_ca.yaml`:
```yaml
system_prompt: |
  You are [NEW PERSONA]...
  # Modify tone, style, approach
```

### Adjust Phase Order

Edit `conversation-service.ts`:
```typescript
const phaseOrder: ConversationPhase[] = [
  // Reorder or add/remove phases
];
```

### Add New Extraction Patterns

Edit `extractStructuredData()` in `conversation-service.ts`:
```typescript
case 'your_new_phase':
  if (!state.extractedData.your_new_field) {
    const match = userMessage.match(/your pattern/i);
    if (match) extracted.your_new_field = match[1];
  }
  break;
```

## Production Checklist

Before deploying to production:

- [ ] Replace demo API key with real authentication
- [ ] Set up production database (MongoDB or Supabase)
- [ ] Configure error monitoring (Sentry, LogRocket)
- [ ] Add analytics tracking (conversation metrics)
- [ ] Test with real users (beta group)
- [ ] Optimize extraction patterns based on testing
- [ ] Set appropriate rate limits
- [ ] Add conversation backups
- [ ] Implement conversation export feature
- [ ] Add multi-language support (optional)

## Future Enhancements

1. **Voice Input**: Add speech-to-text for hands-free conversation
2. **Smart Suggestions**: Suggest answers based on user's industry
3. **Real-time Collaboration**: Multiple stakeholders in same conversation
4. **Conversation Analytics**: Insights into common pain points
5. **AI Improvements**: Learn from successful conversations
6. **Document Upload**: Extract data from existing business documents
7. **Video Explainers**: Abhishek explains complex concepts via video
8. **Industry Templates**: Pre-filled data for common business types

## Support

Questions? Issues?
- Check server logs: `npm run dev` terminal output
- View browser console for frontend errors
- Test API endpoints directly with curl
- Review conversation state in database

---

**Built with ❤️ using Next.js 14, Groq AI, and React**
