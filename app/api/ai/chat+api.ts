/**
 * AI Chat API Route
 *
 * POST /api/ai/chat
 *
 * Streaming conversational AI endpoint using the Vercel AI SDK.
 * Returns Server-Sent Events (SSE) for token streaming.
 *
 * Request Body:
 * {
 *   messages: Array<{ role: string, content: string }>,
 *   systemPrompt?: string,
 *   temperature?: number (0-2, default: 0.7),
 *   maxTokens?: number (default: 1000),
 *   stream?: boolean (default: true),
 *   tools?: string[] (optional tool names)
 * }
 *
 * Response:
 * - Streaming: text/event-stream with NDJSON chunks
 * - Non-streaming: application/json with full response
 */

import { streamText } from 'ai';
import { protectAIEndpoint, getRateLimitHeaders } from './middleware';
import { getCurrentProvider, validateProviderKeys } from '@/services/ai/provider';
import { chatRequestSchema } from '@/features/ai/schemas';
import { logError, addBreadcrumb } from '@/lib/sentry';
import { getTools } from './tools';

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Validate provider configuration
    const providerValidation = validateProviderKeys();
    if (!providerValidation.valid) {
      return Response.json(
        {
          error: 'AI Provider Not Configured',
          code: 'PROVIDER_ERROR',
          message: providerValidation.error,
        },
        { status: 500 }
      );
    }

    // Protect endpoint with auth and rate limiting
    const authResult = await protectAIEndpoint(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { userId } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const validation = chatRequestSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        {
          error: 'Invalid Request',
          code: 'VALIDATION_ERROR',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { messages, systemPrompt, temperature, maxTokens, stream, tools: toolNames } = validation.data;

    // Add Sentry breadcrumb
    addBreadcrumb({
      message: 'AI Chat Request',
      category: 'ai',
      data: {
        userId,
        messageCount: messages.length,
        temperature,
        maxTokens,
        stream,
      },
    });

    // Get AI provider
    const provider = getCurrentProvider();

    // Get requested tools if specified
    const tools = toolNames && toolNames.length > 0 ? getTools(toolNames) : undefined;

    // Create system message if provided
    const systemMessages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }]
      : [];

    // Stream response using AI SDK
    // Note: maxTokens is not directly supported in AI SDK v5
    // Token limits are controlled by the model configuration
    const result = streamText({
      model: provider.chat,
      messages: [...systemMessages, ...messages] as any,
      temperature,
      tools: tools as any,
      onFinish: (event) => {
        // Log completion metrics to Sentry
        const duration = Date.now() - startTime;
        addBreadcrumb({
          message: 'AI Chat Completed',
          category: 'ai',
          data: {
            userId,
            duration,
            tokensUsed: event.usage?.totalTokens,
            finishReason: event.finishReason,
          },
        });
      },
    });

    // Return streaming response
    if (stream !== false) {
      return result.toTextStreamResponse({
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          ...getRateLimitHeaders(userId),
        },
      });
    }

    // Return non-streaming response
    const response = await result.text;
    return Response.json(
      {
        text: response,
        usage: result.usage,
        finishReason: result.finishReason,
      },
      {
        headers: getRateLimitHeaders(userId),
      }
    );
  } catch (error) {
    // Log error to Sentry
    logError(error as Error, {
      context: 'AI Chat API',
      duration: Date.now() - startTime,
    });

    console.error('AI Chat error:', error);

    return Response.json(
      {
        error: 'AI Request Failed',
        code: 'AI_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
