/**
 * Rate Limit Middleware
 *
 * ⚠️  WARNING: This in-memory implementation is for DEVELOPMENT ONLY.
 * It resets on restart and doesn't scale across multiple instances.
 *
 * For PRODUCTION, use Upstash Redis:
 * ```ts
 * import { Ratelimit } from '@upstash/ratelimit';
 * import { Redis } from '@upstash/redis';
 *
 * const ratelimit = new Ratelimit({
 *   redis: Redis.fromEnv(),
 *   limiter: Ratelimit.slidingWindow(100, '1 m'),
 * });
 *
 * export async function checkRateLimit(clientId: string): Promise<boolean> {
 *   const { success } = await ratelimit.limit(clientId);
 *   return success;
 * }
 * ```
 * Install: npm install @upstash/ratelimit @upstash/redis
 */

// TODO: Replace with Upstash/Redis in production
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// ⚠️ In-memory store - for development only
const store: RateLimitStore = {};

export function checkRateLimit(
  clientId: string,
  maxRequests = 100,
  windowMs = 60000
): boolean {
  const now = Date.now();
  const clientData = store[clientId];

  if (!clientData || now > clientData.resetTime) {
    // Initialize or reset the client data
    store[clientId] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return true;
  }

  if (clientData.count >= maxRequests) {
    // Rate limit exceeded
    return false;
  }

  // Increment the request count
  clientData.count++;
  return true;
}
