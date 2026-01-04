/**
 * Abhishek CA Chat Endpoint
 * Natural conversational interface for business planning
 *
 * POST /api/v1/chat/abhishek - Send message to Abhishek CA
 * GET /api/v1/chat/abhishek?conversationId=xxx - Get conversation state
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConversationService, ChatRequest, ChatResponse } from '@/lib/services/conversation-service';
import { authenticateRequest } from '@/lib/middleware/auth';
import { rateLimiter } from '@/lib/middleware/rate-limit';
import { logger } from '@/backend/utils/logger';

/**
 * POST - Send message to Abhishek CA
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Authentication
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Valid API key required' },
        { status: 401 }
      );
    }

    // 2. Rate limiting
    const rateLimitResult = await rateLimiter.checkLimit(user.id, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: `Too many messages. Try again in ${Math.ceil(rateLimitResult.retryAfter / 1000)} seconds`,
          retryAfter: rateLimitResult.retryAfter
        },
        { status: 429 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { conversationId, message, currentQuestionId, currentPhaseId, questionContext } = body;

    // 4. Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Validation error', message: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Validation error', message: 'Message too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    logger.info('Chat request received', {
      userId: user.id,
      conversationId: conversationId || 'new',
      messageLength: message.length
    });

    // 5. Process chat with Abhishek
    const conversationService = new ConversationService();

    const chatRequest: ChatRequest = {
      conversationId,
      userId: user.id,
      message: message.trim(),
      currentQuestionId,
      currentPhaseId,
      questionContext
    };

    const response: ChatResponse = await conversationService.chat(chatRequest);

    const executionTime = Date.now() - startTime;

    logger.info('Chat completed', {
      userId: user.id,
      conversationId: response.conversationId,
      phase: response.phase,
      progress: response.progress,
      executionTimeMs: executionTime
    });

    // 6. Return response
    return NextResponse.json({
      success: true,
      data: {
        conversationId: response.conversationId,
        message: response.message,
        phase: response.phase,
        progress: response.progress,
        extractedData: response.extractedData,
        suggestedActions: response.suggestedActions,
        isComplete: response.isComplete
      },
      metadata: {
        executionTimeMs: executionTime,
        userId: user.id
      }
    });

  } catch (error: any) {
    const executionTime = Date.now() - startTime;

    logger.error('Chat error', {
      error: error.message,
      stack: error.stack,
      executionTimeMs: executionTime
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process chat',
        message: error.message || 'An unexpected error occurred',
        metadata: { executionTimeMs: executionTime }
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve conversation state
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Valid API key required' },
        { status: 401 }
      );
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const list = searchParams.get('list') === 'true';

    const conversationService = new ConversationService();

    // 3. List conversations or get specific conversation
    if (list) {
      const limit = parseInt(searchParams.get('limit') || '10');
      const offset = parseInt(searchParams.get('offset') || '0');

      const conversations = await conversationService.listConversations(user.id, limit, offset);

      return NextResponse.json({
        success: true,
        data: {
          conversations,
          count: conversations.length,
          limit,
          offset
        }
      });
    }

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'Validation error', message: 'conversationId is required' },
        { status: 400 }
      );
    }

    // 4. Get specific conversation
    const conversation = await conversationService.getConversation(conversationId);

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Not found', message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // 5. Verify ownership
    if (conversation.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden', message: 'You do not have access to this conversation' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation
    });

  } catch (error: any) {
    logger.error('Get conversation error', { error: error.message });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve conversation',
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}
