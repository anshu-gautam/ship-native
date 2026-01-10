/**
 * Auth Middleware
 *
 * JWT-based authentication middleware for API routes.
 * Uses jose for edge-compatible token verification.
 *
 * Setup:
 * 1. npm install jose
 * 2. Set JWT_SECRET environment variable
 */

import * as jose from "jose";

export interface AuthToken {
  userId: string;
  role: "user" | "admin";
}

interface JWTPayload {
  sub: string; // userId
  role?: string;
  exp?: number;
}

// Ensure JWT_SECRET is set in production
const isProduction = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && isProduction) {
  throw new Error("JWT_SECRET environment variable is required in production");
}

// Only use fallback in development
const SECRET = JWT_SECRET || "development-secret-do-not-use-in-production";

export async function verifyAuthToken(
  request: Request
): Promise<AuthToken | null> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    // Verify JWT signature and decode payload
    const secret = new TextEncoder().encode(SECRET);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    const jwtPayload = payload as unknown as JWTPayload;

    if (!jwtPayload.sub) {
      console.error("JWT missing sub claim");
      return null;
    }

    return {
      userId: jwtPayload.sub,
      role: jwtPayload.role === "admin" ? "admin" : "user",
    };
  } catch (error) {
    // Token invalid, expired, or signature mismatch
    console.error(
      "JWT verification failed:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Helper to create a signed JWT (for login/auth endpoints)
 */
export async function createAuthToken(
  userId: string,
  role: "user" | "admin" = "user"
): Promise<string> {
  const secret = new TextEncoder().encode(SECRET);

  return await new jose.SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}
