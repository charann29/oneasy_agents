/**
 * Business Planner Service
 * Orchestrates business planning workflows with proper business logic
 */

import { Orchestrator } from '@/backend/orchestrator';
import { BusinessContext, OrchestratorResponse } from '@/backend/utils/types';
import { logger } from '@/backend/utils/logger';
import { DatabaseService } from './database-service';
import { v4 as uuidv4 } from 'uuid';

export interface BusinessPlanRequest {
  businessName: string;
  industry: string;
  stage: 'idea' | 'startup' | 'growing' | 'established';
  targetMarket: string;
  location: string;
  description?: string;
  revenue?: string;
  teamSize?: number;
  fundingGoal?: number;
}

export interface BusinessPlanResult {
  sessionId: string;
  planId: string;
  synthesis: string;
  agentOutputs: any[];
  metrics: {
    executionTime: number;
    agentsUsed: number;
    skillsExecuted: string[];
  };
  status: 'completed' | 'failed';
  createdAt: string;
}

export class BusinessPlannerService {
  private orchestrator: Orchestrator;
  private db: DatabaseService;

  constructor() {
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    this.orchestrator = new Orchestrator({
      groqApiKey,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      maxTokens: 8000
    });

    this.db = new DatabaseService();
  }

  /**
   * Create a comprehensive business plan
   */
  async createBusinessPlan(
    userId: string,
    request: BusinessPlanRequest
  ): Promise<BusinessPlanResult> {
    const startTime = Date.now();
    const sessionId = uuidv4();

    try {
      logger.info('Creating business plan', { userId, sessionId });

      // 1. Validate input
      this.validateRequest(request);

      // 2. Create session in database
      await this.db.createSession({
        id: sessionId,
        userId,
        type: 'business_plan',
        status: 'processing',
        input: request,
        createdAt: new Date()
      });

      // 3. Build message for orchestrator
      const message = this.buildMessage(request);
      const context = this.buildContext(request);

      logger.info('Calling orchestrator', { sessionId, message: message.substring(0, 100) });

      // 4. Call orchestrator
      const orchestratorResult = await this.orchestrator.processRequest(message, context);

      // 5. Extract metrics
      const metrics = this.extractMetrics(orchestratorResult);

      // 6. Create business plan record
      const planId = await this.db.createBusinessPlan({
        id: uuidv4(),
        sessionId,
        userId,
        businessName: request.businessName,
        industry: request.industry,
        synthesis: orchestratorResult.synthesis,
        agentOutputs: orchestratorResult.agent_outputs,
        metrics,
        status: 'completed',
        createdAt: new Date()
      });

      // 7. Update session status
      await this.db.updateSession(sessionId, {
        status: 'completed',
        completedAt: new Date(),
        executionTimeMs: Date.now() - startTime
      });

      logger.info('Business plan created successfully', { sessionId, planId });

      return {
        sessionId,
        planId,
        synthesis: orchestratorResult.synthesis,
        agentOutputs: orchestratorResult.agent_outputs,
        metrics,
        status: 'completed',
        createdAt: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Business plan creation failed', error);

      // Update session with error
      await this.db.updateSession(sessionId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      });

      throw error;
    }
  }

  /**
   * Run market analysis
   */
  async runMarketAnalysis(
    userId: string,
    industry: string,
    geography: string,
    targetSegment: string
  ): Promise<any> {
    const sessionId = uuidv4();

    logger.info('Running market analysis', { userId, sessionId, industry });

    await this.db.createSession({
      id: sessionId,
      userId,
      type: 'market_analysis',
      status: 'processing',
      input: { industry, geography, targetSegment },
      createdAt: new Date()
    });

    const message = `Perform comprehensive market analysis for the ${industry} industry in ${geography}, focusing on the ${targetSegment} segment.`;

    const context: BusinessContext = {
      session_id: sessionId,
      user_id: userId,
      industry,
      location: geography
    };

    const result = await this.orchestrator.processRequest(message, context);

    await this.db.updateSession(sessionId, {
      status: 'completed',
      completedAt: new Date()
    });

    return {
      sessionId,
      analysis: result.synthesis,
      agentOutputs: result.agent_outputs,
      metrics: this.extractMetrics(result)
    };
  }

