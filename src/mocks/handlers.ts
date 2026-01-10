/**
 * MSW Request Handlers
 *
 * Define mock API responses for testing and development
 */

import { http, HttpResponse } from 'msw';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const handlers = [
  // ============= Auth Endpoints =============
  http.post(`${API_URL}/auth/sign-in`, async () => {
    return HttpResponse.json({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      },
      token: 'mock-jwt-token',
    });
  }),

  http.post(`${API_URL}/auth/sign-up`, async () => {
    return HttpResponse.json({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      },
      token: 'mock-jwt-token',
    });
  }),

  http.post(`${API_URL}/auth/sign-out`, async () => {
    return HttpResponse.json({ success: true });
  }),

  // ============= User Endpoints =============
  http.get(`${API_URL}/user/profile`, async () => {
    return HttpResponse.json({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://i.pravatar.cc/150?u=user-123',
      createdAt: '2024-01-01T00:00:00Z',
    });
  }),

  http.patch(`${API_URL}/user/profile`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: 'user-123',
      ...body,
    });
  }),

  // ============= Payment Endpoints =============
  http.post(`${API_URL}/payments/create-checkout`, async () => {
    return HttpResponse.json({
      url: 'https://checkout.stripe.com/mock-session-id',
    });
  }),

  http.post(`${API_URL}/payments/create-payment-intent`, async () => {
    return HttpResponse.json({
      clientSecret: 'mock_client_secret_123',
      publishableKey: 'pk_test_mock',
    });
  }),

  http.get(`${API_URL}/subscription/status`, async () => {
    return HttpResponse.json({
      isActive: true,
      willRenew: true,
      plan: 'yearly',
      expirationDate: '2025-12-31T23:59:59Z',
    });
  }),

  // ============= AI Endpoints =============
  http.post(`${API_URL}/ai/chat`, async () => {
    return new HttpResponse('Mock AI response', {
      headers: {
        'Content-Type': 'text/event-stream',
      },
    });
  }),

  http.post(`${API_URL}/ai/complete`, async () => {
    return HttpResponse.json({
      text: 'This is a mock AI completion response',
      usage: {
        promptTokens: 10,
        completionTokens: 15,
        totalTokens: 25,
      },
      finishReason: 'stop',
    });
  }),

  // ============= Error Scenarios =============
  http.get(`${API_URL}/error/400`, async () => {
    return HttpResponse.json({ error: 'Bad Request' }, { status: 400 });
  }),

  http.get(`${API_URL}/error/401`, async () => {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }),

  http.get(`${API_URL}/error/500`, async () => {
    return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }),

  // ============= Network Delay =============
  http.get(`${API_URL}/slow`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return HttpResponse.json({ data: 'Slow response' });
  }),
];
