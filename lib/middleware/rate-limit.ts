/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse
 */

import { logger } from '@/backend/utils/logger';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private config: RateLimitConfig;

  constructor(config?: Partial<RateLimitConfig>) {
    this.limits = new Map();
    this.config = {
      windowMs: config?.windowMs || 60000, // Default: 1 minute
      maxRequests: config?.maxRequests || 10 // Default: 10 requests per minute
    };

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);

    logger.info('Rate limiter initialized', this.config);
  }

  /**
   * Check if request is rate limited
   */
  async checkLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    // No entry or expired entry - create new
    if (!entry || now >= entry.resetAt) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetAt: now + this.config.windowMs
      };
      this.limits.set(identifier, newEntry);

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAt: newEntry.resetAt
      };
    }

    // Entry exists and is valid
    if (entry.count < this.config.maxRequests) {
      entry.count++;
      this.limits.set(identifier, entry);

      return {
        allowed: true,
        remaining: this.config.maxRequests - entry.count,
        resetAt: entry.resetAt
      };
    }

    // Rate limit exceeded
    logger.warn('Rate limit exceeded', {
      identifier,
      count: entry.count,
      resetAt: new Date(entry.resetAt).toISOString()
    });

    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt
    };
  }

  /**
   * Get current usage for identifier
   */
  async getUsage(identifier: string): Promise<{ count: number; resetAt: number } | null> {
    const entry = this.limits.get(identifier);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now >= entry.resetAt) {
      return null;
    }

    return {
      count: entry.count,
      resetAt: entry.resetAt
    };
  }

  /**
   * Reset limits for identifier
   */
  async resetLimit(identifier: string): Promise<void> {
    this.limits.delete(identifier);
    logger.info('Rate limit reset', { identifier });
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [identifier, entry] of Array.from(this.limits.entries())) {
      if (now >= entry.resetAt) {
        this.limits.delete(identifier);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug('Rate limit cleanup', { cleanedCount, remaining: this.limits.size });
    }
  }

  /**
   * Get rate limit info
   */
  getInfo(): { totalEntries: number; config: RateLimitConfig } {
    return {
      totalEntries: this.limits.size,
      config: this.config
    };
  }
}

// Export default rate limiters for different endpoints
export const defaultRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 10 // 10 requests per minute
});

export const businessPlanRateLimiter = new RateLimiter({
  windowMs: 3600000, // 1 hour
  maxRequests: 5 // 5 business plans per hour (expensive operation)
});

export const marketAnalysisRateLimiter = new RateLimiter({
  windowMs: 600000, // 10 minutes
  maxRequests: 10 // 10 analyses per 10 minutes
});

export const chatRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 20 // 20 messages per minute (conversational, faster cadence)
});

/**
 * Unified rate limiter with named configurations
 */
export const rateLimiter = {
  checkLimit: async (userId: string, type: 'default' | 'business_plan' | 'market_analysis' | 'chat' = 'default') => {
    let limiter: RateLimiter;

    switch (type) {
      case 'business_plan':
        limiter = businessPlanRateLimiter;
        break;
      case 'market_analysis':
        limiter = marketAnalysisRateLimiter;
        break;
      case 'chat':
        limiter = chatRateLimiter;
        break;
      default:
        limiter = defaultRateLimiter;
    }

    const result = await limiter.checkLimit(userId);
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetAt: result.resetAt,
      retryAfter: result.allowed ? 0 : result.resetAt - Date.now()
    };
  }
};

/**
 * Helper to check rate limit and return response if exceeded
 */
export async function checkRateLimit(
  identifier: string,
  limiter: RateLimiter = defaultRateLimiter
): Promise<{ allowed: boolean; response?: Response }> {
  const result = await limiter.checkLimit(identifier);

  if (!result.allowed) {
    const resetDate = new Date(result.resetAt);
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again after ${resetDate.toISOString()}`,
          resetAt: resetDate.toISOString(),
          remaining: result.remaining
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limiter.getInfo().config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': resetDate.toISOString(),
            'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString()
          }
        }
      )
    };
  }

  return { allowed: true };
}
