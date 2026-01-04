/**
 * useAIChat Hook
 *
 * Client-side hook for streaming AI chat functionality.
 * Provides send/abort, message history, system prompts, and streaming state.
 * Degrades gracefully when offline.
 */

import { useNetInfo } from '@react-native-community/netinfo';
import { useCallback, useRef, useState } from 'react';
import type { ChatRequest } from '../schemas';

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface UseAIChatOptions {
  apiUrl?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  onError?: (error: Error) => void;
}

export interface UseAIChatReturn {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: Error | null;
  send: (content: string) => Promise<void>;
  abort: () => void;
  clear: () => void;
  setSystemPrompt: (prompt: string) => void;
  isOnline: boolean;
}

export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const {
    apiUrl = '/api/ai/chat',
    systemPrompt: initialSystemPrompt,
    temperature = 0.7,
    maxTokens = 1000,
    onError,
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string | undefined>(initialSystemPrompt);

  const abortControllerRef = useRef<AbortController | null>(null);
  const netInfo = useNetInfo();
  const isOnline = netInfo.isConnected ?? true;

  /**
   * Generate unique message ID
   */
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Send a message to the AI
   */
  const send = useCallback(
    async (content: string) => {
      if (!isOnline) {
        const offlineError = new Error('No internet connection. Please check your network.');
        setError(offlineError);
        onError?.(offlineError);
        return;
      }

      if (isLoading) {
        return;
      }

      setIsLoading(true);
      setError(null);

      // Create user message
      const userMessage: Message = {
        id: generateMessageId(),
        role: 'user',
        content,
        createdAt: new Date(),
      };

      // Add user message to history
      setMessages((prev) => [...prev, userMessage]);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        // Prepare request body
        const requestBody: ChatRequest = {
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            {
              role: userMessage.role,
              content: userMessage.content,
            },
          ],
          systemPrompt,
          temperature,
          maxTokens,
          stream: true,
        };

        // Get auth token (from your auth store)
        const token = 'your-auth-token'; // TODO: Get from auth store

        // Make streaming request
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to get AI response');
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        // Create assistant message placeholder
        const assistantMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: '',
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsStreaming(true);

        // Read stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });

          // Parse NDJSON chunks
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('0:')) {
              // Text chunk
              const text = JSON.parse(line.substring(2));
              assistantContent += text;

              // Update assistant message with accumulated content
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id ? { ...m, content: assistantContent } : m
                )
              );
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was aborted
          return;
        }

        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [
      isOnline,
      isLoading,
      messages,
      systemPrompt,
      temperature,
      maxTokens,
      apiUrl,
      generateMessageId,
      onError,
    ]
  );

  /**
   * Abort the current request
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, []);

  /**
   * Clear message history
   */
  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    send,
    abort,
    clear,
    setSystemPrompt,
    isOnline,
  };
}
