/**
 * AI Image Generation API Route
 *
 * POST /api/ai/image
 *
 * Generate images using DALL-E 3 or configured image model.
 * Returns base64 encoded image data or URLs.
 *
 * Request Body:
 * {
 *   prompt: string,
 *   size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792',
 *   quality?: 'standard' | 'hd',
 *   style?: 'vivid' | 'natural',
 *   n?: number (1-4)
 * }
 *
 * Response:
 * {
 *   images: Array<{
 *     url?: string,
 *     b64_json?: string,
 *     revised_prompt?: string
 *   }>,
 *   created: number
 * }
 */

import { protectAIEndpoint, getRateLimitHeaders } from './middleware';
import { getCurrentProvider, validateProviderKeys } from '@/services/ai/provider';
import { imageRequestSchema } from '@/features/ai/schemas';
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
    const validation = imageRequestSchema.safeParse(body);

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

    const { prompt, size, quality, style, n } = validation.data;

    // Add Sentry breadcrumb
    addBreadcrumb({
      message: 'AI Image Generation Request',
      category: 'ai',
      data: {
        userId,
        promptLength: prompt.length,
        size,
        quality,
        style,
        n,
      },
    });

    // Get AI provider
    const provider = getCurrentProvider();

    if (!provider.image) {
      return Response.json(
        {
          error: 'Image Generation Not Available',
          code: 'FEATURE_NOT_AVAILABLE',
          message: 'Image generation is not configured for the current provider',
        },
        { status: 501 }
      );
    }

    // Call OpenAI DALL-E API directly
    // Note: The AI SDK doesn't have built-in image generation yet
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.image.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.image.model,
        prompt,
        size,
        quality,
        style,
        n,
        response_format: 'url', // or 'b64_json' for base64
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Image generation failed');
    }

    const result = await response.json();

    // Log completion metrics to Sentry
    const duration = Date.now() - startTime;
    addBreadcrumb({
      message: 'AI Image Generation Completed',
      category: 'ai',
      data: {
        userId,
        duration,
        imagesGenerated: result.data?.length || 0,
      },
    });

    // Return response
    return Response.json(
      {
        images: result.data,
        created: result.created,
      },
      {
        headers: getRateLimitHeaders(userId),
      }
    );
  } catch (error) {
    // Log error to Sentry
    logError(error as Error, {
      context: 'AI Image Generation API',
      duration: Date.now() - startTime,
    });

    console.error('AI Image Generation error:', error);

    return Response.json(
      {
        error: 'Image Generation Failed',
        code: 'AI_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
