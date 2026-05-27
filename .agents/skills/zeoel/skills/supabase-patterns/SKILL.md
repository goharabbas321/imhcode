---
name: supabase-patterns
description: >-
  Supabase patterns for Auth, Realtime, Edge Functions, Row Level Security (RLS),
  and database design. Covers Next.js integration and serverless architecture.
---

# Supabase Patterns

## Overview

Supabase is an open-source Firebase alternative built on PostgreSQL. It provides Auth, Realtime subscriptions, Edge Functions, Storage, and auto-generated APIs. This skill covers production patterns for building SaaS applications with Supabase.

## When to Use

- Building SaaS apps that need auth, database, and realtime features
- Need a PostgreSQL-backed BaaS with auto-generated REST/GraphQL APIs
- Implementing Row Level Security for multi-tenant applications
- Building serverless backend logic with Edge Functions

## Authentication

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
})

// OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: 'https://yourapp.com/auth/callback' },
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

## Row Level Security (RLS)

```sql
-- Enable RLS on a table
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Users can only see their own todos
CREATE POLICY "Users view own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own todos
CREATE POLICY "Users insert own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own todos
CREATE POLICY "Users update own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

-- Multi-tenant: Users can see data from their organization
CREATE POLICY "Org members view org data" ON projects
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  );
```

## Realtime Subscriptions

```typescript
// Subscribe to changes
const channel = supabase
  .channel('todos-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${userId}` },
    (payload) => {
      console.log('Change received:', payload)
    }
  )
  .subscribe()

// Broadcast (client-to-client, no database)
const channel = supabase.channel('room-1')
channel.on('broadcast', { event: 'cursor' }, (payload) => {
  updateCursor(payload)
}).subscribe()

channel.send({ type: 'broadcast', event: 'cursor', payload: { x: 100, y: 200 } })
```

## Edge Functions

```typescript
// supabase/functions/process-payment/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { amount, userId } = await req.json()
  
  // Process payment logic...
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## Guidelines

1. **Always enable RLS** — never expose tables without row-level security
2. **Use `service_role` key only server-side** — never expose in client code
3. **Use database functions** for complex logic instead of client-side processing
4. **Leverage Realtime** for collaborative features instead of polling
5. **Use Edge Functions** for server-side logic that needs secrets or external APIs

## Anti-Patterns

- ❌ Disabling RLS for convenience
- ❌ Using `service_role` key in client-side code
- ❌ Polling for data instead of using Realtime subscriptions
- ❌ Storing business logic in client code instead of database functions
- ❌ Not using database migrations for schema changes
