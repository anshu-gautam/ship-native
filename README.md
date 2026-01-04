# React Native Expo Boilerplate

A production-ready, zero-setup React Native Expo app boilerplate with all the latest libraries and best practices pre-configured. Clone, install dependencies, add credentials, and start building features immediately.

## Features

### Core Stack
- **Expo SDK 54** with React Native 0.81 and React 19.1
- **Expo Router v4.0** with file-based routing, typed routes, and API routes
- **TypeScript 5.3+** with strict mode and path aliases
- **NativeWind v4** for Tailwind CSS styling with dark mode support
- **React Native Reanimated 3.16** for smooth 60fps animations
- **Precompiled XCFrameworks** for iOS (10x faster builds - 120s → 10s)

### Authentication & Backend
- **Clerk** for complete authentication (sign-up, sign-in, OAuth, email verification, password reset)
- **Supabase** for PostgreSQL database, real-time subscriptions, and storage
- **Expo API Routes** for backend endpoints with authentication and rate limiting middleware

### AI Integration (NEW!)
- **Vercel AI SDK** with unified interface for multiple LLM providers
- **OpenAI Provider** with GPT-4o for chat and DALL-E 3 for image generation
- **Streaming Support** with Server-Sent Events (SSE) for real-time token streaming
- **Provider Abstraction** to swap models/providers with one line
- **Tools/Functions** pattern for function calling (Supabase lookups, calculations, etc.)
- **Type-Safe** Zod schemas for all AI requests and responses
- **Protected Endpoints** with Clerk authentication and per-user rate limiting (20 req/hour)
- **Sentry Instrumentation** for latency, token usage, and error tracking
- **useAIChat Hook** with streaming state, abort support, and network awareness
- **AI Playground** demo screen with Chat, Completions, and Image Generation

### State Management & Data
- **Zustand 4** for global state management with MMKV persistence
- **TanStack Query v5** for server state, caching, and synchronization
- **Offline-First Support** with TanStack Query persistence and MMKV storage
- **MMKV** for fast key-value storage (replacing AsyncStorage)

### Testing & Quality
- **Jest 29** with React Native Testing Library
- **Test Coverage** for services and utilities
- **TypeScript Strict Mode** for type safety
- **Biome** for fast linting and formatting (replacing ESLint + Prettier)
- **Husky + lint-staged** for pre-commit hooks
- **Commitlint** for conventional commit message enforcement

### Media & Device Features (NEW!)
- **Expo Camera** for photo and video capture
- **Expo Image Picker** for gallery access
- **Expo Media Library** for media management
- **Multi-Image Selection** with configurable limits
- **Video Support** with quality and duration controls
- **Biometric Authentication** (Face ID, Touch ID, Fingerprint)
- **Secure Storage** with biometric protection

### Push Notifications & Communication (NEW!)
- **Expo Notifications** for local and push notifications
- **Notification Permissions** handling
- **Notification Channels** (Android)
- **Badge Management** for app icons
- **Custom Notification Triggers** (time, location)

### Background Tasks & Offline (NEW!)
- **Background Fetch** for periodic data sync
- **Task Manager** for background job scheduling
- **Offline Query Persistence** with automatic retry
- **Network-Aware Data Fetching** with graceful degradation

### Analytics & Monitoring (NEW!)
- **PostHog** for product analytics and feature flags
- **Event Tracking** with custom properties
- **Screen View Tracking** with Expo Router integration
- **User Identification** and properties
- **Feature Flags** for A/B testing
- **Sentry** for production-ready error monitoring and crash reporting
  - Automatic error tracking with global error handlers
  - React Error Boundaries with fallback UI
  - Performance monitoring and navigation tracking
  - Source maps upload for readable stack traces
  - Release and environment tracking
  - User context and breadcrumbs
  - See [Error Monitoring Guide](docs/ERROR_MONITORING.md)

### Deep Linking & Navigation (NEW!)
- **Universal Links** (iOS) and App Links (Android) support
- **Custom URL Schemes** configuration
- **Deep Link Parsing** utilities
- **Route Generation** helpers
- **Expo Router** integration for seamless navigation

### UI/UX & User Engagement (NEW!)
- **Toast Notifications** with success, error, warning, info types
- **Network Status Banner** for offline/online state
- **QR/Barcode Scanner** with multiple format support
- **Social Sharing** (WhatsApp, Twitter, Facebook, Instagram, Email, SMS)
- **File Sharing** with native share sheet
- **App Rating Prompts** with smart timing and frequency controls
- **Haptic Feedback** integration throughout
- **Skeleton Loaders** with shimmer animation for loading states
- **Empty States** component for no-data scenarios
- **Pull-to-Refresh** pattern for data reloading
- **Infinite Scroll** helper for pagination
- **Bottom Sheet** component with swipeable modal
- **Image Carousel** with pagination dots and auto-play

