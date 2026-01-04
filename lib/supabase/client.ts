import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types/database'

// Lazy initialization - only validate and create client when first accessed
let _client: ReturnType<typeof createBrowserClient<Database>> | null = null

function getClient() {
    if (_client) return _client

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    // Only validate if we actually try to use it (at runtime, not build time)
    if (!supabaseUrl && typeof window !== 'undefined') {
        console.warn('NEXT_PUBLIC_SUPABASE_URL not set')
    }
    if (!supabaseAnonKey && typeof window !== 'undefined') {
        console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY not set')
    }

    _client = createBrowserClient<Database>(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder-key'
    )

    return _client
}

export function createClient() {
    return getClient()
}

// Export a getter function
export const getSupabase = () => createClient()

// Backward compatibility: export as 'supabase' with lazy getters
export const supabase = {
    get auth() { return getClient().auth },
    get from() { return getClient().from.bind(getClient()) },
    get storage() { return getClient().storage },
    get realtime() { return getClient().realtime },
    get functions() { return getClient().functions },
    get channel() { return getClient().channel.bind(getClient()) },
}
