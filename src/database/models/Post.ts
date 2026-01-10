/**
 * Post Model
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children, relation } from '@nozbe/watermelondb/decorators';
import type Comment from './Comment';
import type User from './User';

export default class Post extends Model {
  static table = 'posts';

  static associations = {
    users: { type: 'belongs_to' as const, key: 'user_id' },
    comments: { type: 'has_many' as const, foreignKey: 'post_id' },
  };

  @field('post_id') postId!: string;
  @field('user_id') userId!: string;
  @field('title') title!: string;
  @field('content') content!: string;
  @field('image_url') imageUrl?: string;
  @field('likes_count') likesCount!: number;
  @field('comments_count') commentsCount!: number;
  @field('is_published') isPublished!: boolean;
  @date('published_at') publishedAt?: Date;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('users', 'user_id') user!: User;
  @children('comments') comments!: Comment[];
}
