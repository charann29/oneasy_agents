# AI Business Planner - Orchestrator System

Complete AI-powered business planning application with intelligent agent orchestration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Groq API key ([Get one free](https://console.groq.com))

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local

# 3. Add your Groq API key to .env.local
GROQ_API_KEY=your_groq_api_key_here

# 4. Start development server
npm run dev

# 5. Open chat interface
# Navigate to http://localhost:3000/chat
```

## 🎯 What's New: Orchestrator System

The orchestrator intelligently routes your business planning requests to specialized AI agents:

### Architecture
```
User Request → Orchestrator → Agent Selection → Skill Execution → Synthesis → Response
```

### Features
- **13 Specialized Agents** - Each expert in a specific domain (financial modeling, market analysis, GTM strategy, etc.)
- **4 Business Logic Skills** - Real calculations for financial projections, market sizing, competitor analysis, and compliance
- **Intelligent Routing** - Groq-powered intent analysis determines which agents to use
- **Parallel & Sequential Execution** - Optimized execution based on task dependencies
- **Beautiful Chat Interface** - Modern UI with agent breakdown and execution details

### 🚀 Core Features

- **Abhishek CA Chat Interface**: Conversational 147-question business modeling journey.
- **AI Agent Orchestrator**: Multi-agent system (13 specialized agents) for deep business analysis.
- **Smart Skills**: Programmatic tools for financial modeling, market sizing, and compliance.
- **Real-time Streaming**: SSE-based progress tracking for long-running AI tasks.
- **Hybrid Data Layer**: Built with Next.js, Supabase, and MongoDB.

## 🧠 AI Orchestrator

The system features a state-of-the-art orchestration engine:
1. **Goal Analysis**: Interprets complex business requests.
2. **Task Planning**: Decomposes goals into specialized agent tasks.
3. **Multi-Agent Execution**: Sequential and parallel processing using 13 persona-based agents.
4. **Tool Invocations**: Agents call specialized skills (financial, legal, market) via Groq Tool Calling.
5. **Synthesis**: Intelligent merging of multi-agent outputs into a professional response.

Refer to [ORCHESTRATOR_GUIDE.md](./ORCHESTRATOR_GUIDE.md) for technical details.

## 📁 Project Structure

```
ca-business-planner/
├── backend/                    # NEW - Orchestrator system
│   ├── agents/                # 13 YAML agent definitions
│   ├── orchestrator/          # Core orchestration engine
│   ├── skills/                # Business logic implementations
│   └── utils/                 # Types and utilities
├── app/
│   ├── api/orchestrator/      # NEW - Orchestrator API endpoint
│   ├── chat/                  # NEW - Chat interface
│   └── questionnaire/         # Existing questionnaire system
└── components/
    └── AgentBreakdown.tsx     # NEW - Agent execution details
```

## 🎨 Using the Chat Interface

### Access
Navigate to: `http://localhost:3000/chat`

### Try These Prompts
1. "Help me create a business plan for a meal prep service"
2. "Analyze the market for a B2B SaaS product"
3. "Build financial projections for my e-commerce startup"
4. "What legal structure should I use for my consulting business?"

### View Agent Breakdown
After receiving a response, click **"View Agent Breakdown"** to see:
- Which agents were selected
- What skills they used
- Execution time for each agent
- Individual agent outputs

## 🤖 Available Agents

| Agent | Specialty | Skills Used |
|-------|-----------|-------------|
| **financial_modeler** | Financial projections & metrics | financial_modeling |
| **market_analyst** | Market sizing & trends | market_sizing_calculator |
| **customer_profiler** | Target customer analysis | - |
| **gtm_strategist** | Go-to-market strategy | - |
| **legal_advisor** | Legal structure & compliance | compliance_checker |
| **revenue_architect** | Revenue model design | - |
| **funding_strategist** | Funding strategy | - |
| **ops_planner** | Operations planning | - |
| **unit_economics_calculator** | Unit economics | - |
| **context_collector** | Business context gathering | - |
| **output_generator** | Document generation | - |
| **user_profiler** | User profiling | - |
| **business_planner_lead** | Overall coordination | - |

## 🛠️ Skills (Business Logic)

### 1. Financial Modeling
Calculates comprehensive 5-7 year financial projections:
- Monthly revenue (Year 1) with growth rates and churn
- Annual revenue (Years 2-7)
- COGS and gross profit margins
- EBITDA and break-even analysis
- SaaS metrics (ARR, Rule of 40, burn multiple)
- Capital requirements

### 2. Market Sizing Calculator
Computes market opportunity:
- TAM (Total Addressable Market)
- SAM (Serviceable Addressable Market)
- SOM (Serviceable Obtainable Market)
- Methodology and assumptions

### 3. Competitor Analysis
Analyzes competitive landscape:
- Competitor strengths and weaknesses
- Market positioning
- Competitive advantages
- Threats

### 4. Compliance Checker
Identifies legal requirements:
- Required licenses by industry and location
- Required permits
- Compliance risks
- Recommendations

## 🔧 API Usage

### Endpoint
```
POST /api/orchestrator
```

### Request
```json
{
  "message": "Help me create a business plan for a meal prep service",
  "context": {
    "business_name": "FreshMeal",
    "industry": "Food Delivery",
    "location": "India"
  }
}
```

### Response
```json
{
  "success": true,
  "data": {
    "synthesis": "Comprehensive business plan response...",
    "agent_outputs": [
      {
        "agent_name": "Customer Profiler",
        "output": "Target customer analysis...",
        "skills_used": [],
        "execution_time_ms": 2340
      }
    ],
    "execution_time_ms": 12450,
    "intent": {
      "goal": "Create comprehensive business plan",
      "agents": ["customer_profiler", "market_analyst", "financial_modeler"],
      "execution_type": "sequential"
    }
  }
}
```

## 🧪 Development

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Type Check
```bash
npx tsc --noEmit
```

## 📊 System Capabilities

### Intelligent Features
- ✅ Automatic agent selection based on user intent
- ✅ Parallel execution for independent tasks
- ✅ Sequential execution for dependent tasks
- ✅ Real-time skill invocation via Groq function calling
- ✅ Response synthesis from multiple agent outputs
- ✅ Comprehensive error handling and logging

### Supported Use Cases
- Market analysis and sizing
- Financial projections and modeling
- Competitor analysis
- Legal compliance checking
- Customer profiling
- Go-to-market strategy
- Revenue modeling
- Funding strategy
- Operations planning

## 🔐 Environment Variables

Required in `.env.local`:

```bash
# AI APIs
GROQ_API_KEY=your_groq_api_key          # Required for orchestrator
ANTHROPIC_API_KEY=your_anthropic_key    # Optional (for questionnaire)
OPENAI_API_KEY=your_openai_key          # Optional (for voice)

# Database
MONGODB_URI=your_mongodb_uri            # Optional (for persistence)

# Twilio WhatsApp (Optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+number
```

## 📚 Documentation

- **Walkthrough**: See `walkthrough.md` in artifacts for detailed system overview
- **Implementation Plan**: See `implementation_plan.md` for architecture details
- **Task Breakdown**: See `task.md` for implementation checklist

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `backend/orchestrator/index.ts` | Core orchestration engine (484 lines) |
| `backend/agents/manager.ts` | Agent loading and management |
| `backend/skills/registry.ts` | Skill registration and execution |
| `app/api/orchestrator/route.ts` | API endpoint |
| `app/chat/page.tsx` | Chat interface |
| `components/AgentBreakdown.tsx` | Agent execution details |

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Railway
```bash
railway up
```

### Docker
```bash
docker build -t ca-planner .
docker run -p 3000:3000 ca-planner
```

## 💰 Cost Estimate

For 1000 requests/month:
- **Groq**: ~$10/month (very affordable)
- **Vercel**: Free (Hobby) or $20/mo (Pro)
- **MongoDB**: Free (512MB)

**Total: ~$10-30/month**

## 🤝 Support

For issues or questions:
1. Check the walkthrough documentation
2. Review agent definitions in `backend/agents/`
3. Check logs in console for debugging

## 📝 License

Private - Proprietary

---

**Built with Next.js 14, Groq SDK (Llama 3.3 70B), TypeScript, and Tailwind CSS**

**System Status:** ✅ Production Ready
