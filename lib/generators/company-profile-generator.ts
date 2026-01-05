/**
 * Company Profile Generator
 * Creates professional corporate identity document
 * Uses customer_profiler and market_analyst insights
 */

import { ClaudeService } from '@/lib/services/claude-service';
import { logger } from '@/backend/utils/logger';

export async function generateCompanyProfile(
    answers: Record<string, any>,
    agentOutputs: any
): Promise<string> {
    logger.info('Generating Company Profile document...');

    const claude = new ClaudeService();
    const businessName = extractBusinessName(answers);

    const customerInsights = agentOutputs.customer_profiler?.output || '';
    const marketAnalysis = agentOutputs.market_analyst?.output || '';

    const systemPrompt = `You are a Brand Identity Strategist & Professional Copywriter.

Your task: Craft a compelling, premium Corporate Profile that establishes brand identity.

CRITICAL REQUIREMENTS:
1. Professional "We" language throughout
2. Balance inspiration with credibility
3. Use customer insights to shape value proposition
4. Length: 1,500-2,000 words
5. Tone: Established, trustworthy, innovation-forward

OUTPUT: Polished corporate identity document suitable for website/investor materials.`;

    const userMessage = `# Company Profile Generation

## Business: ${businessName}

## Customer Insights:
${customerInsights}

## Market Context:
${marketAnalysis}

## Founder Background:
\`\`\`json
${JSON.stringify({
    founder_name: answers.user_name || answers.full_name,
    education: answers.education_level,
    experience: answers.years_experience,
    skills: answers.core_skills
}, null, 2)}
\`\`\`

---

## YOUR TASK:

Generate a **Corporate Profile** with this structure:

# ${businessName} - Corporate Profile

## Brand Essence

### Vision
[Where we're headed - aspirational but achievable]

### Mission
[What we do today - clear and actionable]

### Core Values
1. **Value 1:** [Description]
2. **Value 2:** [Description]
3. **Value 3:** [Description]

## Executive Narrative

### Who We Are
[Founder story woven into business purpose - make it human and relatable]

### The Challenge We're Solving
[Use customer pain points from customer_profiler]

### How We're Different
[Unique approach and competitive advantages]

## Our Solution

### What We Offer
[Product/service description - specific and clear]

### How It Works
[Simple explanation of delivery]

### The Value We Create
[Outcomes and benefits - quantify if possible]

## Who We Serve

### Our Ideal Customer
[Based on customer_profiler insights]

### Industries We Focus On
[Specific sectors]

### Geographic Presence
[Current and planned markets]

## Brand Position

### Brand Archetype
[e.g., The Innovator, The Sage, The Hero]

### Brand Voice
[How we communicate]

### Brand Promise
[What customers can always expect]

---

CRITICAL:
- Use professional "We" language
- Avoid generic jargon
- Be specific about what makes the business unique
- Ground claims in customer insights from agents
- Make it feel established and credible`;

    try {
        const response = await claude.sendMessage(
            systemPrompt,
            [{ role: 'user', content: userMessage }],
            undefined,
            0.7,
            4000
        );

        const content = claude.extractText(response);

        logger.info('Company Profile generated', {
            length: content.length
        });

        return content;

    } catch (error) {
        logger.error('Company Profile generation failed', error);
        throw error;
    }
}

function extractBusinessName(answers: Record<string, any>): string {
    return answers.business_name || answers.existing_name || 'New Venture';
}
