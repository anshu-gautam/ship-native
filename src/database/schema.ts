/**
 * WatermelonDB Schema
 *
 * Database schema definitions for all tables.
 * WatermelonDB uses SQLite under the hood for React Native.
 *
 * Schema versioning is important for migrations.
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    // Users table
    tableSchema({
      name: 'users',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'email', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'avatar_url', type: 'string', isOptional: true },
        { name: 'bio', type: 'string', isOptional: true },
        { name: 'role', type: 'string' },
        { name: 'is_verified', type: 'boolean' },
        { name: 'last_login_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Posts table
    tableSchema({
      name: 'posts',
      columns: [
        { name: 'post_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'image_url', type: 'string', isOptional: true },
        { name: 'likes_count', type: 'number' },
        { name: 'comments_count', type: 'number' },
        { name: 'is_published', type: 'boolean' },
        { name: 'published_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Comments table
    tableSchema({
      name: 'comments',
      columns: [
        { name: 'comment_id', type: 'string', isIndexed: true },
        { name: 'post_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'content', type: 'string' },
        { name: 'likes_count', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Favorites table
    tableSchema({
      name: 'favorites',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'post_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
      ],
    }),

    // Cache table (for API responses)
    tableSchema({
      name: 'cache',
      columns: [
        { name: 'cache_key', type: 'string', isIndexed: true },
        { name: 'data', type: 'string' }, // JSON string
        { name: 'expires_at', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    // Offline queue (for pending API requests)
    tableSchema({
      name: 'offline_queue',
      columns: [
        { name: 'request_id', type: 'string', isIndexed: true },
        { name: 'method', type: 'string' },
        { name: 'url', type: 'string' },
        { name: 'data', type: 'string', isOptional: true }, // JSON string
        { name: 'headers', type: 'string', isOptional: true }, // JSON string
        { name: 'status', type: 'string' }, // 'pending' | 'processing' | 'failed'
        { name: 'retry_count', type: 'number' },
        { name: 'error_message', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Settings table
    tableSchema({
      name: 'settings',
      columns: [
        { name: 'setting_key', type: 'string', isIndexed: true },
        { name: 'setting_value', type: 'string' }, // JSON string
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
