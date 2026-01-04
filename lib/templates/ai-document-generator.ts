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
 * Generate Company Profile using AI
 */
async function generateCompanyProfile(answers: DocumentAnswers): Promise<string> {
    const groq = getGroqClient();
    const context = buildContextSummary(answers);
    const businessName = answers.business_name || extractBusinessName(answers);

    const prompt = `You are a professional business writer creating a Company Profile document.

BUSINESS CONTEXT:
${context}

Generate a comprehensive, professional Company Profile document in Markdown format for "${businessName}".

REQUIREMENTS:
1. Write in first person plural ("We", "Our")
2. Be specific - use actual data from the context, DO NOT use placeholder text like "TBD" or "to be determined"
3. If data is missing, make reasonable assumptions based on the business type and industry
4. Include these sections:
   - Executive Summary (compelling overview)
   - About the Company (vision, mission, values)
   - Founder Profile (background, expertise, why they started this)
   - Our Solution (what we offer, how it works)
   - Target Market (who we serve, market opportunity)
   - Competitive Advantage (why we win)
   - Current Stage (where we are today)
   - Contact Information

5. Make it professional but engaging
6. Length: 800-1200 words
7. Use data-driven language with specific numbers where available

DO NOT include phrases like "To be determined", "TBD", "Not specified", or placeholder brackets [].
If information is missing, either omit it or make a reasonable inference based on context.`;

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3000
    });

    return response.choices[0]?.message?.content || 'Error generating company profile';
}

/**
 * Generate Business Plan using AI
 */
async function generateBusinessPlan(answers: DocumentAnswers): Promise<string> {
    const groq = getGroqClient();
    const context = buildContextSummary(answers);
    const businessName = answers.business_name || extractBusinessName(answers);

    const prompt = `You are a professional business consultant creating a Business Plan for investors and stakeholders.

BUSINESS CONTEXT:
${context}

Generate a comprehensive Business Plan document in Markdown format for "${businessName}".

REQUIREMENTS:
1. Write professionally for an investor audience
2. Be specific with numbers and projections - use data from context
3. DO NOT use placeholder text like "TBD" - make reasonable projections
4. Include these sections:
   - Executive Summary (hook investors in first paragraph)
   - Problem & Opportunity (pain points, market gap)
   - Solution (our product/service, how it works)
   - Business Model (how we make money)
   - Market Analysis (TAM/SAM/SOM with numbers, trends)
   - Competitive Analysis (competitors, our differentiation)
   - Go-to-Market Strategy (customer acquisition, channels)
   - Financial Projections (5-year revenue, costs, margins)
   - Unit Economics (CAC, LTV, payback period)
   - Team (founder background, key hires needed)
   - Funding Requirements (amount, use of funds, milestones)
   - Risk & Mitigation

5. Include specific numbers, percentages, and timelines
6. Length: 1500-2500 words
7. Make financial projections realistic based on the business model

If financial data is missing, calculate reasonable estimates based on:
- Industry benchmarks (SaaS: 75-85% gross margin, Services: 50-70%)
- Startup growth rates (20-100% YoY for early stage)
- Typical CAC payback (12-18 months)`;

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 5000
    });

    return response.choices[0]?.message?.content || 'Error generating business plan';
}

/**
 * Generate Financial Model using AI
 */
