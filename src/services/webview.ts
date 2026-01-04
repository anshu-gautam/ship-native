/**
 * WebView Service
 *
 * Utilities for WebView management and JavaScript bridge communication
 */

import { Platform } from 'react-native';
import type { WebView } from 'react-native-webview';

/**
 * Message payload types
 */
export type WebMessagePayload =
  | { message: string }
  | { args: unknown[] }
  | { userAgent: string; platform: string }
  | { key: string; value: string | null }
  | string
  | undefined;

/**
 * Message from web to native
 */
export interface WebMessage {
  type: string;
  payload?: WebMessagePayload;
}

/**
 * JavaScript code to inject into WebView for native bridge
 */
export const NATIVE_BRIDGE_SCRIPT = `
  (function() {
    // Create native bridge object
    window.ReactNativeWebView = window.ReactNativeWebView || {};

    // Helper to post messages to native
    window.postMessageToNative = function(type, payload) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: type,
          payload: payload
        }));
      }
    };

    // Helper to log from web to native console
    window.logToNative = function(message) {
      window.postMessageToNative('log', { message: message });
    };

    // Override console methods to log to native
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
    };

    console.log = function(...args) {
      originalConsole.log.apply(console, args);
      window.postMessageToNative('console.log', { args: args });
    };

    console.warn = function(...args) {
      originalConsole.warn.apply(console, args);
      window.postMessageToNative('console.warn', { args: args });
    };

    console.error = function(...args) {
      originalConsole.error.apply(console, args);
      window.postMessageToNative('console.error', { args: args });
    };

    // Notify native that bridge is ready
    window.postMessageToNative('bridge-ready', {
      userAgent: navigator.userAgent,
      platform: '${Platform.OS}',
    });
  })();
  true; // Required for iOS
`;

/**
 * Send message from native to web
 */
export function sendMessageToWeb(
  webViewRef: React.RefObject<WebView>,
  type: string,
  payload?: WebMessagePayload
): void {
  const message = JSON.stringify({ type, payload });
  const script = `
    (function() {
      if (window.onNativeMessage) {
        window.onNativeMessage(${message});
      }
    })();
    true;
  `;
  webViewRef.current?.injectJavaScript(script);
}

/**
 * WebView message event type
 */
export interface WebViewMessageEvent {
  nativeEvent: {
    data: string;
  };
}

/**
 * Parse message from web
 */
export function parseWebMessage(event: WebViewMessageEvent): WebMessage | null {
  try {
    const data = JSON.parse(event.nativeEvent.data) as WebMessage;
    return data;
  } catch (error) {
    console.error('Error parsing web message:', error);
    return null;
  }
}

/**
 * Common security headers for WebView
 */
export const SECURE_HEADERS = {
  'Content-Security-Policy': "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';",
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/**
 * Cookie management utilities
 */
export const CookieManager = {
  /**
   * Set a cookie in WebView
   */
  setCookie: (
    webViewRef: React.RefObject<WebView>,
    name: string,
    value: string,
    options?: {
      domain?: string;
      path?: string;
      expires?: Date;
      secure?: boolean;
      httpOnly?: boolean;
    }
  ) => {
    const expires = options?.expires ? `expires=${options.expires.toUTCString()};` : '';
    const domain = options?.domain ? `domain=${options.domain};` : '';
    const path = options?.path ? `path=${options.path};` : 'path=/;';
    const secure = options?.secure ? 'secure;' : '';
    const httpOnly = options?.httpOnly ? 'httpOnly;' : '';

    const cookie = `${name}=${value};${expires}${domain}${path}${secure}${httpOnly}`;
    const script = `document.cookie = "${cookie}"; true;`;
    webViewRef.current?.injectJavaScript(script);
  },

  /**
   * Get all cookies from WebView
   */
  getCookies: async (webViewRef: React.RefObject<WebView>): Promise<string> => {
    return new Promise((resolve) => {
      const script = `
        (function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'cookies',
            payload: document.cookie
          }));
        })();
        true;
      `;
      webViewRef.current?.injectJavaScript(script);
      // Note: You'll need to handle the message in onMessage to get the cookies
      resolve('');
    });
  },

  /**
   * Clear all cookies
   */
  clearCookies: (webViewRef: React.RefObject<WebView>) => {
    const script = `
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  },
};

/**
 * Local storage utilities
 */
export const LocalStorageManager = {
  /**
   * Set item in localStorage
   */
  setItem: (webViewRef: React.RefObject<WebView>, key: string, value: string) => {
    const script = `localStorage.setItem("${key}", "${value}"); true;`;
    webViewRef.current?.injectJavaScript(script);
  },

  /**
   * Get item from localStorage
   */
  getItem: async (webViewRef: React.RefObject<WebView>, key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const script = `
        (function() {
          const value = localStorage.getItem("${key}");
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'localStorage-item',
            payload: { key: "${key}", value: value }
          }));
        })();
        true;
      `;
      webViewRef.current?.injectJavaScript(script);
      // Handle in onMessage to get the value
      resolve(null);
    });
  },

  /**
   * Remove item from localStorage
   */
  removeItem: (webViewRef: React.RefObject<WebView>, key: string) => {
    const script = `localStorage.removeItem("${key}"); true;`;
    webViewRef.current?.injectJavaScript(script);
  },

  /**
   * Clear all localStorage
   */
  clear: (webViewRef: React.RefObject<WebView>) => {
    const script = 'localStorage.clear(); true;';
    webViewRef.current?.injectJavaScript(script);
  },
};

/**
 * Execute JavaScript in WebView
 */
export function executeScript(webViewRef: React.RefObject<WebView>, script: string): void {
  webViewRef.current?.injectJavaScript(`${script}; true;`);
}

/**
 * Get current URL from WebView
 */
export function getCurrentUrl(webViewRef: React.RefObject<WebView>): Promise<string> {
  return new Promise((resolve) => {
    const script = `
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'current-url',
        payload: window.location.href
      }));
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
    // Handle in onMessage to get the URL
    resolve('');
  });
}
