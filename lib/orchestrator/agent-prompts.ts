/**
 * Agent-Specific Prompts for Question Processing
 * Context-aware prompts for each agent type based on question context
 */

import { AgentId } from './question-config';

// ============================================================================
// Types
// ============================================================================

export interface AgentPromptContext {
    questionId: string;
    questionText: string;
    userAnswer: string;
    previousAnswers: Record<string, any>;
    currentPhase: number;
    phaseId: string;
    userName?: string;
    language?: string;
}

export interface AgentPromptResult {
    systemPrompt: string;
    userPrompt: string;
    extractionInstructions: string;
}

// ============================================================================
// Base System Prompts by Agent Type
// ============================================================================

export const AGENT_BASE_PROMPTS: Record<AgentId, string> = {
    context_collector: `You are the Context Collector agent. Your role is to:
- Capture and organize user information accurately
- Extract implicit details from responses (e.g., industry from email domain)
- Note inconsistencies or gaps for follow-up
- Structure data for other agents to use

Be precise and thorough. Every piece of information matters for the business model.`,

    business_planner_lead: `You are the Business Planner Lead agent - the orchestrator of business planning. Your role is to:
- Synthesize inputs from all specialized agents
- Identify the most viable business model based on user's context
- Spot potential issues early (cash flow, market fit, team gaps)
- Provide strategic direction and prioritization

Think like a seasoned entrepreneur and business advisor.`,

    customer_profiler: `You are the Customer Profiler agent. Your role is to:
- Build detailed Ideal Customer Profiles (ICPs)
- Understand customer pain points, motivations, and behaviors
- Segment customers by demographics, psychographics, and firmographics
- Identify buyer personas and decision-making patterns

Every business lives or dies by understanding its customers.`,

    market_analyst: `You are the Market Analyst agent. Your role is to:
- Calculate TAM (Total Addressable Market), SAM, and SOM
- Analyze competitive landscape and positioning
- Identify market trends and opportunities
- Assess market maturity and growth potential

Use data-driven analysis. Be specific with numbers and percentages.`,

    financial_modeler: `You are the Financial Modeler agent. Your role is to:
- Build revenue projections and financial models
- Calculate unit economics (CAC, LTV, margins)
- Model cash flow and runway scenarios
- Identify funding requirements and breakeven points

Be precise with numbers. Every assumption should be documented.`,

    revenue_architect: `You are the Revenue Architect agent. Your role is to:
- Design optimal revenue models (recurring, transactional, hybrid)
- Structure pricing tiers and packaging
- Identify upsell and cross-sell opportunities
- Maximize customer lifetime value

Think creatively about monetization while staying grounded in market realities.`,

    gtm_strategist: `You are the GTM (Go-To-Market) Strategist agent. Your role is to:
- Design customer acquisition strategies
- Plan marketing channel mix and budget allocation
- Build sales processes and team structures
- Create launch and growth roadmaps

Focus on practical, executable strategies with clear metrics.`,

    legal_advisor: `You are the Legal Advisor agent. Your role is to:
- Identify required licenses and registrations
- Flag regulatory compliance requirements
- Recommend appropriate legal entity structure
- Highlight intellectual property considerations

Provide practical guidance, not legal advice. Recommend professional consultation when needed.`,

    ops_planner: `You are the Operations Planner agent. Your role is to:
- Design organizational structure and team composition
- Plan hiring sequences and role definitions
- Identify key vendors and partnerships
- Build operational processes and systems

Focus on building a lean, scalable operation.`,

    funding_strategist: `You are the Funding Strategist agent. Your role is to:
- Determine appropriate funding strategy (bootstrap vs raise)
- Calculate funding requirements and runway
- Identify suitable investor types and approach strategies
- Structure deals and valuations

Be realistic about what's achievable given the founder's profile and market.`,

    unit_economics_calculator: `You are the Unit Economics Calculator agent. Your role is to:
- Calculate key SaaS/business metrics (CAC, LTV, LTV:CAC ratio)
- Assess business model health and sustainability
- Identify levers for improving unit economics
- Benchmark against industry standards

Numbers tell the story. Be precise and explain the implications.`,

    output_generator: `You are the Output Generator agent. Your role is to:
- Synthesize all collected information into coherent outputs
- Structure business plans, pitch decks, and financial models
- Ensure consistency across all documents
- Tailor content for the intended audience

Quality matters. Make every word count.`,

    document_generator: `You are the Document Generator agent. Your role is to:
- Create professionally formatted documents
- Apply brand guidelines consistently
- Generate charts, tables, and visualizations
- Export in requested formats (PDF, DOCX, PPT)

Professional presentation builds credibility.`
};

