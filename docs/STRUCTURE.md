# CA Business Planner - Project Structure

## Overview
This document describes the organized folder structure of the CA Business Planner application after the December 2025 reorganization.

## Root Directory

```
ca-business-planner/
├── app/                    # Next.js 14 App Router
├── backend/                # AI agents, orchestrator, skills
├── components/             # React components
├── lib/                    # Shared libraries & utilities
├── docs/                   # 📚 Documentation
├── scripts/                # Build, test, deploy scripts
├── supabase/              # Supabase configuration
├── no-use/                # 🗑️ Archived/unused files
├── .next/                 # Build output (gitignored)
├── node_modules/          # Dependencies (gitignored)
└── Config files           # package.json, tsconfig.json, etc.
```

## Folder Descriptions

### `/app` - Next.js Application
- **chat/** - AI orchestrator chat interface
- **questionnaire-chat/** - 147-question business model builder
- **results/** - Results and document display
- **api/** - API routes
  - orchestrator/ - AI orchestration endpoints
  - session/ - Session management
  - questionnaire/ - Questionnaire endpoints
  - generate-documents/ - Document generation
  - v1/ - Versioned API endpoints
- **page.tsx** - Landing page
- **layout.tsx** - Root layout

### `/backend` - Backend Logic
- **agents/** - AI agent definitions (16 YAML files)
  - abhishek_ca.yaml
  - business_planner_lead.yaml
  - context_collector.yaml, customer_profiler.yaml
  - financial_modeler.yaml, funding_strategist.yaml
  - gtm_strategist.yaml, legal_advisor.yaml
  - market_analyst.yaml, ops_planner.yaml
  - output_generator.yaml, revenue_architect.yaml
  - unit_economics_calculator.yaml, user_profiler.yaml
  - document_generator.yaml
- **orchestrator/** - AI orchestration engine
- **skills/** - Business logic implementations
  - implementations/ - Actual skill code
  - registry.ts - Skill registration
- **mcp/** - Model Context Protocol engine
- **scripts/** - Backend utility scripts
- **utils/** - Shared backend utilities

### `/lib` - Shared Libraries
- **ai/** - AI service clients
  - claude.ts - Anthropic Claude client
  - groq.ts - Groq client
  - unified.ts - Unified AI interface
- **db/** - Database clients
  - mongodb.ts
  - supabase.ts
- **services/** - Business services
  - business-planner-service.ts
  - conversation-service.ts
  - database-service.ts
  - export-engine.ts
- **schemas/** - Data schemas
  - questions.ts - Active question schema
  - questions-complete.ts
  - QUESTIONNAIRE_SPEC.md
- **hooks/** - React hooks
- **middleware/** - Express/Next.js middleware
- **store/** - State management (Zustand)
- **templates/** - Document templates
- **utils/** - Utility functions

### `/components` - React Components
- **chat/** - Chat UI components
  - ChatBubble.tsx, ChatHeader.tsx
- **questionnaire/** - Questionnaire components
  - QuestionCard.tsx, ProgressTracker.tsx
  - VoiceInput.tsx, FileUpload.tsx
  - AutoPopulatedFields.tsx, PreviewPanel.tsx
  - SuggestionPicker.tsx, ThinkingIndicator.tsx
- **examples/** - Example components
- **AgentBreakdown.tsx** - Agent execution visualization
- **BusinessModelCanvas.tsx** - BMC component
- **FinancialCalculator.tsx** - Financial tools

### `/docs` - Documentation
- **ARCHITECTURE.md** - System architecture overview
- **ORCHESTRATOR_GUIDE.md** - AI orchestrator guide
- **QUICKSTART.md** - Getting started guide
- **archive/** - Historical/old documentation (18 files)

### `/scripts` - Build & Deployment Scripts
- **test/** - Test scripts
  - test-api.js, test-api.sh
  - test-abhishek-direct.js
  - test-supabase-creds.js
  - test-system.sh
- **deploy/** - Deployment scripts
  - complete.sh
- **setup/** - Setup scripts (existing scripts folder content)

### `/no-use` - Archive 🗑️
Unused/redundant files kept for reference:
- **empty-dirs/** - 9 empty directories
- **unused-models/** - Mongoose models (not used)
- **backup-schemas/** - Old schema backups
- **redundant-docs/** - Archived in docs/archive
- **test-files/** - Archived in scripts/test

## Key Files

| File | Purpose |
|------|---------|
| README.md | Main project documentation |
| package.json | NPM dependencies and scripts |
| tsconfig.json | TypeScript configuration |
| next.config.js | Next.js configuration |
| tailwind.config.js | Tailwind CSS configuration |
| .env.local | Environment variables (not in git) |
| .env.example | Environment variable template |
| vercel.json | Vercel deployment config |
| Dockerfile | Docker container config |

## Import Paths

### Common Import Patterns
```typescript
// AI Services
import { groq } from '@/lib/ai/groq'
import { claude } from '@/lib/ai/claude'

// Database
import { supabase } from '@/lib/db/supabase'
import { connectDB } from '@/lib/db/mongodb'

// Services
import { conversationService } from '@/lib/services/conversation-service'

// Components
import { ChatBubble } from '@/components/chat/ChatBubble'

// Hooks
import { useChat } from '@/lib/hooks/use-chat'

// Schemas
import { questions } from '@/lib/schemas/questions'

// Backend (when importing from API routes)
import { orchestrator } from '@/backend/orchestrator'
import { skillRegistry } from '@/backend/skills/registry'
```

## NPM Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

Required in `.env.local`:
```bash
# AI APIs
GROQ_API_KEY=                # Required for orchestrator
ANTHROPIC_API_KEY=           # Optional (for Claude)

# Database
MONGODB_URI=                 # Optional (for persistence)
NEXT_PUBLIC_SUPABASE_URL=    # Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon key

# Optional
OPENAI_API_KEY=              # For voice transcription
TWILIO_ACCOUNT_SID=          # For WhatsApp bot
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
```

## Development

### Running Locally
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Start dev server
npm run dev

# Visit http://localhost:3000
```

### Testing
```bash
# Run test scripts
cd scripts/test
./test-system.sh
```

### Adding New Features

**New AI Agent:**
1. Create YAML in `backend/agents/`
2. Register in agent manager
3. Add to orchestrator routing

**New API Route:**
1. Create in `app/api/[your-route]/route.ts`
2. Follow Next.js 14 route handler pattern

**New Component:**
1. Create in appropriate `components/` subfolder
2. Follow existing naming conventions

**New Documentation:**
1. Add to `docs/` folder
2. Link from README.md or relevant docs

## Maintenance

### Keep Organized
- Put test scripts in `scripts/test/`
- Put documentation in `docs/`
- Archive old/unused files in `no-use/`
- Never commit large logs (add to .gitignore)

### Before Committing
- Run `npm run lint`
- Test with `npm run dev`
- Check no sensitive data in commits
- Update documentation if needed

---

**Last Updated:** December 29, 2025
**Status:** ✅ Clean & Organized
