
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const sessionId = params.sessionId;

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: 'Session ID is required' },
                { status: 400 }
            );
        }

        // 1. Get Session Data
        const session = await db.getSession(sessionId);

        // 2. Get Responses (to rebuild history)
        const responses = await db.getResponses(sessionId);

        return NextResponse.json({
            success: true,
            session,
            responses
        });

    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch session' },
            { status: 500 }
        );
    }
}
