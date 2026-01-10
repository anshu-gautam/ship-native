/**
 * User Model
 */

import { Model } from '@nozbe/watermelondb';
import { children, date, field, readonly } from '@nozbe/watermelondb/decorators';
import type Comment from './Comment';
import type Post from './Post';

export default class User extends Model {
  static table = 'users';

  static associations = {
    posts: { type: 'has_many' as const, foreignKey: 'user_id' },
    comments: { type: 'has_many' as const, foreignKey: 'user_id' },
  };

  @field('user_id') userId!: string;
  @field('email') email!: string;
  @field('name') name!: string;
  @field('avatar_url') avatarUrl?: string;
  @field('bio') bio?: string;
  @field('role') role!: string;
  @field('is_verified') isVerified!: boolean;
  @date('last_login_at') lastLoginAt?: Date;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('posts') posts!: Post[];
  @children('comments') comments!: Comment[];
}
