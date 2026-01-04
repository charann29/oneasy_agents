/**
 * Market Analysis API
 * POST /api/v1/market-analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { BusinessPlannerService } from '@/lib/services/business-planner-service';
import { authenticateRequest } from '@/lib/middleware/auth';
import { checkRateLimit, marketAnalysisRateLimiter } from '@/lib/middleware/rate-limit';
import { logger } from '@/backend/utils/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    logger.info('Market analysis request', { userId: user.id });

    // 2. Check rate limit
    const rateLimitResult = await checkRateLimit(user.id, marketAnalysisRateLimiter);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // 3. Parse and validate request body
    const body = await request.json();

    const requiredFields = ['industry', 'geography', 'targetSegment'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: 'Validation error', message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // 4. Call business planner service
    const service = new BusinessPlannerService();
    const result = await service.runMarketAnalysis(
      user.id,
      body.industry,
      body.geography,
      body.targetSegment
    );

    const totalTime = Date.now() - startTime;

    logger.info('Market analysis completed', {
      userId: user.id,
      sessionId: result.sessionId,
      totalTime
    });

    // 5. Return success response
    return NextResponse.json({
      success: true,
      data: {
        sessionId: result.sessionId,
        analysis: result.analysis,
        metrics: result.metrics
      },
      metadata: {
        executionTimeMs: totalTime,
        agentsUsed: result.metrics.agentsUsed,
        skillsExecuted: result.metrics.skillsExecuted
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    logger.error('Market analysis failed', error);

    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      errorMessage = error.message;

      if (errorMessage.includes('Validation')) {
        statusCode = 400;
      } else if (errorMessage.includes('Unauthorized')) {
        statusCode = 403;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        metadata: {
          executionTimeMs: totalTime
        }
      },
      { status: statusCode }
    );
  }
}