  /**
   * Generate financial model
   */
  async generateFinancialModel(
    userId: string,
    businessData: any
  ): Promise<any> {
    const sessionId = uuidv4();

    logger.info('Generating financial model', { userId, sessionId });

    await this.db.createSession({
      id: sessionId,
      userId,
      type: 'financial_model',
      status: 'processing',
      input: businessData,
      createdAt: new Date()
    });

    const message = `Create a comprehensive 7-year financial model for ${businessData.businessName} including revenue projections, cost structure, profitability analysis, and key metrics.`;

    const context: BusinessContext = {
      session_id: sessionId,
      user_id: userId,
      business_name: businessData.businessName,
      industry: businessData.industry,
      stage: businessData.stage
    };

    const result = await this.orchestrator.processRequest(message, context);

    await this.db.updateSession(sessionId, {
      status: 'completed',
      completedAt: new Date()
    });

    return {
      sessionId,
      financialModel: result.synthesis,
      agentOutputs: result.agent_outputs,
      metrics: this.extractMetrics(result)
    };
  }

  /**
   * Get business plan by ID
   */
  async getBusinessPlan(userId: string, planId: string): Promise<any> {
    const plan = await this.db.getBusinessPlan(planId);

    if (!plan) {
      throw new Error('Business plan not found');
    }

    if (plan.userId !== userId) {
      throw new Error('Unauthorized access to business plan');
    }

    return plan;
  }

  /**
   * List user's business plans
   */
  async listBusinessPlans(userId: string, limit = 10, offset = 0): Promise<any> {
    return await this.db.listBusinessPlans(userId, limit, offset);
  }

  /**
   * Get session status
   */
  async getSessionStatus(userId: string, sessionId: string): Promise<any> {
    const session = await this.db.getSession(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.userId !== userId) {
      throw new Error('Unauthorized access to session');
    }

    return session;
  }

  /**
   * Private helper methods
   */

  private validateRequest(request: BusinessPlanRequest): void {
    if (!request.businessName || request.businessName.length < 2) {
      throw new Error('Business name is required');
    }

    if (!request.industry || request.industry.length < 2) {
      throw new Error('Industry is required');
    }

    if (!['idea', 'startup', 'growing', 'established'].includes(request.stage)) {
      throw new Error('Invalid business stage');
    }

    if (!request.targetMarket) {
      throw new Error('Target market is required');
    }

    if (!request.location) {
      throw new Error('Location is required');
    }
  }

  private buildMessage(request: BusinessPlanRequest): string {
    return `Create a comprehensive business plan for ${request.businessName}, a ${request.stage} stage business in the ${request.industry} industry.

The business targets ${request.targetMarket} in ${request.location}.

${request.description ? `Business Description: ${request.description}` : ''}

${request.revenue ? `Current Revenue: ${request.revenue}` : ''}

${request.teamSize ? `Team Size: ${request.teamSize}` : ''}

${request.fundingGoal ? `Funding Goal: $${request.fundingGoal.toLocaleString()}` : ''}

Please provide:
1. Market analysis and opportunity assessment
2. Competitive landscape analysis
3. Target customer profiles and personas
4. Revenue model and pricing strategy
5. 7-year financial projections
6. Unit economics (CAC, LTV, margins)
7. Go-to-market strategy
8. Operational plan and team structure
9. Funding strategy and requirements
10. Legal structure recommendations`;
  }

  private buildContext(request: BusinessPlanRequest): BusinessContext {
    return {
      business_name: request.businessName,
      industry: request.industry,
      stage: request.stage,
      location: request.location,
      accumulated_data: {
        target_market: request.targetMarket,
        description: request.description,
        revenue: request.revenue,
        team_size: request.teamSize,
        funding_goal: request.fundingGoal
      }
    };
  }

  private extractMetrics(result: OrchestratorResponse): any {
    const skillsExecuted = new Set<string>();

    result.agent_outputs.forEach(output => {
      output.skills_used.forEach(skill => skillsExecuted.add(skill));
    });

    return {
      executionTime: result.execution_time_ms,
      agentsUsed: result.agent_outputs.length,
      skillsExecuted: Array.from(skillsExecuted),
      totalAgents: result.intent.agents.length,
      executionType: result.plan.execution_type
    };
  }
}
