# 🏗️ BUSINESS PLANNER ARCHITECTURE

## Overview

This is a **production-ready microservices architecture** that separates business logic from AI orchestration. The system is built with Next.js 14, TypeScript, and integrates with Groq's LLM API for multi-agent orchestration.

---

## 🎯 Architecture Pattern: **Layered Microservices**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
│  React Components + Custom Hooks                            │
│  - /components/examples/BusinessPlannerExample.tsx          │
│  - /lib/hooks/use-business-planner.ts                       │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/HTTPS + Bearer Token Auth
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js API Routes)           │
│  /app/api/v1/*                                              │
│  - Authentication middleware                                 │
│  - Rate limiting middleware                                  │
│  - Input validation                                         │
│  - Error handling                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                     │
│  /lib/services/business-planner-service.ts                  │
│  - Workflow orchestration                                   │
│  - Data validation                                          │
│  - Permission checks                                        │
│  - Database operations                                       │
│  - Metrics extraction                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ↓                       ↓
┌─────────────────────┐   ┌─────────────────────┐
│  DATABASE LAYER     │   │  AI ORCHESTRATOR    │
│  /lib/services/     │   │  /backend/          │
│  database-service.ts│   │  orchestrator/      │
│                     │   │                     │
│  - MongoDB          │   │  - Intent parsing   │
│  - Supabase         │   │  - Plan creation    │
│  - In-memory        │   │  - Agent execution  │
│  (auto-select)      │   │  - Synthesis        │
└─────────────────────┘   └──────────┬──────────┘
                                     │
                          ┌──────────┴──────────┐
                          ↓                     ↓
                    ┌───────────┐        ┌───────────┐
                    │ Agent     │        │ Skill     │
                    │ Manager   │        │ Registry  │
                    └─────┬─────┘        └─────┬─────┘
                          │                     │
                          ↓                     ↓
                    ┌───────────┐        ┌───────────┐
                    │ 13 Agents │        │ 5 Skills  │
                    │ (YAML)    │        │ (TypeScript)
                    └─────┬─────┘        └─────┬─────┘
                          │                     │
                          └──────────┬──────────┘
                                     ↓
                              ┌─────────────┐
                              │  Groq API   │
                              │ (Llama 3.3) │
                              └─────────────┘
```

---

## 📁 Directory Structure

```
ca-business-planner/
├── app/
│   ├── api/
│   │   ├── v1/                         # NEW: Versioned API endpoints
│   │   │   ├── business-plan/
│   │   │   │   ├── create/route.ts     # Create business plan
│   │   │   │   ├── [id]/route.ts       # Get plan by ID
│   │   │   │   └── list/route.ts       # List all plans
│   │   │   ├── market-analysis/route.ts
│   │   │   └── financial-model/route.ts
│   │   └── orchestrator/route.ts       # Direct orchestrator access
│   └── (pages...)
│
├── backend/                            # AI Orchestration Engine
│   ├── orchestrator/
│   │   └── index.ts                    # Core orchestrator
│   ├── agents/
│   │   ├── manager.ts                  # Agent management
│   │   └── *.yaml                      # 13 agent definitions
│   ├── skills/
│   │   ├── registry.ts                 # Skill registry
│   │   └── implementations/
│   │       ├── financial_modeling.ts
│   │       ├── market_sizing.ts
│   │       ├── competitor_analysis.ts
│   │       ├── compliance_checker.ts
│   │       └── branded_document_generator.ts
│   └── utils/
│       ├── types.ts                    # TypeScript types
│       └── logger.ts                   # Logging utilities
│
├── lib/                                # NEW: Business Logic Layer
│   ├── services/
│   │   ├── business-planner-service.ts # Main business service
│   │   └── database-service.ts         # Database abstraction
│   ├── middleware/
│   │   ├── auth.ts                     # Authentication
│   │   └── rate-limit.ts               # Rate limiting
│   └── hooks/
│       └── use-business-planner.ts     # React hooks for API
│
├── components/
│   └── examples/
│       └── BusinessPlannerExample.tsx  # Usage examples
│
└── .env.local                          # Environment variables
```

---

## 🔄 Request Flow

### Example: Creating a Business Plan

```
1. Frontend Component
   ↓ const { createPlan } = useCreateBusinessPlan()
   ↓ await createPlan({ businessName, industry, ... })

2. React Hook
   ↓ POST /api/v1/business-plan/create
   ↓ Headers: Authorization: Bearer <API_KEY>

3. API Route (/app/api/v1/business-plan/create/route.ts)
   ├─→ authenticateRequest() // Verify API key
   ├─→ checkRateLimit()      // Enforce rate limits
   ├─→ validate input        // Check required fields
   └─→ call service

4. Business Planner Service (/lib/services/business-planner-service.ts)
   ├─→ validateRequest()     // Business logic validation
   ├─→ db.createSession()    // Create session record
   ├─→ buildMessage()        // Construct orchestrator prompt
   ├─→ buildContext()        // Prepare business context
   └─→ orchestrator.processRequest()

5. Orchestrator (/backend/orchestrator/index.ts)
   ├─→ parseIntent()         // Groq: Analyze user intent
   │   └─→ Returns: { goal, agents[], skills[], execution_type }
   ├─→ createPlan()          // Build execution plan
   │   └─→ Returns: { tasks[], dependencies[] }
   ├─→ execute()             // Run agents
   │   ├─→ executeTask(agent1)
   │   │   ├─→ Load agent YAML
   │   │   ├─→ Groq: Call with agent persona
   │   │   └─→ Execute skills if needed
   │   ├─→ executeTask(agent2)
   │   └─→ executeTask(agent3)
   └─→ synthesize()          // Groq: Aggregate outputs

6. Back to Business Planner Service
   ├─→ extractMetrics()      // Calculate metrics
   ├─→ db.createBusinessPlan() // Save to database
   ├─→ db.updateSession()    // Mark session complete
   └─→ return result

7. API Route
   └─→ return JSON response

8. React Hook
   └─→ setData(result)       // Update component state
```

---

## 🔑 Key Components

### 1. Business Planner Service

**File**: `/lib/services/business-planner-service.ts`

**Responsibilities**:
- Orchestrate business planning workflows
- Validate inputs
- Manage database operations
- Call AI orchestrator
- Extract and process results

**Methods**:
```typescript
createBusinessPlan(userId, request)    // Create full business plan
runMarketAnalysis(userId, params)      // Market analysis only
generateFinancialModel(userId, data)   // Financial modeling only
getBusinessPlan(userId, planId)        // Retrieve plan
listBusinessPlans(userId, limit, offset) // List all plans
```

### 2. Database Service

**File**: `/lib/services/database-service.ts`

**Features**:
- **Multi-database support**: MongoDB, Supabase, or in-memory
- **Automatic selection**: Uses available database
- **Unified interface**: Same API regardless of database
- **Type-safe**: Full TypeScript types

**Methods**:
```typescript
createSession(session)           // Create processing session
updateSession(id, updates)       // Update session status
getSession(id)                   // Retrieve session
createBusinessPlan(plan)         // Save business plan
getBusinessPlan(id)              // Retrieve plan
listBusinessPlans(userId, limit, offset) // List plans
```

### 3. Authentication Middleware

**File**: `/lib/middleware/auth.ts`

**Features**:
- Bearer token authentication
- API key management
- User authorization
- Demo user for development

**Usage**:
```typescript
const user = await authenticateRequest(request);
if (!user) return unauthorized();
```

**Demo Credentials**:
```
API Key: demo-api-key-12345
User ID: demo-user-123
```

### 4. Rate Limiting Middleware

**File**: `/lib/middleware/rate-limit.ts`

**Features**:
- Configurable rate limits
- Per-user tracking
- Automatic cleanup
- Rate limit headers

**Limiters**:
```typescript
defaultRateLimiter           // 10 requests/minute
businessPlanRateLimiter      // 5 requests/hour
marketAnalysisRateLimiter    // 10 requests/10 minutes
```

### 5. Orchestrator Engine

**File**: `/backend/orchestrator/index.ts`

**4-Stage Pipeline**:
1. **Intent Analysis**: Determine what user wants
2. **Plan Creation**: Select agents and create execution plan
3. **Execution**: Run agents (parallel or sequential)
4. **Synthesis**: Combine outputs into coherent response

### 6. Agent Manager

**File**: `/backend/agents/manager.ts`

**Features**:
- Load agents from YAML files
- Agent validation
- Agent search and filtering
- Hot-reloading support

### 7. Skill Registry

**File**: `/backend/skills/registry.ts`

**Features**:
- Register computational skills
- Execute skills with parameters
- Tool definitions for LLM function calling
- Error handling

---

## 🔐 Security Features

### Authentication
- Bearer token-based API authentication
- Per-user API keys
- Authorization checks for resource access

### Rate Limiting
- Per-user rate limits
- Configurable time windows
- Automatic enforcement
- Rate limit headers in responses

### Input Validation
- Required field validation
- Type checking
- Length limits
- SQL injection prevention

### Error Handling
- Structured error responses
- No sensitive data in errors
- Detailed logging (server-side only)

---

## 📊 Database Schema

### Sessions Table/Collection
```typescript
{
  id: string (UUID)
  userId: string
  type: 'business_plan' | 'market_analysis' | 'financial_model'
  status: 'processing' | 'completed' | 'failed'
  input: object
  error?: string
  executionTimeMs?: number
  createdAt: Date
  completedAt?: Date
}
```

### Business Plans Table/Collection
```typescript
{
  id: string (UUID)
  sessionId: string
  userId: string
  businessName: string
  industry: string
  synthesis: string (AI output)
  agentOutputs: array
  metrics: object
  status: 'completed' | 'failed'
  createdAt: Date
}
```

---

## 🚀 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints

#### 1. Create Business Plan
```
POST /business-plan/create

Headers:
  Authorization: Bearer <API_KEY>
  Content-Type: application/json

Body:
  {
    "businessName": "TechStartup AI",
    "industry": "SaaS",
    "stage": "startup",
    "targetMarket": "Small businesses",
    "location": "San Francisco, CA",
    "description": "AI-powered automation",
    "revenue": "$50,000 MRR",
    "teamSize": 5,
    "fundingGoal": 2000000
  }

Response:
  {
    "success": true,
    "data": {
      "planId": "uuid",
      "sessionId": "uuid",
      "synthesis": "...",
      "metrics": { ... }
    }
  }
```

#### 2. Get Business Plan
```
GET /business-plan/:id

Headers:
  Authorization: Bearer <API_KEY>

Response:
  {
    "success": true,
    "data": { ... plan details ... }
  }
```

#### 3. List Business Plans
```
GET /business-plan/list?limit=10&offset=0

Headers:
  Authorization: Bearer <API_KEY>

Response:
  {
    "success": true,
    "data": [ ... array of plans ... ],
    "metadata": {
      "count": 10,
      "limit": 10,
      "offset": 0
    }
  }
```

#### 4. Market Analysis
```
POST /market-analysis

Headers:
  Authorization: Bearer <API_KEY>
  Content-Type: application/json

Body:
  {
    "industry": "SaaS",
    "geography": "United States",
    "targetSegment": "Small businesses"
  }

Response:
  {
    "success": true,
    "data": {
      "sessionId": "uuid",
      "analysis": "...",
      "metrics": { ... }
    }
  }
```

#### 5. Financial Model
```
POST /financial-model

Headers:
  Authorization: Bearer <API_KEY>
  Content-Type: application/json

Body:
  {
    "businessName": "TechStartup AI",
    "industry": "SaaS",
    "stage": "startup"
  }

Response:
  {
    "success": true,
    "data": {
      "sessionId": "uuid",
      "financialModel": "...",
      "metrics": { ... }
    }
  }
```

---

## 🎨 Frontend Integration

### Using React Hooks

```typescript
import { useCreateBusinessPlan } from '@/lib/hooks/use-business-planner';

function MyComponent() {
  const { createPlan, loading, error, data } = useCreateBusinessPlan();

  const handleCreate = async () => {
    try {
      const result = await createPlan({
        businessName: 'My Business',
        industry: 'SaaS',
        stage: 'startup',
        targetMarket: 'SMBs',
        location: 'San Francisco'
      });

      console.log('Plan created:', result);
    } catch (err) {
      console.error('Failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={loading}>
        {loading ? 'Creating...' : 'Create Plan'}
      </button>
      {error && <p>Error: {error}</p>}
      {data && <p>Success! Plan ID: {data.planId}</p>}
    </div>
  );
}
```

### Using Direct API Calls

```typescript
import { BusinessPlannerAPI } from '@/lib/hooks/use-business-planner';

async function createPlan() {
  const result = await BusinessPlannerAPI.createBusinessPlan({
    businessName: 'My Business',
    industry: 'SaaS',
    stage: 'startup',
    targetMarket: 'SMBs',
    location: 'San Francisco'
  });

  console.log(result);
}
```

---

## 🔧 Configuration

### Environment Variables

```bash
# .env.local

# Required: Groq API Key (for AI orchestration)
GROQ_API_KEY=your_groq_api_key

# Optional: Database (choose one)
MONGODB_URI=mongodb://localhost:27017/business_planner
# OR
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Optional: Alternative AI providers
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key

# Development
NODE_ENV=development
PORT=3000

# Frontend API configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_KEY=demo-api-key-12345
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd ca-business-planner
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your GROQ_API_KEY
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Test API
```bash
curl -X POST http://localhost:3000/api/v1/business-plan/create \
  -H "Authorization: Bearer demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Business",
    "industry": "SaaS",
    "stage": "startup",
    "targetMarket": "SMBs",
    "location": "San Francisco"
  }'
```

### 5. View Example UI
```
http://localhost:3000/examples/business-planner
```

---

## 📈 Scaling Options

### Option 1: Keep Monolithic (Current)
- **Best for**: MVP, prototypes, <1000 users
- **Pros**: Simple deployment, low latency
- **Cons**: Tight coupling, hard to scale

### Option 2: Extract Orchestrator Service
- **Best for**: Production, multiple apps, >1000 users
- **How**: Deploy orchestrator as separate service
- **Benefits**: Independent scaling, reusability

### Option 3: Add Message Queue
- **Best for**: High volume, >10,000 users
- **Tech**: Redis/RabbitMQ for job queue
- **Benefits**: Async processing, real-time updates

---

## 🔍 Monitoring & Logging

### Logging
All operations are logged with structured data:
```typescript
logger.info('Business plan created', {
  userId,
  planId,
  executionTime
});
```

### Metrics
Captured for every request:
- Execution time
- Agents used
- Skills executed
- Success/failure status

---

## 🧪 Testing

### Test API Endpoint
```bash
npm run dev

# In another terminal
curl http://localhost:3000/api/v1/business-plan/list \
  -H "Authorization: Bearer demo-api-key-12345"
```

### Test Frontend Component
```
Visit: http://localhost:3000/examples/business-planner
```

---

## 📚 Architecture Decisions

### Why This Architecture?

1. **Separation of Concerns**: Business logic separate from AI
2. **Reusability**: Same orchestrator for multiple apps
3. **Scalability**: Can scale each layer independently
4. **Flexibility**: Swap databases/LLMs without touching business logic
5. **Security**: Proper auth, rate limiting, validation
6. **Testability**: Each layer can be tested in isolation

### Trade-offs

**Monolithic (Current)**:
- ✅ Simpler deployment
- ✅ Lower latency
- ❌ Tight coupling
- ❌ Hard to scale

**Microservices (Future)**:
- ✅ Independent scaling
- ✅ Reusable orchestrator
- ❌ More complex deployment
- ❌ Network latency

---

## 🎯 Next Steps

1. **Add Authentication**: Replace demo auth with real auth (NextAuth.js)
2. **Setup Database**: Configure MongoDB or Supabase
3. **Add Tests**: Unit tests for services, integration tests for APIs
4. **Monitoring**: Add APM (Sentry, DataDog)
5. **Caching**: Add Redis for caching
6. **WebSocket**: Real-time progress updates
7. **Extract Orchestrator**: Move to separate service when scaling

---

**Built with ❤️ using Next.js 14, TypeScript, and Groq AI**
