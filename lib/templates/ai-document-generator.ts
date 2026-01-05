/**
 * AI Document Generator
 * Generates professional business documents using Groq AI
 * NOT hardcoded templates - genuine AI-generated content
 */

import Groq from 'groq-sdk';

export interface DocumentAnswers {
    // User Info
    user_name?: string;
    full_name?: string;
    email?: string;
    user_email?: string;
    phone?: string;
    user_phone?: string;
    user_location?: string;
    current_location?: string;
    language?: string;

    // Background
    education_level?: string;
    education_field?: string;
    years_experience?: string;
    industries_worked?: string[];
    employment_status?: string;
    core_skills?: string[];
    personal_strengths?: string[];
    risk_tolerance?: number | string;
    investment_capital?: string;
    time_commitment?: string;
    timeline_profitability?: string;

    // Business
    business_path?: string;
    idea_status?: string;
    business_idea_detail?: string;
    business_idea?: string;
    problem_to_solve?: string;
    problems_to_solve?: string;
    target_industries?: string[];
    business_model_type?: string;
    unique_advantage?: string;
    validation_status?: string;
    motivation?: string[];

    // Market
    primary_market?: string;
    customer_type?: string;
    target_customer?: string;
    target_age?: string;
    target_income?: string;
    customer_problem?: string;
    company_size_target?: string;

    // Revenue
    revenue_model?: string;
    target_price?: string;
    year1_revenue?: string;
    growth_rate?: string;
    gross_margin?: string;
    target_cac?: string;
    ltv?: string;
    churn_rate?: string;

    // Competition
    top_competitors?: string;
    competitive_advantage?: string;

    // Operations
    team_size_year1?: string;
    salary_budget?: string;
    key_vendors?: string;

    // GTM
    acquisition_channels?: string[];
    marketing_budget?: string;
    sales_model?: string;
    launch_timeline?: string;

    // Funding
    external_funding?: string;
    capital_needed?: string;
    funds_allocation?: string;
    target_valuation?: string;

    // Risk
    key_risks?: string[];
    risk_mitigation?: string;

    // Allow additional fields
    [key: string]: any;
}

interface GeneratedDocument {
    type: string;
    content: string;
    wordCount: number;
    charCount: number;
}

// Initialize Groq client
function getGroqClient(): Groq {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY environment variable is not set');
    }
    return new Groq({ apiKey });
}

