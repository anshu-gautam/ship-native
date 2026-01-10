# WatermelonDB Database Guide

Complete guide to using the local SQLite database with WatermelonDB in your React Native app.

## Overview

This app uses [WatermelonDB](https://watermelondb.dev) for local data persistence. WatermelonDB is:
- **Fast**: Built for performance with lazy loading
- **Reactive**: Automatic UI updates when data changes
- **Offline-first**: Works without internet connection
- **SQLite-based**: Reliable and battle-tested
- **Type-safe**: Full TypeScript support

## Quick Start

### Reading Data

```typescript
import { usePosts, useUser } from '@/hooks/useDatabase';

function MyComponent() {
  // Get all posts - automatically updates when data changes
  const posts = usePosts();

  // Get specific user
  const user = useUser('user-123');

  // Get filtered posts
  const userPosts = usePosts({ userId: 'user-123', isPublished: true });

  return (
    <View>
      {posts.map(post => (
        <Text key={post.id}>{post.title}</Text>
      ))}
    </View>
  );
}
```

### Writing Data

```typescript
import { dbOperations } from '@/hooks/useDatabase';

// Create a post
const post = await dbOperations.createPost({
  postId: 'post-123',
  userId: 'user-456',
  title: 'My First Post',
  content: 'Hello World!',
  isPublished: true,
});

// Update a post
await dbOperations.updatePost('post-123', {
  title: 'Updated Title',
  likesCount: 10,
});

// Delete a post
await dbOperations.deletePost('post-123');
```

## Database Schema

### Users Table

| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key (auto-generated) |
| user_id | string | External user ID (indexed) |
| email | string | User email (indexed) |
| name | string | Display name |
| avatar_url | string? | Profile picture URL |
| bio | string? | User biography |
| role | string | User role (user/admin) |
| is_verified | boolean | Email verification status |
| last_login_at | date? | Last login timestamp |
| created_at | date | Creation timestamp |
| updated_at | date | Last update timestamp |

### Posts Table

| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key (auto-generated) |
| post_id | string | External post ID (indexed) |
| user_id | string | Author ID (indexed) |
| title | string | Post title |
| content | string | Post content |
| image_url | string? | Featured image URL |
| likes_count | number | Number of likes |
| comments_count | number | Number of comments |
| is_published | boolean | Publication status |
| published_at | date? | Publication timestamp |
| created_at | date | Creation timestamp |
| updated_at | date | Last update timestamp |

### Comments Table

| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key (auto-generated) |
| comment_id | string | External comment ID (indexed) |
| post_id | string | Parent post ID (indexed) |
| user_id | string | Author ID (indexed) |
| content | string | Comment content |
| likes_count | number | Number of likes |
| created_at | date | Creation timestamp |
| updated_at | date | Last update timestamp |

## React Hooks API

### useQuery

Subscribe to any query with automatic updates:

```typescript
import { useQuery } from '@/hooks/useDatabase';
import { Q } from '@nozbe/watermelondb';
import { collections } from '@/database';

function MyComponent() {
  // Custom query
  const query = collections.posts.query(
    Q.where('is_published', true),
    Q.sortBy('created_at', Q.desc),
    Q.take(10)
  );

  const posts = useQuery(query);

  return <PostList posts={posts} />;
}
```

### useRecord

Subscribe to a single record:

```typescript
import { useRecord } from '@/hooks/useDatabase';
import type { Post } from '@/database';

function PostDetail({ postId }: { postId: string }) {
  const post = useRecord<Post>('posts', postId);

  if (!post) return <Loading />;

  return <PostView post={post} />;
}
```

### useUsers

Get all users or filter:

```typescript
const allUsers = useUsers();

// Use with custom query for filtering
const admins = useQuery(
  collections.users.query(Q.where('role', 'admin'))
);
```

### usePosts

Get posts with optional filters:

```typescript
// All posts
const allPosts = usePosts();

// User's posts
const userPosts = usePosts({ userId: 'user-123' });

// Published posts
const publishedPosts = usePosts({ isPublished: true });

// Limited results
const recentPosts = usePosts({ isPublished: true, limit: 10 });
```

### useComments

Get comments for a specific post:

```typescript
function PostComments({ postId }: { postId: string }) {
  const comments = useComments(postId);

  return (
    <View>
      {comments.map(comment => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </View>
  );
}
```

## CRUD Operations

### Create

```typescript
import { dbOperations } from '@/hooks/useDatabase';

// Create user
const user = await dbOperations.createUser({
  userId: 'external-id-123',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'user',
  avatarUrl: 'https://example.com/avatar.jpg',
  bio: 'Software developer',
});

// Create post
const post = await dbOperations.createPost({
  postId: 'post-123',
  userId: user.id,
  title: 'Hello World',
  content: 'My first post!',
  isPublished: true,
  imageUrl: 'https://example.com/image.jpg',
});

// Create comment
const comment = await dbOperations.createComment({
  commentId: 'comment-123',
  postId: post.id,
  userId: user.id,
  content: 'Great post!',
});
```

### Read

```typescript
import { collections } from '@/database';
import { Q } from '@nozbe/watermelondb';

// Find by ID
const user = await collections.users.find('user-id');

// Query with conditions
const publishedPosts = await collections.posts
  .query(Q.where('is_published', true))
  .fetch();

// Complex query
const popularPosts = await collections.posts
  .query(
    Q.where('is_published', true),
    Q.where('likes_count', Q.gte(100)),
    Q.sortBy('likes_count', Q.desc),
    Q.take(10)
  )
  .fetch();

// Get related records
const user = await collections.users.find('user-id');
const userPosts = await user.posts.fetch();
```

### Update

```typescript
// Update user
await dbOperations.updateUser('user-id', {
  name: 'Jane Doe',
  bio: 'Updated bio',
  isVerified: true,
});

// Update post
await dbOperations.updatePost('post-id', {
  title: 'Updated Title',
  content: 'Updated content',
  likesCount: 42,
});

// Update comment
await dbOperations.updateComment('comment-id', {
  content: 'Updated comment',
  likesCount: 5,
});
```

### Delete

```typescript
// Delete user (marks as deleted, doesn't actually remove)
await dbOperations.deleteUser('user-id');

// Delete post
await dbOperations.deletePost('post-id');

// Delete comment (automatically decrements post's comment count)
await dbOperations.deleteComment('comment-id');
```

## Advanced Queries

### Filtering

```typescript
import { Q } from '@nozbe/watermelondb';

// Equal
Q.where('role', 'admin')

// Not equal
Q.where('role', Q.notEq('user'))

// Greater than
Q.where('likes_count', Q.gt(10))

// Greater than or equal
Q.where('likes_count', Q.gte(10))

// Less than
Q.where('likes_count', Q.lt(100))

// Less than or equal
Q.where('likes_count', Q.lte(100))

// Like (SQL LIKE)
Q.where('title', Q.like('%react%'))

// In array
Q.where('role', Q.oneOf(['admin', 'moderator']))

// Between
Q.where('created_at', Q.between(startDate, endDate))
```

### Sorting

```typescript
// Ascending
Q.sortBy('created_at', Q.asc)

// Descending
Q.sortBy('created_at', Q.desc)

// Multiple sort
collections.posts.query(
  Q.sortBy('is_published', Q.desc),
  Q.sortBy('created_at', Q.desc)
)
```

### Limiting

```typescript
// Take first 10
Q.take(10)

// Skip first 10
Q.skip(10)

// Pagination
Q.skip(page * pageSize), Q.take(pageSize)
```

### Combining Conditions

```typescript
// AND (default)
collections.posts.query(
  Q.where('is_published', true),
  Q.where('user_id', userId)
)

// OR
Q.or(
  Q.where('role', 'admin'),
  Q.where('role', 'moderator')
)

// Complex
Q.and(
  Q.where('is_published', true),
  Q.or(
    Q.where('likes_count', Q.gt(100)),
    Q.where('comments_count', Q.gt(50))
  )
)
```

## Relationships

### One-to-Many

```typescript
// Get user's posts
const user = await collections.users.find('user-id');
const posts = await user.posts.fetch();

// Or observe
user.posts.observe().subscribe(posts => {
  console.log('User posts updated:', posts);
});
```

### Many-to-One

```typescript
// Get post's author
const post = await collections.posts.find('post-id');
const author = await post.user.fetch();

// Or observe
post.user.observe().subscribe(user => {
  console.log('Author updated:', user);
});
```

## Synchronization

### Basic Sync

```typescript
import { syncDatabase } from '@/database/sync';

// Sync with remote API
const result = await syncDatabase(
  'https://api.example.com',
  'auth-token-123'
);

if (result.success) {
  console.log('Sync completed in', result.timestamp, 'ms');
} else {
  console.error('Sync failed:', result.error);
}
```

### Pull-Only Sync

```typescript
import { pullChanges } from '@/database/sync';

// One-way sync from server
const result = await pullChanges(
  'https://api.example.com',
  'auth-token-123'
);

console.log('Created:', result.changes?.created);
console.log('Updated:', result.changes?.updated);
console.log('Deleted:', result.changes?.deleted);
```

### Auto Sync

```typescript
import {
  syncDatabase,
  isSyncNeeded,
  getLastSyncTimestamp,
  saveLastSyncTimestamp,
} from '@/database/sync';

// Check if sync needed (every 5 minutes)
const lastSync = await getLastSyncTimestamp();

if (isSyncNeeded(lastSync, 300000)) {
  const result = await syncDatabase(apiUrl, token);

  if (result.success) {
    await saveLastSyncTimestamp(Date.now());
  }
}
```

## Performance Tips

### 1. Use Lazy Loading

WatermelonDB loads records lazily - don't worry about memory:

```typescript
// This doesn't load all records into memory
const allPosts = await collections.posts.query().fetch();
```

### 2. Limit Results

For lists, always limit results:

```typescript
// Good
const posts = useQuery(
  collections.posts.query(Q.take(20))
);

// Bad - loads everything
const posts = useQuery(collections.posts.query());
```

### 3. Use Indexes

The schema already indexes frequently queried fields:
- `user_id` (indexed)
- `post_id` (indexed)
- `email` (indexed)

### 4. Batch Writes

```typescript
import { database } from '@/database';

// Good - single transaction
await database.write(async () => {
  await dbOperations.createPost(post1);
  await dbOperations.createPost(post2);
  await dbOperations.createPost(post3);
});

// Bad - multiple transactions
await dbOperations.createPost(post1);
await dbOperations.createPost(post2);
await dbOperations.createPost(post3);
```

### 5. Observe Only What You Need

```typescript
// Good - specific query
const query = collections.posts.query(
  Q.where('user_id', userId),
  Q.take(10)
);
const posts = useQuery(query);

// Bad - observe all then filter in JS
const allPosts = useQuery(collections.posts.query());
const userPosts = allPosts.filter(p => p.userId === userId);
```

## Testing

### Reset Database

```typescript
import { resetDatabase } from '@/database';

beforeEach(async () => {
  await resetDatabase();
});
```

### Mock Data

```typescript
import { dbOperations } from '@/hooks/useDatabase';

// Create test data
const user = await dbOperations.createUser({
  userId: 'test-user',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
});

const post = await dbOperations.createPost({
  postId: 'test-post',
  userId: user.id,
  title: 'Test Post',
  content: 'Test content',
  isPublished: true,
});
```

## Migrations

When you need to change the schema:

1. **Update schema version:**

```typescript
// src/database/schema.ts
export const schema = appSchema({
  version: 2, // Increment version
  tables: [
    // ... updated tables
  ],
});
```

2. **Create migration:**

```typescript
// src/database/migrations.ts
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        {
          type: 'add_column',
          table: 'users',
          column: { name: 'phone', type: 'string', isOptional: true },
        },
      ],
    },
  ],
});
```

3. **Apply migrations:**

```typescript
// src/database/index.ts
import { migrations } from './migrations';

const adapter = new SQLiteAdapter({
  schema,
  migrations, // Add migrations
  jsi: true,
});
```

## Troubleshooting

### Issue: Records not updating

Make sure you're using WatermelonDB's reactive hooks:

```typescript
// ❌ Bad - won't update
const [posts, setPosts] = useState([]);
useEffect(() => {
  collections.posts.query().fetch().then(setPosts);
}, []);

// ✅ Good - reactive
const posts = useQuery(collections.posts.query());
```

### Issue: Write errors

Always wrap writes in `database.write()`:

```typescript
// ❌ Bad
const user = await collections.users.create(/* ... */);

// ✅ Good
const user = await database.write(async () => {
  return collections.users.create(/* ... */);
});
```

### Issue: Performance problems

1. Limit query results
2. Use indexes on frequently queried fields
3. Batch write operations
4. Don't observe unnecessary queries

## Resources

- [WatermelonDB Documentation](https://watermelondb.dev/docs)
- [WatermelonDB GitHub](https://github.com/Nozbe/WatermelonDB)
- [Performance Tips](https://watermelondb.dev/docs/Advanced/Performance)
- [Schema Migrations](https://watermelondb.dev/docs/Advanced/Migrations)

---

**Last Updated:** 2025-01-15
**Database Version:** 1
