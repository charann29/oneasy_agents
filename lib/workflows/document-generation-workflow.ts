/**
 * Document Generation Workflow
 * Orchestrates multiple agents to generate complete business plan package
 * Uses Claude API + Agent System + Skills for intelligent, deep analysis
 */

import { getClaudeAgentExecutor, AgentExecutionContext } from '@/lib/orchestrator/claude-agent-executor';
import { logger } from '@/backend/utils/logger';

export interface DocumentAnswers {
    [key: string]: any;
}

export interface GeneratedDocument {
    type: string;
    content: string;
    wordCount: number;
    charCount: number;
}

export interface WorkflowMetadata {
    agentsExecuted: string[];
    skillsInvoked: number;
    totalExecutionTimeMs: number;
    totalTokensUsed: { input: number; output: number };
}

export class DocumentGenerationWorkflow {
    private executor;

    constructor() {
        this.executor = getClaudeAgentExecutor();
        logger.info('Document Generation Workflow initialized');
    }

    /**
     * Main entry point - Generate all documents
     */
    async generateAllDocuments(
        answers: DocumentAnswers,
        sessionId?: string
    ): Promise<{ documents: GeneratedDocument[]; metadata: WorkflowMetadata }> {
        const startTime = Date.now();

        logger.info('🚀 Starting document generation workflow', { sessionId });

        try {
            // Step 1: Execute core agents to gather intelligence
            logger.info('📊 Phase 1: Executing intelligence-gathering agents...');

            const agentOutputs = await this.executeIntelligencePhase(answers, sessionId);

            // Step 2: Generate each document using agent outputs
            logger.info('📝 Phase 2: Generating documents...');

            const documents = await this.generateDocuments(answers, agentOutputs, sessionId);

            // Step 3: Calculate metadata
            const metadata = this.calculateMetadata(agentOutputs, startTime);

            logger.info('✅ Document generation workflow complete', {
                documentCount: documents.length,
                totalTimeMs: metadata.totalExecutionTimeMs
            });

            return { documents, metadata };

        } catch (error) {
            logger.error('❌ Document generation workflow failed', error);
            throw new Error(`Workflow failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Phase 1: Execute agents to gather business intelligence
     */
    private async executeIntelligencePhase(
        answers: DocumentAnswers,
        sessionId?: string
    ) {
        const context: AgentExecutionContext = {
            sessionId,
            allAnswers: answers
        };

        // Execute agents in sequence (each builds on previous)
        const agentSequence = [
            'market_analyst',      // Market analysis, TAM/SAM/SOM
            'customer_profiler',   // Customer personas
            'financial_modeler',   // Financial projections (with skill)
            'gtm_strategist'       // Go-to-market strategy
        ];

        logger.info(`Executing ${agentSequence.length} core agents in sequence...`);

        const results = await this.executor.executeAgentSequence(agentSequence, context);

        logger.info('Intelligence phase complete', {
            agentsExecuted: Object.keys(results).length
        });

        return results;
    }

    /**
     * Phase 2: Generate individual documents
     */
    private async generateDocuments(
        answers: DocumentAnswers,
        agentOutputs: any,
        sessionId?: string
    ): Promise<GeneratedDocument[]> {

        // Import document generators
        const { generateBusinessPlan } = await import('@/lib/generators/business-plan-generator');
        const { generateFinancialModel } = await import('@/lib/generators/financial-model-generator');
        const { generatePitchDeck } = await import('@/lib/generators/pitch-deck-generator');
        const { generateCompanyProfile } = await import('@/lib/generators/company-profile-generator');
        const { generateAnalysis } = await import('@/lib/generators/analysis-generator');

        const documents: GeneratedDocument[] = [];

        // Generate all documents in parallel for speed
        logger.info('Generating 5 documents in parallel...');

        const [
            companyProfile,
            businessPlan,
            financialModel,
            pitchDeck,
            analysis
        ] = await Promise.all([
            generateCompanyProfile(answers, agentOutputs),
            generateBusinessPlan(answers, agentOutputs),
            generateFinancialModel(answers, agentOutputs),
            generatePitchDeck(answers, agentOutputs),
            generateAnalysis(answers, agentOutputs)
        ]);

        // Format documents
        documents.push(this.formatDocument('company_profile', companyProfile));
        documents.push(this.formatDocument('business_plan', businessPlan));
        documents.push(this.formatDocument('financial_model', financialModel));
        documents.push(this.formatDocument('pitch_deck', pitchDeck));
        documents.push(this.formatDocument('before_after_analysis', analysis));

        logger.info('All documents generated', { count: documents.length });

        return documents;
    }

    /**
     * Format document with metadata
     */
    private formatDocument(type: string, content: string): GeneratedDocument {
        return {
            type,
            content,
            wordCount: content.split(/\s+/).length,
            charCount: content.length
        };
    }

    /**
     * Calculate workflow metadata
     */
    private calculateMetadata(agentOutputs: any, startTime: number): WorkflowMetadata {
        const agentsExecuted = Object.keys(agentOutputs);

        let skillsInvoked = 0;
        let totalInputTokens = 0;
        let totalOutputTokens = 0;

        for (const result of Object.values(agentOutputs) as any[]) {
            skillsInvoked += result.toolCallsMade?.length || 0;
            totalInputTokens += result.tokensUsed?.input || 0;
            totalOutputTokens += result.tokensUsed?.output || 0;
        }

        return {
            agentsExecuted,
            skillsInvoked,
            totalExecutionTimeMs: Date.now() - startTime,
            totalTokensUsed: {
                input: totalInputTokens,
                output: totalOutputTokens
            }
        };
    }
}

// Export singleton
let workflowInstance: DocumentGenerationWorkflow | null = null;

export function getDocumentGenerationWorkflow(): DocumentGenerationWorkflow {
    if (!workflowInstance) {
        workflowInstance = new DocumentGenerationWorkflow();
    }
    return workflowInstance;
}
