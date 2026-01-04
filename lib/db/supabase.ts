import { createClient } from '@supabase/supabase-js'

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sqleasycmnykqsywnbtk.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-mode'

const isConfigured = supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('your_') && supabaseAnonKey !== 'demo-mode'

// Create client (will work in demo mode with mock data)
export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// In-memory storage for demo mode
const demoStorage = {
    sessions: new Map(),
    responses: new Map(),
    models: new Map()
}

// Server-side client with service role key (for admin operations)
export const getSupabaseAdmin = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey || serviceRoleKey.includes('your_')) {
        return null
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

// Database helper functions with demo mode fallback
export const db = {
    // User sessions
    async createSession(userId: string, data: any) {
        if (!isConfigured) {
            // Demo mode - use in-memory storage
            const sessionId = `demo-${Date.now()}`
            const session = {
                id: sessionId,
                user_id: userId,
                current_phase: 1,
                current_question_index: 0,
                answers: data.answers || {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            demoStorage.sessions.set(sessionId, session)
            console.log('📝 Demo mode: Created session', sessionId)
            return session
        }

        const { data: session, error } = await supabase!
            .from('questionnaire_sessions')
            .insert({
                user_id: userId,
                current_phase: 1,
                current_question_index: 0,
                answers: data.answers || {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error
        return session
    },

    async getSession(sessionId: string) {
        if (!isConfigured) {
            // Demo mode
            const session = demoStorage.sessions.get(sessionId)
            if (!session) throw new Error('Session not found')
            return session
        }

        const { data, error } = await supabase!
            .from('questionnaire_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()

        if (error) throw error
        return data
    },

    async updateSession(sessionId: string, updates: any) {
        if (!isConfigured) {
            // Demo mode
            const session = demoStorage.sessions.get(sessionId)
            if (!session) throw new Error('Session not found')
            const updated = {
                ...session,
                ...updates,
                updated_at: new Date().toISOString()
            }
            demoStorage.sessions.set(sessionId, updated)
            return updated
        }

        const { data, error } = await supabase!
            .from('questionnaire_sessions')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', sessionId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // User responses
    async saveResponse(sessionId: string, questionId: string, answer: any) {
        if (!isConfigured) {
            // Demo mode
            const key = `${sessionId}-${questionId}`
            const response = {
                id: key,
                session_id: sessionId,
                question_id: questionId,
                answer: answer,
                updated_at: new Date().toISOString()
            }
            demoStorage.responses.set(key, response)
            return response
        }

        const { data, error } = await supabase!
            .from('questionnaire_responses')
            .upsert({
                session_id: sessionId,
                question_id: questionId,
                answer: answer,
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async getResponses(sessionId: string) {
        if (!isConfigured) {
            // Demo mode
            const responses = Array.from(demoStorage.responses.values())
                .filter(r => r.session_id === sessionId)
            return responses
        }

        const { data, error } = await supabase!
            .from('questionnaire_responses')
            .select('*')
            .eq('session_id', sessionId)

        if (error) throw error
        return data
    },

    // Business models
    async saveBusinessModel(sessionId: string, model: any) {
        if (!isConfigured) {
            // Demo mode
            const modelId = `model-${Date.now()}`
            const businessModel = {
                id: modelId,
                session_id: sessionId,
                model_data: model,
                created_at: new Date().toISOString()
            }
            demoStorage.models.set(modelId, businessModel)
            return businessModel
        }

        const { data, error } = await supabase!
            .from('business_models')
            .insert({
                session_id: sessionId,
                model_data: model,
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error
        return data
    }
}

// Export configuration status
export const isSupabaseConfigured = isConfigured

console.log(isConfigured
    ? '✅ Supabase configured and ready'
    : '📝 Running in DEMO MODE - using in-memory storage (data will be lost on restart)')
