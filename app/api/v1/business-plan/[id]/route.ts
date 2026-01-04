/**
 * Get Business Plan API
 * GET /api/v1/business-plan/:id
 */

import { NextRequest, NextResponse } from 'next/server';
import { BusinessPlannerService } from '@/lib/services/business-planner-service';
import { authenticateRequest } from '@/lib/middleware/auth';
import { logger } from '@/backend/utils/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    const planId = params.id;

    logger.info('Fetching business plan', { userId: user.id, planId });

    // 2. Get business plan from service
    const service = new BusinessPlannerService();
    const plan = await service.getBusinessPlan(user.id, planId);

    if (!plan) {
      return NextResponse.json(
        { error: 'Not found', message: 'Business plan not found' },
        { status: 404 }
      );
    }

    // 3. Return plan
    return NextResponse.json({
      success: true,
      data: plan
    });

  } catch (error) {
    logger.error('Failed to fetch business plan', error);

    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      errorMessage = error.message;

      if (errorMessage.includes('not found')) {
        statusCode = 404;
      } else if (errorMessage.includes('Unauthorized')) {
        statusCode = 403;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: statusCode }
    );
  }
}
