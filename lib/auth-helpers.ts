import { supabase } from './supabase/client'
import type { User, Session, AuthError, Provider } from '@supabase/supabase-js'

export type AuthResult<T = void> = {
    data: T | null
    error: AuthError | Error | null
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(redirectTo?: string): Promise<AuthResult<{ provider: string, url: string }>> {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectTo || `${window.location.origin}/chat`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        })

        return { data: data as any, error }
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error during sign in'),
        }
    }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
    email: string,
    password: string
): Promise<AuthResult<Session>> {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        return {
            data: data.session,
            error,
        }
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error during sign in'),
        }
    }
}

/**
 * Sign up with email and password
 */
export async function signUp(
    email: string,
    password: string,
    metadata?: {
        full_name?: string
        username?: string
    }
): Promise<AuthResult<User>> {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        })

        return {
            data: data.user,
            error,
        }
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error during sign up'),
        }
    }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
    try {
        const { error } = await supabase.auth.signOut()
        return { data: null, error }
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error during sign out'),
        }
    }
}

/**
 * Get the current user
 */
export async function getUser(): Promise<AuthResult<User>> {
    try {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser()

        return {
            data: user,
            error,
        }
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error getting user'),
        }
    }
}

/**
 * Get the current session
 */
export async function getSession(): Promise<AuthResult<Session>> {
    try {
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession()

        return {
            data: session,
            error,
        }
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error getting session'),
        }
    }
}

/**
 * Reset password for email
 */
export async function resetPassword(email: string): Promise<AuthResult<{}>> {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        })

        return { data: data as any, error }
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error during password reset'),
        }
    }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string): Promise<AuthResult<User>> {
    try {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        })

        return {
            data: data.user,
            error,
        }
    } catch (error) {
        return {
            data: null,
            error:
                error instanceof Error ? error : new Error('Unknown error during password update'),
        }
    }
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(metadata: {
    full_name?: string
    username?: string
    avatar_url?: string
}): Promise<AuthResult<User>> {
    try {
        const { data, error } = await supabase.auth.updateUser({
            data: metadata,
        })

        return {
            data: data.user,
            error,
        }
    } catch (error) {
        return {
            data: null,
            error:
                error instanceof Error ? error : new Error('Unknown error updating user metadata'),
        }
    }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
    callback: (event: string, session: Session | null) => void
) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session)
    })
}
