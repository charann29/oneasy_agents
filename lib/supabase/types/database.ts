export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    updated_at: string | null
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    website: string | null
                }
                Insert: {
                    id: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                }
                Update: {
                    id?: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                }
            }
            question_responses: {
                Row: {
                    id: string
                    user_id: string
                    phase: string
                    question_id: string
                    answer: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    phase: string
                    question_id: string
                    answer: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    phase?: string
                    question_id?: string
                    answer?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            questionnaire_sessions: {
                Row: {
                    id: string
                    user_id: string
                    answers: Json
                    current_phase: number
                    current_question_index: number
                    completed_phases: number[]
                    messages: Json
                    language: string
                    updated_at: string
                    completed: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    answers?: Json
                    current_phase?: number
                    current_question_index?: number
                    completed_phases?: number[]
                    messages?: Json
                    language?: string
                    updated_at?: string
                    completed?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    answers?: Json
                    current_phase?: number
                    current_question_index?: number
                    completed_phases?: number[]
                    messages?: Json
                    language?: string
                    updated_at?: string
                    completed?: boolean
                    created_at?: string
                }
            }

        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
