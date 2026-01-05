/**
 * Financial Model Generator
 * Creates detailed financial model document suitable for Excel/CSV export
 * Uses financial_modeler agent output + skill calculations
 */

import { ClaudeService } from '@/lib/services/claude-service';
import { logger } from '@/backend/utils/logger';

export async function generateFinancialModel(
    answers: Record<string, any>,
    agentOutputs: any
): Promise<string> {
    logger.info('Generating Financial Model document...');

    const claude = new ClaudeService();
    const businessName = extractBusinessName(answers);

    const financialAnalysis = agentOutputs.financial_modeler?.output || 'Financial projections pending';
    const skillResults = agentOutputs.financial_modeler?.toolCallsMade || [];

    const systemPrompt = `You are Rachel Goldman, a Chartered Accountant (CA) & Expert CFO.

Your task: Transform financial model calculations into a professional Financial Model Report suitable for investors and Excel export.

CRITICAL REQUIREMENTS:
1. Use REAL numbers from the financial_modeling skill results
2. Present data in tables (Markdown format) for easy Excel conversion
3. Include: P&L, Cash Flow, Balance Sheet basics, Key Metrics
4. Length: 3,000-5,000 words with comprehensive analysis
5. Professional CFO commentary explaining each section
6. Include formulas and assumptions clearly stated

STYLE: Conservative, data-driven, rigorous. Like a report you'd present to a board.

OUTPUT FORMAT: Heavy use of Markdown tables for structured data.`;

    const userMessage = `# Financial Model Report Generation

## Business: ${businessName}

## Financial Analysis from financial_modeler Agent:
${financialAnalysis}

## Raw Skill Calculation Results:
\`\`\`json
${JSON.stringify(skillResults, null, 2)}
\`\`\`

## Questionnaire Context:
\`\`\`json
${JSON.stringify({
    year1_revenue: answers.year1_revenue || answers.revenue_target_year1,
    growth_rate: answers.growth_rate,
    gross_margin: answers.gross_margin,
    currency: answers.currency || 'INR'
}, null, 2)}
\`\`\`

---

## YOUR TASK:

Generate a comprehensive **Financial Model & Feasibility Report**.

### Required Structure:

# Financial Executive Summary
- Business model and revenue type
- Key financial highlights table
- Break-even timeline
- Funding requirements
- > 💡 **CFO Insight:** Your professional assessment of viability

# 1. Revenue Model & Projections

## 1.1 Revenue Drivers
- Price x Volume breakdown
- Churn and expansion assumptions
- Growth rate rationale

## 1.2 Year 1 Monthly Revenue
| Month | Revenue | Customers | MRR |
|-------|---------|-----------|-----|
[Use actual data from skill results]

## 1.3 5-7 Year Revenue Trajectory
| Year | Revenue | YoY Growth | ARR |
|------|---------|------------|-----|
[Complete table with projections]

# 2. Cost Structure Analysis

## 2.1 Cost of Goods Sold (COGS)
- COGS breakdown by category
- Gross margin analysis
- Margin trends over time

## 2.2 Operating Expenses (OPEX)
| Category | Y1 % | Y3 % | Y5 % | Rationale |
|----------|------|------|------|-----------|
| Sales & Marketing | X% | Y% | Z% | ... |
| R&D | X% | Y% | Z% | ... |
| G&A | X% | Y% | Z% | ... |

## 2.3 Monthly Burn Rate Analysis
- Burn rate progression
- Peak burn timing
- Path to positive cash flow

# 3. Profitability Projections

## 3.1 Profit & Loss Statement (5-7 Years)
| Metric | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|--------|--------|--------|--------|--------|--------|
| Revenue | | | | | |
| COGS | | | | | |
| Gross Profit | | | | | |
| OPEX | | | | | |
| EBITDA | | | | | |
| Net Income | | | | | |

## 3.2 Break-Even Analysis
- EBITDA break-even: Month X
- Net income positive: Month Y
- Analysis of path to profitability

# 4. Cash Flow & Capital Requirements

## 4.1 Cash Flow Projections
- Starting capital
- Monthly cash burn/generation
- Cumulative cash position

## 4.2 Funding Requirements
- Initial seed capital
- Additional rounds needed
- Total capital to profitability
- Use of funds breakdown

# 5. Unit Economics

## 5.1 Core Metrics
| Metric | Value | Benchmark | Status |
|--------|-------|-----------|--------|
| ARPA | | | |
| CAC | | | |
| LTV | | | |
| LTV:CAC | | >3:1 | |
| CAC Payback | | <12mo | |
| Gross Margin | | >70% | |

## 5.2 SaaS Metrics (if applicable)
- MRR and ARR progression
- Churn rate analysis
- Net Revenue Retention (NRR)
- Magic Number
- Rule of 40

# 6. Scenario Analysis

## Base Case (Primary Model)
## Bull Case (+20% revenue, -15% costs)
## Bear Case (-20% revenue, +20% costs)

# 7. Valuation Framework
- Pre-money valuation estimate
- Comparable company analysis
- Revenue multiples approach
- ROI projections for investors

# 8. Financial Assumptions
- List all key assumptions clearly
- Tax rates, payment terms, etc.
- Sensitivity analysis on key variables

# 9. Risk Assessment
- Financial risks identified
- Mitigation strategies
- Contingency planning

---

CRITICAL:
- Use EXACT numbers from skill calculations (don't invent data)
- Every table must be complete and properly formatted
- Include CFO commentary explaining WHY behind numbers
- Be conservative in projections and clear about assumptions
- Length: 3,000-5,000 words minimum`;

    try {
        const response = await claude.sendMessage(
            systemPrompt,
            [{ role: 'user', content: userMessage }],
            undefined,
            0.5, // more conservative for financial data
            4096 // Haiku's max output tokens
        );

        const content = claude.extractText(response);

        logger.info('Financial Model generated', {
            length: content.length,
            wordCount: content.split(/\s+/).length
        });

        return content;

    } catch (error) {
        logger.error('Financial Model generation failed', error);
        throw error;
    }
}

function extractBusinessName(answers: Record<string, any>): string {
    return answers.business_name ||
           answers.existing_name ||
           'New Venture';
}
