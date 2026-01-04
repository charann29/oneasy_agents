/**
 * Question-to-Agent Orchestration Configuration
 * Maps each question to appropriate agents, skills, and skip logic
 */

// ============================================================================
// Types
// ============================================================================

export type AgentId =
    | 'context_collector'
    | 'business_planner_lead'
    | 'customer_profiler'
    | 'market_analyst'
    | 'financial_modeler'
    | 'revenue_architect'
    | 'gtm_strategist'
    | 'legal_advisor'
    | 'ops_planner'
    | 'funding_strategist'
    | 'unit_economics_calculator'
    | 'output_generator'
    | 'document_generator';

export type SkillId =
    | 'financial_modeling'
    | 'market_sizing_calculator'
    | 'competitor_analysis'
    | 'compliance_checker'
    | 'branded_document_generator';

export interface QuestionConfig {
    agents: AgentId[];
    skills?: SkillId[];
    executionType?: 'parallel' | 'sequential';
    priority?: 'critical' | 'high' | 'medium' | 'low';
    contextExtraction?: string[];
    isBranchingPoint?: boolean;
    skipIf?: (answers: Record<string, any>) => boolean;
    prefillFrom?: string[];
    agentPromptContext?: string;
}

export interface PhaseConfig {
    phaseId: string;
    defaultAgents: AgentId[];
    defaultSkills?: SkillId[];
    questions: Record<string, QuestionConfig>;
}

// ============================================================================
// Phase 1: Authentication & Onboarding
// ============================================================================

export const PHASE_1_CONFIG: PhaseConfig = {
    phaseId: 'auth',
    defaultAgents: ['context_collector', 'business_planner_lead'],
    questions: {
        'language': {
            agents: ['context_collector'],
            priority: 'critical',
            contextExtraction: ['language', 'translation_required', 'cultural_context'],
            agentPromptContext: 'Store language preference. This affects ALL future responses.'
        },
        'user_name': {
            agents: ['context_collector'],
            priority: 'critical',
            contextExtraction: ['user_name', 'first_name', 'formality_level'],
            agentPromptContext: 'Store user identity for personalization. Extract first name for casual conversation.'
        },
        'user_email': {
            agents: ['context_collector'],
            priority: 'high',
            contextExtraction: ['user_email', 'email_domain', 'business_email'],
            agentPromptContext: 'Validate email format. Infer potential industry from domain if business email.'
        },
        'user_phone': {
            agents: ['context_collector'],
            priority: 'low',
            contextExtraction: ['user_phone', 'country_code'],
            skipIf: () => false, // Optional but never skipped
            agentPromptContext: 'Optional field. Store if provided for communication.'
        },
        'user_location': {
            agents: ['context_collector', 'market_analyst'],
            skills: ['market_sizing_calculator'],
            priority: 'critical',
            contextExtraction: ['city', 'state', 'country', 'market_maturity', 'tech_hub', 'startup_ecosystem'],
            agentPromptContext: 'Detect location and infer market characteristics. This affects market sizing later.'
        },
        'checkpoint_auth': {
            agents: ['context_collector'],
            priority: 'low',
            agentPromptContext: 'Session pause point. Review collected info before proceeding.'
        }
    }
};

// ============================================================================
// Phase 2: User Discovery
// ============================================================================

