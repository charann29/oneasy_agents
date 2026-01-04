/**
 * Document Templates System
 * Transforms questionnaire answers into professional business documents
 */

export interface QuestionnaireAnswers {
    // Phase 1: Authentication & Onboarding
    full_name?: string;
    email?: string;
    phone?: string;
    preferred_language?: string;
    current_location?: string;

    // Phase 2: User Discovery
    education?: string;
    field_of_study?: string;
    years_experience?: string;
    industries_worked?: string[];
    employment_status?: string;
    professional_skills?: string[];
    personal_strengths?: string[];
    risk_tolerance?: number;
    capital_available?: string;
    time_commitment?: string;
    income_timeline?: string;
    linkedin_profile?: string;
    other_profiles?: string;

    // Phase 3: Business Context
    business_type?: 'new' | 'existing';
    problems_to_solve?: string;
    business_idea?: string;
    industry?: string;
    target_customer?: string;
    unique_advantage?: string;
    business_model?: string;
    stage?: string;
    validation_status?: string;

    // Additional phases...
    [key: string]: any;
}

export interface DocumentTemplate {
    id: string;
    name: string;
    description: string;
    generate: (answers: QuestionnaireAnswers) => Promise<string>;
}

/**
 * Generate Company Profile Document
 */
export async function generateCompanyProfile(
    answers: QuestionnaireAnswers
): Promise<string> {
    const {
        full_name,
        email,
        phone,
        current_location,
        linkedin_profile,
        education,
        field_of_study,
        years_experience,
        industries_worked,
        business_idea,
        industry,
        target_customer,
        unique_advantage,
        business_model,
        stage,
        problems_to_solve,
        validation_status,
        capital_available,
        risk_tolerance,
    } = answers;

    // Extract business name from business_idea or use a placeholder
    const businessName = extractBusinessName(answers);
    const tagline = generateTagline(business_idea || '');

    return `# ${businessName} - Company Profile

## Sample Company for AI Business Planner

**Generated**: ${new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}
**Purpose**: Professional business planning documentation

---

## Company Overview

**Company Name**: ${businessName}
**Tagline**: "${tagline}"
**Industry**: ${industry || 'To be determined'}
**Location**: ${current_location || 'To be determined'}
**Founded**: ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
**Stage**: ${stage || 'Early stage'}

---

## Founder Profile

**Name**: ${full_name || 'Founder'}
**Email**: ${email || 'Not provided'}
**Phone**: ${phone || 'Not provided'}
**Location**: ${current_location || 'Not provided'}
${linkedin_profile ? `**LinkedIn**: ${linkedin_profile}` : ''}

**Background**:
- ${years_experience || 'X'} years of professional experience
${education ? `- Education: ${education}${field_of_study ? ' in ' + field_of_study : ''}` : ''}
${industries_worked?.length ? `- Industry experience: ${industries_worked.join(', ')}` : ''}
${unique_advantage ? `- Key expertise: ${unique_advantage}` : ''}

---

## Business Context

### Problem Statement
${problems_to_solve || 'Addressing market needs and customer pain points.'}

### Solution
${business_idea || 'Innovative solution to market problems.'}

### Value Proposition
${unique_advantage || 'Unique competitive advantages in the market.'}

### Customer Type
**Primary**: ${target_customer || 'Target customer segment'}
**Business Model**: ${business_model || 'Revenue generation approach'}

### Current Stage
- Stage: ${stage || 'Early stage'}
- Validation: ${validation_status || 'In progress'}
${capital_available ? `- Capital available: ${capital_available}` : ''}
${risk_tolerance ? `- Risk tolerance: ${risk_tolerance}/10` : ''}

---

## Market Context

### Target Market
${target_customer || 'Target customer segments and market size to be determined.'}

### Market Opportunity
- **TAM** (Total Addressable Market): To be calculated
- **SAM** (Serviceable Available Market): To be calculated  
- **SOM** (Serviceable Obtainable Market): To be calculated

### Competitive Landscape

**Key Differentiators**:
${unique_advantage || 'Competitive advantages to be articulated.'}

---

## Financial Highlights

### Funding Strategy
- Capital available: ${capital_available || 'To be determined'}
- Funding requirements: To be calculated based on business model

---

## Session Data

\`\`\`json
{
  "generated_at": "${new Date().toISOString()}",
  "generation_type": "company_profile",
  "data_completeness": "${calculateCompleteness(answers)}%"
}
\`\`\`

---

**This profile serves as the foundation for generating additional business planning documents.**
`;
}

