/**
 * Strategic Analysis Generator
 * Creates comprehensive before/after and SWOT analysis
 * Stress-tests the business plan and identifies opportunities
 */

import { ClaudeService } from '@/lib/services/claude-service';
import { logger } from '@/backend/utils/logger';

export async function generateAnalysis(
    answers: Record<string, any>,
    agentOutputs: any
): Promise<string> {
    logger.info('Generating Strategic Analysis document...');

    const claude = new ClaudeService();
    const businessName = extractBusinessName(answers);

    // Gather all agent outputs for comprehensive analysis
    const allAgentInsights = Object.entries(agentOutputs)
        .map(([agentId, result]: [string, any]) => `### ${agentId}\n${result.output}`)
        .join('\n\n');

    const systemPrompt = `You are a Senior Strategic Business Consultant with McKinsey/BCG background.

Your task: Perform rigorous 360-degree strategic analysis of this business plan.

CRITICAL REQUIREMENTS:
1. Be honest and constructive - identify both strengths AND weaknesses
2. Don't sugarcoat risks
3. Provide specific, actionable recommendations
4. Use frameworks: SWOT, Gap Analysis, Risk Heatmap
5. Length: 2,500-3,500 words
6. Include letter grade assessment (A-F) with detailed rationale

TONE: Professional consultant delivering board-level strategic review.

GOAL: Help the founder see blind spots and strengthen their plan before market entry.`;

    const userMessage = `# Strategic Analysis Task

## Business Under Review: ${businessName}

## Complete Agent Intelligence:
${allAgentInsights}

## Questionnaire Data:
\`\`\`json
${JSON.stringify(answers, null, 2)}
\`\`\`

---

## YOUR TASK:

Generate a **360-Degree Strategic Analysis** with this structure:

# Strategic Analysis: ${businessName}

## Executive Assessment

### Overall Viability Grade: [A-F]
**Rationale:** [3-4 sentences explaining the grade]

### Key Strengths (Top 3)
1. [Specific strength with evidence]
2. [Specific strength with evidence]
3. [Specific strength with evidence]

### Critical Concerns (Top 3)
1. [Specific concern with impact]
2. [Specific concern with impact]
3. [Specific concern with impact]

---

## I. SWOT Analysis

### Strengths
- **S1:** [Internal capability/advantage]
- **S2:** [Internal capability/advantage]
- **S3:** [Internal capability/advantage]
- **S4:** [Internal capability/advantage]

### Weaknesses
- **W1:** [Internal limitation]
- **W2:** [Internal limitation]
- **W3:** [Internal limitation]
- **W4:** [Internal limitation]

### Opportunities
- **O1:** [External opportunity]
- **O2:** [External opportunity]
- **O3:** [External opportunity]

### Threats
- **T1:** [External threat]
- **T2:** [External threat]
- **T3:** [External threat]

---

## II. Gap Analysis

### What's Missing?
1. **Gap:** [Area lacking depth]
   - **Impact:** [Why this matters]
   - **Recommendation:** [How to address]

2. **Gap:** [Area lacking depth]
   - **Impact:** [Why this matters]
   - **Recommendation:** [How to address]

3. **Gap:** [Area lacking depth]
   - **Impact:** [Why this matters]
   - **Recommendation:** [How to address]

---

## III. Risk Heatmap

### High Probability + High Impact (RED ZONE)
- **Risk 1:** [Description]
  - **Mitigation:** [Specific actions]

### Medium Probability/Impact (YELLOW ZONE)
- **Risk 1:** [Description]
- **Risk 2:** [Description]

### Low Probability/Impact (GREEN ZONE)
- [Manageable risks]

---

## IV. Competitive Positioning Analysis

### Current Position
[Where the business stands today vs competitors]

### Defensibility Score: [1-10]
**Explanation:** [What makes position sustainable or vulnerable]

### Positioning Recommendations
1. [Specific repositioning advice]
2. [Specific repositioning advice]

---

## V. Financial Realism Check

### Revenue Projections: [Aggressive/Realistic/Conservative]
**Analysis:** [Compare to benchmarks and explain]

### Cost Structure: [Optimistic/Realistic/Pessimistic]
**Analysis:** [Assess OPEX assumptions]

### Break-Even Timeline: [Fast/Normal/Slow]
**Analysis:** [Industry comparison]

### Capital Efficiency: [High/Medium/Low]
**Analysis:** [Burn multiple and runway assessment]

---

## VI. Market Timing Analysis

### Market Maturity: [Early/Growth/Mature]
### Entry Timing: [Too Early/Just Right/Late]
### Window of Opportunity: [Open/Closing/Closed]

**Analysis:** [Detailed timing assessment with recommendations]

---

## VII. Execution Feasibility

### Team Capability: [Strong/Adequate/Weak]
### Resource Sufficiency: [Sufficient/Adequate/Insufficient]
### Operational Complexity: [High/Medium/Low]

**Analysis:** [Can this team actually execute this plan?]

---

## VIII. Strategic Recommendations (Priority Order)

### Priority 1 (Critical - Do First)
**Recommendation:** [Specific action]
**Why:** [Impact and urgency]
**How:** [Implementation steps]
**Timeline:** [When to complete]

### Priority 2 (Important - Do Soon)
[Same structure]

### Priority 3 (Valuable - Do When Ready)
[Same structure]

### Priority 4 (Consider - Future)
[Same structure]

### Priority 5 (Nice to Have - Optional)
[Same structure]

---

## IX. Blue Ocean Strategy Opportunity

**Current Ocean:** [Red/Blue - Competitive vs. Uncontested]

**Blue Ocean Pivot Opportunity:**
[How could this business pivot to less competitive space?]

**Strategic Canvas:**
- Eliminate: [What to stop doing]
- Reduce: [What to do less]
- Raise: [What to do more]
- Create: [What to do differently]

---

## X. Final Verdict

### Investment Worthiness (Investor Perspective)
**Would I invest?** [Yes/No/Maybe]
**Rationale:** [Why or why not]

### Likelihood of Success (Objective Assessment)
**Success Probability:** [0-100%]
**Key Success Factors:** [What must go right]
**Biggest Threat:** [What could kill this]

### Next Best Action
[One specific thing the founder should do immediately]

---

CRITICAL:
- Be brutally honest but constructive
- Every critique must come with a recommendation
- Use specific evidence from agent outputs
- Don't just identify problems - propose solutions
- Think like a board advisor, not a cheerleader`;

    try {
        const response = await claude.sendMessage(
            systemPrompt,
            [{ role: 'user', content: userMessage }],
            undefined,
            0.6, // more analytical, less creative
            4096 // Haiku's max output tokens
        );

        const content = claude.extractText(response);

        logger.info('Strategic Analysis generated', {
            length: content.length,
            wordCount: content.split(/\s+/).length
        });

        return content;

    } catch (error) {
        logger.error('Strategic Analysis generation failed', error);
        throw error;
    }
}

function extractBusinessName(answers: Record<string, any>): string {
    return answers.business_name || answers.existing_name || 'New Venture';
}
