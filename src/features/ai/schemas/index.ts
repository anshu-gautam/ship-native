import { z } from 'zod';

/**
 * Chat Request Schema
 * For streaming conversational AI
 */
export const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant', 'tool']),
      content: z.string().min(1, 'Message content is required'),
      name: z.string().optional(),
      tool_calls: z.any().optional(),
    })
  ),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().max(4096).default(1000),
  stream: z.boolean().default(true),
  tools: z.array(z.any()).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * Completion Request Schema
 * For single-shot text completion
 */
export const completionRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(4000, 'Prompt too long'),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().max(2048).default(500),
  stopSequences: z.array(z.string()).optional(),
});

export type CompletionRequest = z.infer<typeof completionRequestSchema>;

/**
 * Image Generation Request Schema
 */
export const imageRequestSchema = z.object({
  prompt: z
    .string()
    .min(1, 'Prompt is required')
    .max(1000, 'Prompt must be less than 1000 characters'),
  size: z.enum(['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792']).default('1024x1024'),
  quality: z.enum(['standard', 'hd']).default('standard'),
  style: z.enum(['vivid', 'natural']).default('vivid'),
  n: z.number().int().min(1).max(4).default(1),
});

export type ImageRequest = z.infer<typeof imageRequestSchema>;

/**
 * Tool Definition Schema
 * For function calling / tools
 */
export const toolSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  parameters: z.object({
    type: z.literal('object'),
    properties: z.record(z.any()),
    required: z.array(z.string()).optional(),
  }),
});

export type ToolDefinition = z.infer<typeof toolSchema>;

/**
 * AI Error Response Schema
 */
export const aiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

export type AIError = z.infer<typeof aiErrorSchema>;

/**
 * Streaming Response Metadata
 */
export const streamMetadataSchema = z.object({
  tokensUsed: z.number().optional(),
  model: z.string().optional(),
  finishReason: z.enum(['stop', 'length', 'content_filter', 'tool_calls']).optional(),
});

export type StreamMetadata = z.infer<typeof streamMetadataSchema>;
