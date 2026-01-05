/**
 * Business Plan Generator
 * Uses multi-agent outputs to create comprehensive, investor-ready business plan
 * Synthesizes: Market Analysis + Customer Insights + Financial Projections + GTM Strategy
 */

import { ClaudeService } from '@/lib/services/claude-service';
import { logger } from '@/backend/utils/logger';

export async function generateBusinessPlan(
    answers: Record<string, any>,
    agentOutputs: any
): Promise<string> {
    logger.info('Generating Business Plan document...');

    const claude = new ClaudeService();
    const businessName = extractBusinessName(answers);

    // Build context from all agent outputs
    const marketAnalysis = agentOutputs.market_analyst?.output || 'Market analysis pending';
    const customerInsights = agentOutputs.customer_profiler?.output || 'Customer analysis pending';
    const financialProjections = agentOutputs.financial_modeler?.output || 'Financial model pending';
    const gtmStrategy = agentOutputs.gtm_strategist?.output || 'GTM strategy pending';

    const systemPrompt = `You are an elite Venture Capital Strategist & Business Consultant.

Your task: Transform multi-agent intelligence into a world-class, investor-ready Business Plan.

CRITICAL REQUIREMENTS:
1. This is NOT a template - synthesize REAL insights from agent outputs
2. Use specific numbers, data, and projections provided by agents
3. Length: 4,000-6,000 words (comprehensive and detailed)
4. Structure: Executive Summary → Market Analysis → Business Model → Financial Projections → GTM Strategy → Risk Analysis
5. Tone: Professional, authoritative, persuasive, data-driven
6. Include "Agent Insight" blocks (> 💡 **Strategic Insight:**) to explain key decisions

AUDIENCE: Sophisticated investors (VCs, angels) who have seen 1000s of business plans.

YOUR GOAL: Make this plan stand out with depth, specificity, and compelling logic.`;

    const userMessage = `# Business Plan Generation Task

## Business: ${businessName}

## Agent Intelligence Gathered:

### 1. Market Analysis (from market_analyst agent)
${marketAnalysis}

### 2. Customer Insights (from customer_profiler agent)
${customerInsights}

### 3. Financial Projections (from financial_modeler agent)
${financialProjections}

### 4. Go-To-Market Strategy (from gtm_strategist agent)
${gtmStrategy}

## Additional Context from Questionnaire:
\`\`\`json
${JSON.stringify(answers, null, 2)}
\`\`\`

---

## YOUR TASK:

Generate a comprehensive **30-50 page Business Plan** in Markdown format.

### Required Structure:

# Executive Summary
- The "Hook": Why this business? Why now?
- Problem statement and market opportunity
- Solution overview and unique value proposition
- Key financial highlights (revenue, margins, funding need)
- Vision for next 5 years

# I. Market Analysis
Use the market_analyst output to provide:
- TAM/SAM/SOM with calculations and sources
- Market trends and growth drivers
- Competitive landscape analysis
- Market entry strategy and timing

# II. Customer & Product Strategy
Use the customer_profiler output to provide:
- Detailed customer personas (demographics, psychographics, pain points)
- Customer acquisition strategy
- Product-market fit validation
- Value proposition for each segment

# III. Business Model & Revenue Strategy
- Revenue streams breakdown
- Pricing strategy and rationale
- Unit economics (from financial projections)
- Scalability and leverage points

# IV. Financial Projections
Use the financial_modeler output to provide:
- 5-7 year P&L summary
- Key metrics: Gross margin, EBITDA, net income
- Break-even analysis
- Capital requirements and use of funds
- Scenario analysis (base/bull/bear)

# V. Go-To-Market Strategy
Use the gtm_strategist output to provide:
- Channel strategy and CAC targets
- Marketing and sales approach
- Partnership strategy
- Launch timeline and milestones

# VI. Operational Plan
- Team structure and key hires
- Technology stack and infrastructure
- Key vendors and partnerships
- Regulatory and compliance considerations

# VII. Risk Analysis & Mitigation
- Market risks and mitigation strategies
- Execution risks and contingency plans
- Financial risks and buffer strategies
- Competitive risks and differentiation defense

# VIII. Funding & Investment
- Investment ask and use of funds
- Valuation rationale
- Exit strategy and timeline
- ROI projections for investors

---

CRITICAL:
- Use REAL numbers from agent outputs (don't make up data)
- Reference specific projections from financial_modeler
- Cite market data from market_analyst
- Include customer quotes/insights from customer_profiler
- Length: 4,000-6,000 words minimum
- Be specific, detailed, and compelling`;

    try {
        const response = await claude.sendMessage(
            systemPrompt,
            [{ role: 'user', content: userMessage }],
            undefined, // no tools needed
            0.7, // creative but focused
            4096 // Haiku's max output tokens
        );

        const content = claude.extractText(response);

        logger.info('Business Plan generated', {
            length: content.length,
            wordCount: content.split(/\s+/).length
        });

        return content;

    } catch (error) {
        logger.error('Business Plan generation failed', error);
        throw error;
    }
}

function extractBusinessName(answers: Record<string, any>): string {
    return answers.business_name ||
           answers.existing_name ||
           answers.business_idea?.split(' ').slice(0, 3).join(' ') ||
           'New Venture';
}
