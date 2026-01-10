# API Mocking with MSW

This project uses [Mock Service Worker (MSW)](https://mswjs.io/) for API mocking in tests and development.

## Why MSW?

- **Network-level mocking** - Intercepts requests at the network level
- **Works everywhere** - Tests, Storybook, development
- **TypeScript support** - Fully typed mocks
- **No code changes** - Works with existing fetch/axios code
- **Realistic** - Simulates actual network behavior

## Usage

### In Tests

MSW is automatically enabled in Jest tests. No setup needed!

```typescript
import { render, screen } from '@testing-library/react-native';
import { ProfileScreen } from './ProfileScreen';

test('displays user profile', async () => {
  render(<ProfileScreen />);

  // MSW automatically returns mock data
  expect(await screen.findByText('Test User')).toBeTruthy();
  expect(await screen.findByText('test@example.com')).toBeTruthy();
});
```

### Override Handlers in Tests

```typescript
import { server } from '@/mocks';
import { http, HttpResponse } from 'msw';

test('handles error state', async () => {
  // Override handler for this test only
  server.use(
    http.get('/api/user/profile', () => {
      return HttpResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    })
  );

  render(<ProfileScreen />);
  expect(await screen.findByText('Error loading profile')).toBeTruthy();
});
```

### In Development (Optional)

Enable mocking in development to work offline or test edge cases:

```typescript
// app/_layout.tsx
import { startMocking } from '@/mocks';

export default function RootLayout() {
  useEffect(() => {
    // Only in development
    if (__DEV__ && process.env.EXPO_PUBLIC_ENABLE_MOCKS === 'true') {
      startMocking();
    }
  }, []);

  // ... rest of layout
}
```

Then set in `.env.local`:
```bash
EXPO_PUBLIC_ENABLE_MOCKS=true
```

## Mock Handlers

### Available Mock Endpoints

All handlers are defined in `src/mocks/handlers.ts`:

**Authentication:**
- `POST /api/auth/sign-in` - Mock sign in
- `POST /api/auth/sign-up` - Mock sign up
- `POST /api/auth/sign-out` - Mock sign out

**User:**
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update user profile

**Payments:**
- `POST /api/payments/create-checkout` - Create Stripe checkout
- `POST /api/payments/create-payment-intent` - Create payment intent
- `GET /api/subscription/status` - Get subscription status

**AI:**
- `POST /api/ai/chat` - AI chat completion
- `POST /api/ai/complete` - AI text completion

**Error Testing:**
- `GET /api/error/400` - Returns 400 Bad Request
- `GET /api/error/401` - Returns 401 Unauthorized
- `GET /api/error/500` - Returns 500 Server Error

**Performance Testing:**
- `GET /api/slow` - Returns after 3 second delay

### Adding New Handlers

Edit `src/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // ... existing handlers

  // Add new handler
  http.get('/api/posts', async () => {
    return HttpResponse.json({
      posts: [
        { id: 1, title: 'First Post', content: 'Hello' },
        { id: 2, title: 'Second Post', content: 'World' },
      ],
    });
  }),

  // With dynamic response
  http.post('/api/posts', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: Math.random(),
      ...body,
      createdAt: new Date().toISOString(),
    });
  }),

  // With delay
  http.get('/api/slow-endpoint', async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return HttpResponse.json({ data: 'Slow response' });
  }),
];
```

### Path Parameters

```typescript
http.get('/api/users/:userId', async ({ params }) => {
  const { userId } = params;
  return HttpResponse.json({
    id: userId,
    name: `User ${userId}`,
  });
});
```

### Query Parameters

```typescript
http.get('/api/search', async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  return HttpResponse.json({
    query,
    results: [`Result for ${query}`],
  });
});
```

### Request Headers

```typescript
http.get('/api/protected', async ({ request }) => {
  const token = request.headers.get('Authorization');

  if (!token) {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return HttpResponse.json({ data: 'Protected data' });
});
```

## Testing Scenarios

### Network Errors

```typescript
import { server } from '@/mocks';
import { HttpResponse } from 'msw';

test('handles network error', async () => {
  server.use(
    http.get('/api/data', () => {
      return HttpResponse.error();
    })
  );

  // Test your error handling
});
```

### Timeouts

```typescript
test('handles timeout', async () => {
  server.use(
    http.get('/api/data', async () => {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      return HttpResponse.json({ data: 'Too late' });
    })
  );

  // Test your timeout handling
});
```

### Race Conditions

```typescript
test('handles race condition', async () => {
  let requestCount = 0;

  server.use(
    http.get('/api/data', async () => {
      requestCount++;
      await new Promise((resolve) => setTimeout(resolve, 100));
      return HttpResponse.json({ count: requestCount });
    })
  );

  // Make multiple simultaneous requests
});
```

## Best Practices

1. **Keep mocks realistic** - Match your actual API responses
2. **Use TypeScript** - Type your mock responses
3. **Test error states** - Override handlers to test errors
4. **Reset after tests** - MSW does this automatically
5. **Document mocks** - Add comments explaining mock behavior

## Debugging

### Log all requests

```typescript
server.events.on('request:start', ({ request }) => {
  console.log('MSW intercepted:', request.method, request.url);
});
```

### Disable mocking for specific tests

```typescript
import { server } from '@/mocks';

test('with real API', async () => {
  server.close();
  // Test runs with real API
  server.listen();
});
```

## Resources

- [MSW Documentation](https://mswjs.io/)
- [MSW Recipes](https://mswjs.io/docs/recipes)
- [React Native Setup](https://mswjs.io/docs/integrations/react-native)