// ============================================================================
// Question-Type Specific Prompts
// ============================================================================

export const QUESTION_TYPE_PROMPTS = {
    // For questions that are critical branching points
    branching: `
IMPORTANT: This is a CRITICAL BRANCHING POINT question.
The user's answer will determine the path of many subsequent questions.
Extract the decision clearly and note which questions should be skipped based on this answer.
`,

    // For questions requiring NLP extraction
    extraction: `
EXTRACTION REQUIRED: Analyze the user's free-text response carefully.
Extract:
- Key entities (companies, industries, technologies mentioned)
- Quantified metrics (revenue, costs, time periods)
- Implied information (sentiment, confidence level)
- Action items or next steps mentioned
`,

    // For financial questions
    financial: `
FINANCIAL CONTEXT: Apply appropriate financial modeling.
- Validate numbers against industry benchmarks
- Calculate derived metrics (if revenue is 10L, calculate monthly burn rate implications)
- Flag if numbers seem unrealistic (too high or too low for the stage)
- Note assumptions that need validation
`,

    // For market questions
    market: `
MARKET ANALYSIS CONTEXT: Consider market dynamics.
- Cross-reference with known market data
- Consider regional variations (India vs US benchmarks)
- Note competitive implications
- Identify market timing considerations
`,

    // For team/operations questions
    operations: `
OPERATIONS CONTEXT: Think about practical execution.
- Consider founder's time constraints and skills
- Balance between doing vs hiring
- Note dependencies between roles
- Consider remote vs in-person implications
`
};

// ============================================================================
// Generate Context-Aware Prompt
// ============================================================================

export function generateAgentPrompt(
    agentId: AgentId,
    context: AgentPromptContext
): AgentPromptResult {
    const basePrompt = AGENT_BASE_PROMPTS[agentId];

    // Build context summary
    const contextSummary = buildContextSummary(context.previousAnswers);

    // Build system prompt
    const systemPrompt = `${basePrompt}

CURRENT CONTEXT:
- Phase: ${context.phaseId} (Phase ${context.currentPhase + 1})
- Question: ${context.questionId}
- User: ${context.userName || 'Unknown'}
- Language: ${context.language || 'en-US'}

PREVIOUS CONTEXT SUMMARY:
${contextSummary}

INSTRUCTIONS:
1. Analyze the user's response in context of all previous answers
2. Extract relevant insights for this agent's domain
3. Note any inconsistencies or follow-up needs
4. Provide structured output for synthesis

STRICT LANGUAGE REQUIREMENT:
The user has selected the language: "${context.language || 'en-US'}".
You MUST respond in this language.
If the language is Hindi (hi-IN) or Telugu (te-IN), your entire response (except specific English business terms) MUST be in that language.
Do NOT default to English. This is a critical requirement.`;

    // Build user prompt
    const userPrompt = `The user was asked: "${context.questionText}"

Their response: "${context.userAnswer}"

Analyze this response and provide:
1. Key insights relevant to your expertise
2. Implications for the business model
3. Any red flags or concerns
4. Suggestions for related follow-up`;

    // Build extraction instructions
    const extractionInstructions = `
Extract and structure the following from the user's response:
- Direct answer value
- Implied information
- Confidence level (high/medium/low)
- Follow-up needed (yes/no)
- Context updates for other agents`;

    return {
        systemPrompt,
        userPrompt,
        extractionInstructions
    };
}

// ============================================================================
// Context Summary Builder
// ============================================================================

