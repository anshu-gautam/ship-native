import { verifyAuthToken, AuthToken } from "../middleware/auth";
import { checkRateLimit } from "../middleware/rateLimit";

// Authorization helper: users can access own data, admins can access any
const canAccessUser = (token: AuthToken, targetUserId: string): boolean =>
  token.userId === targetUserId || token.role === "admin";

// Example user data (in a real app, this would come from a database)
const users = [
  {
    id: "1",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Smith",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET /api/users/:id
export async function GET(request: Request, { id }: { id: string }) {
  try {
    // Check rate limit
    const clientId = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientId)) {
      return Response.json(
        { status: "error", message: "Too many requests" },
        { status: 429 }
      );
    }

    // Check authentication
    const token = await verifyAuthToken(request);
    if (!token) {
      return Response.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Authorization: check if user can access this resource
    if (!canAccessUser(token, id)) {
      return Response.json(
        { status: "error", message: "Forbidden" },
        { status: 403 }
      );
    }

    const user = users.find((u) => u.id === id);

    if (!user) {
      return Response.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error("GET /api/users/:id error:", error);
    return Response.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/:id
export async function PATCH(request: Request, { id }: { id: string }) {
  try {
    // Check rate limit
    const clientId = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientId)) {
      return Response.json(
        { status: "error", message: "Too many requests" },
        { status: 429 }
      );
    }

    // Check authentication
    const token = await verifyAuthToken(request);
    if (!token) {
      return Response.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Authorization: check if user can modify this resource
    if (!canAccessUser(token, id)) {
      return Response.json(
        { status: "error", message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return Response.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    // Validate and sanitize input
    const allowedFields = ["firstName", "lastName", "email"];
    const updates = Object.keys(body)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: body[key] }), {});

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return Response.json({
      status: "success",
      message: "User updated successfully",
      data: users[userIndex],
    });
  } catch (error) {
    console.error("PATCH /api/users/:id error:", error);
    return Response.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/:id
export async function DELETE(request: Request, { id }: { id: string }) {
  try {
    // Check rate limit
    const clientId = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientId)) {
      return Response.json(
        { status: "error", message: "Too many requests" },
        { status: 429 }
      );
    }

    // Check authentication
    const token = await verifyAuthToken(request);
    if (!token) {
      return Response.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Authorization: only admins can delete users
    if (token.role !== "admin") {
      return Response.json(
        { status: "error", message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return Response.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    // Delete user
    users.splice(userIndex, 1);

    return Response.json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/users/:id error:", error);
    return Response.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
