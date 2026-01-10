/**
 * Comment Model
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators';
import type Post from './Post';
import type User from './User';

export default class Comment extends Model {
  static table = 'comments';

  static associations = {
    posts: { type: 'belongs_to' as const, key: 'post_id' },
    users: { type: 'belongs_to' as const, key: 'user_id' },
  };

  @field('comment_id') commentId!: string;
  @field('post_id') postId!: string;
  @field('user_id') userId!: string;
  @field('content') content!: string;
  @field('likes_count') likesCount!: number;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('posts', 'post_id') post!: Post;
  @relation('users', 'user_id') user!: User;
}
