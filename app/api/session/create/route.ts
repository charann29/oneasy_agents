import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/supabase'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, channel } = await request.json()

    // For now, create a simple session without user authentication
    // In production, you'd want to use Supabase Auth
    const session = await db.createSession('anonymous', {
      name,
      email,
      phone,
      channel: channel || 'web',
      answers: {}
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      message: 'Session created successfully'
    })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json({
      error: 'Failed to create session',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
