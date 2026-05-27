---
name: graphql-patterns
description: >-
  GraphQL schema design, resolver patterns, subscriptions, and performance
  optimization. Covers Apollo Server, code-first schemas, and N+1 prevention.
---

# GraphQL Patterns

## Overview

Production-ready GraphQL patterns covering schema design, resolver architecture, authentication, subscriptions, and performance optimization with dataloader.

## When to Use

- Building APIs where clients need flexible data fetching
- Mobile + web clients with different data needs from same API
- Real-time features with GraphQL subscriptions
- Complex data relationships that benefit from graph queries

## Schema Design (Code-First)

```typescript
// schema.ts — Using Pothos (code-first)
import SchemaBuilder from '@pothos/core'

const builder = new SchemaBuilder<{
  Context: { user: User | null; db: Database }
}>({})

const UserType = builder.objectRef<User>('User')
UserType.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    email: t.exposeString('email'),
    posts: t.field({
      type: [PostType],
      resolve: (user, _, ctx) => ctx.db.posts.findByAuthorId(user.id),
    }),
  }),
})

builder.queryType({
  fields: (t) => ({
    user: t.field({
      type: UserType,
      nullable: true,
      args: { id: t.arg.id({ required: true }) },
      resolve: (_, args, ctx) => ctx.db.users.findById(args.id),
    }),
    users: t.field({
      type: [UserType],
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
        offset: t.arg.int({ defaultValue: 0 }),
      },
      resolve: (_, args, ctx) => ctx.db.users.findMany(args),
    }),
  }),
})

builder.mutationType({
  fields: (t) => ({
    createUser: t.field({
      type: UserType,
      args: {
        name: t.arg.string({ required: true }),
        email: t.arg.string({ required: true }),
      },
      resolve: async (_, args, ctx) => {
        if (!ctx.user) throw new GraphQLError('Unauthorized')
        return ctx.db.users.create(args)
      },
    }),
  }),
})
```

## DataLoader (N+1 Prevention)

```typescript
import DataLoader from 'dataloader'

// Create loaders per request
function createLoaders(db: Database) {
  return {
    userLoader: new DataLoader<string, User>(async (ids) => {
      const users = await db.users.findByIds(ids as string[])
      return ids.map(id => users.find(u => u.id === id)!)
    }),
    postsByAuthorLoader: new DataLoader<string, Post[]>(async (authorIds) => {
      const posts = await db.posts.findByAuthorIds(authorIds as string[])
      return authorIds.map(id => posts.filter(p => p.authorId === id))
    }),
  }
}
```

## Guidelines

1. **Use DataLoader** to prevent N+1 queries — batch and cache per request
2. **Design schemas around use cases**, not database tables
3. **Use code-first** (Pothos/TypeGraphQL) for TypeScript type safety
4. **Paginate with cursors**, not offsets for large datasets
5. **Limit query depth** to prevent abuse (use graphql-depth-limit)
6. **Use persisted queries** in production for security and performance

## Anti-Patterns

- ❌ Exposing database schema 1:1 as GraphQL schema
- ❌ Not using DataLoader (causes N+1 queries)
- ❌ Unlimited query depth (DoS vulnerability)
- ❌ Mutations without input validation
- ❌ Not handling errors with proper GraphQL error extensions
