/**
 * Agent Activity Storage Service
 * Stores agent outputs and execution context to Supabase
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseKey) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export interface AgentOutput {
    task_id: string;
    agent_id: string;
    agent_name: string;
    output: string;
    skills_used: string[];
    tool_calls: any[];
    execution_time_ms: number;
    success: boolean;
    error?: string;
}

export interface ConversationEntry {
    id?: string;
    session_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    question_id?: string;
    phase_name?: string;
    agent_outputs?: AgentOutput[];
    created_at?: string;
}

export interface AgentActivityEntry {
    id?: string;
    session_id: string;
    agent_id: string;
    agent_name: string;
    skill_used: string[];
    input_message: string;
    output_response: string;
    execution_time_ms: number;
    success: boolean;
    error_message?: string;
}

/**
 * Store a conversation message with agent outputs
 */
export async function storeConversationMessage(entry: ConversationEntry): Promise<boolean> {
    try {
        const { error } = await (supabase
            .from('conversation_history') as any)
            .insert({
                session_id: entry.session_id,
                role: entry.role,
                content: entry.content,
                question_id: entry.question_id,
                phase_name: entry.phase_name,
                agent_outputs: entry.agent_outputs || null,
            });

        if (error) {
            console.error('[AgentStorage] Failed to store conversation:', error);
            return false;
        }

        console.log('[AgentStorage] Stored conversation message');
        return true;
    } catch (err) {
        console.error('[AgentStorage] Error storing conversation:', err);
        return false;
    }
}

/**
 * Store individual agent activity logs
 */
export async function storeAgentActivity(
    sessionId: string,
    inputMessage: string,
    agentOutputs: AgentOutput[]
): Promise<boolean> {
    try {
        const entries = agentOutputs.map(output => ({
            session_id: sessionId,
            agent_id: output.agent_id,
            agent_name: output.agent_name,
            skill_used: output.skills_used,
            input_message: inputMessage,
            output_response: output.output,
            execution_time_ms: output.execution_time_ms,
            success: output.success,
            error_message: output.error || null,
        }));

        const { error } = await (supabase
            .from('agent_activity_log') as any)
            .insert(entries);

        if (error) {
            console.error('[AgentStorage] Failed to store agent activity:', error);
            return false;
        }

        console.log(`[AgentStorage] Stored activity for ${entries.length} agents`);
        return true;
    } catch (err) {
        console.error('[AgentStorage] Error storing agent activity:', err);
        return false;
    }
}

/**
 * Get conversation history for a session
 */
export async function getConversationHistory(sessionId: string): Promise<ConversationEntry[]> {
    try {
        const { data, error } = await (supabase
            .from('conversation_history') as any)
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[AgentStorage] Failed to get conversation history:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('[AgentStorage] Error getting conversation history:', err);
        return [];
    }
}

/**
 * Get agent activity summary for a session
 */
export async function getAgentActivitySummary(sessionId: string): Promise<{
    totalExecutions: number;
    agentsUsed: string[];
    totalExecutionTimeMs: number;
    successRate: number;
}> {
    try {
        const { data, error } = await (supabase
            .from('agent_activity_log') as any)
            .select('agent_name, execution_time_ms, success')
            .eq('session_id', sessionId);

        if (error || !data) {
            return {
                totalExecutions: 0,
                agentsUsed: [],
                totalExecutionTimeMs: 0,
                successRate: 0
            };
        }

        const agentNames = Array.from(new Set(data.map((d: any) => d.agent_name))) as string[];
        const totalTime = data.reduce((sum: number, d: any) => sum + (d.execution_time_ms || 0), 0);
        const successCount = data.filter((d: any) => d.success).length;

        return {
            totalExecutions: data.length,
            agentsUsed: agentNames,
            totalExecutionTimeMs: totalTime,
            successRate: data.length > 0 ? (successCount / data.length) * 100 : 0
        };
    } catch (err) {
        console.error('[AgentStorage] Error getting activity summary:', err);
        return {
            totalExecutions: 0,
            agentsUsed: [],
            totalExecutionTimeMs: 0,
            successRate: 0
        };
    }
}

/**
 * Store accumulated context from all agent work
 * This stores a snapshot of the business context with agent insights
 */
export async function storeAccumulatedContext(
    sessionId: string,
    context: {
        answers: Record<string, any>;
        agentInsights: Record<string, any>;
        phase: number;
        questionIndex: number;
    }
): Promise<boolean> {
    try {
        // Update the session with accumulated context
        const { error } = await (supabase
            .from('questionnaire_sessions') as any)
            .update({
                answers: context.answers,
                accumulated_context: {
                    insights: context.agentInsights,
                    phase: context.phase,
                    question_index: context.questionIndex,
                    updated_at: new Date().toISOString()
                },
                updated_at: new Date().toISOString()
            })
            .eq('id', sessionId);

        if (error) {
            console.error('[AgentStorage] Failed to store accumulated context:', error);
            return false;
        }

        console.log('[AgentStorage] Stored accumulated context');
        return true;
    } catch (err) {
        console.error('[AgentStorage] Error storing accumulated context:', err);
        return false;
    }
}
