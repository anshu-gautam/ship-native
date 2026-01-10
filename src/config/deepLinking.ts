/**
 * Deep Linking Configuration
 *
 * Provides configuration for universal links and deep linking
 *
 * Setup Instructions:
 * 1. Configure your app scheme in app.json
 * 2. Set up universal links for iOS (Associated Domains)
 * 3. Set up App Links for Android (assetlinks.json)
 * 4. Use Expo Router's built-in deep linking support
 */

/**
 * App URL scheme
 * This should match the scheme defined in your app.json
 */
export const APP_SCHEME = 'myapp';

/**
 * Deep link prefixes
 * Add your production domain(s) here
 */
export const DEEP_LINK_PREFIXES = [
  `${APP_SCHEME}://`,
  'https://yourapp.com',
  'https://www.yourapp.com',
];

/**
 * Parse deep link URL and extract parameters
 * @param url The deep link URL
 * @returns Parsed route and params
 */
export function parseDeepLink(url: string): {
  route: string;
  params: Record<string, string>;
} | null {
  try {
    const urlObj = new URL(url);
    const route = urlObj.pathname;
    const params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return { route, params };
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
}

/**
 * Common deep link routes
 * Define your app's deep link routes here for consistency
 */
export const DeepLinkRoutes = {
  HOME: '/',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  // Auth routes
  SIGN_IN: '/(auth)/sign-in',
  SIGN_UP: '/(auth)/sign-up',
  RESET_PASSWORD: '/(auth)/reset-password',
  // Dynamic routes (examples)
  USER_PROFILE: (userId: string) => `/users/${userId}`,
  POST_DETAIL: (postId: string) => `/posts/${postId}`,
} as const;

/**
 * Generate a deep link URL
 * @param route App route
 * @param params Optional query parameters
 * @returns Deep link URL
 */
export function generateDeepLink(route: string, params?: Record<string, string>): string {
  const baseUrl = DEEP_LINK_PREFIXES[0];
  const url = new URL(route, baseUrl);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }
  }

  return url.toString();
}

/**
 * Universal Links Configuration for iOS
 *
 * Add to your app.json:
 * ```json
 * {
 *   "expo": {
 *     "ios": {
 *       "associatedDomains": [
 *         "applinks:yourapp.com",
 *         "applinks:www.yourapp.com"
 *       ]
 *     }
 *   }
 * }
 * ```
 *
 * Then create an apple-app-site-association file on your server:
 * https://yourapp.com/.well-known/apple-app-site-association
 */

/**
 * App Links Configuration for Android
 *
 * Add to your app.json:
 * ```json
 * {
 *   "expo": {
 *     "android": {
 *       "intentFilters": [
 *         {
 *           "action": "VIEW",
 *           "autoVerify": true,
 *           "data": [
 *             {
 *               "scheme": "https",
 *               "host": "yourapp.com"
 *             }
 *           ],
 *           "category": ["BROWSABLE", "DEFAULT"]
 *         }
 *       ]
 *     }
 *   }
 * }
 * ```
 *
 * Then create an assetlinks.json file on your server:
 * https://yourapp.com/.well-known/assetlinks.json
 */
