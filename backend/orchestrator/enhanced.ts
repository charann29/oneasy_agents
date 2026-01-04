/**
 * Enhanced Orchestrator with Question Configuration Integration
 * Extends the base orchestrator to use question-specific agent routing
 */

import { Orchestrator, OrchestratorConfig } from './index';
import {
    getOrchestrationForQuestion,
    processAnswer,
    buildOrchestratorContext,
    calculateTrueProgress,
    shouldSkip,
    getAgentsForQuestion,
    getSkillsForQuestion,
    AgentId,
    SkillId
} from '../../lib/orchestrator';
import { logger } from '../utils/logger';
import {
    IntentAnalysis,
    BusinessContext,
    OrchestratorResponse
} from '../utils/types';

// ============================================================================
// Types
// ============================================================================

export interface QuestionContext extends BusinessContext {
    questionId: string;
    questionText: string;
    phaseId: string;
    phaseIndex: number;
    allAnswers: Record<string, any>;
}

export interface EnhancedOrchestratorResponse extends OrchestratorResponse {
    questionConfig?: {
        shouldSkip: boolean;
        skipReason?: string;
        configuredAgents: AgentId[];
        configuredSkills: SkillId[];
        contextFields: string[];
        isBranchingPoint: boolean;
    };
}

// ============================================================================
// Enhanced Orchestrator Class
// ============================================================================

export class EnhancedOrchestrator extends Orchestrator {
    constructor(config: OrchestratorConfig) {
        super(config);
        logger.info('Enhanced Orchestrator initialized with question configuration support');
    }

    /**
     * Process request with question-specific configuration
     * This overrides the base processRequest when question context is provided
     */
    async processQuestionRequest(
        message: string,
        questionContext: QuestionContext
    ): Promise<EnhancedOrchestratorResponse> {
        const startTime = Date.now();

        try {
            const { questionId, questionText, phaseId, phaseIndex, allAnswers } = questionContext;

            logger.orchestrator('Processing question-aware request', {
                questionId,
                phaseId,
                message: message.substring(0, 100)
            });

            // Get orchestration configuration for this question
            const orchestration = getOrchestrationForQuestion({
                questionId,
                questionText,
                phaseId,
                phaseIndex,
                answers: allAnswers,
                userName: allAnswers.user_name,
                language: allAnswers.language
            });

            // If question should be skipped, return early
            if (orchestration.shouldSkip) {
                logger.info('Question skipped by skip logic', {
                    questionId,
                    reason: orchestration.skipReason
                });

                return {
                    synthesis: '',
                    agent_outputs: [],
                    execution_time_ms: Date.now() - startTime,
                    intent: {
                        goal: 'Question skipped',
                        agents: [],
                        skills: [],
                        execution_type: 'parallel',
                        reasoning: orchestration.skipReason || 'Skipped based on previous answers',
                        context_requirements: []
                    },
                    plan: {
                        tasks: [],
                        execution_type: 'parallel',
                        estimated_duration_seconds: 0
                    },
                    questionConfig: {
                        shouldSkip: true,
                        skipReason: orchestration.skipReason,
                        configuredAgents: [],
                        configuredSkills: [],
                        contextFields: [],
                        isBranchingPoint: false
                    }
                };
            }

            // Build intent from question configuration instead of LLM inference
            const configuredIntent: IntentAnalysis = {
                goal: `Process question: ${questionText}`,
                agents: orchestration.agents,
                skills: orchestration.skills,
                execution_type: 'parallel', // Use parallel for speed
                reasoning: `Agents selected from question configuration for ${questionId}`,
                context_requirements: orchestration.contextFields
            };

            logger.orchestrator('Using configured agents', {
                questionId,
                agents: configuredIntent.agents,
                skills: configuredIntent.skills
            });

            // Create execution plan from configured intent
            const plan = this.createPlan(configuredIntent);

            // Build enhanced context for execution
            const enhancedContext: BusinessContext = {
                ...questionContext,
                ...buildOrchestratorContext(allAnswers, phaseId, phaseIndex)
            };

            // Execute the plan
            const agentOutputs = await this.execute(plan, enhancedContext);

            // Synthesize results
            const synthesis = await this.synthesize(
                agentOutputs,
                message,
                questionContext.nextQuestion,
                questionContext.language || allAnswers.language
            );

            const executionTime = Date.now() - startTime;
            logger.timing('Enhanced orchestration', executionTime);

            return {
                synthesis,
                agent_outputs: agentOutputs,
                execution_time_ms: executionTime,
                intent: configuredIntent,
                plan,
                questionConfig: {
                    shouldSkip: false,
                    configuredAgents: orchestration.agents,
                    configuredSkills: orchestration.skills,
                    contextFields: orchestration.contextFields,
                    isBranchingPoint: orchestration.isBranchingPoint
                }
            };
        } catch (error) {
            logger.error('Enhanced orchestration failed', error);

            // Fall back to base orchestrator
            logger.info('Falling back to base orchestrator');
            const baseResponse = await this.processRequest(message, questionContext);
            return {
                ...baseResponse,
                questionConfig: undefined
            };
        }
    }

    /**
     * Get recommended agents for a specific question without executing
     */
    getRecommendedAgents(
        questionId: string,
        phaseId: string,
        answers: Record<string, any>
    ): { agents: AgentId[]; skills: SkillId[]; shouldSkip: boolean } {
        if (shouldSkip(questionId, answers)) {
            return { agents: [], skills: [], shouldSkip: true };
        }

        return {
            agents: getAgentsForQuestion(questionId, phaseId),
            skills: getSkillsForQuestion(questionId, phaseId),
            shouldSkip: false
        };
    }

    /**
     * Process answer and determine next question
     */
    processUserAnswer(
        questionId: string,
        answer: string,
        answers: Record<string, any>,
        allQuestions: { id: string }[],
        currentIndex: number
    ) {
        return processAnswer(questionId, answer, answers, allQuestions, currentIndex);
    }

    /**
     * Calculate progress with skip logic taken into account
     */
    getProgress(
        allQuestions: { id: string }[],
        currentIndex: number,
        answers: Record<string, any>
    ) {
        return calculateTrueProgress(allQuestions, currentIndex, answers);
    }
}

// ============================================================================
// Factory Function
// ============================================================================

let enhancedOrchestratorInstance: EnhancedOrchestrator | null = null;

export function getEnhancedOrchestrator(config?: OrchestratorConfig): EnhancedOrchestrator {
    if (!enhancedOrchestratorInstance && config) {
        enhancedOrchestratorInstance = new EnhancedOrchestrator(config);
    }

    if (!enhancedOrchestratorInstance) {
        throw new Error('Enhanced Orchestrator not initialized. Provide config on first call.');
    }

    return enhancedOrchestratorInstance;
}

export function resetEnhancedOrchestrator(): void {
    enhancedOrchestratorInstance = null;
}

console.log('✅ Enhanced orchestrator loaded');
