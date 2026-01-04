/**
 * MCP (Model Context Protocol) Engine
 * Handles auto-population, validation, and agent/skill triggering based on questionnaire answers
 */

import { logger } from '../utils/logger';
import { getAgentManager } from '../agents/manager';
import { getSkillRegistry } from '../skills/registry';
import { Orchestrator } from '../orchestrator';

export interface MCPRule {
    trigger_field: string;
    conditions?: Array<{ field: string; operator: 'equals' | 'contains' | 'exists'; value?: any }>;
    auto_populate?: Array<{
        target_field: string;
        source: 'static' | 'lookup' | 'calculation' | 'agent' | 'skill';
        value?: any;
        lookup_table?: string;
        formula?: string;
        agent_id?: string;
        skill_id?: string;
        params_builder?: (answer: any, context: any) => any;
    }>;
    trigger_agents?: Array<{
        agent_id: string;
        condition?: (answer: any, context: any) => boolean;
        prompt_template: string;
    }>;
    trigger_skills?: Array<{
        skill_id: string;
        params_builder: (answer: any, context: any) => any;
    }>;
}

export interface MCPProcessResult {
    auto_populated: Record<string, any>;
    agents_to_trigger: Array<{ agent_id: string; prompt: string }>;
    skills_to_execute: Array<{ skill_id: string; params: any }>;
    thinking_log: string[];
    validation_errors: string[];
}

export class MCPEngine {
    private rules: Map<string, MCPRule[]> = new Map();
    private lookupTables: Map<string, any> = new Map();

    constructor() {
        this.initializeLookupTables();
        this.initializeRules();
    }

    /**
     * Initialize lookup tables for auto-population
     */
    private initializeLookupTables(): void {
        // Location to timezone mapping
        this.lookupTables.set('location_to_timezone', {
            'India': 'Asia/Kolkata',
            'Hyderabad': 'Asia/Kolkata',
            'Mumbai': 'Asia/Kolkata',
            'Dubai': 'Asia/Dubai',
            'USA': 'America/New_York',
            'UK': 'Europe/London'
        });

        // Location to currency mapping
        this.lookupTables.set('location_to_currency', {
            'India': 'INR',
            'Hyderabad': 'INR',
            'Mumbai': 'INR',
            'Dubai': 'AED',
            'USA': 'USD',
            'UK': 'GBP'
        });

        // Industry to revenue stream templates
        this.lookupTables.set('industry_revenue_templates', {
            'SaaS': ['Subscription Revenue', 'Professional Services', 'Add-on Revenue'],
            'Healthcare': ['Clinical Revenue', 'Pharmacy Revenue', 'Lab & Diagnostics'],
            'Retail': ['Product Sales', 'E-commerce Revenue', 'Services Revenue'],
            'Manufacturing': ['Product Sales', 'Spare Parts', 'Maintenance Services']
        });

        // Industry to gross margin benchmarks
        this.lookupTables.set('industry_margins', {
            'SaaS': 0.75,
            'Professional Services': 0.60,
            'Healthcare': 0.40,
            'Retail': 0.30,
            'Manufacturing': 0.25,
            'E-commerce': 0.35
        });

        logger.info('MCP lookup tables initialized');
    }