// Build context summary from answers
function buildContextSummary(answers: DocumentAnswers): string {
    const sections: string[] = [];

    // Founder Info
    const name = answers.user_name || answers.full_name || 'Unknown';
    const email = answers.user_email || answers.email || '';
    const location = answers.user_location || answers.current_location || '';

    if (name || email || location) {
        sections.push(`## Founder Information
- Name: ${name}
- Email: ${email}
- Location: ${location}
- Experience: ${answers.years_experience || 'Not specified'} years
- Education: ${answers.education_level || ''} ${answers.education_field ? 'in ' + answers.education_field : ''}
- Skills: ${Array.isArray(answers.core_skills) ? answers.core_skills.join(', ') : answers.core_skills || 'Not specified'}
- Strengths: ${Array.isArray(answers.personal_strengths) ? answers.personal_strengths.join(', ') : answers.personal_strengths || 'Not specified'}`);
    }

    // Business Concept
    const businessIdea = answers.business_idea_detail || answers.business_idea || 'Not specified';
    const problem = answers.problem_to_solve || answers.problems_to_solve || 'Not specified';
    const businessModel = answers.business_model_type || '';

    sections.push(`## Business Concept
- Business Idea: ${businessIdea}
- Problem Being Solved: ${problem}
- Business Model: ${businessModel}
- Unique Advantage: ${answers.unique_advantage || 'Not specified'}
- Validation Status: ${answers.validation_status || 'Not specified'}
- Stage: ${answers.business_path || 'New business'}`);

    // Market
    const customerType = answers.customer_type || '';
    const targetCustomer = answers.target_customer || answers.customer_problem || '';

    sections.push(`## Market & Customers
- Primary Market: ${answers.primary_market || 'Not specified'}
- Customer Type: ${customerType}
- Target Customer: ${targetCustomer}
- Target Age: ${answers.target_age || 'All ages'}
- Target Income: ${answers.target_income || 'Not specified'}
- Customer Problem: ${answers.customer_problem || 'Not specified'}`);

    // Financials
    sections.push(`## Financial Information
- Revenue Model: ${answers.revenue_model || 'Not specified'}
- Target Price: ${answers.target_price || 'Not specified'}
- Year 1 Revenue Target: ${answers.year1_revenue || 'Not specified'}
- Expected Growth Rate: ${answers.growth_rate || 'Not specified'}
- Available Capital: ${answers.investment_capital || 'Not specified'}
- Target CAC: ${answers.target_cac || 'Not specified'}
- Expected LTV: ${answers.ltv || 'Not specified'}
- Churn Rate: ${answers.churn_rate || 'Not specified'}
- Gross Margin: ${answers.gross_margin || 'Not specified'}`);

    // Competition
    if (answers.top_competitors || answers.competitive_advantage) {
        sections.push(`## Competitive Landscape
- Key Competitors: ${answers.top_competitors || 'Not identified'}
- Competitive Advantage: ${answers.competitive_advantage || answers.unique_advantage || 'Not specified'}`);
    }

    // Operations
    sections.push(`## Operations
- Team Size Year 1: ${answers.team_size_year1 || 'Solo founder'}
- Salary Budget: ${answers.salary_budget || 'Not specified'}
- Time Commitment: ${answers.time_commitment || 'Not specified'}`);

    // Go-to-Market
    sections.push(`## Go-to-Market Strategy
- Acquisition Channels: ${Array.isArray(answers.acquisition_channels) ? answers.acquisition_channels.join(', ') : answers.acquisition_channels || 'Not specified'}
- Marketing Budget: ${answers.marketing_budget || 'Not specified'}
- Sales Model: ${answers.sales_model || 'Not specified'}
- Launch Timeline: ${answers.launch_timeline || 'Not specified'}`);

    // Funding
    if (answers.external_funding !== 'bootstrap') {
        sections.push(`## Funding Strategy
- Funding Approach: ${answers.external_funding || 'Not specified'}
- Capital Needed: ${answers.capital_needed || 'Not specified'}
- Use of Funds: ${answers.funds_allocation || 'Not specified'}
- Target Valuation: ${answers.target_valuation || 'Not specified'}`);
    }

    // Risk
    sections.push(`## Risk Assessment
- Risk Tolerance: ${answers.risk_tolerance || 'Not specified'}/10
- Key Risks: ${Array.isArray(answers.key_risks) ? answers.key_risks.join(', ') : answers.key_risks || 'Not identified'}
- Mitigation Strategy: ${answers.risk_mitigation || 'Not specified'}`);

    return sections.join('\n\n');
}

/**
 * Agent: Brand & Identity Strategist
 * Generates Company Profile using specific agent persona
 */
async function generateCompanyProfile(answers: DocumentAnswers): Promise<string> {
    const groq = getGroqClient();
    const context = buildContextSummary(answers);
    const businessName = answers.business_name || extractBusinessName(answers);

    const prompt = `You are a Brand Identity Strategist & Professional Copywriter Agent.
Your goal is to craft a compelling, premium corporate identity.

ROLE:
- Transform basic inputs into polished, professional copy.
- Tone: Established, trustworthy, innovation-forward.
- Use "Agent Insights" to explain branding choices (e.g. why you chose a specific mission statement phrasing).

BUSINESS CONTEXT:
${context}

TASK:
Generate a Corporate Profile for "${businessName}".

STRUCTURE:
1. **Brand Essence**: Vision, Mission, Core Values (3-5 distinct values).
2. **Executive Narrative**: Who we are (Founder story woven into business purpose).
3. **The Solution**: Elevator Pitch + Detailed Product Description.
4. **Target Audience**: Who we serve (Ideal Customer Profile).
5. **Brand Position**: Brand Archetype & voice.

REQUIREMENTS:
- Use professional "We" language.
- Avoid generic jargon.
- Length: 800+ words.
`;

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3000
    });

    return response.choices[0]?.message?.content || 'Error generating company profile';
}

/**
 * Agent: Strategic Planner
 * Generates Business Plan using specific agent persona
 */