async function generateFinancialModel(answers: DocumentAnswers): Promise<string> {
    const groq = getGroqClient();
    const context = buildContextSummary(answers);
    const businessName = answers.business_name || extractBusinessName(answers);

    const prompt = `You are a financial analyst creating a Financial Model summary for a startup.

BUSINESS CONTEXT:
${context}

Generate a detailed Financial Model document in Markdown format for "${businessName}".

REQUIREMENTS:
1. Create realistic financial projections based on the business type
2. DO NOT use "TBD" - calculate specific numbers
3. Include these sections:
   - Financial Summary (5-year overview table)
   - Revenue Projections (monthly for Y1, annual for Y2-5)
   - Cost Structure (fixed costs, variable costs, COGS)
   - Unit Economics (CAC, LTV, LTV:CAC ratio, payback period)
   - Cash Flow Analysis (burn rate, runway)
   - Key Assumptions (list all assumptions with rationale)
   - Sensitivity Analysis (best/base/worst case)
   - Break-even Analysis

4. Use tables for financial data:
   | Metric | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
   
5. Base projections on:
   - Business model type (SaaS, marketplace, services, etc.)
   - Target pricing mentioned
   - Growth rate expectations
   - Industry benchmarks

6. Include specific formulas and calculations
7. Length: 1000-1500 words with tables

Make the numbers specific and realistic. For a SaaS business, assume:
- Month 1-3: ₹0-50K revenue (pre-launch)
- Month 4-12: ₹50K-5L/month (early traction)
- Gross margin: 75-85%
- Growth: 15-20% MoM initially`;

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 4000
    });

    return response.choices[0]?.message?.content || 'Error generating financial model';
}

/**
 * Generate Pitch Deck using AI
 */
async function generatePitchDeck(answers: DocumentAnswers): Promise<string> {
    const groq = getGroqClient();
    const context = buildContextSummary(answers);
    const businessName = answers.business_name || extractBusinessName(answers);

    const prompt = `You are creating a Pitch Deck outline for a startup seeking investment.

BUSINESS CONTEXT:
${context}

Generate a detailed Pitch Deck document in Markdown format for "${businessName}".

REQUIREMENTS:
1. Format for a 12-15 slide investor pitch deck
2. Include specific content for each slide (not just headers)
3. DO NOT use placeholder text - write real content
4. Structure:
   
   ## Slide 1: Title
   [Company name, tagline, founder name, contact]
   
   ## Slide 2: The Problem
   [Specific pain points with data/examples]
   
   ## Slide 3: The Solution
   [What we do, how it works, key features]
   
   ## Slide 4: Demo / Product
   [Product description, key screenshots/mockups description]
   
   ## Slide 5: Market Size
   [TAM/SAM/SOM with specific numbers]
   
   ## Slide 6: Business Model
   [Revenue streams, pricing, unit economics]
   
   ## Slide 7: Traction
   [Current metrics, milestones achieved]
   
   ## Slide 8: Competition
   [Competitive landscape, our differentiation]
   
   ## Slide 9: Go-to-Market
   [Customer acquisition strategy, channels]
   
   ## Slide 10: Team
   [Founder background, key team members]
   
   ## Slide 11: Financials
   [Key projections, growth trajectory]
   
   ## Slide 12: The Ask
   [Funding amount, use of funds, milestones]
   
   ## Slide 13: Contact
   [Call to action, contact info]

5. Make it compelling and investor-ready
6. Include specific numbers and metrics
7. Length: 800-1200 words`;

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3000
    });

    return response.choices[0]?.message?.content || 'Error generating pitch deck';
}

/**
 * Generate Before/After Analysis using AI
 */
async function generateAnalysis(answers: DocumentAnswers): Promise<string> {
    const groq = getGroqClient();
    const context = buildContextSummary(answers);
    const businessName = answers.business_name || extractBusinessName(answers);

    const prompt = `You are a strategic business consultant providing analysis and recommendations.

BUSINESS CONTEXT:
${context}

Generate a comprehensive Analysis document in Markdown format for "${businessName}".

REQUIREMENTS:
1. Provide genuine strategic insights (not generic advice)
2. Include these sections:
   - Executive Assessment (overall business health score)
   - Strengths Analysis (what's working well)
   - Opportunity Areas (growth potential)
   - Risk Assessment (potential threats, mitigation)
   - Strategic Recommendations (specific, actionable items)
   - Quick Wins (things to implement in 30 days)
   - Long-term Priorities (90-day and 1-year goals)
   - Key Metrics to Track
   - Next Steps Checklist

3. Use a scoring system:
   | Dimension | Score | Assessment |
   |-----------|-------|------------|
   | Market Opportunity | X/10 | Brief note |
   
4. Make recommendations specific to THIS business
5. Include timelines and priorities
6. Length: 1000-1500 words

Base your analysis on the actual business context provided. Be constructive but honest about challenges.`;

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
