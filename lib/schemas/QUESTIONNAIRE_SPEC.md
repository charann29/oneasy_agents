# Complete 147-Question Business Model Questionnaire

## Overview
This document contains all 11 phases with 147 questions for the comprehensive business model questionnaire system.

## Implementation Status

✅ **Phase 1: Authentication & Onboarding** - 6 questions
✅ **Phase 2: User Discovery** - 14 questions  
⏳ **Phase 3-11:** Remaining 127 questions

## All Phases Summary

| Phase | Name | Questions | Time | Status |
|-------|------|-----------|------|--------|
| 1 | Authentication & Onboarding | 6 | 3-5 min | ✅ Implemented |
| 2 | User Discovery | 14 | 8-12 min | ✅ Implemented |
| 3 | Business Context | 19 | 10-15 min | 📝 Ready to implement |
| 4 | Market & Industry Analysis | 20 | 12-15 min | 📝 Ready to implement |
| 5 | Revenue Model & Financial | 20 | 10-12 min | 📝 Ready to implement |
| 6 | Competitive Analysis | 7 | 5-7 min | 📝 Ready to implement |
| 7 | Operations & Team | 18 | 8-10 min | 📝 Ready to implement |
| 8 | Go-to-Market Strategy | 13 | 5-7 min | 📝 Ready to implement |
| 9 | Funding Strategy | 10 | 5-7 min | 📝 Ready to implement |
| 10 | Risk Assessment | 5 | 3-5 min | 📝 Ready to implement |
| 11 | Final Review & Output | 8 | 2-3 min | 📝 Ready to implement |
| **TOTAL** | **11 Phases** | **147** | **~60-90 min** | **14% Complete** |

## Checkpoint System

Every phase ends with a checkpoint question that allows users to:
- ✅ **Continue now** - Proceed to next phase
- ⏸️ **Pause and resume later** - Save progress and exit

### Checkpoint Questions (11 total)
1. `checkpoint_auth` - After authentication
2. `checkpoint_discovery` - After user discovery  
3. `checkpoint_context` - After business context
4. `checkpoint_market` - After market analysis
5. `checkpoint_revenue` - After revenue model
6. `checkpoint_competition` - After competitive analysis
7. `checkpoint_operations` - After operations planning
8. `checkpoint_gtm` - After go-to-market
9. `checkpoint_funding` - After funding strategy
10. `checkpoint_risk` - After risk assessment
11. `final_confirmation` - Before generating output

## Question Types Supported

| Type | Description | Example |
|------|-------------|---------|
| `text` | Short text input | Name, email |
| `textarea` | Long text input | Business description |
| `email` | Email validation | user@example.com |
| `phone` | Phone number | +91-9876543210 |
| `choice` | Single selection | Industry dropdown |
| `multiselect` | Multiple selections | Skills, industries |
| `slider` | Numeric slider | Risk tolerance 1-10 |
| `number` | Numeric input | Team size |
| `amount` | Currency input | ₹10,00,000 |
| `percentage` | Percentage input | 70% |
| `date` | Date picker | Start date |
| `url` | Website URL | https://example.com |
| `list` | Multiple items | Product list |
| `milestone` | Timeline events | Month 1: MVP |
| `checkpoint` | Pause/Continue | Checkpoint questions |

## MCP Integration Points

Questions with `mcp_trigger` field automatically trigger:

### Auto-Population Triggers
- `user_location` → Detect timezone, currency, local market data
- `industry` → Load revenue templates, margin benchmarks
- `operating_markets` → Calculate TAM/SAM/SOM, identify competitors
- `marketing_budget` + `monthly_customers` → Calculate CAC
- `year_1_revenue_target` → Generate financial projections
- `business_description` → Competitor analysis

### Agent Triggers
- **Market Analyst** - Triggered by location, industry, market questions
- **Financial Modeler** - Triggered by revenue, pricing, financial questions
- **Competitor Analyst** - Triggered by competitor, positioning questions

### Skill Triggers
- `market_sizing_calculator` - For TAM/SAM/SOM calculations
- `financial_modeling` - For 5-year projections
- `competitor_analysis` - For competitive intelligence
- `compliance_checker` - For regulatory requirements

## Conditional Logic

Questions with `condition` field only show when condition is met:

```typescript
// Example: Only show for B2B businesses
condition: "context.customer_type in ['B2B', 'B2B2C', 'Hybrid']"

// Example: Only show if expanding nationally
condition: "context.expansion_plan == 'Yes'"
```

## Next Steps to Complete Implementation

### 1. Add Remaining Phases (127 questions)
Create complete TypeScript definitions for:
- Phase 3: Business Context (19 questions)
- Phase 4: Market Analysis (20 questions)
- Phase 5: Revenue Model (20 questions)
- Phase 6: Competition (7 questions)
- Phase 7: Operations (18 questions)
- Phase 8: GTM Strategy (13 questions)
- Phase 9: Funding (10 questions)
- Phase 10: Risk (5 questions)
- Phase 11: Final Review (8 questions)

### 2. Implement Session Management
```typescript
interface QuestionnaireSession {
  user_id: string
  current_phase: string
  current_question_index: number
  responses: Record<string, any>
  completed_phases: string[]
  paused: boolean
  created_at: Date
  updated_at: Date
}
```

### 3. Add Conditional Rendering
Update questionnaire page to:
- Evaluate `condition` field before showing questions
- Skip questions that don't meet conditions
- Track conditional paths

### 4. Implement Progress Tracking
- Calculate overall progress (questions answered / total questions)
- Show phase-by-phase progress
- Display estimated time remaining

### 5. Add Business Model Generator
Create output generation for:
- Executive Summary
- Financial Projections (5-7 years)
- Market Analysis Report
- Competitive Positioning
- Operations Plan
- Go-to-Market Strategy
- Funding Requirements
- Risk Assessment

## File Structure

```
lib/schemas/
├── questions.ts (Current - Phases 1-2)
├── questions-phase3.ts (Business Context)
├── questions-phase4.ts (Market Analysis)
├── questions-phase5.ts (Revenue Model)
├── questions-phase6.ts (Competition)
├── questions-phase7.ts (Operations)
├── questions-phase8.ts (GTM)
├── questions-phase9.ts (Funding)
├── questions-phase10.ts (Risk)
├── questions-phase11.ts (Final)
└── index.ts (Export all)
```

## Usage Example

```typescript
import { ALL_PHASES, getQuestionsByPhase } from '@/lib/schemas/questions'

// Get all questions for Phase 1
const phase1Questions = getQuestionsByPhase(1)

// Get specific question
const nameQuestion = getQuestionById('user_name')

// Check if question has MCP trigger
if (nameQuestion.mcp_trigger) {
  // Trigger MCP engine
  await mcpEngine.processAnswer(questionId, answer, allAnswers)
}

// Check conditional logic
if (question.condition) {
  const shouldShow = evaluateCondition(question.condition, allAnswers)
  if (!shouldShow) {
    // Skip this question
  }
}
```

## Estimated Completion Time

- **Phase 3-11 Implementation:** 4-6 hours
- **Session Management:** 2-3 hours
- **Conditional Logic:** 2-3 hours
- **Business Model Generator:** 4-6 hours
- **Testing & Refinement:** 3-4 hours

**Total:** 15-22 hours of development

## Priority Order

1. ✅ Phase 1-2 (Complete)
2. 🔄 Phase 3: Business Context (Critical for branching)
3. Phase 4: Market Analysis (Triggers market sizing)
4. Phase 5: Revenue Model (Triggers financial modeling)
5. Phases 6-11 (Complete remaining)
6. Session management & persistence
7. Business model output generation
