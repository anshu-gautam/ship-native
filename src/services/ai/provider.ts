/**
 * AI Provider Configuration
 *
 * This module provides a unified interface to swap AI providers with a single line change.
 * The AI SDK exposes a unified interface to multiple LLM vendors for portability.
 *
 * ⚠️ SECURITY: This file should ONLY be imported in API routes (server-side).
 * Never import this in client components as it requires server-only API keys.
 */

import { openai } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

// Provider configuration type
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'local';

interface ProviderConfig {
  chat: LanguageModel;
  completion: LanguageModel;
  image?: {
    model: string;
    apiKey: string;
  };
}

/**
 * Get the configured AI provider
 * Change this single line to swap providers
 */
export const getAIProvider = (): AIProvider => {
  return (process.env.AI_PROVIDER as AIProvider) || 'openai';
};

/**
 * OpenAI Provider Configuration
 */
const openaiConfig: ProviderConfig = {
  // Default: GPT-4o for chat
  chat: openai('gpt-4o'),

  // GPT-4o-mini for completions (faster, cheaper)
  completion: openai('gpt-4o-mini'),

  // DALL-E 3 for image generation
  image: {
    model: 'dall-e-3',
    apiKey: process.env.OPENAI_API_KEY || '',
  },
};

/**
 * Provider registry
 * Add new providers here following the same interface
 */
const providers: Record<AIProvider, ProviderConfig> = {
  openai: openaiConfig,

  // Placeholder for Anthropic (Claude)
  anthropic: openaiConfig, // TODO: Implement when needed

  // Placeholder for Google (Gemini)
  google: openaiConfig, // TODO: Implement when needed

  // Placeholder for local/on-device models
  local: openaiConfig, // TODO: Implement for offline inference
};

/**
 * Get the current provider configuration
 * This is the main entry point for AI functionality
 */
export const getCurrentProvider = (): ProviderConfig => {
  const provider = getAIProvider();

  if (!providers[provider]) {
    throw new Error(`AI provider "${provider}" is not configured`);
  }

  return providers[provider];
};

/**
 * Validate that required API keys are present
 */
export const validateProviderKeys = (): { valid: boolean; error?: string } => {
  const provider = getAIProvider();

  switch (provider) {
    case 'openai':
      if (!process.env.OPENAI_API_KEY) {
        return {
          valid: false,
          error: 'OPENAI_API_KEY is not configured. Add it to your .env file.',
        };
      }
      break;

    // Add validation for other providers as needed
    default:
      break;
  }

  return { valid: true };
};

/**
 * Get provider display name for UI/logging
 */
export const getProviderDisplayName = (provider: AIProvider): string => {
  const names: Record<AIProvider, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic Claude',
    google: 'Google Gemini',
    local: 'Local Model',
  };

  return names[provider] || provider;
};
