---
name: trpc-patterns
description: >-
  tRPC patterns for end-to-end typesafe APIs. Covers router definition,
  middleware, input validation, React Query integration, and error handling.
---

# tRPC Patterns

## Overview

tRPC allows you to build fully typesafe APIs without schemas or code generation. Define your API on the server, and call it from the client with full TypeScript autocompletion and type checking.

## When to Use

- Full-stack TypeScript applications (Next.js, React + Node)
- Want end-to-end type safety without REST/GraphQL schemas
- Rapid API development with automatic client types
- Need real-time subscriptions with WebSocket support

## Router Definition

```typescript
// server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

// Auth middleware
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { user: ctx.session.user } })
})

export const protectedProcedure = t.procedure.use(isAuthed)
```

### API Routes

```typescript
// server/routers/user.ts
export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      })
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      email: z.string().email(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.insert(users).values(input).returning()
    }),

  list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const items = await db.query.users.findMany({
        limit: input.limit + 1,
        where: input.cursor ? gt(users.id, input.cursor) : undefined,
      })
      const hasMore = items.length > input.limit
      return { items: items.slice(0, input.limit), nextCursor: hasMore ? items[input.limit - 1].id : null }
    }),
})
```

## Client Usage (React)

```tsx
// Fully typed — autocomplete for routes, inputs, and outputs
const { data: user } = trpc.user.getById.useQuery({ id: '123' })

const createUser = trpc.user.create.useMutation({
  onSuccess: () => {
    utils.user.list.invalidate() // Refetch list
  },
})

// Infinite query for pagination
const { data, fetchNextPage } = trpc.user.list.useInfiniteQuery(
  { limit: 10 },
  { getNextPageParam: (lastPage) => lastPage.nextCursor },
)
```

## Guidelines

1. **Always validate inputs with Zod** — never trust client data
2. **Use middleware** for auth, logging, and rate limiting
3. **Separate routers by domain** (user, post, payment) and merge them
4. **Use cursor-based pagination** for list endpoints
5. **Invalidate queries** after mutations for automatic UI updates
6. **Use `protectedProcedure`** for any mutation that modifies data

## Anti-Patterns

- ❌ Skipping input validation (even with TypeScript, validate at runtime)
- ❌ Putting all routes in a single giant router
- ❌ Using tRPC for public APIs (it's designed for internal app APIs)
- ❌ Not handling errors with proper tRPC error codes
- ❌ Calling mutations without invalidating related queries
