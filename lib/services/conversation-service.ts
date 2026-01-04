/**
 * Conversation Service
 * Manages conversational interactions with Abhishek CA
 * Handles state management, phase tracking, and data extraction
 */

import { getAgentManager } from '@/backend/agents/manager';
import { Orchestrator } from '@/backend/orchestrator';
import { DatabaseService } from './database-service';

// Conversation phases matching Abhishek CA's system prompt
export type ConversationPhase =
  | 'getting_to_know'      // Phase 1: Personal background
  | 'business_idea'        // Phase 2: Understanding the idea
  | 'market_customers'     // Phase 3: Market & customers
  | 'business_model'       // Phase 4: Revenue model
  | 'operations_team'      // Phase 5: Operations
  | 'gtm_growth'          // Phase 6: Go-to-market
  | 'funding_resources'    // Phase 7: Funding
  | 'risks_strategy'       // Phase 8: Risks
  | 'final_review'         // Final: Review before plan generation
  | 'completed';           // Conversation completed

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    phase?: ConversationPhase;
    dataExtracted?: Record<string, any>;
    confidence?: 'high' | 'medium' | 'low';
  };
}

export interface ConversationState {
  conversationId: string;
  userId: string;
  phase: ConversationPhase;
  messages: ConversationMessage[];
  extractedData: Record<string, any>;
  progress: number; // 0-100
  startedAt: number;
  lastActiveAt: number;
  completedAt?: number;
}

export interface ChatRequest {
  conversationId?: string; // Optional for continuing conversation
  userId: string;
  message: string;
  // Optional: For structured questionnaire mode
  currentQuestionId?: string;
  currentPhaseId?: string;
  questionContext?: {
    questionText: string;
    questionType: string;
    phaseName: string;
  };
}

export interface ChatResponse {
  conversationId: string;
  message: string;
  phase: ConversationPhase;
  progress: number;
  extractedData?: Record<string, any>;
  suggestedActions?: string[];
  isComplete: boolean;
}

export class ConversationService {
  private orchestrator: Orchestrator;
  private db: DatabaseService;
  private agentManager: ReturnType<typeof getAgentManager>;

  constructor() {
    const groqApiKey = process.env.GROQ_API_KEY || '';
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }

    this.orchestrator = new Orchestrator({ groqApiKey });
    this.db = new DatabaseService();
    this.agentManager = getAgentManager();
  }

  /**
   * Main entry point for chat interactions
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Load or create conversation state
    let state = await this.getOrCreateConversation(request.conversationId, request.userId);

    // Add user message to history
    state.messages.push({
      role: 'user',
      content: request.message,
      timestamp: Date.now()
    });

    // Build context for Abhishek CA agent
    const conversationContext = this.buildConversationContext(state);

    // Get response from Abhishek CA
    const agentResponse = await this.getAbhishekResponse(
      request.message,
      conversationContext,
      state,
      request.questionContext
    );

    // Extract structured data from conversation
    const extractedData = this.extractStructuredData(
      request.message,
      agentResponse,
      state
    );

    // Update state with extracted data
    if (Object.keys(extractedData).length > 0) {
      state.extractedData = { ...state.extractedData, ...extractedData };
    }

    // Determine current phase and progress
    const phaseUpdate = this.determinePhaseAndProgress(state);
    state.phase = phaseUpdate.phase;
    state.progress = phaseUpdate.progress;

    // Add assistant message to history
    state.messages.push({
      role: 'assistant',
      content: agentResponse,
      timestamp: Date.now(),
      metadata: {
        phase: state.phase,
        dataExtracted: extractedData,
        confidence: this.calculateConfidence(extractedData)
      }
    });

    // Update last active timestamp
    state.lastActiveAt = Date.now();

    // Check if conversation is complete
    const isComplete = state.phase === 'completed' || state.progress >= 100;
    if (isComplete && !state.completedAt) {
      state.completedAt = Date.now();
    }

    // Save conversation state
    await this.saveConversation(state);

    // If complete, trigger business plan generation
    let businessPlanId: string | undefined;
    if (isComplete) {
      businessPlanId = await this.generateBusinessPlan(state);
    }

    return {
      conversationId: state.conversationId,
      message: agentResponse,
      phase: state.phase,
      progress: state.progress,
      extractedData: Object.keys(extractedData).length > 0 ? extractedData : undefined,
      suggestedActions: this.getSuggestedActions(state),
      isComplete
    };
  }

  /**
   * Get or create conversation state
   */
  private async getOrCreateConversation(
    conversationId: string | undefined,
    userId: string
  ): Promise<ConversationState> {
    if (conversationId) {
      const existing = await this.db.getConversation(conversationId);
      if (existing) {
        // Cast the phase string to ConversationPhase
        return {
          ...existing,
          phase: existing.phase as ConversationPhase
        };
      }
    }

    // Create new conversation
    const newState: ConversationState = {
      conversationId: this.generateConversationId(),
      userId,
      phase: 'getting_to_know',
      messages: [],
      extractedData: {},
      progress: 0,
      startedAt: Date.now(),
      lastActiveAt: Date.now()
    };

    // Add initial greeting from Abhishek
    newState.messages.push({
      role: 'assistant',
      content: this.getInitialGreeting(),
      timestamp: Date.now(),
      metadata: { phase: 'getting_to_know' }
    });

    return newState;
  }

  /**
   * Build conversation context for agent
   */
  private buildConversationContext(state: ConversationState): string {
    const recentMessages = state.messages.slice(-10); // Last 10 messages
    const conversationHistory = recentMessages
      .map(m => `${m.role === 'user' ? 'User' : 'Abhishek'}: ${m.content}`)
      .join('\n\n');

    const extractedDataSummary = Object.keys(state.extractedData).length > 0
      ? `\n\nExtracted Data So Far:\n${JSON.stringify(state.extractedData, null, 2)}`
      : '';

    return `Current Phase: ${state.phase}
Progress: ${state.progress}%

Recent Conversation:
${conversationHistory}
${extractedDataSummary}`;
  }

  /**
   * Get response from Abhishek CA agent
   */
  private async getAbhishekResponse(
    userMessage: string,
    conversationContext: string,
    state: ConversationState,
    questionContext?: { questionText: string; questionType: string; phaseName: string }
  ): Promise<string> {
    console.log('[Abhishek] Looking for abhishek_ca agent...');
    console.log('[Abhishek] Available agents:', this.agentManager.getAllAgents().map(a => a.id));

    const abhishekAgent = this.agentManager.getAgent('abhishek_ca');

    if (!abhishekAgent) {
      console.error('[Abhishek] Agent not found! Available:', this.agentManager.getAllAgents().map(a => a.id));
      throw new Error('Abhishek CA agent not found');
    }

    console.log('[Abhishek] Found agent:', abhishekAgent.id, abhishekAgent.name);

    // Build prompt for Abhishek with his system prompt
    const systemPrompt = abhishekAgent.system_prompt;

    if (!systemPrompt) {
      console.error('[Abhishek] No system prompt found in agent definition');
      throw new Error('Abhishek CA system prompt is missing');
    }

    // Build user prompt with optional question context for structured questionnaire mode
    let userPrompt = `${conversationContext}

User's latest message: "${userMessage}"

You are currently in the "${state.phase}" phase.`;

    if (questionContext) {
      // Structured questionnaire mode - guide agent to ask specific  question conversationally
      userPrompt += `

IMPORTANT - Structured Questionnaire Mode:
- You just received answer to: "${questionContext.questionText}"
- Current phase: ${questionContext.phaseName}
- Acknowledge their answer warmly and personally
- Then ask the NEXT question from the questionnaire naturally
- Make it feel like a conversation, not an interrogation
- Keep your response concise (2-3 sentences max)

Your response should:
1. Acknowledge what they shared ("Great!", "Thanks for that!", "Perfect!")
2. Bridge to next topic if needed
3. Ask the next question conversationally`;
    } else {
      // Free-form conversation mode
      userPrompt += ` Based on the conversation so far and the data you've extracted, respond naturally as Abhishek CA. Remember:
- Ask 1-2 questions at a time
- Acknowledge what the user just shared
- Show genuine interest and enthusiasm
- Extract structured data naturally
- Guide the conversation toward the next phase when appropriate`;
    }

    userPrompt += `

Your response:`;

    try {
      // Directly call Groq with Abhishek's system prompt
      const Groq = require('groq-sdk').default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      console.log('[Abhishek] Calling Groq API with model:', abhishekAgent.model);
      console.log('[Abhishek] System prompt length:', systemPrompt.length);
      console.log('[Abhishek] User message:', userMessage.substring(0, 100));

      const completion = await groq.chat.completions.create({
        model: abhishekAgent.model || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: abhishekAgent.temperature || 0.7,
        max_tokens: 1000
      });

      console.log('[Abhishek] Got response:', completion.choices[0]?.message?.content?.substring(0, 100));

      const response = completion.choices[0]?.message?.content?.trim();

      if (!response) {
        console.error('[Abhishek] No response content from Groq');
        return 'I apologize, I had trouble processing that. Could you please rephrase?';
      }

      return response;
    } catch (error: any) {
      console.error('[Abhishek] Error getting response:', error.message);
      console.error('[Abhishek] Error stack:', error.stack);
      return 'I apologize for the confusion. Let me try again. Could you tell me more about that?';
    }
  }

  /**
   * Extract structured data from conversation
   */
  private extractStructuredData(
    userMessage: string,
    agentResponse: string,
    state: ConversationState
  ): Record<string, any> {
    const extracted: Record<string, any> = {};

    // Phase-specific extraction patterns
    switch (state.phase) {
      case 'getting_to_know':
        // Extract name, background, education, experience
        if (!state.extractedData.user_name) {
          const nameMatch = userMessage.match(/(?:my name is|i'm|i am)\s+([a-z]+(?:\s+[a-z]+)?)/i);
          if (nameMatch) extracted.user_name = nameMatch[1];
        }

        if (!state.extractedData.education) {
          const eduMatch = userMessage.match(/(degree|bachelor|master|phd|mba|ca|cpa|graduate)/i);
          if (eduMatch) extracted.education = userMessage;
        }

        if (!state.extractedData.current_employment) {
          const empMatch = userMessage.match(/(work at|employed at|working as|job at|position at)/i);
          if (empMatch) extracted.current_employment = userMessage;
        }
        break;

      case 'business_idea':
        // Extract business idea, problem, solution
        if (!state.extractedData.business_idea) {
          const ideaMatch = userMessage.match(/(business|startup|company|product|service|platform)/i);
          if (ideaMatch && userMessage.length > 20) {
            extracted.business_idea = userMessage;
          }
        }

        if (!state.extractedData.problem_solved) {
          const problemMatch = userMessage.match(/(problem|issue|challenge|pain point|difficulty)/i);
          if (problemMatch) extracted.problem_solved = userMessage;
        }
        break;

      case 'market_customers':
        // Extract target customer, market size, competitors
        if (!state.extractedData.target_customer) {
          const customerMatch = userMessage.match(/(customers|users|clients|buyers|businesses|companies)/i);
          if (customerMatch) extracted.target_customer = userMessage;
        }

        if (!state.extractedData.geography) {
          const geoMatch = userMessage.match(/(local|national|global|international|([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?))/);
          if (geoMatch) extracted.geography = geoMatch[0];
        }
        break;

      case 'business_model':
        // Extract revenue model, pricing
        if (!state.extractedData.revenue_model) {
          const revenueMatch = userMessage.match(/(subscription|commission|licensing|advertising|freemium|one-time)/i);
          if (revenueMatch) extracted.revenue_model = userMessage;
        }

        if (!state.extractedData.pricing) {
          const priceMatch = userMessage.match(/\$?\d+(?:,\d{3})*(?:\.\d{2})?(?:\s*(?:per|\/)\s*(?:month|year|user|license))?/i);
          if (priceMatch) extracted.pricing = priceMatch[0];
        }
        break;

      case 'operations_team':
        // Extract team size, key roles
        if (!state.extractedData.team_size) {
          const teamMatch = userMessage.match(/(\d+)\s*(?:people|employees|team members|person)/i);
          if (teamMatch) extracted.team_size = teamMatch[1];
        }
        break;

      case 'gtm_growth':
        // Extract marketing channels, customer acquisition
        if (!state.extractedData.marketing_channels) {
          const channelMatch = userMessage.match(/(social media|seo|content|ads|email|referrals|partnerships)/i);
          if (channelMatch) {
            extracted.marketing_channels = extracted.marketing_channels || [];
            extracted.marketing_channels.push(channelMatch[0]);
          }
        }
        break;

      case 'funding_resources':
        // Extract funding needs, current capital
        if (!state.extractedData.funding_needed) {
          const fundingMatch = userMessage.match(/\$?\d+(?:,\d{3})*(?:\.\d{2})?(?:\s*(?:k|m|million|thousand))?/i);
          if (fundingMatch) extracted.funding_needed = fundingMatch[0];
        }
        break;

      case 'risks_strategy':
        // Extract risks, mitigation strategies
        if (!state.extractedData.key_risks) {
          extracted.key_risks = extracted.key_risks || [];
          if (userMessage.length > 20) {
            extracted.key_risks.push(userMessage);
          }
        }
        break;
    }

    return extracted;
  }

  /**
   * Determine current phase and progress
   */
  private determinePhaseAndProgress(state: ConversationState): {
    phase: ConversationPhase;
    progress: number;
  } {
    const phaseOrder: ConversationPhase[] = [
      'getting_to_know',
      'business_idea',
      'market_customers',
      'business_model',
      'operations_team',
      'gtm_growth',
      'funding_resources',
      'risks_strategy',
      'final_review',
      'completed'
    ];

    // Define required fields per phase
    const phaseRequirements: Record<ConversationPhase, string[]> = {
      getting_to_know: ['user_name', 'education'],
      business_idea: ['business_idea', 'problem_solved'],
      market_customers: ['target_customer', 'geography'],
      business_model: ['revenue_model', 'pricing'],
      operations_team: ['team_size'],
      gtm_growth: ['marketing_channels'],
      funding_resources: ['funding_needed'],
      risks_strategy: ['key_risks'],
      final_review: [],
      completed: []
    };

    // Check which phases are complete
    let currentPhase = state.phase;
    let completedPhases = 0;

    for (const phase of phaseOrder) {
      if (phase === 'final_review' || phase === 'completed') break;

      const requirements = phaseRequirements[phase];
      const isComplete = requirements.every(field => state.extractedData[field]);

      if (isComplete) {
        completedPhases++;
        // Move to next phase if current phase is complete
        const currentIndex = phaseOrder.indexOf(currentPhase);
        const phaseIndex = phaseOrder.indexOf(phase);
        if (phaseIndex === currentIndex) {
          currentPhase = phaseOrder[phaseIndex + 1];
        }
      } else {
        break; // Stop at first incomplete phase
      }
    }

    // Calculate progress (8 main phases)
    const totalPhases = 8;
    const progress = Math.min(100, Math.round((completedPhases / totalPhases) * 100));

    // Move to final review if all phases complete
    if (completedPhases >= totalPhases && currentPhase !== 'final_review' && currentPhase !== 'completed') {
      currentPhase = 'final_review';
    }

    return { phase: currentPhase, progress };
  }

  /**
   * Calculate confidence score for extracted data
   */
  private calculateConfidence(extractedData: Record<string, any>): 'high' | 'medium' | 'low' {
    const keys = Object.keys(extractedData);
    if (keys.length === 0) return 'low';
    if (keys.length >= 3) return 'high';
    return 'medium';
  }

  /**
   * Save conversation state to database
   */
  private async saveConversation(state: ConversationState): Promise<void> {
    await this.db.saveConversation(state);
  }

  /**
   * Generate business plan when conversation is complete
   */
  private async generateBusinessPlan(state: ConversationState): Promise<string> {
    // Transform extracted data into BusinessPlanRequest format
    const businessPlanRequest = {
      businessName: state.extractedData.business_idea || 'Untitled Business',
      industry: this.inferIndustry(state.extractedData),
      stage: 'startup' as const,
      targetMarket: state.extractedData.target_customer || 'General market',
      location: state.extractedData.geography || 'United States',
      description: state.extractedData.problem_solved || state.extractedData.business_idea
    };

    // Create comprehensive business plan using existing service
    const BusinessPlannerService = require('./business-planner-service').BusinessPlannerService;
    const plannerService = new BusinessPlannerService();

    try {
      const result = await plannerService.createBusinessPlan(
        state.userId,
        businessPlanRequest
      );

      // Link conversation to business plan
      await this.db.linkConversationToPlan(state.conversationId, result.planId);

      return result.planId;
    } catch (error) {
      console.error('Error generating business plan:', error);
      throw error;
    }
  }

  /**
   * Get suggested actions based on conversation state
   */
  private getSuggestedActions(state: ConversationState): string[] {
    const suggestions: string[] = [];

    if (state.phase === 'final_review') {
      suggestions.push('Review your responses');
      suggestions.push('Generate business plan');
      suggestions.push('Make corrections');
    } else if (state.progress > 0) {
      suggestions.push('Continue conversation');
      suggestions.push('Take a break');
      suggestions.push('Skip to specific phase');
    }

    return suggestions;
  }

  /**
   * Initial greeting from Abhishek
   */
  private getInitialGreeting(): string {
    return `Hi! I'm Abhishek, and I'm a Chartered Accountant who helps entrepreneurs like you build strong business foundations.

Over the next 30-40 minutes, we'll have a casual conversation about your business idea. I'll ask you questions, and together we'll create a comprehensive business plan with financial projections, market analysis, and a clear roadmap.

There's no right or wrong answers here - I just want to understand your vision and help bring it to life. Sound good?

Let's start simple - what's your name, and what brings you here today?`;
  }

  /**
   * Generate unique conversation ID
   */
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Infer industry from extracted data
   */
  private inferIndustry(data: Record<string, any>): string {
    const text = JSON.stringify(data).toLowerCase();

    if (text.includes('saas') || text.includes('software') || text.includes('app')) {
      return 'SaaS';
    } else if (text.includes('ecommerce') || text.includes('retail') || text.includes('store')) {
      return 'E-commerce';
    } else if (text.includes('health') || text.includes('medical') || text.includes('healthcare')) {
      return 'Healthcare';
    } else if (text.includes('fintech') || text.includes('finance') || text.includes('banking')) {
      return 'FinTech';
    } else if (text.includes('education') || text.includes('learning') || text.includes('course')) {
      return 'EdTech';
    }

    return 'Technology';
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<ConversationState | null> {
    const dbResult = await this.db.getConversation(conversationId);
    if (!dbResult) return null;
    // Cast the phase string to ConversationPhase
    return {
      ...dbResult,
      phase: dbResult.phase as ConversationPhase
    };
  }

  /**
   * List all conversations for a user
   */
  async listConversations(userId: string, limit: number = 10, offset: number = 0): Promise<ConversationState[]> {
    const dbResults = await this.db.listConversations(userId, limit, offset);
    // Cast the phase string to ConversationPhase for each result
    return dbResults.map(result => ({
      ...result,
      phase: result.phase as ConversationPhase
    }));
  }
}