    /**
     * Initialize MCP rules for auto-population and agent triggering
     * Updated for complete 147-question questionnaire
     */
    private initializeRules(): void {
        // ==========================================
        // PHASE 1: AUTHENTICATION & ONBOARDING
        // ==========================================

        // Rule: Location detection triggers timezone and currency
        this.addRule({
            trigger_field: 'user_location',
            auto_populate: [
                {
                    target_field: 'timezone',
                    source: 'lookup',
                    lookup_table: 'location_to_timezone'
                },
                {
                    target_field: 'currency',
                    source: 'lookup',
                    lookup_table: 'location_to_currency'
                }
            ]
        });

        // ==========================================
        // PHASE 2: USER DISCOVERY
        // ==========================================

        // Rule: Industry selection triggers revenue templates and margin benchmarks
        this.addRule({
            trigger_field: 'target_industries',
            auto_populate: [
                {
                    target_field: 'revenue_stream_templates',
                    source: 'lookup',
                    lookup_table: 'industry_revenue_templates'
                },
                {
                    target_field: 'gross_margin_benchmark',
                    source: 'lookup',
                    lookup_table: 'industry_margins'
                }
            ],
            trigger_agents: [
                {
                    agent_id: 'market_analyst',
                    prompt_template: 'Analyze the {{target_industries}} industry: market trends, growth potential, key success factors, and competitive dynamics in {{user_location}}.'
                }
            ]
        });

        // ==========================================
        // PHASE 3: BUSINESS CONTEXT
        // ==========================================

        // Rule: Business idea triggers problem validation
        this.addRule({
            trigger_field: 'business_idea_detail',
            trigger_agents: [
                {
                    agent_id: 'problem_validator',
                    prompt_template: 'Analyze this business idea: "{{business_idea_detail}}". Validate the problem-solution fit, identify potential challenges, and suggest improvements.'
                }
            ]
        });

        // ==========================================
        // PHASE 4: MARKET & INDUSTRY ANALYSIS
        // ==========================================

        // Rule: Primary market + customer type triggers market sizing
        this.addRule({
            trigger_field: 'customer_type',
            conditions: [
                { field: 'primary_market', operator: 'exists' },
                { field: 'target_industries', operator: 'exists' }
            ],
            trigger_skills: [
                {
                    skill_id: 'market_sizing_calculator',
                    params_builder: (answer, context) => ({
                        industry: Array.isArray(context.target_industries)
                            ? context.target_industries[0]
                            : context.target_industries || 'General',
                        geography: context.primary_market || 'India',
                        business_model: answer
                    })
                }
            ],
            trigger_agents: [
                {
                    agent_id: 'market_analyst',
                    prompt_template: 'Analyze the {{customer_type}} market for {{target_industries}} in {{primary_market}}. Calculate TAM, SAM, SOM and provide market entry strategy.'
                }
            ]
        });

        // Rule: Customer problem triggers problem validation
        this.addRule({
            trigger_field: 'customer_problem',
            trigger_agents: [
                {
                    agent_id: 'problem_validator',
                    prompt_template: 'Validate this customer problem: "{{customer_problem}}". Assess severity, frequency, willingness to pay, and existing solutions in the {{target_industries}} industry.'
                }
            ]
        });

        // ==========================================
        // PHASE 5: REVENUE MODEL & FINANCIAL PROJECTIONS
        // ==========================================

        // Rule: Revenue target triggers financial modeling
        this.addRule({
            trigger_field: 'revenue_target_year1',
            conditions: [
                { field: 'revenue_model', operator: 'exists' },
                { field: 'target_industries', operator: 'exists' }
            ],
            trigger_skills: [
                {
                    skill_id: 'financial_modeling',
                    params_builder: (answer, context) => {
                        const revenueTarget = typeof answer === 'number'
                            ? answer
                            : parseFloat(String(answer).replace(/[^0-9.]/g, '')) || 0;

                        // Parse growth rate
                        const growthRateStr = context.growth_rate || '50-100';
                        let growthRate = 0.75; // Default
                        if (growthRateStr.includes('20-40')) growthRate = 0.30;
                        if (growthRateStr.includes('50-100')) growthRate = 0.75;
                        if (growthRateStr.includes('100-200')) growthRate = 1.50;
                        if (growthRateStr.includes('200+')) growthRate = 2.00;

                        return {
                            revenue_target: revenueTarget,
                            industry: Array.isArray(context.target_industries)
                                ? context.target_industries[0]
                                : context.target_industries || 'General',
                            business_model: context.revenue_model,
                            growth_rate: growthRate
                        };
                    }
                }
            ],
            trigger_agents: [
                {
                    agent_id: 'financial_modeler',
                    prompt_template: 'Validate if ₹{{revenue_target_year1}} Year 1 revenue target is realistic for a {{revenue_model}} business in {{target_industries}}. Provide detailed 5-year financial projections with {{growth_rate}} growth rate.'
                }
            ]
        });

        // Rule: CAC + LTV triggers ratio calculation
        this.addRule({
            trigger_field: 'ltv',
            conditions: [{ field: 'target_cac', operator: 'exists' }],
            auto_populate: [
                {
                    target_field: 'ltv_cac_ratio',
                    source: 'calculation',
                    formula: 'ltv / target_cac'
                }
            ]
        });

        // Rule: Marketing budget + monthly customers triggers CAC calculation
        this.addRule({
            trigger_field: 'marketing_budget',
            conditions: [{ field: 'monthly_customers', operator: 'exists' }],
            auto_populate: [
                {
                    target_field: 'calculated_cac',
                    source: 'calculation',
                    formula: 'marketing_budget / monthly_customers'
                }
            ]
        });

        // ==========================================
        // PHASE 6: COMPETITIVE ANALYSIS
        // ==========================================

        // Rule: Competitor list triggers competitive analysis
        this.addRule({
            trigger_field: 'top_competitors',
            conditions: [
                { field: 'target_industries', operator: 'exists' },
                { field: 'primary_market', operator: 'exists' }
            ],
            trigger_skills: [
                {
                    skill_id: 'competitor_analysis',
                    params_builder: (answer, context) => ({
                        competitors: Array.isArray(answer) ? answer : [answer],
                        industry: Array.isArray(context.target_industries)
                            ? context.target_industries[0]
                            : context.target_industries || 'General',
                        geography: context.primary_market || 'India',
                        your_business: context.business_idea_detail || context.customer_problem
                    })
                }
            ]
        });

        // Rule: Competitive advantage triggers positioning analysis
        this.addRule({
            trigger_field: 'competitive_advantage',
            trigger_agents: [
                {
                    agent_id: 'positioning_analyst',
                    prompt_template: 'Analyze this competitive advantage: "{{competitive_advantage}}". Assess defensibility, sustainability, and market positioning strategy against competitors: {{top_competitors}}.'
                }
            ]
        });

        // ==========================================
        // PHASE 7: OPERATIONS & TEAM
        // ==========================================

        // Rule: Licenses and regulations trigger compliance check
        this.addRule({
            trigger_field: 'licenses_needed',
            conditions: [
                { field: 'target_industries', operator: 'exists' },
                { field: 'primary_market', operator: 'exists' }
            ],
            trigger_skills: [
                {
                    skill_id: 'compliance_checker',
                    params_builder: (answer, context) => ({
                        industry: Array.isArray(context.target_industries)
                            ? context.target_industries[0]
                            : context.target_industries || 'General',
                        geography: context.primary_market || 'India',
                        business_type: context.customer_type || 'B2C',
                        licenses: Array.isArray(answer) ? answer : [answer],
                        regulations: context.regulations || []
                    })
                }
            ]
        });

        // Rule: Team size + salary budget triggers burn rate calculation
        this.addRule({
            trigger_field: 'salary_budget',
            conditions: [{ field: 'team_size_year1', operator: 'exists' }],
            auto_populate: [
                {
                    target_field: 'monthly_burn_rate',
                    source: 'calculation',
                    formula: 'salary_budget * 1.3' // Add 30% for overhead
                }
            ]
        });

        // ==========================================
        // PHASE 8: GO-TO-MARKET STRATEGY
        // ==========================================

        // Rule: Acquisition channels trigger GTM strategy
        this.addRule({
            trigger_field: 'acquisition_channels',
            conditions: [
                { field: 'customer_type', operator: 'exists' },
                { field: 'marketing_budget', operator: 'exists' }
            ],
            trigger_agents: [
                {
                    agent_id: 'gtm_strategist',
                    prompt_template: 'Create a go-to-market strategy for {{customer_type}} customers using channels: {{acquisition_channels}}. Budget: {{marketing_budget}}. Target: {{monthly_customers}} customers/month. Provide detailed channel mix and CAC targets.'
                }
            ]
        });

        // ==========================================
        // PHASE 9: FUNDING STRATEGY
        // ==========================================

        // Rule: Capital needed + equity dilution triggers valuation calculation
        this.addRule({
            trigger_field: 'equity_dilution',
            conditions: [{ field: 'capital_needed', operator: 'exists' }],
            auto_populate: [
                {
                    target_field: 'implied_valuation',
                    source: 'calculation',
                    formula: '(capital_needed / equity_dilution) * 100'
                }
            ]
        });

        // Rule: Funding stage triggers investor matching
        this.addRule({
            trigger_field: 'funding_stage',
            conditions: [
                { field: 'target_industries', operator: 'exists' },
                { field: 'revenue_target_year1', operator: 'exists' }
            ],
            trigger_agents: [
                {
                    agent_id: 'funding_advisor',
                    prompt_template: 'Recommend {{funding_stage}} funding strategy for {{target_industries}} business with Year 1 revenue target of ₹{{revenue_target_year1}}. Capital needed: ₹{{capital_needed}}. Suggest investor types, typical terms, and fundraising timeline.'
                }
            ]
        });

        // ==========================================
        // PHASE 10: RISK ASSESSMENT
        // ==========================================

        // Rule: Key risks trigger risk analysis
        this.addRule({
            trigger_field: 'key_risks',
            trigger_agents: [
                {
                    agent_id: 'risk_analyst',
                    prompt_template: 'Analyze these business risks: {{key_risks}}. For each risk, assess: (1) Probability, (2) Impact, (3) Mitigation strategies, (4) Early warning indicators. Industry: {{target_industries}}, Market: {{primary_market}}.'
                }
            ]
        });

        // ==========================================
        // PHASE 11: FINAL REVIEW & OUTPUT
        // ==========================================

        // Rule: Final confirmation triggers business model generation
        this.addRule({
            trigger_field: 'final_confirmation',
            conditions: [{ field: 'output_formats', operator: 'exists' }],
            trigger_skills: [
                {
                    skill_id: 'business_model_generator',
                    params_builder: (answer, context) => ({
                        all_responses: context,
                        output_formats: context.output_formats || ['pdf'],
                        detail_level: context.detail_level || 'standard',
                        include_ai_recommendations: context.ai_recommendations === 'yes_include'
                    })
                }
            ]
        });

        logger.info(`MCP rules initialized: ${this.rules.size} trigger fields`);
    }


