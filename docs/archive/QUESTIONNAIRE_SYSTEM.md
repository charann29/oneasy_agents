# 🎯 Intelligent Questionnaire System

## Overview

An **agent-based, schema-driven intelligent questionnaire system** for the CA Business Planner. This system combines:

- **Type-safe schemas** with Zod validation (all 12 phases, 50+ questions)
- **Reusable UI components** (Voice, File Upload, AI Suggestions, Progress)
- **AI agents** for intelligent orchestration and validation
- **State management** with Zustand (persistent across sessions)
- **Beautiful UX** with Tailwind CSS and Framer Motion

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │ QuestionCard   │  │ VoiceInput   │  │ FileUpload   ││
│  │ SuggestionPicker  │ Progress     │  │ Navigation   ││
│  └────────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│              State Management (Zustand)                  │
│   • Session tracking  • Answers  • Progress              │
│   • Phase management  • Persistence                      │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│          Intelligence Layer (AI Agents)                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  QuestionnaireAgent                              │   │
│  │  • Question flow orchestration                   │   │
│  │  • Context-aware validation                      │   │
│  │  • AI suggestions (Groq)                         │   │
│  │  • Business plan generation (Claude)             │   │
│  │  • Insights & recommendations                    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│              Data Layer (Schemas)                        │
│  • 12 phases × 50+ questions                            │
│  • Zod validation schemas                               │
│  • TypeScript types                                     │
│  • Question dependencies & conditional logic            │
└─────────────────────────────────────────────────────────┘
```

## Features

### ✅ Core Functionality

1. **12-Phase Questionnaire**
   - Phase 1: Basic Information (5 questions)
   - Phase 2: Market Analysis (6 questions)
   - Phase 3: Products/Services (5 questions)
   - Phase 4: Operations (6 questions)
   - Phase 5: Team & Organization (5 questions)
   - Phase 6: Marketing & Sales (6 questions)
   - Phase 7: Financial Projections (7 questions)
   - Phase 8: Funding (5 questions)
   - Phase 9: Risks & Mitigation (5 questions)
   - Phase 10: Milestones & Timeline (4 questions)
   - Phase 11: Legal & Compliance (5 questions)
   - Phase 12: Final Review (4 questions)

2. **Input Methods**
   - ✅ Text input with real-time AI suggestions
   - ✅ Voice input (multi-language: English, Hindi, Telugu)
   - ✅ File upload with drag & drop
   - ✅ Single/multi-select options
   - ✅ Number inputs with validation

3. **AI-Powered Features**
   - ✅ Real-time suggestions as you type (Groq AI)
   - ✅ Smart validation with helpful feedback
   - ✅ Context-aware question flow
   - ✅ Business plan generation (Claude AI)
   - ✅ Insights & recommendations

4. **User Experience**
   - ✅ Progress tracking with visual indicators
   - ✅ Phase-by-phase navigation
   - ✅ Skip questions (optional ones)
   - ✅ Persistent state (resume anytime)
   - ✅ Mobile-responsive design

## File Structure

```
ca-business-planner/
├── lib/
│   ├── schemas/
│   │   ├── questions.ts          # Phases 1-6 schemas
│   │   └── questions-extended.ts # Phases 7-12 schemas
│   ├── agents/
│   │   └── questionnaire-agent.ts # AI orchestration
│   ├── store/
│   │   └── questionnaire-store.ts # Zustand state management
│   └── ai/
│       ├── groq.ts               # Groq AI integration
│       ├── claude.ts             # Claude AI integration
│       └── unified.ts            # Unified AI interface
├── components/
│   └── questionnaire/
│       ├── QuestionCard.tsx       # Main question component
│       ├── VoiceInput.tsx         # Voice recording & transcription
│       ├── FileUpload.tsx         # Drag & drop file upload
│       ├── SuggestionPicker.tsx   # AI suggestions display
│       └── ProgressTracker.tsx    # Phase progress visualization
├── app/
│   ├── questionnaire/
│   │   └── page.tsx              # Main questionnaire page
│   ├── results/
│   │   └── page.tsx              # Business plan results
│   └── page.tsx                  # Landing page
└── QUESTIONNAIRE_SYSTEM.md       # This file
```

## Key Components

### 1. Question Schemas (`lib/schemas/questions.ts`)

```typescript
import { z } from 'zod'

