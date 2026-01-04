/**
 * Auth Middleware Example
 *
 * This is a reference implementation for authentication middleware.
 * In Expo Router API routes, you can check authentication directly in your handler.
 *
 * Example usage:
 * ```ts
 * export async function GET(request: Request) {
 *   const authHeader = request.headers.get('authorization');
 *   if (!authHeader?.startsWith('Bearer ')) {
 *     return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   // Verify token and proceed
 * }
 * ```
 */

export function verifyAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  // In a real app, verify the token here
  // For example, using Clerk's verifyToken or JWT verification
  // const decoded = await verifyToken(token);
  // return decoded.userId;

  return token;
}
