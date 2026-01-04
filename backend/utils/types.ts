/**
 * Core Type Definitions for AI Orchestrator System
 */

// ============================================================================
// Agent Types
// ============================================================================

export interface Agent {
    id: string;
    name: string;
    description: string;
    model: string;
    system_prompt: string;
    skills: string[];
    tools: string[];
    temperature: number;
    context_window: number;
    phase?: string;
    persona?: string;
}

// ============================================================================
// Skill Types
// ============================================================================

export interface Skill {
    id: string;
    name: string;
    description: string;
    execute: (params: any) => Promise<any>;
    getToolDefinition: () => ToolDefinition;
}

export interface ToolDefinition {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: Record<string, any>;
            required: string[];
        };
    };
}

// ============================================================================
// Orchestrator Types
// ============================================================================

export interface IntentAnalysis {
    goal: string;
    agents: string[]; // Agent IDs needed
    skills: string[]; // Skill IDs needed
    execution_type: 'parallel' | 'sequential';
    reasoning: string;
    context_requirements: string[];
}

export interface ExecutionPlan {
    tasks: Task[];
    execution_type: 'parallel' | 'sequential';
    estimated_duration_seconds: number;
}

export interface Task {
    id: string;
    agent_id: string;
    agent_name: string;
    description: string;
    skills: string[];
    context: any;
    dependencies: string[]; // Task IDs that must complete first
    priority: number;
}

export interface AgentOutput {
    task_id: string;
    agent_id: string;
    agent_name: string;
    output: string;
    skills_used: string[];
    tool_calls: ToolCall[];
    execution_time_ms: number;
    success: boolean;
    error?: string;
}

export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}

export interface ToolCallResult {
    tool_call_id: string;
    role: 'tool';
    name: string;
    content: string;
}

export interface OrchestratorResponse {
    synthesis: string;
    agent_outputs: AgentOutput[];
    execution_time_ms: number;
    intent: IntentAnalysis;
    plan: ExecutionPlan;
}

// ============================================================================
// Groq API Types
// ============================================================================

export interface GroqMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
    name?: string;
}

export interface GroqChatCompletionRequest {
    model: string;
    messages: GroqMessage[];
    temperature?: number;
    max_tokens?: number;
    tools?: ToolDefinition[];
    tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

export interface GroqChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: GroqMessage;
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// ============================================================================
// Context Types
// ============================================================================

export interface BusinessContext {
    business_id?: string;
    user_id?: string;
    session_id?: string;
    business_name?: string;
    industry?: string;
    stage?: string;
    currentPhase?: number;
    location?: string;
    language?: string; // e.g. 'en-US', 'hi-IN'
    allAnswers?: Record<string, any>;
    previous_responses?: Record<string, any>;
    accumulated_data?: Record<string, any>;
    nextQuestion?: { question: string; type: string; options?: any[] };
    requestType?: 'suggestion' | 'answer' | 'general';
}

// ============================================================================
// Skill Input/Output Types
// ============================================================================

export interface FinancialModelingInput {
    revenue_data: {
        products: Array<{
            name: string;
            initial_quantity_m1: number;
            avg_price: number;
            growth_rates_m: number[];
            growth_rates_y: number[];
            cogs_percentage: number;
            churn_rate?: number;
        }>;
    };
    cost_structure: {
        opex_percentages: {
            sales_marketing: Record<string, number>;
            research_development: Record<string, number>;
            general_administrative: Record<string, number>;
        };
    };
    projection_period: {
        years: number;
        detail_level: 'monthly_year1_annual' | 'monthly_all' | 'annual';
    };
    assumptions: {
        tax_rate: number;
        starting_cash: number;
        payment_terms_days: number;
    };
}

export interface FinancialModelingOutput {
    revenue: {
        year_1_monthly: number[];
        years_2_7_annual: number[];
        total_y1: number;
        total_y5: number;
    };
    gross_profit: {
        year_1_monthly: number[];
        margin_pct_y1: number;
        margin_pct_y5: number;
    };
    ebitda: {
        break_even_month: number;
        year_1_avg_margin: number;
        year_5_margin: number;
    };
    summary_metrics: {
        total_capital_required: number;
        peak_burn_rate: number;
        break_even_month: number;
        profitability_month: number;
        cagr_y1_y5: number;
    };
    saas_metrics?: {
        arr_y5: number;
        rule_of_40_y5: number;
    };
    validation_results: {
        pass: boolean;
        warnings: string[];
        errors: string[];
    };
}

export interface MarketSizingInput {
    industry: string;
    geography: string;
    target_segment: string;
    approach: 'top_down' | 'bottom_up' | 'both';
}

export interface MarketSizingOutput {
    tam: number;
    sam: number;
    som: number;
    methodology: string;
    assumptions: string[];
    confidence_level: 'high' | 'medium' | 'low';
}

export interface CompetitorAnalysisInput {
    industry: string;
    competitors: string[];
    analysis_depth: 'basic' | 'detailed';
}

export interface CompetitorAnalysisOutput {
    competitors: Array<{
        name: string;
        strengths: string[];
        weaknesses: string[];
        market_share?: number;
        positioning: string;
    }>;
    competitive_advantages: string[];
    threats: string[];
}

export interface ComplianceCheckInput {
    industry: string;
    location: string;
    business_type: string;
}

export interface ComplianceCheckOutput {
    required_licenses: string[];
    required_permits: string[];
    compliance_risks: string[];
    recommendations: string[];
}

export interface BrandedDocumentGeneratorInput {
    document_type: 'business_plan' | 'financial_model' | 'investor_deck' | 'executive_summary';
    content: any;
    business_name: string;
    brand_identity?: {
        logo_url?: string;
        colors?: string[];
        font_family?: string;
    };
    format: 'pdf' | 'docx' | 'markdown';
}

export interface BrandedDocumentGeneratorOutput {
    document_id: string;
    document_url: string;
    format: string;
    page_count?: number;
    status: 'generated' | 'failed';
    generated_at: string;
}


// ============================================================================
// Error Types
// ============================================================================

export class OrchestratorError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: any
    ) {
        super(message);
        this.name = 'OrchestratorError';
    }
}

export class AgentExecutionError extends Error {
    constructor(
        message: string,
        public agentId: string,
        public details?: any
    ) {
        super(message);
        this.name = 'AgentExecutionError';
    }
}

export class SkillExecutionError extends Error {
    constructor(
        message: string,
        public skillId: string,
        public details?: any
    ) {
        super(message);
        this.name = 'SkillExecutionError';
    }
}
