/**
 * Orchestrator Module - Main Export
 * Combines question config, agent prompts, and skip logic
 */

// Re-export all types and functions
export * from './question-config';
export * from './agent-prompts';
export * from './skip-logic';

// Import for orchestrator integration
import {
    getQuestionConfig,
    getAgentsForQuestion,
    getSkillsForQuestion,
    getContextFields,
    getBranchingPoints,
    AgentId,
    SkillId
} from './question-config';

import {
    generateAgentPrompt,
    getPhaseAgents,
    extractFromAnswer,
    AgentPromptContext
} from './agent-prompts';

import {
    shouldSkip,
    getSkipReason,
    getNextQuestionIndex,
    countRemainingQuestions,
    getBranchQuestions
} from './skip-logic';

// ============================================================================
// Orchestration Flow Controller
// ============================================================================

export interface OrchestrationContext {
    questionId: string;
    questionText: string;
    phaseId: string;
    phaseIndex: number;
    answers: Record<string, any>;
    userName?: string;
    language?: string;
}

export interface OrchestrationResult {
    agents: AgentId[];
    skills: SkillId[];
    shouldSkip: boolean;
    skipReason?: string;
    agentPrompts: Partial<Record<AgentId, { systemPrompt: string; userPrompt: string }>>;
    contextFields: string[];
    isBranchingPoint: boolean;
    nextQuestions?: string[];
}

/**
 * Get complete orchestration configuration for a question
 */
export function getOrchestrationForQuestion(
    context: OrchestrationContext
): OrchestrationResult {
    const { questionId, questionText, phaseId, phaseIndex, answers, userName, language } = context;

    // Check if question should be skipped
    const skip = shouldSkip(questionId, answers);
    const skipReason = skip ? getSkipReason(questionId, answers) : undefined;

    if (skip) {
        return {
            agents: [],
            skills: [],
            shouldSkip: true,
            skipReason: skipReason || 'Skipped based on previous answers',
            agentPrompts: {},
            contextFields: [],
            isBranchingPoint: false
        };
    }

    // Get agents and skills for this question
    const agents = getAgentsForQuestion(questionId, phaseId);
    const skills = getSkillsForQuestion(questionId, phaseId);
    const contextFields = getContextFields(questionId);

    // Get question config to check if branching point
    const questionConfig = getQuestionConfig(questionId);
    const isBranchingPoint = questionConfig?.isBranchingPoint || false;

    // Generate prompts for each agent
    const agentPrompts: Partial<Record<AgentId, { systemPrompt: string; userPrompt: string }>> = {};

    const promptContext: AgentPromptContext = {
        questionId,
        questionText,
        userAnswer: '', // Will be filled after user answers
        previousAnswers: answers,
        currentPhase: phaseIndex,
        phaseId,
        userName,
        language
    };

    for (const agentId of agents) {
        const prompt = generateAgentPrompt(agentId, promptContext);
        agentPrompts[agentId] = {
            systemPrompt: prompt.systemPrompt,
            userPrompt: prompt.userPrompt
        };
    }

    return {
        agents,
        skills,
        shouldSkip: false,
        agentPrompts,
        contextFields,
        isBranchingPoint
    };
}

/**
 * Process an answer and get next question info
 */
export function processAnswer(
    questionId: string,
    answer: string,
    answers: Record<string, any>,
    allQuestions: { id: string }[],
    currentIndex: number
): {
    extractedData: Record<string, any>;
    nextQuestionIndex: number;
    remainingQuestions: number;
    branchActivated?: string[];
} {
    // Extract structured data from answer
    const extractedData = extractFromAnswer(questionId, answer);

    // Update answers with the new one
    const updatedAnswers = { ...answers, [questionId]: answer };

    // Get next non-skipped question
    const nextQuestionIndex = getNextQuestionIndex(allQuestions, currentIndex + 1, updatedAnswers);

    // Count remaining questions
    const remainingQuestions = countRemainingQuestions(allQuestions, nextQuestionIndex, updatedAnswers);

    // Check if this was a branching point
    const config = getQuestionConfig(questionId);
    let branchActivated: string[] | undefined;

    if (config?.isBranchingPoint) {
        branchActivated = getBranchQuestions(questionId, answer);
    }

    return {
        extractedData,
        nextQuestionIndex,
        remainingQuestions,
        branchActivated
    };
}

// ============================================================================
// Helper Functions for Integration
// ============================================================================

/**
 * Build context object for orchestrator from answers
 */
export function buildOrchestratorContext(
    answers: Record<string, any>,
    phaseId: string,
    phaseIndex: number
): Record<string, any> {
    const context: Record<string, any> = {
        currentPhase: phaseIndex,
        phaseId,
        allAnswers: answers
    };

    // Add commonly needed fields directly
    if (answers.language) context.language = answers.language;
    if (answers.user_name) context.userName = answers.user_name;
    if (answers.business_path) context.businessPath = answers.business_path;
    if (answers.customer_type) context.customerType = answers.customer_type;
    if (answers.business_model_type) context.businessModelType = answers.business_model_type;
    if (answers.risk_tolerance) context.riskTolerance = answers.risk_tolerance;

    return context;
}

/**
 * Get all branching points that have been answered
 */
export function getActiveBranches(answers: Record<string, any>): Record<string, string> {
    const branchingPointIds = getBranchingPoints();
    const activeBranches: Record<string, string> = {};

    for (const pointId of branchingPointIds) {
        if (answers[pointId]) {
            activeBranches[pointId] = answers[pointId];
        }
    }

    return activeBranches;
}

/**
 * Calculate completion percentage considering skip logic
 */
export function calculateTrueProgress(
    allQuestions: { id: string }[],
    currentIndex: number,
    answers: Record<string, any>
): {
    answered: number;
    total: number;
    percentage: number;
    skipped: number;
} {
    let answered = 0;
    let skipped = 0;

    for (let i = 0; i < currentIndex && i < allQuestions.length; i++) {
        const question = allQuestions[i];
        if (shouldSkip(question.id, answers)) {
            skipped++;
        } else if (answers[question.id] !== undefined) {
            answered++;
        }
    }

    // Count remaining non-skipped questions
    const remaining = countRemainingQuestions(allQuestions, currentIndex, answers);
    const total = answered + remaining;
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;

    return { answered, total, percentage, skipped };
}

console.log('✅ Orchestrator module loaded');
