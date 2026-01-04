/**
 * Rate Limit Middleware Example
 *
 * This is a reference implementation for rate limiting.
 * In production, use a proper rate limiting service like Upstash or Redis.
 *
 * Example usage:
 * ```ts
 * export async function GET(request: Request) {
 *   const clientId = request.headers.get('x-forwarded-for') || 'unknown';
 *   if (!checkRateLimit(clientId)) {
 *     return Response.json({ error: 'Too many requests' }, { status: 429 });
 *   }
 *   // Process request
 * }
 * ```
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function checkRateLimit(clientId: string, maxRequests = 100, windowMs = 60000): boolean {
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