function buildContextSummary(answers: Record<string, any>): string {
    if (!answers || Object.keys(answers).length === 0) {
        return 'No previous context available.';
    }

    const summaryParts: string[] = [];

    // User profile
    if (answers.user_name) {
        summaryParts.push(`User: ${answers.user_name}`);
    }
    if (answers.user_location) {
        summaryParts.push(`Location: ${answers.user_location}`);
    }
    if (answers.years_experience) {
        summaryParts.push(`Experience: ${answers.years_experience} years`);
    }
    if (answers.core_skills) {
        const skills = Array.isArray(answers.core_skills)
            ? answers.core_skills.join(', ')
            : answers.core_skills;
        summaryParts.push(`Skills: ${skills}`);
    }

    // Business context
    if (answers.business_path) {
        summaryParts.push(`Business Path: ${answers.business_path}`);
    }
    if (answers.business_model_type) {
        summaryParts.push(`Model: ${answers.business_model_type}`);
    }
    if (answers.customer_type) {
        summaryParts.push(`Customer Type: ${answers.customer_type}`);
    }

    // Financial context
    if (answers.investment_capital) {
        summaryParts.push(`Capital: ${answers.investment_capital}`);
    }
    if (answers.risk_tolerance) {
        summaryParts.push(`Risk Tolerance: ${answers.risk_tolerance}/10`);
    }
    if (answers.timeline_profitability) {
        summaryParts.push(`Profit Timeline: ${answers.timeline_profitability}`);
    }

    return summaryParts.join('\n');
}

// ============================================================================
// Phase-Specific Agent Selection Logic
// ============================================================================

export const PHASE_AGENT_PATTERNS: Record<string, {
    primary: AgentId[];
    conditional: (answers: Record<string, any>) => AgentId[];
}> = {
    auth: {
        primary: ['context_collector'],
        conditional: () => []
    },
    discovery: {
        primary: ['context_collector', 'business_planner_lead'],
        conditional: (answers) => {
            const extra: AgentId[] = [];
            if (answers.years_experience && answers.years_experience !== '0') {
                extra.push('customer_profiler');
            }
            if (answers.investment_capital && answers.investment_capital !== '<50k') {
                extra.push('financial_modeler');
            }
            return extra;
        }
    },
    context: {
        primary: ['context_collector', 'business_planner_lead'],
        conditional: (answers) => {
            const extra: AgentId[] = [];
            if (answers.business_path === 'new') {
                extra.push('market_analyst', 'customer_profiler');
            }
            if (answers.business_path === 'existing') {
                extra.push('financial_modeler', 'revenue_architect');
            }
            return extra;
        }
    },
    market: {
        primary: ['market_analyst', 'customer_profiler'],
        conditional: (answers) => {
            const extra: AgentId[] = [];
            if (['b2b', 'b2b2c', 'b2g'].includes(answers.customer_type)) {
                extra.push('revenue_architect');
            }
            if (answers.international_plan === 'yes') {
                extra.push('legal_advisor');
            }
            return extra;
        }
    },
    revenue: {
        primary: ['financial_modeler', 'revenue_architect'],
        conditional: (answers) => {
            const extra: AgentId[] = [];
            if (answers.revenue_model === 'recurring') {
                extra.push('unit_economics_calculator');
            }
            return extra;
        }
    },
    competition: {
        primary: ['market_analyst', 'customer_profiler'],
        conditional: () => ['business_planner_lead']
    },
    operations: {
        primary: ['ops_planner', 'business_planner_lead'],
        conditional: (answers) => {
            const extra: AgentId[] = [];
            if (answers.team_size_year1 !== 'just_me') {
                extra.push('financial_modeler');
            }
            if (answers.licenses_needed || answers.regulations) {
                extra.push('legal_advisor');
            }
            return extra;
        }
    },
    gtm: {
        primary: ['gtm_strategist', 'market_analyst'],
        conditional: (answers) => {
            const extra: AgentId[] = [];
            if (answers.sales_model !== 'self_serve') {
                extra.push('ops_planner');
            }
            return extra;
        }
    },
    funding: {
        primary: ['funding_strategist', 'financial_modeler'],
        conditional: (answers) => {
            const extra: AgentId[] = [];
            if (answers.external_funding !== 'bootstrap') {
                extra.push('business_planner_lead');
            }
            return extra;
        }
    },
    risk: {
        primary: ['business_planner_lead', 'market_analyst'],
        conditional: () => ['financial_modeler']
    },
    output: {
        primary: ['output_generator', 'document_generator'],
        conditional: () => ['business_planner_lead']
    }
};

