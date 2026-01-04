import { NextRequest, NextResponse } from 'next/server'
import { AI } from '@/lib/ai/unified'

export async function POST(request: NextRequest) {
  try {
    const { questionId, partialAnswer, userContext } = await request.json()
    const suggestions = await AI.getSuggestions(questionId, partialAnswer, userContext || {})
    return NextResponse.json({ suggestions })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get suggestions' }, { status: 500 })
  }
}

export const runtime = 'edge'