    /**
     * Add a rule to the MCP engine
     */
    private addRule(rule: MCPRule): void {
        const existing = this.rules.get(rule.trigger_field) || [];
        existing.push(rule);
        this.rules.set(rule.trigger_field, existing);
    }

    /**
     * Process an answer and return auto-populated fields, agents to trigger, etc.
     */
    async processAnswer(
        questionId: string,
        answer: any,
        allAnswers: Record<string, any>
    ): Promise<MCPProcessResult> {
        const result: MCPProcessResult = {
            auto_populated: {},
            agents_to_trigger: [],
            skills_to_execute: [],
            thinking_log: [],
            validation_errors: []
        };

        logger.info('Processing answer with MCP', { questionId, answer });
        result.thinking_log.push(`Processing answer for ${questionId}...`);

        // Get rules for this question
        const rules = this.rules.get(questionId) || [];

        for (const rule of rules) {
            // Check conditions
            if (rule.conditions && !this.checkConditions(rule.conditions, allAnswers)) {
                logger.debug('Rule conditions not met, skipping', { questionId, rule });
                continue;
            }

            // Process auto-population
            if (rule.auto_populate && rule.auto_populate.length > 0) {
                result.thinking_log.push('Auto-populating related fields...');
                for (const autoPopRule of rule.auto_populate) {
                    try {
                        const value = await this.resolveAutoPopulation(autoPopRule, answer, allAnswers);
                        if (value !== undefined) {
                            result.auto_populated[autoPopRule.target_field] = value;
                            logger.debug('Auto-populated field', {
                                field: autoPopRule.target_field,
                                value
                            });
                        }
                    } catch (error) {
                        logger.error('Auto-population failed', error);
                        result.validation_errors.push(`Failed to auto-populate ${autoPopRule.target_field}`);
                    }
                }
            }

            // Collect agents to trigger
            if (rule.trigger_agents) {
                result.thinking_log.push('Identifying relevant AI agents...');
                for (const agentRule of rule.trigger_agents) {
                    if (!agentRule.condition || agentRule.condition(answer, allAnswers)) {
                        const prompt = this.interpolateTemplate(agentRule.prompt_template, {
                            ...allAnswers,
                            [questionId]: answer
                        });
                        result.agents_to_trigger.push({
                            agent_id: agentRule.agent_id,
                            prompt
                        });
                    }
                }
            }

            // Collect skills to execute
            if (rule.trigger_skills) {
                result.thinking_log.push('Preparing business calculations...');
                for (const skillRule of rule.trigger_skills) {
                    const params = skillRule.params_builder(answer, allAnswers);
                    result.skills_to_execute.push({
                        skill_id: skillRule.skill_id,
                        params
                    });
                }
            }
        }

        logger.info('MCP processing complete', {
            auto_populated_count: Object.keys(result.auto_populated).length,
            agents_count: result.agents_to_trigger.length,
            skills_count: result.skills_to_execute.length
        });

        return result;
    }

