/**
 * WatermelonDB Database Instance
 *
 * Central database initialization and configuration.
 * Uses SQLite adapter for React Native.
 */

import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import Comment from './models/Comment';
import Post from './models/Post';
import User from './models/User';
import { schema } from './schema';

// Configure SQLite adapter
const adapter = new SQLiteAdapter({
  schema,
  // Enable JSI for better performance (optional)
  jsi: true,
});

// Create database instance
export const database = new Database({
  adapter,
  modelClasses: [User, Post, Comment],
});

/**
 * Get database instance
 */
export function getDatabase(): Database {
  return database;
}

/**
 * Reset database (for testing/development)
 */
export async function resetDatabase(): Promise<void> {
  await database.write(async () => {
    await database.unsafeResetDatabase();
  });
}

/**
 * Helper to get collections
 */
export const collections = {
  users: database.get<User>('users'),
  posts: database.get<Post>('posts'),
  comments: database.get<Comment>('comments'),
};

export { User, Post, Comment };
