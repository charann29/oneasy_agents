/**
 * Business Plan Creation API
 * POST /api/v1/business-plan/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { BusinessPlannerService } from '@/lib/services/business-planner-service';
import { authenticateRequest } from '@/lib/middleware/auth';
import { checkRateLimit, businessPlanRateLimiter } from '@/lib/middleware/rate-limit';
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

    logger.info('Business plan creation request', { userId: user.id });

    // 2. Check rate limit
    const rateLimitResult = await checkRateLimit(user.id, businessPlanRateLimiter);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // 3. Parse and validate request body
    const body = await request.json();

    const requiredFields = ['businessName', 'industry', 'stage', 'targetMarket', 'location'];
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
    const result = await service.createBusinessPlan(user.id, {
      businessName: body.businessName,
      industry: body.industry,
      stage: body.stage,
      targetMarket: body.targetMarket,
      location: body.location,
      description: body.description,
      revenue: body.revenue,
      teamSize: body.teamSize,
      fundingGoal: body.fundingGoal
    });

    const totalTime = Date.now() - startTime;

    logger.info('Business plan created successfully', {
      userId: user.id,
      planId: result.planId,
      totalTime
    });

    // 5. Return success response
    return NextResponse.json({
      success: true,
      data: {
        planId: result.planId,
        sessionId: result.sessionId,
        synthesis: result.synthesis,
        metrics: result.metrics,
        createdAt: result.createdAt
      },
      metadata: {
        executionTimeMs: totalTime,
        agentsUsed: result.metrics.agentsUsed,
        skillsExecuted: result.metrics.skillsExecuted
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    logger.error('Business plan creation failed', error);

    // Determine error type and status
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      errorMessage = error.message;

      if (errorMessage.includes('Validation')) {
        statusCode = 400;
      } else if (errorMessage.includes('Unauthorized')) {
        statusCode = 403;
      } else if (errorMessage.includes('GROQ_API_KEY')) {
        statusCode = 503;
        errorMessage = 'Service temporarily unavailable';
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