async function generateBusinessPlan(answers: DocumentAnswers): Promise<string> {
    const groq = getGroqClient();
    const context = buildContextSummary(answers);
    const businessName = answers.business_name || extractBusinessName(answers);

    const prompt = `You are an elite Venture Capital Strategist & Business Consultant Agent.
Your goal is to transform raw user inputs into a world-class, investor-ready Business Plan.

ROLE & METHODOLOGY:
1. Act as a critical partner, not just a writer. If the user's idea is generic, analyze specific execution challenges.
2. Use "Agent Insights" blocks: Begin key sections with a blockquote (> 💡 **Agent Insight:** ...) explaining the strategic rationale.
3. Extrapolate intelligently: If inputs are sparse, use your training on successful startups to fill gaps with plausible, high-quality strategies.

BUSINESS CONTEXT:
${context}

TASK:
Generate a comprehensive Business Plan for "${businessName}" in Markdown.

STRUCTURE & REQUIREMENTS:

# Executive Summary
- The "Hook": Why this? Why now?
- Quick formatting: High-level metrics and value prop.

# I. Market Analysis (Deep Dive)
- TAM/SAM/SOM Calculation (Show your logic).
- Market Trends (Current outlook).
- Competitor Matrix (Compare vs 3 archetypes).

# II. Strategic Roadmap
- The "Secret Sauce" (Unfair Advantage).
- Go-to-Market Engine (Specific channels, CPA estimates).
- Product Roadmap (Phase 1, 2, 3).

# III. Operational Architecture
- Team Structure (Key hires timeline).
- Tech Stack / Infrastructure.

# IV. Financial & Risk Overview
- Investment Ask & Use of Funds.
- Critical Risks & Mitigation Strategies.

TONE:
Professional, authoritative, persuasive, yet grounded in reality.
Avoid generic fluff. Use active verbs.
Length: 1500+ words.
`;

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 6000
    });

    return response.choices[0]?.message?.content || 'Error generating business plan';
}

/**
 * Agent: CFO & Financial Architect
 * Generates Financial Model using specific agent persona
 */
async function generateFinancialModel(answers: DocumentAnswers): Promise<string> {
    const groq = getGroqClient();
    const context = buildContextSummary(answers);
    const businessName = answers.business_name || extractBusinessName(answers);

    const prompt = `You are a Chartered Accountant (CA) & Expert CFO Agent.
Your task is to build a robust, mathematically sound projected financial model.

ROLE:
- Be conservative in revenue, realistic in costs.
- Do not just output tables; explain the *drivers* (e.g., "Assumed 15% m-o-m growth based on SaaS benchmarks").
- Include a "Sanity Check" section where you evaluate if the business is viable.

BUSINESS CONTEXT:
${context}

TASK:
Generate a detailed Financial Model & Feasibility Report for "${businessName}".

STRUCTURE & REQUIREMENTS:

# 1. Financial Executive Summary
- Key highlights (Breakeven point, Year 3 Revenue, Total Funding Need).
- > 💡 **CFO Insight:** Your professional opinion on the financial viability.

# 2. Revenue Modeling
- **Revenue Drivers:** (Price x Volume, Churn, Expansion).
- **Year 1 Monthly Projections:** Table showing Month 1-12.
- **5-Year Growth Trajectory:** Annual summary table.

# 3. Cost Structure Analysis
- **COGS Breakdown:** Margins per unit/user.
- **OPEX:** Team salaries, Marketing budget, Tech costs.
- **Burn Rate:** Monthly cash burn in Year 1.

# 4. Unit Economics (Crucial)
- Customer Acquisition Cost (CAC) Estimate.
- Lifetime Value (LTV) Calculation.
- LTV:CAC Ratio Analysis.

# 5. Valuation & Investment
- Pre-money Valuation Estimate (using multiples method).
- ROI Analysis for investors.

FORMATTING:
- Use Markdown tables for all financial data.
- Use bolding for key figures.
- Provide specific formulas used for calculations.
`;

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 5000
    });

    return response.choices[0]?.message?.content || 'Error generating financial model';
}

/**
 * Agent: Startup Storytelling Coach
 * Generates Pitch Deck using specific agent persona
 */
async function generatePitchDeck(answers: DocumentAnswers): Promise<string> {
    const groq = getGroqClient();
    const context = buildContextSummary(answers);
    const businessName = answers.business_name || extractBusinessName(answers);

    const prompt = `You are a Startup Pitch Coach & Storyteller Agent.
Your background is in helping founders raise Series A rounds.

ROLE:
Think visually and narratively. A pitch deck is a STORY, not just data.
Use "Slide Note:" to advise the user on *visuals* (e.g., "Show a graph of X here").

BUSINESS CONTEXT:
${context}

TASK:
Create a text-based layout for a 12-Slide Investor Pitch Deck for "${businessName}".

STRUCTURE:
1. Cover Slide (Tagline + One-liner).
2. The Problem (The Villain).
3. The Solution (The Hero).
4. The Market (The Prize - TAM/SAM/SOM).
5. The Product (Demo flow).
6. Traction (Social Proof).
7. Business Model (How we make money).
8. Go-To-Market (How we grow).
9. Competition (Why we win).
10. The Team (Why us).
11. Financial Projections (The ROI).
12. The Ask (Funding + Milestones).

REQUIREMENTS:
- For each slide, write 3-4 bullet points of PUNCHY, high-impact copy.
- Include "Speaker Notes" for the founder.
`;

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3000
    });

    return response.choices[0]?.message?.content || 'Error generating pitch deck';
}

