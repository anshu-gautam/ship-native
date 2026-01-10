/**
 * React Hooks for WatermelonDB
 *
 * Reactive hooks for database queries with automatic updates.
 */

import { type Comment, type Post, type User, collections, database } from '@/database';
import { Q } from '@nozbe/watermelondb';
import type { Model, Query } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

/**
 * Subscribe to query changes
 */
export function useQuery<T extends Model>(query: Query<T>): T[] {
  const [records, setRecords] = useState<T[]>([]);

  useEffect(() => {
    const subscription = query.observe().subscribe((newRecords) => {
      setRecords(newRecords);
    });

    return () => subscription.unsubscribe();
  }, [query]);

  return records;
}

/**
 * Subscribe to single record changes
 */
export function useRecord<T extends Model>(collection: string, id: string): T | null {
  const [record, setRecord] = useState<T | null>(null);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    const fetchAndObserve = async () => {
      try {
        const rec = await database.get<T>(collection).find(id);
        setRecord(rec);

        subscription = rec.observe().subscribe((updatedRecord) => {
          setRecord(updatedRecord);
        });
      } catch (error) {
        console.error(`[useRecord] Record not found: ${id}`, error);
        setRecord(null);
      }
    };

    fetchAndObserve();

    return () => subscription?.unsubscribe();
  }, [collection, id]);

  return record;
}

/**
 * Get all users
 */
export function useUsers(): User[] {
  const query = collections.users.query();
  return useQuery(query);
}

/**
 * Get user by ID
 */
export function useUser(userId: string): User | null {
  return useRecord<User>('users', userId);
}

/**
 * Get all posts
 */
export function usePosts(filters?: {
  userId?: string;
  isPublished?: boolean;
  limit?: number;
}): Post[] {
  const [query] = useState(() => {
    const conditions = [];

    if (filters?.userId) {
      conditions.push(Q.where('user_id', filters.userId));
    }

    if (filters?.isPublished !== undefined) {
      conditions.push(Q.where('is_published', filters.isPublished));
    }

    let q = collections.posts.query(...conditions);

    if (filters?.limit) {
      q = q.extend(Q.take(filters.limit));
    }

    return q;
  });

  return useQuery(query);
}

/**
 * Get post by ID
 */
export function usePost(postId: string): Post | null {
  return useRecord<Post>('posts', postId);
}

/**
 * Get comments for a post
 */
export function useComments(postId: string): Comment[] {
  const [query] = useState(() => collections.comments.query(Q.where('post_id', postId)));

  return useQuery(query);
}

/**
 * Get comment by ID
 */
export function useComment(commentId: string): Comment | null {
  return useRecord<Comment>('comments', commentId);
}

/**
 * Database write operations
 */
export const dbOperations = {
  /**
   * Create a new user
   */
  async createUser(data: {
    userId: string;
    email: string;
    name: string;
    role?: string;
    avatarUrl?: string;
    bio?: string;
  }): Promise<User> {
    return database.write(async () => {
      return collections.users.create((user) => {
        user.userId = data.userId;
        user.email = data.email;
        user.name = data.name;
        user.role = data.role || 'user';
        user.isVerified = false;
        if (data.avatarUrl) user.avatarUrl = data.avatarUrl;
        if (data.bio) user.bio = data.bio;
      });
    });
  },

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    data: Partial<{
      name: string;
      email: string;
      avatarUrl: string;
      bio: string;
      isVerified: boolean;
    }>
  ): Promise<User> {
    return database.write(async () => {
      const user = await collections.users.find(userId);
      return user.update((u) => {
        if (data.name) u.name = data.name;
        if (data.email) u.email = data.email;
        if (data.avatarUrl !== undefined) u.avatarUrl = data.avatarUrl;
        if (data.bio !== undefined) u.bio = data.bio;
        if (data.isVerified !== undefined) u.isVerified = data.isVerified;
      });
    });
  },

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    return database.write(async () => {
      const user = await collections.users.find(userId);
      await user.markAsDeleted();
    });
  },

  /**
   * Create a new post
   */
  async createPost(data: {
    postId: string;
    userId: string;
    title: string;
    content: string;
    imageUrl?: string;
    isPublished?: boolean;
  }): Promise<Post> {
    return database.write(async () => {
      return collections.posts.create((post) => {
        post.postId = data.postId;
        post.userId = data.userId;
        post.title = data.title;
        post.content = data.content;
        post.likesCount = 0;
        post.commentsCount = 0;
        post.isPublished = data.isPublished ?? false;
        if (data.imageUrl) post.imageUrl = data.imageUrl;
        if (data.isPublished) post.publishedAt = new Date();
      });
    });
  },

  /**
   * Update post
   */
  async updatePost(
    postId: string,
    data: Partial<{
      title: string;
      content: string;
      imageUrl: string;
      isPublished: boolean;
      likesCount: number;
      commentsCount: number;
    }>
  ): Promise<Post> {
    return database.write(async () => {
      const post = await collections.posts.find(postId);
      return post.update((p) => {
        if (data.title) p.title = data.title;
        if (data.content) p.content = data.content;
        if (data.imageUrl !== undefined) p.imageUrl = data.imageUrl;
        if (data.isPublished !== undefined) {
          p.isPublished = data.isPublished;
          if (data.isPublished && !p.publishedAt) {
            p.publishedAt = new Date();
          }
        }
        if (data.likesCount !== undefined) p.likesCount = data.likesCount;
        if (data.commentsCount !== undefined) p.commentsCount = data.commentsCount;
      });
    });
  },

  /**
   * Delete post
   */
  async deletePost(postId: string): Promise<void> {
    return database.write(async () => {
      const post = await collections.posts.find(postId);
      await post.markAsDeleted();
    });
  },

  /**
   * Create a comment
   */
  async createComment(data: {
    commentId: string;
    postId: string;
    userId: string;
    content: string;
  }): Promise<Comment> {
    return database.write(async () => {
      const comment = await collections.comments.create((c) => {
        c.commentId = data.commentId;
        c.postId = data.postId;
        c.userId = data.userId;
        c.content = data.content;
        c.likesCount = 0;
      });

      // Increment comments count on post
      const post = await collections.posts.find(data.postId);
      await post.update((p) => {
        p.commentsCount += 1;
      });

      return comment;
    });
  },

  /**
   * Update comment
   */
  async updateComment(
    commentId: string,
    data: Partial<{ content: string; likesCount: number }>
  ): Promise<Comment> {
    return database.write(async () => {
      const comment = await collections.comments.find(commentId);
      return comment.update((c) => {
        if (data.content) c.content = data.content;
        if (data.likesCount !== undefined) c.likesCount = data.likesCount;
      });
    });
  },

  /**
   * Delete comment
   */
  async deleteComment(commentId: string): Promise<void> {
    return database.write(async () => {
      const comment = await collections.comments.find(commentId);
      const postId = comment.postId;

      await comment.markAsDeleted();

      // Decrement comments count on post
      const post = await collections.posts.find(postId);
      await post.update((p) => {
        p.commentsCount = Math.max(0, p.commentsCount - 1);
      });
    });
  },
};