/**
 * Get agents for a phase based on current answers
 */
export function getPhaseAgents(phaseId: string, answers: Record<string, any>): AgentId[] {
    const pattern = PHASE_AGENT_PATTERNS[phaseId];
    if (!pattern) {
        return ['context_collector', 'business_planner_lead'];
    }
    const conditionalAgents = pattern.conditional(answers);
    const allAgents = [...pattern.primary, ...conditionalAgents];

    // Deduplicate
    return Array.from(new Set(allAgents));
}

// ============================================================================
// Answer Extraction Templates
// ============================================================================

export const EXTRACTION_TEMPLATES: Record<string, (answer: string) => Record<string, any>> = {
    // Extract from free-text business idea
    business_idea_detail: (answer: string) => {
        const extracted: Record<string, any> = {
            raw_idea: answer
        };

        // Simple keyword extraction (in production, use NLP)
        const keywords = {
            saas: ['saas', 'software', 'platform', 'app', 'subscription'],
            b2b: ['b2b', 'business', 'enterprise', 'companies', 'organizations'],
            b2c: ['b2c', 'consumer', 'customer', 'people', 'individual'],
            ecommerce: ['ecommerce', 'online store', 'selling', 'marketplace'],
            ai: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'automation']
        };

        const lowerAnswer = answer.toLowerCase();

        for (const [key, terms] of Object.entries(keywords)) {
            if (terms.some(term => lowerAnswer.includes(term))) {
                extracted[`is_${key}`] = true;
            }
        }

        return extracted;
    },

    // Extract from customer problem description
    customer_problem: (answer: string) => {
        const extracted: Record<string, any> = {
            raw_problem: answer,
            has_quantified_pain: false
        };

        // Check for quantified pain (numbers, percentages)
        const hasNumbers = /\d+%|\$[\d,]+|₹[\d,]+|\d+\s*(hours|minutes|days|weeks)/.test(answer);
        if (hasNumbers) {
            extracted.has_quantified_pain = true;
            extracted.pain_urgency = 'high';
        }

        return extracted;
    },

    // Extract from unique advantage description
    unique_advantage: (answer: string) => {
        const extracted: Record<string, any> = {
            raw_advantage: answer
        };

        const moatTypes = {
            technology: ['proprietary', 'patent', 'algorithm', 'technology', 'ai', 'ml'],
            network: ['network', 'connections', 'relationships', 'partnerships'],
            expertise: ['experience', 'years', 'expert', 'worked at', 'built'],
            data: ['data', 'insights', 'analytics', 'information'],
            brand: ['brand', 'reputation', 'trust', 'recognition']
        };

        const lowerAnswer = answer.toLowerCase();
        const identifiedMoats: string[] = [];

        for (const [moatType, terms] of Object.entries(moatTypes)) {
            if (terms.some(term => lowerAnswer.includes(term))) {
                identifiedMoats.push(moatType);
            }
        }

        extracted.moat_types = identifiedMoats;
        extracted.moat_strength = identifiedMoats.length >= 2 ? 'strong' :
            identifiedMoats.length === 1 ? 'medium' : 'weak';

        return extracted;
    }
};

/**
 * Extract structured data from an answer
 */
export function extractFromAnswer(questionId: string, answer: string): Record<string, any> {
    const template = EXTRACTION_TEMPLATES[questionId];
    if (template) {
        return template(answer);
    }

    // Default extraction
    return {
        value: answer,
        timestamp: new Date().toISOString()
    };
}

console.log('✅ Agent prompts loaded');