    /**
     * Check if conditions are met
     */
    private checkConditions(
        conditions: Array<{ field: string; operator: string; value?: any }>,
        allAnswers: Record<string, any>
    ): boolean {
        return conditions.every(condition => {
            const fieldValue = allAnswers[condition.field];

            switch (condition.operator) {
                case 'exists':
                    return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
                case 'equals':
                    return fieldValue === condition.value;
                case 'contains':
                    return typeof fieldValue === 'string' && fieldValue.includes(condition.value);
                default:
                    return false;
            }
        });
    }

    /**
     * Resolve auto-population value based on source
     */
    private async resolveAutoPopulation(
        rule: NonNullable<MCPRule['auto_populate']>[number],
        answer: any,
        allAnswers: Record<string, any>
    ): Promise<any> {
        switch (rule.source) {
            case 'static':
                return rule.value;

            case 'lookup':
                if (!rule.lookup_table) return undefined;
                const table = this.lookupTables.get(rule.lookup_table);
                if (!table) return undefined;

                // Try direct lookup or partial match
                const key = Object.keys(table).find(key =>
                    answer?.toString().toLowerCase().includes(key.toLowerCase())
                );
                return table[answer] || (key ? table[key] : undefined);

            case 'calculation':
                if (!rule.formula) return undefined;
                return this.evaluateFormula(rule.formula, allAnswers);

            default:
                return undefined;
        }
    }

    /**
     * Evaluate a formula with context
     */
    private evaluateFormula(formula: string, context: Record<string, any>): any {
        try {
            // Simple formula evaluation (extend as needed)
            let expression = formula;

            // Replace variables with values
            Object.keys(context).forEach(key => {
                const value = context[key];
                if (typeof value === 'number') {
                    expression = expression.replace(new RegExp(key, 'g'), value.toString());
                }
            });

            // Evaluate (use a safe eval alternative in production)
            return eval(expression);
        } catch (error) {
            logger.error('Formula evaluation failed', { formula, error });
            return undefined;
        }
    }

    /**
     * Interpolate template with context
     */
    private interpolateTemplate(template: string, context: Record<string, any>): string {
        let result = template;

        Object.keys(context).forEach(key => {
            const value = context[key];
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        });

        return result;
    }
}

// Export singleton instance
let mcpEngineInstance: MCPEngine | null = null;

export function getMCPEngine(): MCPEngine {
    if (!mcpEngineInstance) {
        mcpEngineInstance = new MCPEngine();
    }
    return mcpEngineInstance;
}
