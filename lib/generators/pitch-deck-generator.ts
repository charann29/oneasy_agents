/**
 * Pitch Deck Generator
 * Creates investor-ready pitch deck content (12-15 slides)
 * Suitable for PowerPoint/PPTX export
 */

import { ClaudeService } from '@/lib/services/claude-service';
import { logger } from '@/backend/utils/logger';

export async function generatePitchDeck(
    answers: Record<string, any>,
    agentOutputs: any
): Promise<string> {
    logger.info('Generating Pitch Deck document...');

    const claude = new ClaudeService();
    const businessName = extractBusinessName(answers);

    const marketAnalysis = agentOutputs.market_analyst?.output || '';
    const financialProjections = agentOutputs.financial_modeler?.output || '';
    const gtmStrategy = agentOutputs.gtm_strategist?.output || '';
    const customerInsights = agentOutputs.customer_profiler?.output || '';

    const systemPrompt = `You are a Startup Pitch Coach & Storyteller with Series A fundraising expertise.

Your task: Create a compelling, slide-by-slide Investor Pitch Deck.

CRITICAL REQUIREMENTS:
1. 12-15 slides with specific, punchy content for each
2. Think VISUALLY - describe what should be shown on each slide
3. Use real numbers and data from agent outputs
4. Follow the narrative arc: Problem → Solution → Opportunity → Traction → Team → Ask
5. Each slide: 3-5 bullet points max (punchy, high-impact)
6. Include "Speaker Notes" for the founder to use during presentation
7. Include "Visual Guidance" (what charts/images to show)

TONE: Confident, exciting, data-driven. Make investors feel FOMO.

GOAL: Get investors to schedule a follow-up meeting.`;

    const userMessage = `# Pitch Deck Generation Task

## Business: ${businessName}

## Intelligence from Agents:

### Market Analysis:
${marketAnalysis}

### Financial Projections:
${financialProjections}

### Go-To-Market Strategy:
${gtmStrategy}

### Customer Insights:
${customerInsights}

## Additional Context:
\`\`\`json
${JSON.stringify(answers, null, 2)}
\`\`\`

---

## YOUR TASK:

Create a **12-15 Slide Investor Pitch Deck** in the following format:

For each slide, provide:
1. Slide title
2. 3-5 bullet points of content (punchy, specific)
3. Visual guidance (what to show visually)
4. Speaker notes (what to say)

---

# SLIDE STRUCTURE:

## SLIDE 1: Cover
**Tagline:** [One powerful sentence]
**Visual Guidance:** Company logo, founder photo, one striking image
**Speaker Notes:** [30-second opening hook]

## SLIDE 2: The Problem (The Villain)
- Bullet 1: [Specific pain point with data]
- Bullet 2: [Market inefficiency]
- Bullet 3: [Why existing solutions fail]
**Visual Guidance:** Problem illustration, customer quote, stat
**Speaker Notes:** [Make them FEEL the pain]

## SLIDE 3: The Solution (The Hero)
- Bullet 1: [Your solution in one sentence]
- Bullet 2: [How it works (simple)]
- Bullet 3: [Why it's 10x better]
**Visual Guidance:** Product screenshot or demo flow
**Speaker Notes:** [Show, don't just tell]

## SLIDE 4: The Market (The Prize)
- TAM: [$X billion]
- SAM: [$Y billion]
- SOM: [$Z billion achievable]
**Visual Guidance:** Market sizing chart, growth trends
**Speaker Notes:** [Use market_analyst numbers]

## SLIDE 5: Product Demo / How It Works
- Step 1: [User action]
- Step 2: [Platform response]
- Step 3: [Value delivered]
**Visual Guidance:** Product flow diagram or screenshots
**Speaker Notes:** [Walk through specific use case]

## SLIDE 6: Traction & Validation
- Metric 1: [Revenue, users, or engagement]
- Metric 2: [Growth rate MoM/YoY]
- Metric 3: [Customer testimonial or case study]
**Visual Guidance:** Growth chart, logos of customers
**Speaker Notes:** [Prove it's working]

## SLIDE 7: Business Model (How We Make Money)
- Revenue stream 1: [% breakdown]
- Revenue stream 2: [% breakdown]
- Unit economics: [LTV:CAC, margins]
**Visual Guidance:** Revenue breakdown chart
**Speaker Notes:** [Use financial_modeler numbers]

## SLIDE 8: Go-To-Market Strategy
- Channel 1: [Strategy and CAC]
- Channel 2: [Strategy and CAC]
- Partnership strategy
**Visual Guidance:** Funnel diagram, channel mix
**Speaker Notes:** [Use gtm_strategist insights]

## SLIDE 9: Competition (Why We Win)
- Competitor A: [Their weakness]
- Competitor B: [Their weakness]
- Our unfair advantage: [Specific]
**Visual Guidance:** Competitive matrix or positioning map
**Speaker Notes:** [Show differentiation clearly]

## SLIDE 10: The Team (Why Us)
- Founder 1: [Relevant expertise]
- Founder 2: [Complementary skills]
- Key hire: [Critical capability]
**Visual Guidance:** Team photos, logos of previous companies
**Speaker Notes:** [Inspire confidence in execution]

## SLIDE 11: Financial Projections (The ROI)
- Year 1 revenue: [from financial model]
- Year 3 revenue: [from financial model]
- Year 5 revenue: [from financial model]
- Path to profitability: [Month X]
**Visual Guidance:** Revenue hockey stick chart
**Speaker Notes:** [Walk through key assumptions]

## SLIDE 12: The Ask (Investment Details)
- Raising: [$X million]
- Use of funds: [3-4 categories with %]
- Milestones: [What this round achieves]
- Target close: [Date]
**Visual Guidance:** Use of funds pie chart
**Speaker Notes:** [Clear call to action]

## SLIDE 13: Vision (Optional - Close Strong)
- Where we'll be in 5 years
- Impact on market
- Exit opportunity
**Visual Guidance:** Inspirational future state
**Speaker Notes:** [End with vision]

## SLIDE 14: Appendix - Key Metrics (Backup)
[Additional data for Q&A]

## SLIDE 15: Appendix - Team Bios (Backup)
[Detailed backgrounds]

---

CRITICAL:
- Use REAL numbers from agent outputs
- Make every bullet count (no fluff)
- Visual guidance should be specific and actionable
- Speaker notes should sound natural and confident
- Total deck should tell a compelling STORY`;

    try {
        const response = await claude.sendMessage(
            systemPrompt,
            [{ role: 'user', content: userMessage }],
            undefined,
            0.7,
            4096 // Haiku's max output tokens
        );

        const content = claude.extractText(response);

        logger.info('Pitch Deck generated', {
            length: content.length,
            wordCount: content.split(/\s+/).length
        });

        return content;

    } catch (error) {
        logger.error('Pitch Deck generation failed', error);
        throw error;
    }
}

function extractBusinessName(answers: Record<string, any>): string {
    return answers.business_name ||
           answers.existing_name ||
           'New Venture';
}