### File Management & Device Features (LATEST!)
- **Document Picker** for selecting files from device storage
- **File Upload** with progress tracking
- **File Download** with resume capability
- **File Operations** (copy, move, delete, read, write)
- **Clipboard Management** (copy, paste, check)
- **Contacts Access** with permission handling
- **Calendar Integration** (create events, get calendars)
- **Device Information** (brand, model, OS, memory)
- **Battery Status** and low power mode detection
- **Network State** monitoring and IP address retrieval

### App Lifecycle & Update Management (LATEST!)
- **Onboarding Flow** with swipeable carousel
- **Force Update** mechanism with version checking
- **App Shortcuts** (iOS Quick Actions, Android App Shortcuts)
- **Version Comparison** utilities
- **Smart Onboarding** with step tracking and skip option

### WebView & Web Content (LATEST!)
- **Secure WebView** component with JavaScript bridge
- **Native-to-Web Messaging** bidirectional communication
- **Cookie Management** utilities
- **Local Storage** integration from native side
- **Domain Whitelisting** for security
- **Console Logging** from web to native

### Payment & Monetization (LATEST!)
- **RevenueCat + Stripe** integration guide
- **Cross-Platform Subscriptions** (iOS, Android, Web)
- **External Payment Links** (post-Epic v. Apple 2025)
- **Subscription Management** with entitlements
- **Receipt Validation** and restore purchases
- **Comprehensive Documentation** with setup steps

### Forms & Validation
- **React Hook Form 7** for performant form management
- **Zod** for TypeScript-first schema validation

### Utilities & Features
- **i18next** with expo-localization for internationalization and RTL support
- **Expo Haptics** for haptic feedback
- **date-fns** for date formatting
- Path aliases (`@/components`, `@/features`, `@/lib`, `@/types`)

### Build & Deployment
- **EAS Build** for cloud builds (development, preview, production)
- **EAS Update** for over-the-air updates
- **Auto-Increment** build numbers
- **Multi-Environment** configuration (dev, preview, prod)

## Project Structure

```
my-app/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                   # Auth group
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   ├── forgot-password.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── index.tsx             # Home screen
│   │   ├── profile.tsx
│   │   ├── settings.tsx
│   │   └── _layout.tsx
│   ├── api/                      # API routes
│   │   ├── health+api.ts
│   │   ├── users/
│   │   │   └── [id]+api.ts
│   │   └── middleware/
│   │       ├── auth.ts
│   │       └── rateLimit.ts
│   ├── _layout.tsx               # Root layout with providers
│   └── +not-found.tsx
├── src/
│   ├── features/                 # Feature-based modules
│   │   ├── auth/
│   │   │   └── schemas/          # Zod validation schemas
│   │   ├── user/
│   │   └── notes/
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── NetworkStatusBanner.tsx
│   │   │   ├── BarcodeScanner.tsx
│   │   │   ├── SkeletonLoader.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── ImageCarousel.tsx
│   │   │   ├── OnboardingCarousel.tsx
│   │   │   ├── ForceUpdateModal.tsx
│   │   │   └── SecureWebView.tsx
│   │   └── layout/               # Layout components
│   │       ├── Screen.tsx
│   │       └── Container.tsx
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   ├── useTheme.ts
│   │   ├── useI18n.ts
│   │   ├── useToast.ts
│   │   ├── usePullToRefresh.ts
│   │   └── useInfiniteScroll.ts
│   ├── store/                    # Zustand stores
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   └── uiStore.ts
│   ├── services/                 # External services
│   │   ├── clerk.ts
│   │   ├── supabase.ts
│   │   ├── api.ts
│   │   ├── media.ts
│   │   ├── notifications.ts
│   │   ├── toast.ts
│   │   ├── sharing.ts
│   │   ├── appRating.ts
│   │   ├── scanner.ts
│   │   ├── fileManagement.ts
│   │   ├── deviceFeatures.ts
│   │   ├── onboarding.ts
│   │   ├── forceUpdate.ts
│   │   ├── appShortcuts.ts
│   │   └── webview.ts
│   ├── lib/                      # Library configurations
│   │   ├── i18n/
│   │   │   ├── index.ts
│   │   │   └── locales/
│   │   │       ├── en.json
│   │   │       ├── es.json
│   │   │       └── ar.json
│   │   ├── mmkv.ts
│   │   ├── queryClient.ts
│   │   └── sentry.ts
│   ├── types/                    # TypeScript types
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── navigation.ts
│   ├── utils/                    # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   └── constants/                # App constants
│       ├── colors.ts
│       ├── fonts.ts
│       └── spacing.ts
├── assets/                       # Static assets
│   ├── fonts/
│   ├── images/
│   └── icons/
├── docs/                         # Documentation
│   ├── ERROR_MONITORING.md       # Sentry error monitoring guide
│   └── PAYMENT_INTEGRATION.md    # Payment setup guide
├── .env.local.example            # Environment variables template
├── .env.production.example
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
├── biome.json                    # Biome configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for builds): `npm install -g eas-cli`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-native-expo-boilerplate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your credentials:
   - **Clerk**: Get your publishable key from [clerk.com](https://clerk.com)
   - **Supabase**: Get your URL and anon key from [supabase.com](https://supabase.com)
   - **Sentry**: Get your DSN from [sentry.io](https://sentry.io)

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on a device or simulator**
   - iOS: Press `i` in the terminal or run `npm run ios`
   - Android: Press `a` in the terminal or run `npm run android`
   - Web: Press `w` in the terminal or run `npm run web`

### Configuration

#### 1. Clerk Authentication

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable key to `.env.local`:
   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```
