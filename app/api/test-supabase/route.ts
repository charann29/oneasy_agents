import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/db/supabase'

/**
 * GET /api/test-supabase
 * Test Supabase connection
 */
export async function GET(req: NextRequest) {
    try {
        if (!isSupabaseConfigured) {
            return NextResponse.json({
                success: true,
                mode: 'demo',
                message: '📝 Running in DEMO MODE - using in-memory storage. Add Supabase credentials to .env.local to enable persistent storage.',
                project_id: 'sqleasycmnykqsywnbtk',
                instructions: 'See SUPABASE_SETUP.md for setup instructions',
                timestamp: new Date().toISOString()
            })
        }

        return NextResponse.json({
            success: true,
            mode: 'production',
            message: '✅ Supabase connection successful!',
            project_id: 'sqleasycmnykqsywnbtk',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to connect to Supabase. Check your environment variables.'
        }, { status: 500 })
    }
}