/**
 * Generate Business Plan Executive Summary
 */
export async function generateBusinessPlan(
    answers: QuestionnaireAnswers
): Promise<string> {
    const businessName = extractBusinessName(answers);

    return `# ${businessName} - Business Plan

## Executive Summary

[Generated comprehensive business plan based on questionnaire responses]

### Vision & Mission

**Vision**: ${answers.business_idea || 'Company vision'}

**Mission**: Deliver exceptional value to ${answers.target_customer || 'our customers'}

### Business Model

${answers.business_model || 'Business model description'}

### Market Opportunity

Market: ${answers.industry || 'Industry sector'}
Target: ${answers.target_customer || 'Customer segments'}

### Competitive Advantage

${answers.unique_advantage || 'Key differentiators'}

### Financial Summary

- Stage: ${answers.stage || 'Early stage'}
- Capital: ${answers.capital_available || 'TBD'}

---

[Additional sections to be generated with full data]
`;
}

/**
 * Generate Financial Model Document
 */
export async function generateFinancialModel(
    answers: QuestionnaireAnswers
): Promise<string> {
    const businessName = extractBusinessName(answers);
    const { revenue_model, pricing_strategy, capital_available } = answers;

    return `# ${businessName} - Financial Model Summary

**Generated by**: AI Business Planner
**Date**: ${new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}
**Format**: Excel Workbook Summary
**Period**: 5 Years

---

## Financial Summary (5-Year)

\`\`\`
                    Year 1    Year 2    Year 3    Year 4    Year 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Revenue            TBD       TBD       TBD       TBD       TBD
Gross Margin       60%       60%       60%       60%       60%
EBITDA Margin      TBD%      TBD%      TBD%      TBD%      TBD%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

## Unit Economics

\`\`\`
Customer Acquisition Cost (CAC):  TBD
Lifetime Value (LTV):              TBD
LTV:CAC Ratio:                     Target >3:1
Payback Period:                    TBD months
Gross Margin:                      60% (target)
\`\`\`

## Key Assumptions

**Revenue Model**: ${revenue_model || 'To be determined'}
**Pricing Strategy**: ${pricing_strategy || 'To be determined'}
**Starting Capital**: ${capital_available || 'To be determined'}

---

**Generated by AI Business Planner**
`;
}

/**
 * Generate Pitch Deck Document
 */
export async function generatePitchDeck(
    answers: QuestionnaireAnswers
): Promise<string> {
    const businessName = extractBusinessName(answers);
    const { full_name, email, problems_to_solve, business_idea, target_customer } = answers;

    return `# ${businessName} - Pitch Deck Outline

**Generated by**: AI Business Planner
**Date**: ${new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}
**Format**: PowerPoint (PPTX) - 13-15 Slides
**Duration**: 15-20 minute presentation

---

## Slide 1: Title Slide

\`\`\`
${businessName}
${generateTagline(business_idea || '')}

${full_name || 'Founder'}
Founder & CEO
${email || 'contact@company.com'}
\`\`\`

## Slide 2: The Problem

${problems_to_solve || 'Market pain points and customer challenges'}

## Slide 3: Our Solution

${business_idea || 'Innovative solution to market problems'}

## Slide 4: Market Opportunity

**Target**: ${target_customer || 'Target customer segments'}
**Market Size**: TBD

## Slide 5: Business Model

Revenue streams and pricing strategy

## Slide 6: Traction

Early metrics and validation

## Slide 7: Team

**Founder**: ${full_name || 'Founder Name'}

## Slide 8: The Ask

Funding requirements and use of funds

---

**Generated by AI Business Planner**
`;
}

/**
 * Generate Before/After Analysis
 */
