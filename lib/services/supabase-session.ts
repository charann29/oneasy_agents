/**
 * Supabase Session Service
 * 
 * Handles all session persistence in Supabase database.
 * NO localStorage - everything in the database for persistence across refreshes.
 */

import { createBrowserClient } from '@supabase/ssr';

// Create a simple client without strict typing for flexibility
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createBrowserClient(supabaseUrl, supabaseKey);


export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    questionId?: string;
    phaseName?: string;
}

export interface QuestionnaireSession {
    id: string;
    user_id: string;
    current_phase: number;
    current_question_index: number;
    completed: boolean;
    completed_phases: number[];
    answers: Record<string, any>;
    messages: Message[];
    language: string;
    created_at: string;
    updated_at: string;
}

/**
 * Get or create an active session for the current user
 */
export async function getOrCreateSession(userId: string, language: string = 'en-US'): Promise<QuestionnaireSession | null> {
    try {
        // First, try to get an existing active (non-completed) session
        const { data: existingSession, error: fetchError } = await supabase
            .from('questionnaire_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('completed', false)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('[SupabaseSession] Error fetching session:', fetchError);
            return null;
        }

        if (existingSession) {
            console.log('[SupabaseSession] Found existing session:', existingSession.id);
            return mapDbToSession(existingSession);
        }

        // No existing session, create a new one
        console.log('[SupabaseSession] Creating new session for user:', userId);

        const newSession = {
            user_id: userId,
            current_phase: 0,
            current_question_index: 0,
            completed: false,
            completed_phases: [],
            answers: {},
            messages: [],
            language: language
        };

        const { data: createdSession, error: insertError } = await supabase
            .from('questionnaire_sessions')
            .insert(newSession)
            .select()
            .single();

        if (insertError) {
            console.error('[SupabaseSession] Error creating session:', insertError);
            return null;
        }

        console.log('[SupabaseSession] Created new session:', createdSession.id);
        return mapDbToSession(createdSession);

    } catch (error) {
        console.error('[SupabaseSession] Unexpected error:', error);
        return null;
    }
}

/**
 * Get session by ID
 */
export async function getSessionById(sessionId: string): Promise<QuestionnaireSession | null> {
    try {
        const { data, error } = await supabase
            .from('questionnaire_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

        if (error) {
            console.error('[SupabaseSession] Error getting session:', error);
            return null;
        }

        return mapDbToSession(data);
    } catch (error) {
        console.error('[SupabaseSession] Error getting session by ID:', error);
        return null;
    }
}

/**
 * Update session state - this should be called after every answer
 */
export async function updateSession(
    sessionId: string,
    updates: {
        current_phase?: number;
        current_question_index?: number;
        completed?: boolean;
        completed_phases?: number[];
        answers?: Record<string, any>;
        messages?: Message[];
        language?: string;
    }
): Promise<QuestionnaireSession | null> {
    try {
        const { data, error } = await supabase
            .from('questionnaire_sessions')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', sessionId)
            .select()
            .single();

        if (error) {
            console.error('[SupabaseSession] Error updating session:', error);
            return null;
        }

        console.log('[SupabaseSession] Session updated successfully');
        return mapDbToSession(data);
    } catch (error) {
        console.error('[SupabaseSession] Error updating session:', error);
        return null;
    }
}

/**
 * Add a message to the session
 */
export async function addMessage(sessionId: string, message: Message): Promise<boolean> {
    try {
        // Get current messages
        const { data: session, error: fetchError } = await supabase
            .from('questionnaire_sessions')
            .select('messages')
            .eq('id', sessionId)
            .single();

        if (fetchError) {
            console.error('[SupabaseSession] Error fetching messages:', fetchError);
            return false;
        }

        const currentMessages = (session?.messages || []) as Message[];
        const updatedMessages = [...currentMessages, message];

        // Update with new message
        const { error: updateError } = await supabase
            .from('questionnaire_sessions')
            .update({
                messages: updatedMessages,
                updated_at: new Date().toISOString()
            })
            .eq('id', sessionId);

        if (updateError) {
            console.error('[SupabaseSession] Error adding message:', updateError);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[SupabaseSession] Error adding message:', error);
        return false;
    }
}

/**
 * Save an answer to the session
 */
export async function saveAnswer(
    sessionId: string,
    questionId: string,
    answer: any,
    newPhase: number,
    newQuestionIndex: number,
    completedPhases: number[]
): Promise<boolean> {
    try {
        // Get current answers
        const { data: session, error: fetchError } = await supabase
            .from('questionnaire_sessions')
            .select('answers')
            .eq('id', sessionId)
            .single();

        if (fetchError) {
            console.error('[SupabaseSession] Error fetching answers:', fetchError);
            return false;
        }

        const currentAnswers = (session?.answers || {}) as Record<string, any>;
        const updatedAnswers = { ...currentAnswers, [questionId]: answer };

        // Update session with new answer and progress
        const { error: updateError } = await supabase
            .from('questionnaire_sessions')
            .update({
                answers: updatedAnswers,
                current_phase: newPhase,
                current_question_index: newQuestionIndex,
                completed_phases: completedPhases,
                updated_at: new Date().toISOString()
            })
            .eq('id', sessionId);

        if (updateError) {
            console.error('[SupabaseSession] Error saving answer:', updateError);
            return false;
        }

        console.log('[SupabaseSession] Answer saved:', questionId);
        return true;
    } catch (error) {
        console.error('[SupabaseSession] Error saving answer:', error);
        return false;
    }
}

/**
 * Mark session as complete
 */
export async function completeSession(sessionId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('questionnaire_sessions')
            .update({
                completed: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', sessionId);

        if (error) {
            console.error('[SupabaseSession] Error completing session:', error);
            return false;
        }

        console.log('[SupabaseSession] Session marked complete:', sessionId);
        return true;
    } catch (error) {
        console.error('[SupabaseSession] Error completing session:', error);
        return false;
    }
}

/**
 * Delete/reset a session (start fresh)
 */
export async function resetSession(sessionId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('questionnaire_sessions')
            .delete()
            .eq('id', sessionId);

        if (error) {
            console.error('[SupabaseSession] Error deleting session:', error);
            return false;
        }

        console.log('[SupabaseSession] Session deleted:', sessionId);
        return true;
    } catch (error) {
        console.error('[SupabaseSession] Error resetting session:', error);
        return false;
    }
}

/**
 * Map database row to typed session
 */
function mapDbToSession(data: any): QuestionnaireSession {
    return {
        id: data.id,
        user_id: data.user_id,
        current_phase: data.current_phase ?? 0,
        current_question_index: data.current_question_index ?? 0,
        completed: data.completed ?? false,
        completed_phases: data.completed_phases ?? [],
        answers: data.answers ?? {},
        messages: Array.isArray(data.messages) ? data.messages.map((m: any) => ({
            ...m,
            timestamp: m.timestamp || new Date().toISOString()
        })) : [],
        language: data.language ?? 'en-US',
        created_at: data.created_at,
        updated_at: data.updated_at
    };
}
