/**
 * AI Endpoint Middleware
 *
 * Provides authentication via Clerk and per-user rate limiting for AI endpoints.
 * Returns structured JSON errors for 401/429 responses.
 *
 * ⚠️  WARNING: In-memory rate limiting is for DEVELOPMENT ONLY.
 * For PRODUCTION, use Upstash Redis:
 * ```ts
 * import { Ratelimit } from '@upstash/ratelimit';
 * import { Redis } from '@upstash/redis';
 *
 * const aiRatelimit = new Ratelimit({
 *   redis: Redis.fromEnv(),
 *   limiter: Ratelimit.slidingWindow(20, '1 h'),
 *   prefix: 'ai-ratelimit',
 * });
 * ```
 */

// TODO: Replace with Upstash/Redis in production
interface RateLimitStore {
  [userId: string]: {
    count: number;
    resetTime: number;
  };
}

// ⚠️ In-memory store - for development only
const aiRateLimitStore: RateLimitStore = {};

import { verifyAuthToken } from "../middleware/auth";

/**
 * Verify user session from request
 * Returns userId if valid, null otherwise
 */
export async function verifyUserSession(
  request: Request
): Promise<string | null> {
  const token = await verifyAuthToken(request);
  return token?.userId ?? null;
}

/**
 * Check per-user rate limit for AI endpoints
 * More restrictive than general API rate limits due to cost
 *
 * Default: 20 requests per hour per user
 */
export function checkAIRateLimit(
  userId: string,
  maxRequests = 20,
  windowMs = 3600000 // 1 hour
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const userData = aiRateLimitStore[userId];

  if (!userData || now > userData.resetTime) {
    // Initialize or reset the user data
    aiRateLimitStore[userId] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (userData.count >= maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: userData.resetTime,
    };
  }

  // Increment the request count
  userData.count++;

  return {
    allowed: true,
    remaining: maxRequests - userData.count,
    resetTime: userData.resetTime,
  };
}

/**
 * Middleware to protect AI endpoints
 * Returns Response with error or null if checks pass
 */
export async function protectAIEndpoint(
  request: Request
): Promise<{ userId: string } | Response> {
  // Verify authentication
  const userId = await verifyUserSession(request);

  if (!userId) {
    return Response.json(
      {
        error: "Unauthorized",
        code: "AUTH_REQUIRED",
        message: "You must be signed in to use AI features",
      },
      { status: 401 }
    );
  }

  // Check rate limit
  const rateLimit = checkAIRateLimit(userId);

  if (!rateLimit.allowed) {
    const resetDate = new Date(rateLimit.resetTime);
    return Response.json(
      {
        error: "Too Many Requests",
        code: "RATE_LIMIT_EXCEEDED",
        message: "AI request limit exceeded. Please try again later.",
        resetAt: resetDate.toISOString(),
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
          ),
          "X-RateLimit-Limit": "20",
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(Math.floor(rateLimit.resetTime / 1000)),
        },
      }
    );
  }

  // All checks passed
  return { userId };
}

/**
 * Get rate limit headers for successful responses
 */
export function getRateLimitHeaders(userId: string): Record<string, string> {
  const rateLimit = checkAIRateLimit(userId, 20, 3600000);

  return {
    "X-RateLimit-Limit": "20",
    "X-RateLimit-Remaining": String(Math.max(0, rateLimit.remaining)),
    "X-RateLimit-Reset": String(Math.floor(rateLimit.resetTime / 1000)),
  };
}
