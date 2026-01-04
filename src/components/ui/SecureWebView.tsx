/**
 * Secure WebView Component
 *
 * A secure WebView wrapper with JavaScript bridge and common features
 */

import { NATIVE_BRIDGE_SCRIPT, type WebMessage, parseWebMessage } from '@/services/webview';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';
import WebView, {
  type WebViewProps,
  type WebViewNavigation,
  type WebViewMessageEvent,
} from 'react-native-webview';

interface SecureWebViewProps extends Partial<WebViewProps> {
  /**
   * URL to load
   */
  url: string;

  /**
   * Custom JavaScript to inject
   */
  customScript?: string;

  /**
   * Enable JavaScript bridge
   * @default true
   */
  enableBridge?: boolean;

  /**
   * Show loading indicator
   * @default true
   */
  showLoading?: boolean;

  /**
   * Callback for messages from web
   */
  onWebMessage?: (message: WebMessage) => void;

  /**
   * Callback for navigation state changes
   */
  onNavigationChange?: (navState: WebViewNavigation) => void;

  /**
   * Allowed domains (whitelist)
   * If specified, navigation to other domains will be blocked
   */
  allowedDomains?: string[];

  /**
   * Custom style for container
   */
  style?: ViewStyle;
}

/**
 * Secure WebView Component
 *
 * @example
 * ```tsx
 * <SecureWebView
 *   url="https://example.com"
 *   onWebMessage={(message) => {
 *     console.log('Message from web:', message);
 *     if (message.type === 'user-action') {
 *       // Handle user action
 *     }
 *   }}
 *   allowedDomains={['example.com', 'api.example.com']}
 * />
 * ```
 */
export function SecureWebView({
  url,
  customScript,
  enableBridge = true,
  showLoading = true,
  onWebMessage,
  onNavigationChange,
  allowedDomains,
  style,
  ...props
}: SecureWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  const injectedScript = enableBridge
    ? `${NATIVE_BRIDGE_SCRIPT}\n${customScript || ''}`
    : customScript;

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const message = parseWebMessage(event);
      if (message) {
        // Handle console logs
        if (message.type.startsWith('console.')) {
          const level = message.type.split('.')[1];
          console.log(`[WebView ${level}]:`, message.payload.args);
          return;
        }

        // Handle bridge ready
        if (message.type === 'bridge-ready') {
          console.log('[WebView] Bridge ready:', message.payload);
          return;
        }

        // Forward to custom handler
        onWebMessage?.(message);
      }
    },
    [onWebMessage]
  );

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      // Check domain whitelist
      if (allowedDomains && navState.url) {
        const url = new URL(navState.url);
        const isAllowed = allowedDomains.some(
          (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
        );

        if (!isAllowed) {
          console.warn('[WebView] Navigation blocked:', navState.url);
          webViewRef.current?.stopLoading();
          return;
        }
      }

      onNavigationChange?.(navState);
    },
    [allowedDomains, onNavigationChange]
  );

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        injectedJavaScript={injectedScript}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        // Security settings
        mixedContentMode="never"
        allowsProtectedMedia={false}
        {...props}
      />

      {showLoading && loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}
    </View>
  );
}

/**
 * Expose WebView ref type for parent components
 */
export type SecureWebViewRef = WebView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
