/**
 * MSW Server Setup (Node.js)
 *
 * For use in Jest tests and Node.js environments
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Create MSW server instance
 */
export const server = setupServer(...handlers);

/**
 * Setup MSW for Jest tests
 * Call this in jest.setup.js
 */
export function setupMockServer(): void {
  // Start server before all tests
  beforeAll(() => {
    server.listen({
      onUnhandledRequest: 'warn',
    });
  });

  // Reset handlers after each test
  afterEach(() => {
    server.resetHandlers();
  });

  // Clean up after all tests
  afterAll(() => {
    server.close();
  });
}
