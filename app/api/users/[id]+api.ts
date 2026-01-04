import { verifyAuthToken } from '../middleware/auth';
import { checkRateLimit } from '../middleware/rateLimit';

// Example user data (in a real app, this would come from a database)
const users = [
  {
    id: '1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET /api/users/:id
export async function GET(request: Request, { id }: { id: string }) {
  try {
    // Check rate limit
    const clientId = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientId)) {
      return Response.json({ status: 'error', message: 'Too many requests' }, { status: 429 });
    }

    // Check authentication
    const token = verifyAuthToken(request);
    if (!token) {
      return Response.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const user = users.find((u) => u.id === id);

    if (!user) {
      return Response.json({ status: 'error', message: 'User not found' }, { status: 404 });
    }

    return Response.json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    console.error('GET /api/users/:id error:', error);
    return Response.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/users/:id
export async function PATCH(request: Request, { id }: { id: string }) {
  try {
    // Check rate limit
    const clientId = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientId)) {
      return Response.json({ status: 'error', message: 'Too many requests' }, { status: 429 });
    }

    // Check authentication
    const token = verifyAuthToken(request);
    if (!token) {
      return Response.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return Response.json({ status: 'error', message: 'User not found' }, { status: 404 });
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return Response.json({
      status: 'success',
      message: 'User updated successfully',
      data: users[userIndex],
    });
  } catch (error) {
    console.error('PATCH /api/users/:id error:', error);
    return Response.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users/:id
export async function DELETE(request: Request, { id }: { id: string }) {
  try {
    // Check rate limit
    const clientId = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientId)) {
      return Response.json({ status: 'error', message: 'Too many requests' }, { status: 429 });
    }

    // Check authentication
    const token = verifyAuthToken(request);
    if (!token) {
      return Response.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return Response.json({ status: 'error', message: 'User not found' }, { status: 404 });
    }

    // Delete user
    users.splice(userIndex, 1);

    return Response.json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/users/:id error:', error);
    return Response.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