4. Configure OAuth providers (optional) in Clerk dashboard

#### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env.local`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://...supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJh...
   ```
3. Set up your database schema and row-level security policies

#### 3. Sentry Error Monitoring

1. Create a project at [sentry.io](https://sentry.io)
2. Copy your DSN to `.env.local`:
   ```
   EXPO_PUBLIC_SENTRY_DSN=https://...@o...ingest.sentry.io/...
   ```

#### 4. EAS Build Configuration

1. Log in to EAS:
   ```bash
   eas login
   ```

2. Configure your project:
   ```bash
   eas build:configure
   ```

3. Update `eas.json` with your specific configuration

## Scripts

```bash
# Development
npm start              # Start Expo development server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Run on web

# Testing
npm test               # Run Jest tests
npm test -- --coverage # Run tests with coverage report
npm test -- --watch    # Run tests in watch mode

# Code Quality
npm run lint           # Run Biome linter
npm run format         # Format code with Biome
npm run check          # Lint and format in one command
npm run type-check     # Run TypeScript type checking

# Building
npm run prebuild       # Generate native projects
npm run build:android  # Build Android app with EAS
npm run build:ios      # Build iOS app with EAS
npm run build:all      # Build both platforms
```

## Architecture

### Path Aliases

The project uses TypeScript path aliases for clean imports:

```typescript
import { Button } from '@/components';
import { useAuth } from '@/hooks';
import { apiClient } from '@/services';
import type { User } from '@/types';
```

### State Management

- **Zustand** for client state (auth, user preferences, UI state)
- **TanStack Query** for server state (API data, caching)
- **MMKV** for persisting Zustand stores

### Styling

The project uses **NativeWind v4** which brings Tailwind CSS to React Native:

```tsx
<View className="flex-1 bg-white dark:bg-gray-900">
  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
    Hello World
  </Text>
</View>
```

### Forms

Forms are handled with **React Hook Form** and validated with **Zod**:

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

### Internationalization

Use the `useI18n` hook to access translations:

```typescript
const { t, changeLanguage } = useI18n();

<Text>{t('auth.signIn')}</Text>
```

Add new languages in `src/lib/i18n/locales/`.

### API Routes

Create API endpoints in the `app/api/` directory:

```typescript
// app/api/example+api.ts
export async function GET(req: ExpoRequest) {
  return Response.json({ message: 'Hello' });
}
```

## AI Integration

The boilerplate includes a complete AI module built on the Vercel AI SDK with streaming support, provider abstraction, and production-ready security.

### Setup

1. **Add your OpenAI API key** to `.env.local`:
   ```bash
   # ⚠️ SERVER-ONLY - Never use EXPO_PUBLIC_ prefix!
   OPENAI_API_KEY=sk-your-key-here
   AI_PROVIDER=openai
   ```

2. **Security Warning**: AI API keys are **SERVER-ONLY**. They:
   - Must NOT be prefixed with `EXPO_PUBLIC_`
   - Can ONLY be accessed in `/app/api/` routes
   - Will NOT be bundled in the client app
   - Are protected by Clerk authentication and rate limiting

### Available Endpoints

#### Chat (Streaming)
```typescript
POST /api/ai/chat

Body: {
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  systemPrompt?: string,
  temperature?: number,  // 0-2, default: 0.7
  maxTokens?: number,    // default: 1000
  stream?: boolean,      // default: true
  tools?: string[]       // optional: ['searchNotes', 'getCurrentTime', etc.]
}

Response: Server-Sent Events (SSE) with NDJSON chunks
```

#### Completion (Single-shot)
```typescript
POST /api/ai/complete

Body: {
  prompt: string,
  systemPrompt?: string,
  temperature?: number,
  maxTokens?: number
}

