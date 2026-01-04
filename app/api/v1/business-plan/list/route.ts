/**
 * List Business Plans API
 * GET /api/v1/business-plan/list
 */

import { NextRequest, NextResponse } from 'next/server';
import { BusinessPlannerService } from '@/lib/services/business-planner-service';
import { authenticateRequest } from '@/lib/middleware/auth';
import { logger } from '@/backend/utils/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    // 2. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    logger.info('Listing business plans', { userId: user.id, limit, offset });

    // 3. Get business plans from service
    const service = new BusinessPlannerService();
    const plans = await service.listBusinessPlans(user.id, limit, offset);

    // 4. Return plans
    return NextResponse.json({
      success: true,
      data: plans,
      metadata: {
        count: plans.length,
        limit,
        offset
      }
    });

  } catch (error) {
    logger.error('Failed to list business plans', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