export interface Question {
  id: string
  phase: number
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'file' | 'voice'
  question: string
  description?: string
  placeholder?: string
  options?: QuestionOption[]
  validation?: z.ZodType<any>
  required: boolean
  aiSuggestionsEnabled: boolean
  voiceInputEnabled: boolean
  fileUploadEnabled: boolean
  dependsOn?: string
  showIf?: (answers: Record<string, any>) => boolean
}
```

### 2. Questionnaire Agent (`lib/agents/questionnaire-agent.ts`)

**Key Methods:**

- `getNextQuestion()` - Determines next question based on context
- `validatePhase()` - Validates all answers in a phase
- `getSuggestions()` - Fetches AI suggestions
- `validateAnswer()` - AI-powered answer validation
- `generateInsights()` - SWOT-style insights
- `generateBusinessPlan()` - Full business plan generation
- `calculateProgress()` - Overall completion percentage

### 3. State Management (`lib/store/questionnaire-store.ts`)

**Zustand Store with Persistence:**

```typescript
interface QuestionnaireState {
  sessionId: string | null
  userId: string | null
  currentPhase: number
  completedPhases: number[]
  answers: Record<string, any>
  isLoading: boolean
  error: string | null
  // ... actions
}
```

### 4. Reusable Components

**VoiceInput** (`components/questionnaire/VoiceInput.tsx`)
- Records audio from microphone
- Transcribes using OpenAI Whisper
- Supports multiple languages
- Shows recording status

**FileUpload** (`components/questionnaire/FileUpload.tsx`)
- Drag & drop interface
- Multiple file support
- File type validation
- Size validation
- Preview uploaded files

**SuggestionPicker** (`components/questionnaire/SuggestionPicker.tsx`)
- Debounced API calls
- Real-time suggestions
- Click to apply
- Loading states

**ProgressTracker** (`components/questionnaire/ProgressTracker.tsx`)
- Overall progress bar
- Phase-by-phase status
- Visual indicators (completed, current, upcoming)
- Motivational messages

## Usage

### Starting the Questionnaire

1. User lands on home page
2. Clicks "Start Your Business Plan"
3. Session automatically created via API
4. Redirected to `/questionnaire`

### Question Flow

1. **Display Question**: QuestionCard renders based on current phase
2. **User Input**: Text, voice, or file upload
3. **AI Suggestions**: Real-time as user types (if enabled)
4. **Validation**: Zod schema + AI validation
5. **Save Answer**: Stored in Zustand + persisted to localStorage
6. **Navigation**: Next question or next phase
7. **Complete**: All phases done → Generate plan

### Generating Business Plan

1. All 12 phases completed
2. QuestionnaireAgent.generateBusinessPlan(answers)
3. Claude AI generates comprehensive plan
4. AI insights generated (strengths, opportunities, recommendations)
5. Display on results page with download option

## API Integration

The questionnaire integrates with:

- **POST /api/ai/suggestions** - Real-time AI suggestions
- **POST /api/voice/transcribe** - Voice-to-text transcription
- **POST /api/session/create** - Create user session
- **POST /api/session/update** - Save progress (implement this)

## Customization

### Adding New Questions

```typescript
// lib/schemas/questions-extended.ts
{
  id: 'your_question_id',
  phase: 7,
  type: 'textarea',
  question: 'Your question here?',
  description: 'Help text',
  placeholder: 'Example answer',
  validation: schemas.longText,
  required: true,
  aiSuggestionsEnabled: true,
  voiceInputEnabled: true,
  fileUploadEnabled: false,
}
```

### Adding New Phases

1. Add questions with `phase: 13`
2. Update `getTotalPhases()` in questions.ts
3. Update PHASE_NAMES in ProgressTracker.tsx
4. Update max phase check in questionnaire page

### Customizing AI Behavior

Edit `lib/agents/questionnaire-agent.ts`:

```typescript
// Customize suggestion generation
static async getSuggestions(questionId: string, partialAnswer: string, context: any) {
  // Add custom logic here
  return await AI.getSuggestions(questionId, partialAnswer, context)
}
```

## Testing

### Test Questionnaire Flow

```bash
# Start dev server
npm run dev

# Navigate to http://localhost:3000
# Click "Start Your Business Plan"
# Fill out questions, test:
# - Text input + AI suggestions
# - Voice input (click mic icon)
# - File upload (drag & drop)
# - Navigation (next/previous)
# - Skip optional questions
# - Phase completion
```

### Test APIs Directly

```bash
# Test AI suggestions
curl -X POST http://localhost:3000/api/ai/suggestions \
  -H "Content-Type: application/json" \
  -d '{"questionId":"business_idea","partialAnswer":"I want to","userContext":{}}'

# Test voice transcription
# (upload an audio file via the UI)
```

## Production Checklist

- [ ] Set all API keys in production environment
- [ ] Test all 12 phases end-to-end
- [ ] Verify voice input on mobile devices
- [ ] Test file uploads with various file types
- [ ] Verify AI suggestions work in production
- [ ] Test business plan generation with real data
- [ ] Add error tracking (Sentry, LogRocket)
- [ ] Implement proper session management
- [ ] Add analytics (Mixpanel, Amplitude)
- [ ] Setup automated backups for user data

## Performance Optimizations

1. **AI Suggestions**: Debounced (500ms) to reduce API calls
2. **State Persistence**: LocalStorage with Zustand persistence
3. **Component Lazy Loading**: Use React.lazy() for results page
4. **Image Optimization**: Use Next.js Image component
5. **Edge Runtime**: Suggestions API uses edge runtime for speed

## Future Enhancements

- [ ] Multi-language UI (i18n)
- [ ] Collaborative editing (multiple users)
- [ ] Version control for plans
- [ ] Templates for common industries
- [ ] PDF/DOCX export with formatting
- [ ] Integration with accounting software
- [ ] AI-powered financial modeling
- [ ] Competitive analysis automation
- [ ] Investor pitch deck generation

## Support

For issues or questions:
- Check ACTUALLY_BUILT.md for what's working
- Review LAUNCH_GUIDE.md for deployment
- See README.md for project overview
