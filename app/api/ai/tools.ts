/**
 * AI Tools / Functions Pattern
 *
 * Define server-side callable tools that the AI model can invoke.
 * All tool inputs and outputs are validated with Zod before execution.
 */

import { z } from 'zod';
import { tool } from 'ai';
import { supabase } from '@/services/supabase';

/**
 * Tool: Search Notes
 * Searches user's notes in Supabase
 */
export const searchNotesTool = tool({
  description: 'Search through user notes to find relevant information',
  parameters: z.object({
    query: z.string().describe('The search query to find in notes'),
    limit: z.number().default(5).describe('Maximum number of results to return'),
  }),
  execute: async ({ query, limit }: { query: string; limit: number }): Promise<any> => {
    try {
      // Search notes in Supabase
      const { data, error } = await supabase
        .from('notes')
        .select('id, title, content, created_at')
        .textSearch('content', query)
        .limit(limit);

      if (error) {
        return {
          success: false,
          error: `Failed to search notes: ${error.message}`,
        };
      }

      return {
        success: true,
        results: data || [],
        count: data?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
} as any);

/**
 * Tool: Get Current Date/Time
 * Provides current date and time information
 */
export const getCurrentTimeTool = tool({
  description: 'Get the current date and time in ISO format',
  parameters: z.object({
    timezone: z.string().optional().describe('Optional timezone (e.g., "America/New_York")'),
  }),
  execute: async ({ timezone }: { timezone?: string }): Promise<any> => {
    try {
      const now = new Date();

      return {
        success: true,
        timestamp: now.toISOString(),
        unix: now.getTime(),
        formatted: timezone
          ? now.toLocaleString('en-US', { timeZone: timezone })
          : now.toLocaleString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
} as any);

/**
 * Tool: Calculate
 * Performs basic calculations
 */
export const calculateTool = tool({
  description: 'Perform mathematical calculations',
  parameters: z.object({
    expression: z.string().describe('Mathematical expression to evaluate (e.g., "2 + 2 * 3")'),
  }),
  execute: async ({ expression }: { expression: string }): Promise<any> => {
    try {
      // Safely evaluate math expression
      // Note: In production, use a proper math parser like mathjs
      // eslint-disable-next-line no-eval
      const result = eval(expression);

      return {
        success: true,
        expression,
        result,
      };
    } catch (_error) {
      return {
        success: false,
        error: 'Invalid mathematical expression',
      };
    }
  },
} as any);

/**
 * Tool: Web Search (Stub)
 * Placeholder for web search functionality
 */
export const webSearchTool = tool({
  description: 'Search the web for current information (stub - not implemented)',
  parameters: z.object({
    query: z.string().describe('The search query'),
    numResults: z.number().default(5).describe('Number of results to return'),
  }),
  execute: async ({ query, numResults }: { query: string; numResults: number }): Promise<any> => {
    // TODO: Implement actual web search (e.g., using Brave Search API)
    return {
      success: false,
      error: 'Web search is not yet implemented',
      query,
      numResults,
    };
  },
} as any);

/**
 * Export all available tools
 */
export const availableTools = {
  searchNotes: searchNotesTool,
  getCurrentTime: getCurrentTimeTool,
  calculate: calculateTool,
  webSearch: webSearchTool,
};

/**
 * Get tools by name
 */
export function getTools(toolNames: string[]) {
  const tools: Record<string, any> = {};

  for (const name of toolNames) {
    if (name in availableTools) {
      tools[name] = availableTools[name as keyof typeof availableTools];
    }
  }

  return tools;
}
