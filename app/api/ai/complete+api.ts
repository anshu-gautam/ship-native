/**
 * AI Completion API Route
 *
 * POST /api/ai/complete
 *
 * Single-shot text completion endpoint for non-conversational use cases.
 * Returns a complete response (no streaming).
 *
 * Request Body:
 * {
 *   prompt: string,
 *   systemPrompt?: string,
 *   temperature?: number (0-2, default: 0.7),
 *   maxTokens?: number (default: 500),
 *   stopSequences?: string[]
 * }
 *
 * Response:
 * {
 *   text: string,
 *   usage: { promptTokens, completionTokens, totalTokens },
 *   finishReason: string
 * }
 */

import { generateText } from 'ai';
import { protectAIEndpoint, getRateLimitHeaders } from './middleware';
import { getCurrentProvider, validateProviderKeys } from '@/services/ai/provider';
import { completionRequestSchema } from '@/features/ai/schemas';
import { logError, addBreadcrumb } from '@/lib/sentry';

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
    const validation = completionRequestSchema.safeParse(body);

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

    const { prompt, systemPrompt, temperature, maxTokens, stopSequences } = validation.data;

    // Add Sentry breadcrumb
    addBreadcrumb({
      message: 'AI Completion Request',
      category: 'ai',
      data: {
        userId,
        promptLength: prompt.length,
        temperature,
        maxTokens,
      },
    });

    // Get AI provider
    const provider = getCurrentProvider();

    // Build messages array
    const messages = [];

    if (systemPrompt) {
      messages.push({
        role: 'system' as const,
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user' as const,
      content: prompt,
    });

    // Generate completion using AI SDK
    // Note: maxTokens is not directly supported in AI SDK v5
    // Token limits are controlled by the model configuration
    const result = await generateText({
      model: provider.completion,
      messages,
      temperature,
      ...(stopSequences && { stopSequences }),
    });

    // Log completion metrics to Sentry
    const duration = Date.now() - startTime;
    addBreadcrumb({
      message: 'AI Completion Completed',
      category: 'ai',
      data: {
        userId,
        duration,
        tokensUsed: result.usage?.totalTokens,
        finishReason: result.finishReason,
      },
    });

    // Return response
    return Response.json(
      {
        text: result.text,
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
      context: 'AI Completion API',
      duration: Date.now() - startTime,
    });

    console.error('AI Completion error:', error);

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
