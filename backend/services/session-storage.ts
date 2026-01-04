/**
 * Session Storage Service
 * Handles storing sessions and conversations in Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    questionId?: string;
    phaseName?: string;
}

export interface SessionData {
    id: string;
    userId: string;
    currentPhase: number;
    currentQuestionIndex: number;
    completed: boolean;
    completedPhases: number[];
    answers: Record<string, any>;
    messages: Message[];
    language: string;
    channel: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AgentActivity {
    agentId: string;
    agentName: string;
    skillsUsed: string[];
    inputMessage: string;
    outputResponse: string;
    executionTimeMs: number;
    success: boolean;
    errorMessage?: string;
}

export class SessionStorageService {
    private supabase: SupabaseClient | null = null;
    private inMemoryStorage: Map<string, SessionData> = new Map();
    private isConfigured: boolean = false;

    constructor() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey && !supabaseKey.includes('your_') && supabaseKey !== 'demo-mode') {
            this.supabase = createClient(supabaseUrl, supabaseKey);
            this.isConfigured = true;
            console.log('✅ SessionStorageService: Supabase connected');
        } else {
            console.log('📝 SessionStorageService: Using in-memory storage (Supabase not configured)');
        }
    }

    /**
     * Create a new session
     */
    async createSession(userId: string, language: string = 'en-US'): Promise<SessionData> {
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

        const session: SessionData = {
            id: sessionId,
            userId,
            currentPhase: 0,
            currentQuestionIndex: 0,
            completed: false,
            completedPhases: [],
            answers: {},
            messages: [],
            language,
            channel: 'web',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (this.isConfigured && this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('questionnaire_sessions')
                    .insert({
                        user_id: userId,
                        current_phase: 0,
                        current_question_index: 0,
                        completed: false,
                        completed_phases: [],
                        answers: {},
                        messages: [],
                        language,
                        channel: 'web'
                    })
                    .select()
                    .single();

                if (error) throw error;
                session.id = data.id;
                console.log('[SessionStorage] Created Supabase session:', data.id);
            } catch (error) {
                console.error('[SessionStorage] Failed to create Supabase session, using local:', error);
                this.inMemoryStorage.set(sessionId, session);
            }
        } else {
            this.inMemoryStorage.set(sessionId, session);
        }

        return session;
    }

    /**
     * Get session by ID
     */
    async getSession(sessionId: string): Promise<SessionData | null> {
        if (this.isConfigured && this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('questionnaire_sessions')
                    .select('*')
                    .eq('id', sessionId)
                    .single();

                if (error) throw error;

                return this.mapDbToSession(data);
            } catch (error) {
                console.error('[SessionStorage] Failed to get Supabase session:', error);
            }
        }

        return this.inMemoryStorage.get(sessionId) || null;
    }

    /**
     * Get active session for user
     */
    async getActiveSession(userId: string): Promise<SessionData | null> {
        if (this.isConfigured && this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('questionnaire_sessions')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('completed', false)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                if (!data) return null;

                return this.mapDbToSession(data);
            } catch (error) {
                console.error('[SessionStorage] Failed to get active session:', error);
            }
        }

        // Find in memory
        const sessions = Array.from(this.inMemoryStorage.values());
        for (const session of sessions) {
            if (session.userId === userId && !session.completed) {
                return session;
            }
        }
        return null;
    }

    /**
     * Update session state
     */
    async updateSession(sessionId: string, updates: Partial<SessionData>): Promise<SessionData | null> {
        if (this.isConfigured && this.supabase) {
            try {
                const dbUpdates: any = {};

                if (updates.currentPhase !== undefined) dbUpdates.current_phase = updates.currentPhase;
                if (updates.currentQuestionIndex !== undefined) dbUpdates.current_question_index = updates.currentQuestionIndex;
                if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
                if (updates.completedPhases !== undefined) dbUpdates.completed_phases = updates.completedPhases;
                if (updates.answers !== undefined) dbUpdates.answers = updates.answers;
                if (updates.messages !== undefined) dbUpdates.messages = updates.messages;
                if (updates.language !== undefined) dbUpdates.language = updates.language;

                const { data, error } = await this.supabase
                    .from('questionnaire_sessions')
                    .update(dbUpdates)
                    .eq('id', sessionId)
                    .select()
                    .single();

                if (error) throw error;

                return this.mapDbToSession(data);
            } catch (error) {
                console.error('[SessionStorage] Failed to update Supabase session:', error);
            }
        }

        // Update in memory
        const session = this.inMemoryStorage.get(sessionId);
        if (session) {
            const updated = { ...session, ...updates, updatedAt: new Date() };
            this.inMemoryStorage.set(sessionId, updated);
            return updated;
        }
        return null;
    }

    /**
     * Add message to conversation history
     */
    async addMessage(sessionId: string, message: Message): Promise<void> {
        if (this.isConfigured && this.supabase) {
            try {
                // Add to conversation_history table for detailed tracking
                await this.supabase
                    .from('conversation_history')
                    .insert({
                        session_id: sessionId,
                        role: message.role,
                        content: message.content,
                        question_id: message.questionId,
                        phase_name: message.phaseName
                    });

                // Also update messages array in session
                const { data: session } = await this.supabase
                    .from('questionnaire_sessions')
                    .select('messages')
                    .eq('id', sessionId)
                    .single();

                const messages = (session?.messages || []) as Message[];
                messages.push(message);

                await this.supabase
                    .from('questionnaire_sessions')
                    .update({ messages })
                    .eq('id', sessionId);

            } catch (error) {
                console.error('[SessionStorage] Failed to add message:', error);
            }
        }

        // Update in memory
        const session = this.inMemoryStorage.get(sessionId);
        if (session) {
            session.messages.push(message);
            session.updatedAt = new Date();
        }
    }

    /**
     * Log agent activity
     */
    async logAgentActivity(sessionId: string, activity: AgentActivity): Promise<void> {
        if (this.isConfigured && this.supabase) {
            try {
                await this.supabase
                    .from('agent_activity_log')
                    .insert({
                        session_id: sessionId,
                        agent_id: activity.agentId,
                        agent_name: activity.agentName,
                        skill_used: activity.skillsUsed,
                        input_message: activity.inputMessage,
                        output_response: activity.outputResponse,
                        execution_time_ms: activity.executionTimeMs,
                        success: activity.success,
                        error_message: activity.errorMessage
                    });
            } catch (error) {
                console.error('[SessionStorage] Failed to log agent activity:', error);
            }
        }
    }

    /**
     * Save answer
     */
    async saveAnswer(sessionId: string, questionId: string, answer: any): Promise<void> {
        const session = await this.getSession(sessionId);
        if (session) {
            const answers = { ...session.answers, [questionId]: answer };
            await this.updateSession(sessionId, { answers });
        }
    }

    /**
     * Map database record to SessionData
     */
    private mapDbToSession(data: any): SessionData {
        return {
            id: data.id,
            userId: data.user_id,
            currentPhase: data.current_phase || 0,
            currentQuestionIndex: data.current_question_index || 0,
            completed: data.completed || false,
            completedPhases: data.completed_phases || [],
            answers: data.answers || {},
            messages: (data.messages || []).map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp)
            })),
            language: data.language || 'en-US',
            channel: data.channel || 'web',
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        };
    }
}

// Singleton instance
let storageInstance: SessionStorageService | null = null;

export function getSessionStorage(): SessionStorageService {
    if (!storageInstance) {
        storageInstance = new SessionStorageService();
    }
    return storageInstance;
}