export const PHASE_2_CONFIG: PhaseConfig = {
    phaseId: 'discovery',
    defaultAgents: ['context_collector', 'business_planner_lead', 'customer_profiler'],
    questions: {
        'education_level': {
            agents: ['context_collector', 'business_planner_lead'],
            priority: 'high',
            contextExtraction: ['education_level', 'analytical_capability', 'business_sophistication'],
            agentPromptContext: 'Profile user capability level. Higher education = more sophisticated language allowed.'
        },
        'education_field': {
            agents: ['context_collector', 'customer_profiler'],
            priority: 'medium',
            contextExtraction: ['domain_expertise', 'technical_skills', 'business_model_preference'],
            skipIf: (answers) => answers.education_level === 'self_taught',
            agentPromptContext: 'Identify domain expertise. Tech fields = SaaS/product businesses more viable.'
        },
        'years_experience': {
            agents: ['context_collector', 'business_planner_lead'],
            priority: 'high',
            contextExtraction: ['career_stage', 'industry_knowledge', 'network_strength', 'startup_readiness'],
            agentPromptContext: 'Assess business readiness and depth of experience.'
        },
        'industries_worked': {
            agents: ['context_collector', 'market_analyst', 'customer_profiler'],
            skills: ['competitor_analysis'],
            priority: 'medium',
            contextExtraction: ['cross_industry_experience', 'domain_versatility', 'potential_markets'],
            skipIf: (answers) => answers.years_experience === '0',
            agentPromptContext: 'Identify industry patterns and cross-domain opportunities.'
        },
        'employment_status': {
            agents: ['context_collector', 'business_planner_lead'],
            priority: 'high',
            contextExtraction: ['financial_stability', 'risk_profile', 'time_constraint', 'income_to_invest'],
            agentPromptContext: 'Determines time availability, urgency, and financial stability.'
        },
        'core_skills': {
            agents: ['context_collector', 'customer_profiler', 'ops_planner'],
            priority: 'critical',
            contextExtraction: ['technical_founding_capacity', 'product_sense', 'leadership_ready', 'hiring_needs'],
            agentPromptContext: 'Critical for role identification. Determines what founder can do vs must hire.'
        },
        'personal_strengths': {
            agents: ['context_collector', 'business_planner_lead', 'customer_profiler'],
            priority: 'high',
            contextExtraction: ['founder_archetype', 'execution_quality', 'ideal_business_type', 'weakness_inference'],
            agentPromptContext: 'Identify competitive advantages and infer weaknesses from what is NOT listed.'
        },
        'risk_tolerance': {
            agents: ['business_planner_lead', 'financial_modeler', 'funding_strategist'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['risk_profile', 'funding_appetite', 'growth_preference', 'recommended_runway'],
            agentPromptContext: 'Critical for financial modeling. Influences funding strategy and growth projections.'
        },
        'investment_capital': {
            agents: ['financial_modeler', 'funding_strategist', 'business_planner_lead'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['bootstrap_capable', 'viable_business_models', 'runway_estimate', 'external_funding_need'],
            agentPromptContext: 'Determines business model viability and capital constraints.'
        },
        'time_commitment': {
            agents: ['context_collector', 'ops_planner', 'business_planner_lead'],
            priority: 'high',
            contextExtraction: ['approach', 'timeline_multiplier', 'team_need', 'initial_business_model'],
            agentPromptContext: 'Critical constraint. Limited time = need help or simpler business model.'
        },
        'timeline_profitability': {
            agents: ['financial_modeler', 'revenue_architect', 'business_planner_lead'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['acceptable_burn_period', 'revenue_urgency', 'business_model_fit', 'funding_strategy'],
            agentPromptContext: 'Shapes entire financial strategy. Longer horizon = can pursue scalable models.'
        },
        'linkedin_connect': {
            agents: ['context_collector'],
            priority: 'low',
            contextExtraction: ['linkedin_connected', 'profile_data_available'],
            agentPromptContext: 'Optional. Yes = faster profile import from LinkedIn API.'
        },
        'social_profiles': {
            agents: ['context_collector'],
            priority: 'low',
            contextExtraction: ['public_credibility', 'technical_portfolio', 'personal_brand'],
            agentPromptContext: 'Optional. Analyze for credibility and network size.'
        },
        'checkpoint_discovery': {
            agents: ['context_collector'],
            priority: 'low',
            agentPromptContext: 'Session pause point. Summarize founder profile before business context.'
        }
    }
};

// ============================================================================
// Phase 3: Business Context
// ============================================================================

export const PHASE_3_CONFIG: PhaseConfig = {
    phaseId: 'context',
    defaultAgents: ['context_collector', 'business_planner_lead', 'market_analyst'],
    questions: {
        'business_path': {
            agents: ['business_planner_lead', 'context_collector', 'market_analyst'],
            priority: 'critical',
            isBranchingPoint: true,
            contextExtraction: ['business_path', 'starting_from_scratch', 'needs_ideation_support'],
            agentPromptContext: 'CRITICAL BRANCHING. Determines next 15+ questions. new vs existing changes entire flow.'
        },
        'idea_status': {
            agents: ['business_planner_lead', 'customer_profiler', 'market_analyst'],
            priority: 'high',
            contextExtraction: ['needs_ideation_help', 'idea_clarity', 'ready_for_validation'],
            skipIf: (answers) => answers.business_path === 'existing',
            agentPromptContext: 'Determines ideation support level. Need suggestions = AI generates ideas.'
        },
        'business_idea_detail': {
            agents: ['business_planner_lead', 'customer_profiler', 'market_analyst'],
            skills: ['competitor_analysis', 'market_sizing_calculator'],
            priority: 'critical',
            contextExtraction: ['product_type', 'core_technology', 'problem_solved', 'customer_type_detected', 'target_customer_segment'],
            skipIf: (answers) => answers.business_path === 'existing',
            agentPromptContext: 'EXTRACT MAXIMUM CONTEXT via NLP. This is GOLD - extract problem, solution, customers, technology.'
        },
        'problem_to_solve': {
            agents: ['customer_profiler', 'market_analyst', 'business_planner_lead'],
            skills: ['competitor_analysis'],
            priority: 'high',
            contextExtraction: ['problem_magnitude', 'problem_type', 'willingness_to_pay'],
            skipIf: (answers) => answers.idea_status === 'need_suggestions',
            agentPromptContext: 'Problem statement validation. Look for quantified pain points.'
        },
        'target_industries': {
            agents: ['market_analyst', 'customer_profiler', 'business_planner_lead'],
            skills: ['market_sizing_calculator', 'competitor_analysis'],
            priority: 'high',
            contextExtraction: ['target_industries', 'market_sizing_inputs'],
            skipIf: (answers) => answers.business_path === 'existing',
            agentPromptContext: 'Calculate TAM/SAM/SOM per selected industry. Trigger market sizing skill.'
        },
        'business_model_type': {
            agents: ['business_planner_lead', 'revenue_architect', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['business_model_type', 'financial_assumptions', 'gross_margin_default'],
            agentPromptContext: 'Activates financial modeling defaults. SaaS = recurring, 80% margins. Product = different assumptions.'
        },
        'unique_advantage': {
            agents: ['market_analyst', 'customer_profiler', 'business_planner_lead'],
            skills: ['competitor_analysis'],
            priority: 'critical',
            contextExtraction: ['moat_type', 'competitive_strength', 'defensibility', 'proprietary_ip'],
            agentPromptContext: 'Identify competitive moat. Extract specific advantages like expertise, IP, network.'
        },
        'validation_status': {
            agents: ['customer_profiler', 'market_analyst', 'business_planner_lead'],
            priority: 'high',
            contextExtraction: ['validation_level', 'product_market_fit', 'risk_level', 'next_step_priority'],
            agentPromptContext: 'Affects risk assessment. paying > interest > surveyed > confident > need_help.'
        },
        'motivation': {
            agents: ['business_planner_lead', 'context_collector'],
            priority: 'medium',
            contextExtraction: ['primary_driver', 'mission_driven', 'exit_strategy', 'grit_factor'],
            agentPromptContext: 'Shapes goal alignment. Problem-solving = mission-driven. Financial = exit-focused.'
        },
        'existing_name': {
            agents: ['context_collector', 'business_planner_lead'],
            skills: ['branded_document_generator'],
            priority: 'high',
            contextExtraction: ['business_name'],
            skipIf: (answers) => answers.business_path !== 'existing',
            agentPromptContext: 'Store business name for all branded outputs.'
        },
        'existing_website': {
            agents: ['context_collector', 'market_analyst'],
            skills: ['competitor_analysis'],
            priority: 'medium',
            contextExtraction: ['website_url', 'current_positioning'],
            skipIf: (answers) => answers.business_path !== 'existing',
            agentPromptContext: 'Scrape website to analyze current positioning if URL provided.'
        },
        'existing_industry': {
            agents: ['market_analyst', 'context_collector'],
            skills: ['market_sizing_calculator'],
            priority: 'high',
            contextExtraction: ['industry', 'market_data'],
            skipIf: (answers) => answers.business_path !== 'existing',
            agentPromptContext: 'Trigger market sizing for existing industry.'
        },
        'business_start_date': {
            agents: ['context_collector', 'financial_modeler'],
            priority: 'medium',
            contextExtraction: ['business_age', 'years_operating'],
            skipIf: (answers) => answers.business_path !== 'existing',
            agentPromptContext: 'Calculate business age for historical revenue analysis.'
        },
        'current_revenue': {
            agents: ['financial_modeler', 'revenue_architect', 'business_planner_lead'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['current_revenue_range', 'growth_baseline'],
            skipIf: (answers) => answers.business_path !== 'existing',
            agentPromptContext: 'Baseline for projections. Critical for existing business financial modeling.'
        },
        'legal_entity': {
            agents: ['legal_advisor', 'business_planner_lead'],
            skills: ['compliance_checker'],
            priority: 'high',
            contextExtraction: ['entity_type', 'legal_requirements'],
            skipIf: (answers) => answers.business_path !== 'existing',
            agentPromptContext: 'Determine compliance requirements based on entity type.'
        },
        'current_products': {
            agents: ['revenue_architect', 'customer_profiler', 'market_analyst'],
            skills: ['competitor_analysis'],
            priority: 'high',
            contextExtraction: ['product_list', 'product_market_fit'],
            skipIf: (answers) => answers.business_path !== 'existing',
            agentPromptContext: 'Analyze product-market fit for each offering.'
        },
        'team_size_current': {
            agents: ['ops_planner', 'business_planner_lead'],
            priority: 'medium',
            contextExtraction: ['team_size', 'scaling_strategy'],
            skipIf: (answers) => answers.business_path === 'new' && answers.idea_status === 'idea_only',
            agentPromptContext: 'Determine team capacity and scaling needs.'
        },
        'biggest_challenges': {
            agents: ['business_planner_lead', 'market_analyst', 'ops_planner'],
            priority: 'high',
            contextExtraction: ['challenge_priority', 'needs_help_with', 'immediate_focus'],
            agentPromptContext: 'Prioritize recommendations based on top challenges.'
        },
        'checkpoint_context': {
            agents: ['context_collector'],
            priority: 'low',
            agentPromptContext: 'Summarize business foundation before market analysis.'
        }
    }
};

// ============================================================================
// Phase 4: Market & Industry Analysis
// ============================================================================

export const PHASE_4_CONFIG: PhaseConfig = {
    phaseId: 'market',
    defaultAgents: ['market_analyst', 'customer_profiler', 'business_planner_lead'],
    defaultSkills: ['market_sizing_calculator'],
    questions: {
        'primary_market': {
            agents: ['market_analyst', 'customer_profiler', 'business_planner_lead'],
            skills: ['market_sizing_calculator'],
            priority: 'critical',
            contextExtraction: ['primary_market', 'market_scope', 'market_fragmentation', 'sales_approach'],
            agentPromptContext: 'Trigger market sizing for location. Affects GTM and pricing strategy.'
        },
        'expansion_plan': {
            agents: ['market_analyst', 'gtm_strategist'],
            priority: 'high',
            contextExtraction: ['expansion_plan', 'multi_stage_gtm'],
            agentPromptContext: 'Determines if multi-market GTM planning needed.'
        },
        'expansion_timeline': {
            agents: ['market_analyst', 'gtm_strategist', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'medium',
            contextExtraction: ['expansion_timeline', 'phased_revenue_projections'],
            skipIf: (answers) => answers.expansion_plan !== 'yes',
            agentPromptContext: 'Add phased expansion to financial projections.'
        },
        'international_plan': {
            agents: ['market_analyst', 'gtm_strategist', 'legal_advisor'],
            skills: ['market_sizing_calculator', 'compliance_checker'],
            priority: 'high',
            contextExtraction: ['international_plan', 'global_strategy'],
            agentPromptContext: 'If yes, trigger international compliance and market sizing.'
        },
        'target_regions': {
            agents: ['market_analyst', 'gtm_strategist'],
            skills: ['market_sizing_calculator'],
            priority: 'medium',
            contextExtraction: ['target_regions', 'regional_market_sizes'],
            skipIf: (answers) => !['yes', 'maybe_later'].includes(answers.international_plan),
            agentPromptContext: 'Calculate regional TAM/SAM/SOM for each selected region.'
        },
        'customer_type': {
            agents: ['customer_profiler', 'market_analyst', 'revenue_architect'],
            priority: 'critical',
            isBranchingPoint: true,
            contextExtraction: ['customer_type', 'sales_cycle_default', 'cac_benchmark', 'ltv_benchmark'],
            agentPromptContext: 'CRITICAL BRANCHING. B2B vs B2C determines next 10+ questions and GTM defaults.'
        },
        'target_age': {
            agents: ['customer_profiler', 'market_analyst'],
            skills: ['market_sizing_calculator'],
            priority: 'medium',
            contextExtraction: ['target_age_group', 'demographic_targeting'],
            skipIf: (answers) => ['b2b', 'b2g'].includes(answers.customer_type),
            agentPromptContext: 'B2C demographic targeting for market segmentation.'
        },
        'target_gender': {
            agents: ['customer_profiler', 'market_analyst'],
            skills: ['market_sizing_calculator'],
            priority: 'low',
            contextExtraction: ['target_gender', 'market_segmentation'],
            skipIf: (answers) => ['b2b', 'b2g'].includes(answers.customer_type),
            agentPromptContext: 'Gender-based market segmentation for B2C.'
        },
        'target_income': {
            agents: ['customer_profiler', 'market_analyst', 'revenue_architect'],
            skills: ['market_sizing_calculator'],
            priority: 'high',
            contextExtraction: ['target_income', 'pricing_strategy_hint'],
            skipIf: (answers) => ['b2b', 'b2g'].includes(answers.customer_type),
            agentPromptContext: 'Income level affects pricing strategy. Affluent = premium pricing viable.'
        },
        'target_location': {
            agents: ['customer_profiler', 'market_analyst', 'gtm_strategist'],
            skills: ['market_sizing_calculator'],
            priority: 'high',
            contextExtraction: ['target_location_type', 'distribution_strategy'],
            agentPromptContext: 'Affects distribution strategy. Urban = digital-first. Rural = need offline channels.'
        },
        'target_education': {
            agents: ['customer_profiler', 'market_analyst'],
            priority: 'low',
            contextExtraction: ['target_education', 'messaging_complexity'],
            skipIf: (answers) => ['b2b', 'b2g'].includes(answers.customer_type),
            agentPromptContext: 'Education level affects messaging complexity.'
        },
        'customer_interests': {
            agents: ['customer_profiler', 'market_analyst', 'gtm_strategist'],
            priority: 'medium',
            contextExtraction: ['customer_interests', 'psychographic_targeting'],
            skipIf: (answers) => ['b2b', 'b2g'].includes(answers.customer_type),
            agentPromptContext: 'Psychographic targeting for content and ad targeting.'
        },
        'customer_problem': {
            agents: ['customer_profiler', 'market_analyst', 'business_planner_lead'],
            priority: 'critical',
            contextExtraction: ['customer_pain_point', 'value_proposition'],
            agentPromptContext: 'CRITICAL for value proposition. Extract quantified pain if possible.'
        },
        'company_size_target': {
            agents: ['customer_profiler', 'market_analyst', 'revenue_architect'],
            skills: ['market_sizing_calculator'],
            priority: 'high',
            contextExtraction: ['company_size_target', 'icp_definition', 'deal_size_range'],
            skipIf: (answers) => !['b2b', 'b2b2c', 'b2g', 'hybrid'].includes(answers.customer_type),
            agentPromptContext: 'Define ICP. Mid-market = inside sales. Enterprise = field sales.'
        },
        'target_industries_b2b': {
            agents: ['market_analyst', 'customer_profiler', 'gtm_strategist'],
            skills: ['market_sizing_calculator', 'competitor_analysis'],
            priority: 'high',
            contextExtraction: ['target_industries_b2b', 'vertical_tam'],
            skipIf: (answers) => !['b2b', 'b2b2c', 'b2g', 'hybrid'].includes(answers.customer_type),
            agentPromptContext: 'Calculate vertical-specific TAM/SAM/SOM.'
        },
        'company_revenue_target': {
            agents: ['customer_profiler', 'market_analyst', 'revenue_architect'],
            skills: ['market_sizing_calculator'],
            priority: 'medium',
            contextExtraction: ['company_revenue_target', 'budget_availability'],
            skipIf: (answers) => !['b2b', 'b2b2c', 'b2g', 'hybrid'].includes(answers.customer_type),
            agentPromptContext: 'Target company revenue indicates their budget for solutions.'
        },
        'decision_maker': {
            agents: ['customer_profiler', 'gtm_strategist'],
            priority: 'high',
            contextExtraction: ['decision_maker_level', 'sales_approach', 'content_strategy'],
            skipIf: (answers) => !['b2b', 'b2b2c', 'b2g', 'hybrid'].includes(answers.customer_type),
            agentPromptContext: 'Buyer persona definition. C-suite = thought leadership content.'
        },
        'business_problem_b2b': {
            agents: ['customer_profiler', 'market_analyst', 'business_planner_lead'],
            priority: 'critical',
            contextExtraction: ['b2b_pain_point', 'roi_proposition'],
            skipIf: (answers) => !['b2b', 'b2b2c', 'b2g', 'hybrid'].includes(answers.customer_type),
            agentPromptContext: 'B2B value proposition. Extract ROI-quantifiable problems.'
        },
        'current_solution': {
            agents: ['market_analyst', 'customer_profiler'],
            skills: ['competitor_analysis'],
            priority: 'high',
            contextExtraction: ['current_solutions', 'switching_barriers', 'competitive_landscape'],
            skipIf: (answers) => !['b2b', 'b2b2c', 'b2g', 'hybrid'].includes(answers.customer_type),
            agentPromptContext: 'Analyze alternatives. Excel = biggest competitor for many B2B tools.'
        },
        'checkpoint_market': {
            agents: ['context_collector'],
            priority: 'low',
            agentPromptContext: 'Summarize market opportunity before revenue modeling.'
        }
    }
};

// ============================================================================
// Phase 5: Revenue Model & Financial Projections
// ============================================================================

export const PHASE_5_CONFIG: PhaseConfig = {
    phaseId: 'revenue',
    defaultAgents: ['financial_modeler', 'revenue_architect', 'business_planner_lead'],
    defaultSkills: ['financial_modeling'],
    questions: {
        'revenue_model': {
            agents: ['revenue_architect', 'financial_modeler', 'business_planner_lead'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['revenue_model', 'revenue_recognition', 'valuation_multiple'],
            agentPromptContext: 'Activates financial model. Recurring = SaaS metrics. One-time = different model.'
        },
        'billing_frequency': {
            agents: ['revenue_architect', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'high',
            contextExtraction: ['billing_frequency', 'cash_flow_pattern', 'churn_risk_level'],
            agentPromptContext: 'Monthly = higher churn risk. Annual = better cash flow.'
        },
        'target_price': {
            agents: ['revenue_architect', 'market_analyst', 'financial_modeler'],
            skills: ['financial_modeling', 'competitor_analysis'],
            priority: 'critical',
            contextExtraction: ['target_price', 'annual_contract_value', 'price_segment', 'ltv_estimate'],
            agentPromptContext: 'CRITICAL. Determines entire revenue model. Calculate LTV, CAC payback.'
        },
        'tiered_pricing': {
            agents: ['revenue_architect', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'medium',
            contextExtraction: ['pricing_tiers', 'expected_tier_distribution', 'blended_arpu'],
            agentPromptContext: 'Calculate blended ARPU if multiple tiers. Upsell strategy.'
        },
        'gross_margin': {
            agents: ['financial_modeler', 'revenue_architect', 'unit_economics_calculator'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['gross_margin', 'cogs_breakdown', 'scalability'],
            agentPromptContext: 'Critical for unit economics. SaaS = 75-85%. Services = 40-60%.'
        },
        'secondary_revenue': {
            agents: ['revenue_architect', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'medium',
            contextExtraction: ['secondary_revenue_streams', 'revenue_diversification'],
            agentPromptContext: 'Upsells, cross-sells, services add 15-30% to base revenue.'
        },
        'year1_revenue': {
            agents: ['financial_modeler', 'revenue_architect', 'business_planner_lead'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['year1_revenue_target', 'customers_needed', 'monthly_breakdown'],
            agentPromptContext: 'CRITICAL anchor for all projections. Calculate customers needed, monthly ramp.'
        },
        'growth_rate': {
            agents: ['financial_modeler', 'market_analyst', 'funding_strategist'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['growth_rate', 'revenue_projections', 'team_growth_needed', 'capital_requirements'],
            agentPromptContext: 'Calculate 5-year projections. Triggers funding need calculation.'
        },
        'monthly_customers': {
            agents: ['financial_modeler', 'gtm_strategist', 'unit_economics_calculator'],
            skills: ['financial_modeling'],
            priority: 'high',
            contextExtraction: ['customer_acquisition_pace', 'pipeline_needed', 'sales_capacity'],
            agentPromptContext: 'Calculate pipeline math. Leads needed = customers / conversion rate.'
        },
        'churn_rate': {
            agents: ['financial_modeler', 'revenue_architect', 'unit_economics_calculator'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['churn_rate', 'retention_rate', 'customer_lifetime'],
            agentPromptContext: 'Critical for LTV. 5% monthly = 46% annual. Calculate lifetime.'
        },
        'arpu': {
            agents: ['revenue_architect', 'financial_modeler', 'unit_economics_calculator'],
            skills: ['financial_modeling'],
            priority: 'high',
            contextExtraction: ['arpu', 'arpu_evolution'],
            agentPromptContext: 'Average Revenue Per User. Include upsells in calculation.'
        },
        'expansion_revenue': {
            agents: ['revenue_architect', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'medium',
            contextExtraction: ['expansion_strategy', 'expansion_rate'],
            agentPromptContext: 'Upsell/cross-sell strategy. Contributes to NRR > 100%.'
        },
        'nrr': {
            agents: ['financial_modeler', 'revenue_architect', 'unit_economics_calculator'],
            skills: ['financial_modeling'],
            priority: 'high',
            contextExtraction: ['nrr', 'gross_revenue_retention', 'expansion_contribution'],
            agentPromptContext: 'Net Revenue Retention. >100% = grow without new customers.'
        },
        'target_cac': {
            agents: ['financial_modeler', 'gtm_strategist', 'unit_economics_calculator'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['target_cac', 'cac_payback', 'cac_breakdown'],
            agentPromptContext: 'Customer Acquisition Cost. Calculate payback months. <12 months = healthy.'
        },
        'ltv': {
            agents: ['financial_modeler', 'revenue_architect', 'unit_economics_calculator'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['ltv', 'ltv_cac_ratio', 'unit_economics_verdict'],
            agentPromptContext: 'Lifetime Value. LTV:CAC > 3:1 = healthy. Calculate from ARPU, margin, churn.'
        },
        'sales_cycle': {
            agents: ['gtm_strategist', 'financial_modeler', 'revenue_architect'],
            priority: 'high',
            contextExtraction: ['sales_cycle', 'deals_per_rep', 'pipeline_coverage'],
            agentPromptContext: 'Affects cash flow timing and sales team sizing.'
        },
        'pricing_comparison': {
            agents: ['revenue_architect', 'market_analyst'],
            skills: ['competitor_analysis'],
            priority: 'medium',
            contextExtraction: ['competitive_pricing', 'price_positioning'],
            agentPromptContext: 'Competitive positioning. Premium = need ROI justification.'
        },
        'pricing_strategy': {
            agents: ['revenue_architect', 'market_analyst', 'business_planner_lead'],
            priority: 'high',
            contextExtraction: ['pricing_strategy', 'value_proposition_alignment'],
            agentPromptContext: 'Value-based = price on outcomes. Competitive = watch market.'
        },
        'discounts': {
            agents: ['revenue_architect', 'gtm_strategist', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'medium',
            contextExtraction: ['discount_structure', 'blended_discount_rate', 'effective_price'],
            agentPromptContext: 'Calculate effective price after discounts. Impact on revenue.'
        },
        'checkpoint_revenue': {
            agents: ['context_collector'],
            priority: 'low',
            agentPromptContext: 'Summarize unit economics before competitive analysis.'
        }
    }
};

// ============================================================================
// Phase 6: Competitive Analysis
// ============================================================================

export const PHASE_6_CONFIG: PhaseConfig = {
    phaseId: 'competition',
    defaultAgents: ['market_analyst', 'customer_profiler', 'business_planner_lead'],
    defaultSkills: ['competitor_analysis'],
    questions: {
        'top_competitors': {
            agents: ['market_analyst', 'customer_profiler', 'business_planner_lead'],
            skills: ['competitor_analysis'],
            priority: 'critical',
            contextExtraction: ['top_competitors', 'competitor_details', 'competitive_landscape'],
            agentPromptContext: 'Deep competitive analysis. Analyze pricing, strength, weakness of each.'
        },
        'indirect_competitors': {
            agents: ['market_analyst', 'customer_profiler'],
            skills: ['competitor_analysis'],
            priority: 'medium',
            contextExtraction: ['indirect_competitors', 'substitute_analysis'],
            agentPromptContext: 'Analyze alternatives: status quo, manual processes, different solutions.'
        },
        'competitive_advantage': {
            agents: ['market_analyst', 'customer_profiler', 'business_planner_lead'],
            priority: 'critical',
            contextExtraction: ['moat_components', 'competitive_strength_ranking', 'defensibility'],
            agentPromptContext: 'CRITICAL for positioning. What makes this business defensible?'
        },
        'competitor_weaknesses': {
            agents: ['market_analyst', 'customer_profiler'],
            skills: ['competitor_analysis'],
            priority: 'high',
            contextExtraction: ['competitor_weaknesses', 'exploitation_strategy'],
            agentPromptContext: 'Identify weaknesses to exploit. Guide product and marketing priorities.'
        },
        'barriers_to_entry': {
            agents: ['market_analyst', 'business_planner_lead', 'funding_strategist'],
            priority: 'high',
            contextExtraction: ['barriers', 'market_defensibility', 'entry_difficulty'],
            agentPromptContext: 'Assess how easy for new competitors to enter. Higher barriers = more defensible.'
        },
        'competition_strategy': {
            agents: ['market_analyst', 'gtm_strategist', 'business_planner_lead'],
            priority: 'high',
            contextExtraction: ['competition_strategy', 'positioning'],
            agentPromptContext: 'How to win: innovation, cost leadership, differentiation, or focus.'
        },
        'checkpoint_competition': {
            agents: ['context_collector'],
            priority: 'low',
            agentPromptContext: 'Summarize competitive landscape before operations planning.'
        }
    }
};

// ============================================================================
// Phase 7: Operations & Team
// ============================================================================

export const PHASE_7_CONFIG: PhaseConfig = {
    phaseId: 'operations',
    defaultAgents: ['ops_planner', 'business_planner_lead', 'financial_modeler'],
    questions: {
        'need_cofounder': {
            agents: ['ops_planner', 'business_planner_lead'],
            priority: 'high',
            contextExtraction: ['cofounder_need', 'cofounder_search_active', 'equity_split'],
            agentPromptContext: 'Determine if solo founder or need partner. B2B SaaS usually needs sales co-founder.'
        },
        'cofounder_skills': {
            agents: ['ops_planner', 'business_planner_lead'],
            priority: 'high',
            contextExtraction: ['cofounder_skills', 'division_of_responsibilities'],
            skipIf: (answers) => answers.need_cofounder === 'solo',
            agentPromptContext: 'Define ideal co-founder profile. Usually complement founder skills.'
        },
        'missing_skills': {
            agents: ['ops_planner', 'business_planner_lead'],
            priority: 'high',
            contextExtraction: ['skills_gap', 'critical_first_hires', 'advisory_needs'],
            agentPromptContext: 'Identify hiring priorities based on missing skills.'
        },
        'team_size_year1': {
            agents: ['ops_planner', 'financial_modeler', 'business_planner_lead'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['team_size_year1', 'team_composition', 'compensation_planning'],
            agentPromptContext: 'Calculate payroll budget. Critical for burn rate and runway.'
        },
        'hiring_priorities': {
            agents: ['ops_planner', 'financial_modeler', 'business_planner_lead'],
            skills: ['financial_modeling'],
            priority: 'high',
            contextExtraction: ['hiring_sequence', 'hiring_budget'],
            skipIf: (answers) => answers.team_size_year1 === 'just_me',
            agentPromptContext: 'Sequence and timing of hires. Product, sales, or ops first?'
        },
        'employment_model': {
            agents: ['ops_planner', 'financial_modeler', 'legal_advisor'],
            skills: ['compliance_checker'],
            priority: 'medium',
            contextExtraction: ['employment_structure', 'fte_vs_contractor'],
            skipIf: (answers) => answers.team_size_year1 === 'just_me',
            agentPromptContext: 'FTE vs contractor mix. Contractors = flexibility, FTE = commitment.'
        },
        'work_arrangement': {
            agents: ['ops_planner', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'medium',
            contextExtraction: ['work_arrangement', 'office_cost', 'talent_pool'],
            agentPromptContext: 'Remote saves office cost but needs remote culture practices.'
        },
        'salary_budget': {
            agents: ['financial_modeler', 'ops_planner'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['salary_budget', 'monthly_burn', 'runway'],
            agentPromptContext: 'CRITICAL. Calculate burn rate and runway. May trigger funding urgency.'
        },
        'key_vendors': {
            agents: ['ops_planner', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'medium',
            contextExtraction: ['vendor_costs', 'startup_programs'],
            agentPromptContext: 'Calculate vendor spend. Apply startup credit programs.'
        },
        'manufacturing': {
            agents: ['ops_planner', 'financial_modeler', 'business_planner_lead'],
            skills: ['financial_modeling'],
            priority: 'high',
            contextExtraction: ['manufacturing_model', 'cogs_structure'],
            skipIf: (answers) => ['service', 'saas', 'agency', 'consulting'].includes(answers.business_model_type),
            agentPromptContext: 'Manufacturing model affects COGS and capital requirements.'
        },
        'strategic_partnerships': {
            agents: ['gtm_strategist', 'ops_planner', 'business_planner_lead'],
            priority: 'medium',
            contextExtraction: ['partnership_strategy', 'partner_ecosystem'],
            agentPromptContext: 'Technology, channel, or distribution partnerships.'
        },
        'tech_stack': {
            agents: ['ops_planner', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'medium',
            contextExtraction: ['technology_stack', 'tech_cost'],
            agentPromptContext: 'Calculate technology costs. Apply startup discounts.'
        },
        'tech_budget': {
            agents: ['financial_modeler', 'ops_planner'],
            skills: ['financial_modeling'],
            priority: 'medium',
            contextExtraction: ['tech_budget', 'tool_costs'],
            agentPromptContext: 'Monthly tech spend. Part of operating expenses.'
        },
        'custom_tech': {
            agents: ['ops_planner', 'financial_modeler', 'business_planner_lead'],
            skills: ['financial_modeling'],
            priority: 'high',
            contextExtraction: ['custom_tech_needed', 'r_and_d_budget', 'ip_strategy'],
            agentPromptContext: 'Proprietary technology needs. Affects R&D budget and defensibility.'
        },
        'licenses_needed': {
            agents: ['legal_advisor', 'ops_planner'],
            skills: ['compliance_checker'],
            priority: 'high',
            contextExtraction: ['required_licenses', 'compliance_timeline'],
            agentPromptContext: 'Legal requirements based on industry and location.'
        },
        'regulations': {
            agents: ['legal_advisor', 'ops_planner', 'business_planner_lead'],
            skills: ['compliance_checker'],
            priority: 'high',
            contextExtraction: ['regulatory_requirements', 'compliance_cost'],
            agentPromptContext: 'Data privacy, financial, industry-specific regulations.'
        },
        'insurance_needed': {
            agents: ['legal_advisor', 'ops_planner', 'financial_modeler'],
            skills: ['compliance_checker', 'financial_modeling'],
            priority: 'medium',
            contextExtraction: ['insurance_types', 'insurance_cost'],
            agentPromptContext: 'Required insurance types and annual premiums.'
        },
        'checkpoint_operations': {
            agents: ['context_collector'],
            priority: 'low',
            agentPromptContext: 'Summarize operations plan before GTM strategy.'
        }
    }
};

// ============================================================================
// Phase 8: Go-To-Market Strategy
// ============================================================================

export const PHASE_8_CONFIG: PhaseConfig = {
    phaseId: 'gtm',
    defaultAgents: ['gtm_strategist', 'market_analyst', 'financial_modeler'],
    questions: {
        'acquisition_channels': {
            agents: ['gtm_strategist', 'market_analyst', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['acquisition_channels', 'channel_contribution', 'cac_by_channel'],
            agentPromptContext: 'CRITICAL for GTM. Calculate CAC and contribution by channel.'
        },
        'acquisition_strategy': {
            agents: ['gtm_strategist', 'customer_profiler', 'business_planner_lead'],
            priority: 'critical',
            contextExtraction: ['gtm_timeline', 'first_100_customers_plan'],
            agentPromptContext: 'Detailed roadmap. How to get first 100 customers?'
        },
        'marketing_budget': {
            agents: ['gtm_strategist', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['marketing_budget', 'budget_allocation', 'customers_affordable'],
            agentPromptContext: 'Calculate how many customers affordable with budget. May need to adjust targets.'
        },
        'existing_audience': {
            agents: ['gtm_strategist', 'customer_profiler'],
            priority: 'medium',
            contextExtraction: ['existing_audience', 'warm_leads', 'network_activation'],
            agentPromptContext: 'Warm leads convert 3-5x better than cold. Start with network.'
        },
        'sales_model': {
            agents: ['gtm_strategist', 'revenue_architect', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['sales_model', 'sales_structure', 'sales_efficiency'],
            agentPromptContext: 'Self-serve vs inside sales vs field sales. Determines team structure.'
        },
        'sales_team': {
            agents: ['gtm_strategist', 'ops_planner', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'high',
            contextExtraction: ['sales_team_size', 'sales_budget'],
            skipIf: (answers) => answers.sales_model === 'self_serve',
            agentPromptContext: 'Sales team size and composition. Calculate quota and OTE.'
        },
        'commission_structure': {
            agents: ['gtm_strategist', 'revenue_architect', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'medium',
            contextExtraction: ['commission_rate', 'sales_compensation'],
            skipIf: (answers) => answers.sales_team === 'founder',
            agentPromptContext: 'Commission percentage and structure. Affects sales cost.'
        },
        'brand_positioning': {
            agents: ['gtm_strategist', 'market_analyst', 'customer_profiler'],
            priority: 'high',
            contextExtraction: ['brand_positioning', 'price_messaging_alignment'],
            agentPromptContext: 'Premium vs value positioning. Must align with pricing.'
        },
        'brand_voice': {
            agents: ['gtm_strategist', 'customer_profiler'],
            skills: ['branded_document_generator'],
            priority: 'medium',
            contextExtraction: ['brand_voice', 'brand_guidelines'],
            agentPromptContext: 'Brand voice for all communications. Inform document generation.'
        },
        'marketing_focus': {
            agents: ['gtm_strategist', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'high',
            contextExtraction: ['marketing_focus', 'budget_split'],
            agentPromptContext: 'Brand vs performance marketing. Affects budget allocation.'
        },
        'key_milestones': {
            agents: ['business_planner_lead', 'gtm_strategist', 'ops_planner'],
            priority: 'high',
            contextExtraction: ['milestones', 'execution_roadmap'],
            agentPromptContext: 'Key milestones by month. Creates execution roadmap.'
        },
        'launch_timeline': {
            agents: ['business_planner_lead', 'gtm_strategist', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['launch_date', 'runway_to_launch', 'pre_launch_spend'],
            agentPromptContext: 'Launch date affects runway calculation. Must have funds to reach launch.'
        },
        'checkpoint_gtm': {
            agents: ['context_collector'],
            priority: 'low',
            agentPromptContext: 'Summarize GTM strategy before funding.'
        }
    }
};

// ============================================================================
// Phase 9: Funding Strategy
// ============================================================================

export const PHASE_9_CONFIG: PhaseConfig = {
    phaseId: 'funding',
    defaultAgents: ['funding_strategist', 'financial_modeler', 'business_planner_lead'],
    defaultSkills: ['financial_modeling'],
    questions: {
        'external_funding': {
            agents: ['funding_strategist', 'financial_modeler', 'business_planner_lead'],
            skills: ['financial_modeling'],
            priority: 'critical',
            isBranchingPoint: true,
            contextExtraction: ['funding_decision', 'funding_path'],
            agentPromptContext: 'CRITICAL BRANCHING. Bootstrap vs raise determines next 8 questions.'
        },
        'funding_stage': {
            agents: ['funding_strategist', 'financial_modeler'],
            priority: 'high',
            contextExtraction: ['funding_stage', 'investor_targeting'],
            skipIf: (answers) => answers.external_funding === 'bootstrap',
            agentPromptContext: 'Pre-seed, seed, Series A. Determines investor type.'
        },
        'capital_needed': {
            agents: ['funding_strategist', 'financial_modeler', 'business_planner_lead'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['capital_needed', 'use_of_funds'],
            skipIf: (answers) => answers.external_funding === 'bootstrap',
            agentPromptContext: 'How much to raise. Should cover 18-24 months runway.'
        },
        'funds_allocation': {
            agents: ['funding_strategist', 'financial_modeler', 'ops_planner'],
            skills: ['financial_modeling'],
            priority: 'high',
            contextExtraction: ['funds_allocation', 'budget_breakdown'],
            skipIf: (answers) => answers.external_funding === 'bootstrap',
            agentPromptContext: 'How to spend the money. Team, marketing, product, operations.'
        },
        'equity_dilution': {
            agents: ['funding_strategist', 'financial_modeler'],
            skills: ['financial_modeling'],
            priority: 'high',
            contextExtraction: ['equity_dilution', 'ownership_structure'],
            skipIf: (answers) => answers.external_funding === 'bootstrap',
            agentPromptContext: 'Acceptable dilution percentage. Affects ownership after funding.'
        },
        'target_valuation': {
            agents: ['funding_strategist', 'financial_modeler', 'market_analyst'],
            skills: ['financial_modeling'],
            priority: 'critical',
            contextExtraction: ['target_valuation', 'valuation_methodology'],
            skipIf: (answers) => answers.external_funding === 'bootstrap',
            agentPromptContext: 'Target valuation based on stage, traction, market size.'
        },
        'investor_types': {
            agents: ['funding_strategist', 'business_planner_lead'],
            priority: 'high',
            contextExtraction: ['investor_types', 'investor_outreach'],
            skipIf: (answers) => answers.external_funding === 'bootstrap',
            agentPromptContext: 'Angels, VCs, family. Determines outreach strategy.'
        },
        'investor_connections': {
            agents: ['funding_strategist', 'business_planner_lead'],
            priority: 'medium',
            contextExtraction: ['warm_intros', 'fundraising_strategy'],
            skipIf: (answers) => answers.external_funding === 'bootstrap',
            agentPromptContext: 'Warm intros convert 10x better than cold. Map network.'
        },
        'investor_conversations': {
            agents: ['funding_strategist', 'business_planner_lead'],
            priority: 'medium',
            contextExtraction: ['current_conversations', 'next_steps'],
            skipIf: (answers) => answers.external_funding === 'bootstrap',
            agentPromptContext: 'Current status of fundraising conversations.'
        },
        'checkpoint_funding': {
            agents: ['context_collector'],
            priority: 'low',
            agentPromptContext: 'Summarize funding strategy before risk assessment.'
        }
    }
};

// ============================================================================
// Phase 10: Risk Assessment
// ============================================================================

export const PHASE_10_CONFIG: PhaseConfig = {
    phaseId: 'risk',
    defaultAgents: ['business_planner_lead', 'market_analyst', 'financial_modeler'],
    questions: {
        'key_risks': {
            agents: ['business_planner_lead', 'market_analyst', 'financial_modeler'],
            priority: 'critical',
            contextExtraction: ['key_risks', 'risk_matrix'],
            agentPromptContext: 'Identify top risks. Market, execution, financial, regulatory.'
        },
        'risk_mitigation': {
            agents: ['business_planner_lead', 'market_analyst', 'ops_planner'],
            priority: 'critical',
            contextExtraction: ['mitigation_plans', 'contingencies'],
            agentPromptContext: 'Mitigation strategy for each identified risk.'
        },
        'plan_b': {
            agents: ['business_planner_lead', 'market_analyst'],
            priority: 'high',
            contextExtraction: ['pivot_strategy', 'alternative_paths'],
            agentPromptContext: 'Pivot strategy if primary plan fails.'
        },
        'key_assumptions': {
            agents: ['business_planner_lead', 'financial_modeler', 'market_analyst'],
            priority: 'critical',
            contextExtraction: ['key_assumptions', 'validation_roadmap'],
            agentPromptContext: 'Critical assumptions that must be true. Create validation plan.'
        },
        'checkpoint_risk': {
            agents: ['context_collector'],
            priority: 'low',
            agentPromptContext: 'Summarize risk assessment before final review.'
        }
    }
};

// ============================================================================
// Phase 11: Final Review & Output
// ============================================================================

export const PHASE_11_CONFIG: PhaseConfig = {
    phaseId: 'output',
    defaultAgents: ['output_generator', 'business_planner_lead', 'document_generator'],
    defaultSkills: ['branded_document_generator'],
    questions: {
        'summary_review': {
            agents: ['business_planner_lead', 'output_generator'],
            priority: 'critical',
            contextExtraction: ['review_status', 'revisions_needed'],
            agentPromptContext: 'Present summary for user review. Allow revisions.'
        },
        'output_formats': {
            agents: ['output_generator', 'document_generator'],
            skills: ['branded_document_generator'],
            priority: 'high',
            contextExtraction: ['output_formats', 'documents_to_generate'],
            agentPromptContext: 'Select output formats. PDF, DOCX, presentation, etc.'
        },
        'detail_level': {
            agents: ['output_generator', 'business_planner_lead'],
            skills: ['branded_document_generator'],
            priority: 'medium',
            contextExtraction: ['detail_level', 'document_length'],
            agentPromptContext: 'Executive summary vs detailed business plan.'
        },
        'purpose': {
            agents: ['output_generator', 'business_planner_lead'],
            skills: ['branded_document_generator'],
            priority: 'high',
            contextExtraction: ['document_purpose', 'audience'],
            agentPromptContext: 'Purpose determines tone and content focus. Investor vs internal.'
        },
        'ai_recommendations': {
            agents: ['business_planner_lead', 'market_analyst', 'financial_modeler'],
            priority: 'high',
            contextExtraction: ['include_recommendations', 'strategic_advice'],
            agentPromptContext: 'Generate AI-powered strategic recommendations.'
        },
        'follow_up': {
            agents: ['business_planner_lead'],
            priority: 'medium',
            contextExtraction: ['next_steps', 'action_items'],
            agentPromptContext: 'Define immediate next steps and action items.'
        },
        'contact_permission': {
            agents: ['context_collector'],
            priority: 'low',
            contextExtraction: ['marketing_consent'],
            agentPromptContext: 'Marketing and follow-up permission.'
        },
        'final_confirmation': {
            agents: ['output_generator', 'document_generator'],
            skills: ['branded_document_generator', 'financial_modeling'],
            priority: 'critical',
            contextExtraction: ['generation_confirmed'],
            agentPromptContext: 'Final confirmation. Trigger full document generation.'
        }
    }
};

// ============================================================================
// Master Configuration
// ============================================================================

export const ALL_PHASE_CONFIGS: PhaseConfig[] = [
    PHASE_1_CONFIG,
    PHASE_2_CONFIG,
    PHASE_3_CONFIG,
    PHASE_4_CONFIG,
    PHASE_5_CONFIG,
    PHASE_6_CONFIG,
    PHASE_7_CONFIG,
    PHASE_8_CONFIG,
    PHASE_9_CONFIG,
    PHASE_10_CONFIG,
    PHASE_11_CONFIG
];

/**
 * Get configuration for a specific question
 */
export function getQuestionConfig(questionId: string): QuestionConfig | undefined {
    for (const phase of ALL_PHASE_CONFIGS) {
        if (phase.questions[questionId]) {
            return phase.questions[questionId];
        }
    }
    return undefined;
}

/**
 * Get phase configuration by phase ID
 */
export function getPhaseConfig(phaseId: string): PhaseConfig | undefined {
    return ALL_PHASE_CONFIGS.find(p => p.phaseId === phaseId);
}

/**
 * Check if a question should be skipped based on current answers
 */
export function shouldSkipQuestion(questionId: string, answers: Record<string, any>): boolean {
    const config = getQuestionConfig(questionId);
    if (config?.skipIf) {
        return config.skipIf(answers);
    }
    return false;
}

/**
 * Get agents for a question (with fallback to phase defaults)
 */
export function getAgentsForQuestion(questionId: string, phaseId: string): AgentId[] {
    const questionConfig = getQuestionConfig(questionId);
    if (questionConfig?.agents && questionConfig.agents.length > 0) {
        return questionConfig.agents;
    }

    const phaseConfig = getPhaseConfig(phaseId);
    return phaseConfig?.defaultAgents || ['context_collector', 'business_planner_lead'];
}

/**
 * Get skills for a question (with fallback to phase defaults)
 */
export function getSkillsForQuestion(questionId: string, phaseId: string): SkillId[] {
    const questionConfig = getQuestionConfig(questionId);
    if (questionConfig?.skills && questionConfig.skills.length > 0) {
        return questionConfig.skills;
    }

    const phaseConfig = getPhaseConfig(phaseId);
    return phaseConfig?.defaultSkills || [];
}

/**
 * Get all branching point questions
 */
export function getBranchingPoints(): string[] {
    const branchingPoints: string[] = [];
    for (const phase of ALL_PHASE_CONFIGS) {
        for (const [questionId, config] of Object.entries(phase.questions)) {
            if (config.isBranchingPoint) {
                branchingPoints.push(questionId);
            }
        }
    }
    return branchingPoints;
}

/**
 * Get context extraction fields for a question
 */
export function getContextFields(questionId: string): string[] {
    const config = getQuestionConfig(questionId);
    return config?.contextExtraction || [];
}

console.log('✅ Question configuration loaded with', ALL_PHASE_CONFIGS.length, 'phases');