export async function generateBeforeAfterAnalysis(
    answers: QuestionnaireAnswers
): Promise<string> {
    const businessName = extractBusinessName(answers);
    const { business_type, stage } = answers;

    return `# ${businessName} - Before/After Analysis

**Generated by**: AI Business Planner
**Date**: ${new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}

---

## BEFORE: Initial State

### Business Context
- **Type**: ${business_type === 'new' ? 'New venture' : 'Existing business'}
- **Stage**: ${stage || 'Early concept'}

### Initial Challenges
1. **Strategy Clarity**: Undefined business strategy
2. **Market Understanding**: Limited market validation
3. **Financial Planning**: Missing projections
4. **Execution Roadmap**: Lack of structured plan

---

## AFTER: Transformed State

### Key Improvements

#### 1. Strategic Clarity
- ✅ Defined value proposition
- ✅ Clear target market
- ✅ Competitive positioning

#### 2. Financial Framework
- ✅ 5-year projections
- ✅ Unit economics
- ✅ Funding requirements

#### 3. Execution Roadmap
- ✅ Go-to-market strategy
- ✅ Key milestones
- ✅ Team requirements

---

## Transformation Metrics

| Aspect | Before | After | Impact |
|--------|--------|-------|--------|
| Business Strategy | Undefined | Documented | ✓✓✓ |
| Financial Model | None | 5-year plan | ✓✓✓ |
| Market Analysis | Limited | Comprehensive | ✓✓✓ |

---

## Next Steps

1. Validate assumptions with target customers
2. Begin MVP development
3. Execute go-to-market plan
4. Track key metrics

**The foundation is built. Now it's time to execute.**

---

**Generated by AI Business Planner**
`;
}

/**
 * Helper Functions
 */
function extractBusinessName(answers: QuestionnaireAnswers): string {
    // Try to extract business name from various fields
    if (answers.business_name) return answers.business_name;

    // Try to extract from business idea
    const idea = answers.business_idea || '';
    const words = idea.split(' ').slice(0, 3);

    if (words.length > 0) {
        return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    return 'Your Business';
}

function generateTagline(businessIdea: string): string {
    // Simple tagline generation - in production, use AI
    const words = businessIdea.toLowerCase();

    if (words.includes('delivery')) return 'Delivered with excellence';
    if (words.includes('tech') || words.includes('software')) return 'Technology that works for you';
    if (words.includes('health') || words.includes('fitness')) return 'Your partner in health';
    if (words.includes('education') || words.includes('learning')) return 'Empowering through education';

    return 'Innovation meets execution';
}

function calculateCompleteness(answers: QuestionnaireAnswers): number {
    const totalFields = Object.keys(answers).length;
    const filledFields = Object.values(answers).filter(v =>
        v !== null && v !== undefined && v !== ''
    ).length;

    return Math.round((filledFields / totalFields) * 100);
}

/**
 * Document Templates Registry
 */
export const documentTemplates: DocumentTemplate[] = [
    {
        id: 'company_profile',
        name: 'Company Profile',
        description: 'Comprehensive company overview and founder profile',
        generate: generateCompanyProfile,
    },
    {
        id: 'business_plan',
        name: 'Business Plan Executive Summary',
        description: 'Investor-ready business plan document',
        generate: generateBusinessPlan,
    },
    {
        id: 'financial_model',
        name: 'Financial Model Summary',
        description: '5-year financial projections with unit economics',
        generate: generateFinancialModel,
    },
    {
        id: 'pitch_deck',
        name: 'Pitch Deck Outline',
        description: 'Slide-by-slide investor pitch deck structure',
        generate: generatePitchDeck,
    },
    {
        id: 'before_after_analysis',
        name: 'Before/After Analysis',
        description: 'Transformation insights and strategic recommendations',
        generate: generateBeforeAfterAnalysis,
    },
];

/**
 * Get template by ID
 */
export function getTemplate(id: string): DocumentTemplate | undefined {
    return documentTemplates.find(t => t.id === id);
}

/**
 * Generate all documents
 */
export async function generateAllDocuments(
    answers: QuestionnaireAnswers
): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    for (const template of documentTemplates) {
        results[template.id] = await template.generate(answers);
    }

    return results;
}