Response: { text: string, usage: {...}, finishReason: string }
```

#### Image Generation
```typescript
POST /api/ai/image

Body: {
  prompt: string,
  size?: '1024x1024' | '1792x1024' | '1024x1792',
  quality?: 'standard' | 'hd',
  style?: 'vivid' | 'natural'
}

Response: { images: Array<{ url: string }> }
```

### Using the AI Chat Hook

```typescript
import { useAIChat } from '@/features/ai/hooks';

function ChatComponent() {
  const {
    messages,        // Message history
    isLoading,       // Request in progress
    isStreaming,     // Tokens streaming
    error,           // Error state
    send,            // Send message function
    abort,           // Abort current request
    clear,           // Clear history
    isOnline,        // Network status
  } = useAIChat({
    systemPrompt: 'You are a helpful assistant',
    temperature: 0.7,
    maxTokens: 1000,
  });

  return (
    // Your UI here
    <Button onPress={() => send('Hello!')}>Send</Button>
  );
}
```

### Provider Abstraction

Swap AI providers with one line:

```typescript
// src/services/ai/provider.ts
export const getAIProvider = (): AIProvider => {
  return 'openai';  // Change to 'anthropic', 'google', or 'local'
};
```

### Tools / Function Calling

Define server-side tools that the AI can invoke:

```typescript
// app/api/ai/tools.ts
export const searchNotesTool = tool({
  description: 'Search user notes',
  parameters: z.object({
    query: z.string(),
  }),
  execute: async ({ query }) => {
    const { data } = await supabase
      .from('notes')
      .textSearch('content', query);
    return { results: data };
  },
});
```

Use in requests:
```typescript
POST /api/ai/chat
{
  "messages": [...],
  "tools": ["searchNotes", "getCurrentTime"]
}
```

### Rate Limiting

AI endpoints are rate limited per user:
- **20 requests per hour** per user
- Responses include rate limit headers:
  - `X-RateLimit-Limit: 20`
  - `X-RateLimit-Remaining: 15`
  - `X-RateLimit-Reset: 1234567890`

### AI Playground

Access the demo screen at `/ai` tab to try:
- **Chat**: Streaming conversational AI
- **Completions**: Single-shot text generation
- **Images**: DALL-E 3 image generation

### Monitoring

All AI requests are instrumented with Sentry:
- Request latency
- Token usage
- Stream aborts
- Provider errors
- Error context

### Optional: On-Device Inference

To add local model support:

1. Set provider flag:
   ```typescript
   AI_PROVIDER=local
   ```

2. Implement provider in `src/services/ai/provider.ts`:
   ```typescript
   // TODO: Add react-native-ai or MLC implementation
   ```

Note: Cloud-based is default and recommended for production.

## Customization

### Theme Colors

Edit `src/constants/colors.ts` to customize your app's color scheme.

### Fonts

1. Add font files to `assets/fonts/`
2. Update `app.json` plugin configuration
3. Update `src/constants/fonts.ts`

### App Name and Bundle ID

1. Update `app.json`:
   - `name`: Display name
   - `slug`: URL-friendly name
   - `ios.bundleIdentifier`: iOS bundle ID
   - `android.package`: Android package name

## Best Practices

1. **Use path aliases** for imports
2. **Follow feature-based structure** for scalable code organization
3. **Use TypeScript strictly** - the project has strict mode enabled
4. **Commit with conventional commits** - enforced by commitlint
5. **Format before committing** - handled by lint-staged
6. **Use Zod schemas** for all form validation
7. **Leverage TanStack Query** for API data fetching
8. **Use MMKV** instead of AsyncStorage for better performance

## Common Tasks

### Adding a New Screen

1. Create the screen file in `app/` or `app/(group)/`
2. Expo Router will automatically handle routing

### Adding a New API Endpoint

1. Create a file in `app/api/` with `+api.ts` suffix
2. Export GET, POST, PUT, DELETE, or PATCH functions
3. Use middleware for authentication and rate limiting

### Adding a New Feature

1. Create a folder in `src/features/`
2. Add components, hooks, services, and schemas
3. Export from the feature's index file

### Adding New Translations

1. Add keys to `src/lib/i18n/locales/*.json`
2. Use `t('key')` to access translations

## Troubleshooting

### Clear Cache

```bash
npx expo start -c
```

### Reset Dependencies

```bash
rm -rf node_modules
npm install
```

### iOS Build Issues

```bash
cd ios && pod install && cd ..
```

## License

MIT

## Support

For issues and questions:
- Check the [Expo documentation](https://docs.expo.dev)
- Visit [Clerk docs](https://clerk.com/docs)
- Read [Supabase docs](https://supabase.com/docs)

---

**Happy coding! 🚀**
# ship-native
