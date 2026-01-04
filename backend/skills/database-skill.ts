/**
 * Database Management Skill
 * Allows agents to store and retrieve session data, conversations, and business plans
 */

import { getSessionStorage, SessionData, Message, AgentActivity } from '../services/session-storage';

export interface DatabaseSkillParams {
    operation: 'save_answer' | 'get_session' | 'update_session' | 'log_activity' | 'save_plan' | 'get_answers';
    sessionId?: string;
    userId?: string;
    questionId?: string;
    answer?: any;
    updates?: Partial<SessionData>;
    activity?: AgentActivity;
    planType?: string;
    planContent?: any;
}

export interface DatabaseSkillResult {
    success: boolean;
    data?: any;
    error?: string;
}

/**
 * Execute database operations
 */
export async function executeDatabaseSkill(params: DatabaseSkillParams): Promise<DatabaseSkillResult> {
    const storage = getSessionStorage();

    try {
        switch (params.operation) {
            case 'save_answer':
                if (!params.sessionId || !params.questionId) {
                    return { success: false, error: 'Missing sessionId or questionId' };
                }
                await storage.saveAnswer(params.sessionId, params.questionId, params.answer);
                return { success: true, data: { saved: true, questionId: params.questionId } };

            case 'get_session':
                if (params.sessionId) {
                    const session = await storage.getSession(params.sessionId);
                    return { success: true, data: session };
                }
                if (params.userId) {
                    const session = await storage.getActiveSession(params.userId);
                    return { success: true, data: session };
                }
                return { success: false, error: 'Missing sessionId or userId' };

            case 'update_session':
                if (!params.sessionId || !params.updates) {
                    return { success: false, error: 'Missing sessionId or updates' };
                }
                const updated = await storage.updateSession(params.sessionId, params.updates);
                return { success: true, data: updated };

            case 'log_activity':
                if (!params.sessionId || !params.activity) {
                    return { success: false, error: 'Missing sessionId or activity' };
                }
                await storage.logAgentActivity(params.sessionId, params.activity);
                return { success: true, data: { logged: true } };

            case 'get_answers':
                if (!params.sessionId) {
                    return { success: false, error: 'Missing sessionId' };
                }
                const session = await storage.getSession(params.sessionId);
                return { success: true, data: session?.answers || {} };

            default:
                return { success: false, error: `Unknown operation: ${params.operation}` };
        }
    } catch (error: any) {
        console.error('[DatabaseSkill] Error:', error);
        return { success: false, error: error.message || 'Database operation failed' };
    }
}

/**
 * Tool definition for agents
 */
export const databaseSkillDefinition = {
    type: 'function',
    function: {
        name: 'database_management',
        description: 'Store and retrieve session data, user answers, and agent activity logs. Use this to persist conversation state and business plan data.',
        parameters: {
            type: 'object',
            properties: {
                operation: {
                    type: 'string',
                    enum: ['save_answer', 'get_session', 'update_session', 'log_activity', 'get_answers'],
                    description: 'The database operation to perform'
                },
                sessionId: {
                    type: 'string',
                    description: 'The session ID to operate on'
                },
                userId: {
                    type: 'string',
                    description: 'The user ID to look up sessions for (for get_session)'
                },
                questionId: {
                    type: 'string',
                    description: 'The question ID when saving an answer'
                },
                answer: {
                    type: 'string',
                    description: 'The answer value to save'
                },
                updates: {
                    type: 'object',
                    description: 'Session updates (for update_session operation)'
                }
            },
            required: ['operation']
        }
    }
};
