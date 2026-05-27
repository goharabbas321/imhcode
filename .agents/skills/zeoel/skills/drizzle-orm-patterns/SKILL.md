---
name: drizzle-orm-patterns
description: >-
  Drizzle ORM patterns for TypeScript-first database access. Covers schema
  definition, queries, relations, migrations, and PostgreSQL/MySQL/SQLite support.
---

# Drizzle ORM Patterns

## Overview

Drizzle ORM is a TypeScript-first ORM that provides type-safe database access with zero runtime overhead. It features a SQL-like query builder, automatic migration generation, and excellent developer experience with full IntelliSense support.

## When to Use

- TypeScript/Node.js projects needing type-safe database access
- Preferring SQL-like syntax over active record patterns
- Needing lightweight ORM without heavy abstraction layers
- Working with PostgreSQL, MySQL, or SQLite

## Schema Definition

```typescript
// schema.ts
import { pgTable, text, integer, timestamp, boolean, uuid, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'user', 'moderator'] }).default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').default(false),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}))

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}))
```

## Queries

```typescript
import { db } from './db'
import { users, posts } from './schema'
import { eq, and, like, desc, count, sql } from 'drizzle-orm'

// Select with filters
const activeUsers = await db.select()
  .from(users)
  .where(eq(users.role, 'admin'))
  .orderBy(desc(users.createdAt))
  .limit(10)

// Join query
const postsWithAuthors = await db.select({
  postTitle: posts.title,
  authorName: users.name,
}).from(posts)
  .innerJoin(users, eq(posts.authorId, users.id))
  .where(eq(posts.published, true))

// Relational query (like Prisma's include)
const usersWithPosts = await db.query.users.findMany({
  with: { posts: true },
  where: eq(users.role, 'admin'),
})

// Aggregation
const postCounts = await db.select({
  authorId: posts.authorId,
  count: count(),
}).from(posts)
  .groupBy(posts.authorId)

// Insert
const newUser = await db.insert(users).values({
  email: 'gohar@example.com',
  name: 'Gohar Abbas',
}).returning()

// Update
await db.update(users)
  .set({ name: 'Updated Name' })
  .where(eq(users.id, userId))

// Transaction
await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values({ email, name }).returning()
  await tx.insert(posts).values({ title: 'First Post', authorId: user.id })
})
```

## Migrations

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Push schema directly (development only)
npx drizzle-kit push

# Open Drizzle Studio (GUI)
npx drizzle-kit studio
```

## Guidelines

1. **Define schemas in TypeScript** — let Drizzle generate SQL migrations
2. **Use relations** for type-safe eager loading
3. **Use transactions** for multi-table operations
4. **Use `returning()`** for INSERT/UPDATE to get results without extra queries
5. **Use `drizzle-kit push`** in dev, `drizzle-kit migrate` in production
6. **Prefer `select()` with explicit columns** over `select(*)` for performance

## Anti-Patterns

- ❌ Using raw SQL strings when Drizzle's query builder supports the operation
- ❌ Not using transactions for multi-step mutations
- ❌ Skipping migrations in production (using `push` instead)
- ❌ Defining relations without corresponding foreign keys in the schema
- ❌ Not using `.returning()` after INSERT/UPDATE operations