/**
 * Agent: Strategic Consultant
 * Generates Analysis using specific agent persona
 */
async function generateAnalysis(answers: DocumentAnswers): Promise<string> {
    const groq = getGroqClient();
    const context = buildContextSummary(answers);
    const businessName = answers.business_name || extractBusinessName(answers);

    const prompt = `You are a Senior Strategic Business Consultant Agent.
Your job is to stress-test the user's business plan and identify blind spots.

ROLE:
Be honest, constructive, and rigorous. Don't sugarcoat risks.

BUSINESS CONTEXT:
${context}

TASK:
Perform a 360-degree Strategic Analysis for "${businessName}".

STRUCTURE:
1. **Executive Assessment**: A letter grade (A-F) on overall viability with rationale.
2. **SWOT Analysis**: Strengths, Weaknesses, Opportunities, Threats.
3. **Gap Analysis**: What is missing? (e.g., "No clear retention strategy").
4. **Risk Heatmap**: Identify High/Med/Low probability risks.
5. **Strategic Recommendations**: 5 concrete next steps for the CEO.
6. **Blue Ocean Strategy**: How to pivot to uncontested market space.

REQUIREMENTS:
- Use clear headers.
- Provide actionable advice, not generic theory.
`;

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3500
    });

    return response.choices[0]?.message?.content || 'Error generating analysis';
}

/**
 * Extract business name from answers
 */
function extractBusinessName(answers: DocumentAnswers): string {
    if (answers.business_name) return answers.business_name;
    if (answers.existing_name) return answers.existing_name;

    // Try to extract from business idea
    const idea = answers.business_idea_detail || answers.business_idea || '';
    if (idea) {
        // Take first 3-4 meaningful words
        const words = idea.split(' ').slice(0, 4).filter(w => w.length > 2);
        if (words.length > 0) {
            return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        }
    }

    // Fallback
    const userName = answers.user_name || answers.full_name || '';
    if (userName) {
        return `${userName.split(' ')[0]}'s Business`;
    }

    return 'New Venture';
}

/**
 * Generate all documents using AI
 */
export async function generateAllDocumentsWithAI(
    answers: DocumentAnswers
): Promise<GeneratedDocument[]> {
    console.log('🚀 Generating documents with AI...');
    console.log('📋 Input answers:', JSON.stringify(answers, null, 2).substring(0, 500) + '...');

    const documents: GeneratedDocument[] = [];

    try {
        // Generate all documents in parallel for speed
        const [companyProfile, businessPlan, financialModel, pitchDeck, analysis] =
            await Promise.all([
                generateCompanyProfile(answers),
                generateBusinessPlan(answers),
                generateFinancialModel(answers),
                generatePitchDeck(answers),
                generateAnalysis(answers)
            ]);

        documents.push({
            type: 'company_profile',
            content: companyProfile,
            wordCount: companyProfile.split(/\s+/).length,
            charCount: companyProfile.length
        });

        documents.push({
            type: 'business_plan',
            content: businessPlan,
            wordCount: businessPlan.split(/\s+/).length,
            charCount: businessPlan.length
        });

        documents.push({
            type: 'financial_model',
            content: financialModel,
            wordCount: financialModel.split(/\s+/).length,
            charCount: financialModel.length
        });

        documents.push({
            type: 'pitch_deck',
            content: pitchDeck,
            wordCount: pitchDeck.split(/\s+/).length,
            charCount: pitchDeck.length
        });

        documents.push({
            type: 'before_after_analysis',
            content: analysis,
            wordCount: analysis.split(/\s+/).length,
            charCount: analysis.length
        });

        console.log('✅ All documents generated successfully');
        return documents;

    } catch (error) {
        console.error('❌ Error generating documents:', error);
        throw error;
    }
}

export type { DocumentAnswers as QuestionnaireAnswers };
